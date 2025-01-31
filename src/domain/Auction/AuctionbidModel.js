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
    },
    bid_price: { type: DataTypes.DECIMAL },
    bid_date: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('BID', 'PARTICIPATE') },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    timestamps: false,
  }
);

Auction.associate = (models) => {
  Auction.belongsTo(models.User, { foreignKey: 'auction_id', as: 'auction' });
  Auction.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
};

export default AuctionBid;
