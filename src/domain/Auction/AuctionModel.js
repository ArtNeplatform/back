import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
import Artwork from '../Artwork/ArtworkModel.js';

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
  },
  {
    modelName: 'Auction',
    sequelize,
    timestamps: true,
  }
);

export default Auction;
