import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
import User from '../User/UserModel.js';
import Exhibition from '../Exhibition/ExhibitionModel.js';

class FavoriteExhibition extends Model {}

FavoriteExhibition.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { 
      type: DataTypes.BIGINT, 
      references: { model: User, key: 'id' }
    },
    exhibition_id: { 
      type: DataTypes.BIGINT, 
      references: { model: Exhibition, key: 'id' }
    },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    modelName: 'FavoriteExhibition',
    tableName: 'FavoriteExhibitions',
    timestamps: true
  }
);

export default FavoriteExhibition;