const express = require('express');
const { Op }  = require('sequelize');
const { Item } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/s3');

const router = express.Router();

const CATEGORY_MAP = { S: 'Shirt', SW: 'Sport wear', OW: 'Outwear' };
const LABEL_MAP    = { P: 'primary', S: 'secondary', D: 'danger' };

// GET /api/items  – list with optional search & category filter
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const where = {};
    if (search)   where.title    = { [Op.iLike]: `%${search}%` };
    if (category) where.category = category;
    const { count, rows } = await Item.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']],
    });
    res.json({ items: rows, total: count, pages: Math.ceil(count / limit), currentPage: parseInt(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/items/:slug
router.get('/:slug', async (req, res) => {
  try {
    const item = await Item.findOne({ where: { slug: req.params.slug } });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/items  (admin, with S3 image)
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { title, price, discountPrice, category, label, slug, description } = req.body;
    const image = req.file?.location || null;
    const item = await Item.create({ title, price, discountPrice, category, label, slug, description, image });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/items/:id  (admin)
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    const fields = ['title', 'price', 'discountPrice', 'category', 'label', 'slug', 'description'];
    fields.forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });
    if (req.file?.location) item.image = req.file.location;
    await item.save();
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/items/:id  (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    await item.destroy();
    res.json({ message: 'Item deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
