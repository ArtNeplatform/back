const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Artwork = require('./Artwork');

const ArtworkCategory = sequelize.define('ArtworkCategory', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  artwork_id: { type: DataTypes.BIGINT, references: { model: Artwork, key: 'id' } },
  category_type: { type: DataTypes.ENUM('THEME', 'SIZE', 'FORM') },
  category_value: { type: DataTypes.STRING },
});

ArtworkCategory.belongsTo(Artwork, { foreignKey: 'artwork_id' });

module.exports = ArtworkCategory;
