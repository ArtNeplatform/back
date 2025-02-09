import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
import User from '../User/UserModel.js';
import Artwork from '../Artwork/ArtworkModel.js';

class FavoriteArtwork extends Model {
  // 즐겨찾기 추가
  static async addFavorite(userId, artworkId) {
    try {
      return await FavoriteArtwork.create({ user_id: userId, artwork_id: artworkId });
    } catch (error) {
      throw error;
    }
  }

  // 특정 사용자의 즐겨찾기 목록 조회
  static async findFavoritesByUser(userId) {
    try {
      return await FavoriteArtwork.findAll({
        where: { user_id: userId },
        include: [
          { model: Artwork, as: 'artwork' },
          { model: User, as: 'user' }
        ]
      });
    } catch (error) {
      throw error;
    }
  }

  // 즐겨찾기 삭제
  static async removeFavorite(userId, artworkId) {
    try {
      const deleted = await FavoriteArtwork.destroy({
        where: { user_id: userId, artwork_id: artworkId },
      });
      
      if (deleted) {
        return { message: 'Favorite artwork removed successfully' };
      }
      throw new Error('Favorite artwork not found');
    } catch (error) {
      throw error;
    }
  }
}

// 모델 정의
FavoriteArtwork.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { 
      type: DataTypes.BIGINT, 
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    artwork_id: { 
      type: DataTypes.BIGINT, 
      references: { model: 'Artworks', key: 'id' } 
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize, // Sequelize 인스턴스 전달
    modelName: 'FavoriteArtwork',
    timestamps: false, // timestamps 비활성화
  }
);

// 관계 설정
FavoriteArtwork.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
FavoriteArtwork.belongsTo(Artwork, { foreignKey: 'artwork_id', as: 'artwork' });

export default FavoriteArtwork;
