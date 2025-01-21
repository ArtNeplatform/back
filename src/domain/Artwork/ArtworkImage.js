import { DataTypes } from 'sequelize';
import Artwork from './Artwork.js';

const ArtworkImage = (sequelize) => {
  return sequelize.define('ArtworkImage', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    artwork_id: { 
      type: DataTypes.BIGINT, 
      references: { model: Artwork(sequelize), key: 'id' }  
    },
    image_url: { type: DataTypes.STRING },
  });
};

ArtworkImage.associate = (models) => {
  ArtworkImage.belongsTo(models.Artwork, { foreignKey: 'artwork_id' });
};

export default ArtworkImage;
