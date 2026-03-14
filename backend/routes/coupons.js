const express = require('express');
const { Coupon, Order } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/coupons/apply  – apply coupon code to active order
router.post('/apply', protect, async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ where: { code } });
    if (!coupon) return res.status(404).json({ message: 'Coupon does not exist.' });

    const order = await Order.findOne({ where: { userId: req.user.id, ordered: false } });
    if (!order) return res.status(400).json({ message: 'No active order.' });

    order.couponId = coupon.id;
    await order.save();
    res.json({ message: 'Coupon applied!', coupon });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin CRUD
router.get('/', protect, adminOnly, async (req, res) => {
  res.json(await Coupon.findAll());
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Coupon deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
