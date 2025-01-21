const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('./User');
const Exhibition = require('./Exhibition');

const FavoriteExhibition = sequelize.define('FavoriteExhibition', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, references: { model: User, key: 'id' } },
  exhibition_id: { type: DataTypes.BIGINT, references: { model: Exhibition, key: 'id' } },
});

FavoriteExhibition.belongsTo(User, { foreignKey: 'user_id' });
FavoriteExhibition.belongsTo(Exhibition, { foreignKey: 'exhibition_id' });

module.exports = FavoriteExhibition;
