const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  profile_image_url: { type: DataTypes.STRING },
  nickname: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  role: { type: DataTypes.ENUM('BUYER', 'AUTHOR') },
  social_type: { type: DataTypes.ENUM('KAKAO', 'GOOGLE') },
  name: { type: DataTypes.STRING },
  phone_number: { type: DataTypes.STRING },
  birth: { type: DataTypes.DATE },
  address: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = User;
