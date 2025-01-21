import { DataTypes } from 'sequelize';
import Auction from './Auction.js';
import User from '../User/User.js';

const AuctionBid = (sequelize) => {
  return sequelize.define('AuctionBid', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    auction_id: { 
      type: DataTypes.BIGINT, 
      references: { model: Auction(sequelize), key: 'id' } 
    },
    user_id: { 
      type: DataTypes.BIGINT, 
      references: { model: User(sequelize), key: 'id' } 
    },
    bid_price: { type: DataTypes.DECIMAL },
    bid_date: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('BID', 'PARTICIPATE') },
  });
};

AuctionBid.associate = (models) => {
  AuctionBid.belongsTo(models.Auction, { foreignKey: 'auction_id' });
  AuctionBid.belongsTo(models.User, { foreignKey: 'user_id' });
};

export default AuctionBid;
