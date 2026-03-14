const express = require('express');
const { Refund, Order } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/refunds  – submit refund request by refCode
router.post('/', protect, async (req, res) => {
  try {
    const { refCode, reason, email } = req.body;
    if (!refCode || !reason || !email)
      return res.status(400).json({ message: 'refCode, reason and email are required.' });

    const order = await Order.findOne({ where: { refCode } });
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.refundRequested = true;
    await order.save();

    const refund = await Refund.create({ orderId: order.id, reason, email });
    res.status(201).json({ message: 'Refund request submitted.', refund });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/refunds  – admin: list all pending refunds
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const refunds = await Refund.findAll({
      include: [{ model: Order, as: 'order' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(refunds);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/refunds/:id/accept  – admin: accept refund
router.put('/:id/accept', protect, adminOnly, async (req, res) => {
  try {
    const refund = await Refund.findByPk(req.params.id, { include: [{ model: Order, as: 'order' }] });
    if (!refund) return res.status(404).json({ message: 'Refund not found.' });
    refund.accepted = true;
    refund.order.refundGranted = true;
    await refund.save();
    await refund.order.save();
    res.json(refund);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
