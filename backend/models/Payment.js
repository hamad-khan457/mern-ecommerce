const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  stripeChargeId: { type: DataTypes.STRING(50), allowNull: false },
  amount:         { type: DataTypes.FLOAT, allowNull: false },
});

module.exports = Payment;
