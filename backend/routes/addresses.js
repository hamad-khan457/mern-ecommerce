const express = require('express');
const { Address } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/addresses
router.get('/', protect, async (req, res) => {
  try {
    const addresses = await Address.findAll({ where: { userId: req.user.id } });
    res.json(addresses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/addresses
router.post('/', protect, async (req, res) => {
  try {
    const { streetAddress, apartmentAddress, country, zip, addressType, isDefault } = req.body;
    // if setting as default, unset existing defaults of same type
    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id, addressType } });
    }
    const address = await Address.create({ streetAddress, apartmentAddress, country, zip, addressType, isDefault, userId: req.user.id });
    res.status(201).json(address);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/addresses/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return res.status(404).json({ message: 'Address not found.' });
    if (req.body.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id, addressType: address.addressType } });
    }
    await address.update(req.body);
    res.json(address);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/addresses/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return res.status(404).json({ message: 'Address not found.' });
    await address.destroy();
    res.json({ message: 'Address deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
