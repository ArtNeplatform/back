const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Author = require('./Author');

const Artwork = sequelize.define('Artwork', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  author_id: { type: DataTypes.BIGINT, references: { model: Author, key: 'id' } },
  title: { type: DataTypes.STRING },
  thumbnail_image_url: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  information: { type: DataTypes.TEXT },
  year: { type: DataTypes.STRING },
  material: { type: DataTypes.STRING },
  size: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  genre: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

Artwork.belongsTo(Author, { foreignKey: 'author_id' });

module.exports = Artwork;
