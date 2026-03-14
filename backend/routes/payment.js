const express  = require('express');
const stripe   = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Order, OrderItem, Payment, User } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

function createRefCode() {
  return Math.random().toString(36).substring(2, 22);
}

// GET /api/payment  – get order total + stripe public key
router.get('/', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { userId: req.user.id, ordered: false },
      include: ['items', 'shippingAddress', 'billingAddress', 'coupon'],
    });
    if (!order) return res.status(404).json({ message: 'No active order.' });
    if (!order.billingAddressId) return res.status(400).json({ message: 'No billing address set.' });

    const subtotal = await computeTotal(order);
    const total = Math.max(0, subtotal - (order.coupon?.amount || 0));

    res.json({ total, stripePublicKey: process.env.STRIPE_PUBLIC_KEY, order });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/payment  – charge via Stripe
router.post('/', protect, async (req, res) => {
  try {
    const { stripeToken, save, useDefault } = req.body;
    const order = await Order.findOne({
      where: { userId: req.user.id, ordered: false },
      include: ['items', 'coupon'],
    });
    if (!order) return res.status(400).json({ message: 'No active order.' });

    const user     = await User.findByPk(req.user.id);
    const subtotal = await computeTotal(order);
    const amount   = Math.round(Math.max(0, subtotal - (order.coupon?.amount || 0)) * 100); // cents

    let customerId = user.stripeCustomerId;

    // Save card for future one-click purchases
    if (save) {
      if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email });
        customerId = customer.id;
        user.stripeCustomerId = customerId;
        user.oneClickPurchasing = true;
        await user.save();
      }
      await stripe.customers.createSource(customerId, { source: stripeToken });
    }

    // Charge
    const chargeParams = { amount, currency: 'usd' };
    if (useDefault || save) chargeParams.customer = customerId;
    else chargeParams.source = stripeToken;

    const charge = await stripe.charges.create(chargeParams);

    // Persist payment
    const payment = await Payment.create({
      stripeChargeId: charge.id,
      amount: amount / 100,
      userId: user.id,
    });

    // Mark order items as ordered
    const items = await order.getItems();
    for (const oi of items) { oi.ordered = true; await oi.save(); }

    // Mark order as complete
    order.ordered     = true;
    order.paymentId   = payment.id;
    order.refCode     = createRefCode();
    order.orderedDate = new Date();
    await order.save();

    res.json({ message: 'Payment successful!', refCode: order.refCode });
  } catch (err) {
    if (err.type?.startsWith('Stripe')) {
      return res.status(402).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
});

async function computeTotal(order) {
  const items = order.items || await order.getItems({ include: ['item'] });
  return items.reduce((sum, oi) => {
    const price = oi.item?.discountPrice || oi.item?.price || 0;
    return sum + price * oi.quantity;
  }, 0);
}

module.exports = router;
