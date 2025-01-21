import { DataTypes } from 'sequelize';
import Artwork from '../Artwork/Artwork.js';

const Auction = (sequelize) => {
  return sequelize.define('Auction', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    artwork_id: { 
      type: DataTypes.BIGINT, 
      references: { model: Artwork(sequelize), key: 'id' } 
    },
    start_price: { type: DataTypes.DECIMAL },
    current_price: { type: DataTypes.DECIMAL },
    final_price: { type: DataTypes.DECIMAL },
    start_time: { type: DataTypes.DATE },
    end_time: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
};

Auction.associate = (models) => {
  Auction.belongsTo(models.Artwork, { foreignKey: 'artwork_id' });
};

export default Auction;
