const express = require('express');
const { Order, OrderItem, Item, Address, Payment } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const orderInclude = [
  { model: OrderItem, as: 'items', include: [{ model: Item, as: 'item' }] },
  { model: Address, as: 'shippingAddress' },
  { model: Address, as: 'billingAddress' },
  { model: Payment, as: 'payment' },
];

// GET /api/orders/my  – logged in user's completed orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id, ordered: true },
      include: orderInclude,
      order: [['updatedAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/orders  – admin: all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { User } = require('../models');
    const orders = await Order.findAll({
      where: { ordered: true },
      include: [...orderInclude, { model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
      order: [['updatedAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/orders/:id/deliver  – admin: mark being delivered
router.put('/:id/deliver', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    order.beingDelivered = true;
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/orders/:id/receive  – user confirms received
router.put('/:id/receive', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    order.received = true;
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/orders/:id/grant-refund  – admin: approve refund
router.put('/:id/grant-refund', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    order.refundGranted = true;
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
