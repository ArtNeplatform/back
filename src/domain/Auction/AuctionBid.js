const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Auction = require('./Auction');
const User = require('./User');

const AuctionBid = sequelize.define('AuctionBid', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  auction_id: { type: DataTypes.BIGINT, references: { model: Auction, key: 'id' } },
  user_id: { type: DataTypes.BIGINT, references: { model: User, key: 'id' } },
  bid_price: { type: DataTypes.DECIMAL },
  bid_date: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('BID', 'PARTICIPATE') },
});

AuctionBid.belongsTo(Auction, { foreignKey: 'auction_id' });
AuctionBid.belongsTo(User, { foreignKey: 'user_id' });

module.exports = AuctionBid;
