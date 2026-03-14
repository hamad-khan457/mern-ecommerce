const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  streetAddress:    { type: DataTypes.STRING(100), allowNull: false },
  apartmentAddress: { type: DataTypes.STRING(100), defaultValue: '' },
  country:          { type: DataTypes.STRING(2), allowNull: false },   // ISO 2-letter code
  zip:              { type: DataTypes.STRING(20), allowNull: false },
  addressType:      { type: DataTypes.ENUM('B', 'S'), allowNull: false },  // Billing / Shipping
  isDefault:        { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Address;
