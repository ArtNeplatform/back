const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Artwork = require('./Artwork');

const ArtworkImage = sequelize.define('ArtworkImage', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  artwork_id: { type: DataTypes.BIGINT, references: { model: Artwork, key: 'id' } },
  image_url: { type: DataTypes.STRING },
});

ArtworkImage.belongsTo(Artwork, { foreignKey: 'artwork_id' });

module.exports = ArtworkImage;
