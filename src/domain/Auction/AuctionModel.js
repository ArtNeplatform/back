import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
import Artwork from '../Artwork/ArtworkModel.js';
import Auction from './AuctionbidModel.js';

class Auction extends Model {}
Auction.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    artwork_id: {
      type: DataTypes.BIGINT,
      references: { model: Artwork, key: 'id' },
    },
    start_price: { type: DataTypes.DECIMAL },
    current_price: { type: DataTypes.DECIMAL },
    final_price: { type: DataTypes.DECIMAL },
    start_time: { type: DataTypes.DATE },
    end_time: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    timestamps: false,
  }
);

Auction.associate = (models) => {
  Auction.belongsTo(models.User, { foreignKey: 'artwork_id', as: 'artwork' });
  Auction.hasMany(models.User, { foreignKey: 'auction_id', as: 'bids' });
};

export default Auction;
