const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Refund = sequelize.define('Refund', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reason:   { type: DataTypes.TEXT, allowNull: false },
  email:    { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Refund;
