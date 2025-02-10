import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
import User from '../User/UserModel.js';
import Auction from './AuctionModel.js';

class AuctionBid extends Model {
}

AuctionBid.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    auction_id: {
      type: DataTypes.BIGINT,
      references: { model: Auction, key: 'id' },
    },
    user_id: {
      type: DataTypes.BIGINT,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
    bid_price: { type: DataTypes.DECIMAL },
    bid_date: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('BID', 'PARTICIPATE') },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    modelName: 'AuctionBid',
    sequelize,
    timestamps: false,
  }
);

export default AuctionBid;
