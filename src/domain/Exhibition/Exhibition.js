const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Author = require('./Author');

const Exhibition = sequelize.define('Exhibition', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  author_id: { type: DataTypes.BIGINT, references: { model: Author, key: 'id' } },
  title: { type: DataTypes.STRING },
  image_url: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

Exhibition.belongsTo(Author, { foreignKey: 'author_id' });

module.exports = Exhibition;
