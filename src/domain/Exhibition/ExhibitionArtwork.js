import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
import Exhibition from './ExhibitionModel.js';
import Artwork from '../Artwork/ArtworkModel.js';

class ExhibitionArtwork extends Model {}

ExhibitionArtwork.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    exhi_id: { 
      type: DataTypes.BIGINT, 
      allowNull: false, 
      references: { model: 'Exhibition', key: 'exhi_id' }
    },
    artwork_id: { 
      type: DataTypes.BIGINT, 
      allowNull: false, 
      references: { model: Artwork, key: 'id' }
    }
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'ExhibitionArtwork',
  }
);

// // 관계 설정
// Exhibition.belongsToMany(Artwork, { through: ExhibitionArtwork, foreignKey: 'exhi_id' });
// Artwork.belongsToMany(Exhibition, { through: ExhibitionArtwork, foreignKey: 'artwork_id' });

export default ExhibitionArtwork;
