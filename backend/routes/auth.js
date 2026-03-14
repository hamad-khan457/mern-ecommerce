const express = require('express');
const jwt     = require('jsonwebtoken');
const { User } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    if (await User.findOne({ where: { email } }))
      return res.status(400).json({ message: 'Email already registered.' });
    const user = await User.create({ username, email, password, firstName, lastName });
    res.status(201).json({ token: sign(user.id), user: safe(user) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ token: sign(user.id), user: safe(user) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json(req.user));

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const { firstName, lastName, password, oneClickPurchasing } = req.body;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName  !== undefined) user.lastName  = lastName;
    if (password)                user.password  = password;
    if (oneClickPurchasing !== undefined) user.oneClickPurchasing = oneClickPurchasing;
    await user.save();
    res.json(safe(user));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const safe = (u) => ({ id: u.id, username: u.username, email: u.email, firstName: u.firstName, lastName: u.lastName, isAdmin: u.isAdmin });

module.exports = router;
