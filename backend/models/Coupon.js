const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code:   { type: DataTypes.STRING(15), allowNull: false, unique: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
});

module.exports = Coupon;
