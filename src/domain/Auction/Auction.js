const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Artwork = require('./Artwork');

const Auction = sequelize.define('Auction', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  artwork_id: { type: DataTypes.BIGINT, references: { model: Artwork, key: 'id' } },
  start_price: { type: DataTypes.DECIMAL },
  current_price: { type: DataTypes.DECIMAL },
  final_price: { type: DataTypes.DECIMAL },
  start_time: { type: DataTypes.DATE },
  end_time: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

Auction.belongsTo(Artwork, { foreignKey: 'artwork_id' });

module.exports = Auction;
