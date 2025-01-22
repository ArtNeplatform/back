import { DataTypes } from 'sequelize';
import User from '../User/User.js';
import Exhibition from '../Exhibition/Exhibition.js';

const FavoriteExhibition = (sequelize) => {
  return sequelize.define('FavoriteExhibition', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { 
      type: DataTypes.BIGINT, 
      references: { model: User(sequelize), key: 'id' } 
    },
    exhibition_id: { 
      type: DataTypes.BIGINT, 
      references: { model: Exhibition(sequelize), key: 'id' } 
    },
  });
};

FavoriteExhibition.associate = (models) => {
  FavoriteExhibition.belongsTo(models.User, { foreignKey: 'user_id' });
  FavoriteExhibition.belongsTo(models.Exhibition, { foreignKey: 'exhibition_id' });
};

export default FavoriteExhibition;
