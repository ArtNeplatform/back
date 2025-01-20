const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('./User');
const Artwork = require('./Artwork');

const FavoriteArtwork = sequelize.define('FavoriteArtwork', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, references: { model: User, key: 'id' } },
  artwork_id: { type: DataTypes.BIGINT, references: { model: Artwork, key: 'id' } },
});

FavoriteArtwork.belongsTo(User, { foreignKey: 'user_id' });
FavoriteArtwork.belongsTo(Artwork, { foreignKey: 'artwork_id' });

module.exports = FavoriteArtwork;
