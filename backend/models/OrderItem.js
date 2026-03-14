const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
  ordered:  { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = OrderItem;
