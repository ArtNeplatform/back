import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
import Artwork from '../Artwork/ArtworkModel.js';
import Payment from '../Payment/PaymentModel.js';

class Auction extends Model {
  static async findAuctionById(auction_id) {
    try {
      const auction = await Auction.findOne({
        where: { id: auction_id },
      });
      return auction;
    } catch (error) {
      throw error;
    }
  }
}
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
