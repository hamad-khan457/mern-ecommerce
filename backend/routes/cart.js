const express = require('express');
const { Order, OrderItem, Item } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// helper: get the active (not ordered) order for user, with items
const getActiveOrder = async (userId) => {
  return Order.findOne({
    where: { userId, ordered: false },
    include: [{
      model: OrderItem,
      as: 'items',
      include: [{ model: Item, as: 'item' }],
    }],
  });
};

// GET /api/cart  – order summary
router.get('/', protect, async (req, res) => {
  try {
    const order = await getActiveOrder(req.user.id);
    if (!order) return res.json({ items: [], total: 0 });
    res.json(formatOrder(order));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/cart/add/:slug  – mirrors Django add_to_cart
router.post('/add/:slug', protect, async (req, res) => {
  try {
    const item = await Item.findOne({ where: { slug: req.params.slug } });
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    // get or create an OrderItem for this user+item (not yet ordered)
    let [orderItem, created] = await OrderItem.findOrCreate({
      where: { itemId: item.id, userId: req.user.id, ordered: false },
      defaults: { quantity: 1 },
    });
    if (!created) { orderItem.quantity += 1; await orderItem.save(); }

    // get or create the active order
    let order = await Order.findOne({ where: { userId: req.user.id, ordered: false } });
    if (!order) {
      order = await Order.create({ userId: req.user.id, orderedDate: new Date() });
    }
    const alreadyIn = await order.hasItem(orderItem);
    if (!alreadyIn) await order.addItem(orderItem);

    const fresh = await getActiveOrder(req.user.id);
    res.json(formatOrder(fresh));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/cart/remove/:slug  – remove item entirely
router.delete('/remove/:slug', protect, async (req, res) => {
  try {
    const item  = await Item.findOne({ where: { slug: req.params.slug } });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    const order = await Order.findOne({ where: { userId: req.user.id, ordered: false } });
    if (!order) return res.status(404).json({ message: 'No active order.' });

    const orderItem = await OrderItem.findOne({ where: { itemId: item.id, userId: req.user.id, ordered: false } });
    if (orderItem) {
      await order.removeItem(orderItem);
      await orderItem.destroy();
    }
    const fresh = await getActiveOrder(req.user.id);
    res.json(fresh ? formatOrder(fresh) : { items: [], total: 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/cart/remove-single/:slug  – decrement qty by 1
router.patch('/remove-single/:slug', protect, async (req, res) => {
  try {
    const item  = await Item.findOne({ where: { slug: req.params.slug } });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    const order = await Order.findOne({ where: { userId: req.user.id, ordered: false } });
    if (!order) return res.status(404).json({ message: 'No active order.' });

    const orderItem = await OrderItem.findOne({ where: { itemId: item.id, userId: req.user.id, ordered: false } });
    if (orderItem) {
      if (orderItem.quantity > 1) {
        orderItem.quantity -= 1;
        await orderItem.save();
      } else {
        await order.removeItem(orderItem);
        await orderItem.destroy();
      }
    }
    const fresh = await getActiveOrder(req.user.id);
    res.json(fresh ? formatOrder(fresh) : { items: [], total: 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// helper: compute totals (mirrors Django Order.get_total)
function formatOrder(order) {
  const items = order.items || [];
  const subtotal = items.reduce((sum, oi) => {
    const price = oi.item?.discountPrice || oi.item?.price || 0;
    return sum + price * oi.quantity;
  }, 0);
  return {
    id: order.id,
    items: items.map(oi => ({
      id: oi.id,
      quantity: oi.quantity,
      item: oi.item,
      totalItemPrice:    oi.quantity * (oi.item?.price || 0),
      finalPrice:        oi.quantity * (oi.item?.discountPrice || oi.item?.price || 0),
      amountSaved:       oi.item?.discountPrice
        ? oi.quantity * ((oi.item?.price || 0) - (oi.item?.discountPrice || 0))
        : 0,
    })),
    subtotal,
    couponDiscount: order.coupon?.amount || 0,
    total: Math.max(0, subtotal - (order.coupon?.amount || 0)),
    coupon: order.coupon || null,
    shippingAddress: order.shippingAddress || null,
    billingAddress: order.billingAddress || null,
  };
}

module.exports = router;
