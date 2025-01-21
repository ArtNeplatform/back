import { DataTypes } from 'sequelize';
import Artwork from './Artwork.js';

const ArtworkCategory = (sequelize) => {
  return sequelize.define('ArtworkCategory', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    artwork_id: { 
      type: DataTypes.BIGINT, 
      references: { model: Artwork(sequelize), key: 'id' }  
    },
    category_type: { type: DataTypes.ENUM('THEME', 'SIZE', 'FORM') },
    category_value: { type: DataTypes.STRING },
  });
};

ArtworkCategory.associate = (models) => {
  ArtworkCategory.belongsTo(models.Artwork, { foreignKey: 'artwork_id' });
};

export default ArtworkCategory;
