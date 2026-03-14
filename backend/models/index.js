const sequelize = require('../config/database');
const User      = require('./User');
const Item      = require('./Item');
const OrderItem = require('./OrderItem');
const Order     = require('./Order');
const Address   = require('./Address');
const Payment   = require('./Payment');
const Coupon    = require('./Coupon');
const Refund    = require('./Refund');

// User ↔ OrderItem  (each OrderItem belongs to a user)
User.hasMany(OrderItem, { foreignKey: 'userId' });
OrderItem.belongsTo(User, { foreignKey: 'userId' });

// Item ↔ OrderItem
Item.hasMany(OrderItem, { foreignKey: 'itemId' });
OrderItem.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });

// User ↔ Order
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order ↔ OrderItems (many-to-many via join table)
Order.belongsToMany(OrderItem, { through: 'OrderOrderItems', as: 'items' });
OrderItem.belongsToMany(Order,  { through: 'OrderOrderItems' });

// Order ↔ Address (shipping + billing as separate FK)
Order.belongsTo(Address, { foreignKey: 'shippingAddressId', as: 'shippingAddress' });
Order.belongsTo(Address, { foreignKey: 'billingAddressId',  as: 'billingAddress' });

// Order ↔ Payment
Order.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });
Payment.hasOne(Order, { foreignKey: 'paymentId' });

// Order ↔ Coupon
Order.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });
Coupon.hasMany(Order,   { foreignKey: 'couponId' });

// User ↔ Address
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId' });

// Order ↔ Refund
Order.hasMany(Refund,   { foreignKey: 'orderId', as: 'refunds' });
Refund.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User ↔ Payment
User.hasMany(Payment,    { foreignKey: 'userId' });
Payment.belongsTo(User,  { foreignKey: 'userId' });

module.exports = { sequelize, User, Item, OrderItem, Order, Address, Payment, Coupon, Refund };
