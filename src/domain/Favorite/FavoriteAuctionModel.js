import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
import User from '../User/UserModel.js';
import Auction from '../Auction/AuctionModel.js';

class FavoriteAuction extends Model {}

FavoriteAuction.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.BIGINT,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
    auction_id: {
      type: DataTypes.BIGINT,
      references: { model: Auction, key: 'id' },
    },
  },
  {
    modelName: 'FavoriteAuction',
    sequelize,
    timestamps: true,
  }
);

export default FavoriteAuction;
