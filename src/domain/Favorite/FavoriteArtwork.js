import { DataTypes } from 'sequelize';
import User from '../User/User.js';
import Artwork from '../Artwork/Artwork.js';

const FavoriteArtwork = (sequelize) => {
  return sequelize.define('FavoriteArtwork', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { 
      type: DataTypes.BIGINT, 
      references: { model: User(sequelize), key: 'id' } 
    },
    artwork_id: { 
      type: DataTypes.BIGINT, 
      references: { model: Artwork(sequelize), key: 'id' } 
    },
  });
};

FavoriteArtwork.associate = (models) => {
  FavoriteArtwork.belongsTo(models.User, { foreignKey: 'user_id' });
  FavoriteArtwork.belongsTo(models.Artwork, { foreignKey: 'artwork_id' });
};

export default FavoriteArtwork;
