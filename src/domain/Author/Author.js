const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('./User');

const Author = sequelize.define('Author', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, references: { model: User, key: 'id' } },
  author_name: { type: DataTypes.STRING },
  author_image_url: { type: DataTypes.STRING },
  introduction_image_url: { type: DataTypes.STRING },
  education: { type: DataTypes.TEXT },
  award: { type: DataTypes.TEXT },
  experience: { type: DataTypes.TEXT },
  bank_name: { type: DataTypes.STRING },
  account_holder: { type: DataTypes.STRING },
  account_number: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

Author.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Author;
