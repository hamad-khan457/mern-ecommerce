const express = require('express');
const { Order, OrderItem, Item, Address, Coupon } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/checkout
// Assigns shipping/billing addresses + coupon to the active order
router.post('/', protect, async (req, res) => {
  try {
    const {
      // shipping
      useDefaultShipping, setDefaultShipping,
      shippingStreet, shippingApartment, shippingCountry, shippingZip,
      // billing
      useDefaultBilling, setDefaultBilling, sameBillingAddress,
      billingStreet, billingApartment, billingCountry, billingZip,
      // payment method: 'stripe' | 'paypal'
      paymentOption,
    } = req.body;

    const order = await Order.findOne({ where: { userId: req.user.id, ordered: false } });
    if (!order) return res.status(400).json({ message: 'No active order.' });

    // ── SHIPPING ────────────────────────────────────────────────────
    let shippingAddress;
    if (useDefaultShipping) {
      shippingAddress = await Address.findOne({ where: { userId: req.user.id, addressType: 'S', isDefault: true } });
      if (!shippingAddress) return res.status(400).json({ message: 'No default shipping address.' });
    } else {
      if (!shippingStreet || !shippingCountry || !shippingZip)
        return res.status(400).json({ message: 'Please fill all required shipping fields.' });
      shippingAddress = await Address.create({
        userId: req.user.id, streetAddress: shippingStreet,
        apartmentAddress: shippingApartment || '', country: shippingCountry,
        zip: shippingZip, addressType: 'S', isDefault: !!setDefaultShipping,
      });
      if (setDefaultShipping)
        await Address.update({ isDefault: false }, { where: { userId: req.user.id, addressType: 'S', id: { $ne: shippingAddress.id } } });
    }
    order.shippingAddressId = shippingAddress.id;

    // ── BILLING ─────────────────────────────────────────────────────
    let billingAddress;
    if (sameBillingAddress) {
      // clone shipping as billing
      billingAddress = await Address.create({
        userId: req.user.id, streetAddress: shippingAddress.streetAddress,
        apartmentAddress: shippingAddress.apartmentAddress, country: shippingAddress.country,
        zip: shippingAddress.zip, addressType: 'B', isDefault: false,
      });
    } else if (useDefaultBilling) {
      billingAddress = await Address.findOne({ where: { userId: req.user.id, addressType: 'B', isDefault: true } });
      if (!billingAddress) return res.status(400).json({ message: 'No default billing address.' });
    } else {
      if (!billingStreet || !billingCountry || !billingZip)
        return res.status(400).json({ message: 'Please fill all required billing fields.' });
      billingAddress = await Address.create({
        userId: req.user.id, streetAddress: billingStreet,
        apartmentAddress: billingApartment || '', country: billingCountry,
        zip: billingZip, addressType: 'B', isDefault: !!setDefaultBilling,
      });
    }
    order.billingAddressId = billingAddress.id;
    order.paymentOption = paymentOption || 'stripe';
    await order.save();

    res.json({ message: 'Checkout info saved.', orderId: order.id, paymentOption: order.paymentOption });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
