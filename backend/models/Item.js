const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Matches Django CATEGORY_CHOICES and LABEL_CHOICES
const CATEGORIES = ['S', 'SW', 'OW'];   // Shirt, Sport wear, Outwear
const LABELS     = ['P', 'S', 'D'];     // primary, secondary, danger

const Item = sequelize.define('Item', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title:         { type: DataTypes.STRING(100), allowNull: false },
  price:         { type: DataTypes.FLOAT, allowNull: false },
  discountPrice: { type: DataTypes.FLOAT },
  category:      { type: DataTypes.ENUM(...CATEGORIES), allowNull: false },
  label:         { type: DataTypes.ENUM(...LABELS), allowNull: false },
  slug:          { type: DataTypes.STRING, allowNull: false, unique: true },
  description:   { type: DataTypes.TEXT, allowNull: false },
  image:         { type: DataTypes.STRING },   // S3 URL
});

// Helper — mirrors Django get_final_price logic
Item.prototype.getFinalPrice = function () {
  return this.discountPrice || this.price;
};

module.exports = Item;
