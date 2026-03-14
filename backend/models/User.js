const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id:                  { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  username:            { type: DataTypes.STRING, allowNull: false, unique: true },
  email:               { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password:            { type: DataTypes.STRING, allowNull: false },
  firstName:           { type: DataTypes.STRING, defaultValue: '' },
  lastName:            { type: DataTypes.STRING, defaultValue: '' },
  isAdmin:             { type: DataTypes.BOOLEAN, defaultValue: false },
  // UserProfile fields merged in
  stripeCustomerId:    { type: DataTypes.STRING },
  oneClickPurchasing:  { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  hooks: {
    beforeCreate: async (u) => { u.password = await bcrypt.hash(u.password, 12); },
    beforeUpdate: async (u) => { if (u.changed('password')) u.password = await bcrypt.hash(u.password, 12); },
  },
});

User.prototype.comparePassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

module.exports = User;
