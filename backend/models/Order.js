const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  refCode:          { type: DataTypes.STRING(20) },
  orderedDate:      { type: DataTypes.DATE },
  ordered:          { type: DataTypes.BOOLEAN, defaultValue: false },
  beingDelivered:   { type: DataTypes.BOOLEAN, defaultValue: false },
  received:         { type: DataTypes.BOOLEAN, defaultValue: false },
  refundRequested:  { type: DataTypes.BOOLEAN, defaultValue: false },
  refundGranted:    { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Order;
