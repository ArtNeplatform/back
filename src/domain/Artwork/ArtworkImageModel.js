import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js'; 
import Artwork from './ArtworkModel.js'; 

class ArtworkImage extends Model {
  // 이미지 추가
  static async createArtworkImage(artworkImageData) {
    try {
      const artworkImage = await ArtworkImage.create(artworkImageData);
      return artworkImage;
    } catch (error) {
      throw error;
    }
  }

  // 이미지 조회
  static async findArtworkImageById(artworkImageId) {
    try {
      const artworkImage = await ArtworkImage.findOne({
        where: { id: artworkImageId },
      });
      return artworkImage;
    } catch (error) {
      throw error;
    }
  }

  // 이미지 수정
  static async updateArtworkImage(artworkImageId, updateData) {
    try {
      const [updated] = await ArtworkImage.update(updateData, {
        where: { id: artworkImageId },
      });

      if (updated) {
        return ArtworkImage.findOne({ where: { id: artworkImageId } });
      }
      throw new Error('ArtworkImage not found');
    } catch (error) {
      throw error;
    }
  }

  // 이미지 삭제
  static async deleteArtworkImage(artworkImageId) {
    try {
      const deleted = await ArtworkImage.destroy({
        where: { id: artworkImageId },
      });

      if (deleted) {
        return { message: 'ArtworkImage deleted successfully' };
      }
      throw new Error('ArtworkImage not found');
    } catch (error) {
      throw error;
    }
  }
}

// 모델 정의
ArtworkImage.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    artwork_id: {
      type: DataTypes.BIGINT,
      references: { model: Artwork, key: 'id' }, // Artwork 모델 참조
    },
    image_url: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize, // Sequelize 인스턴스 전달
    timestamps: false, // timestamps 비활성화
  }
);


// 관계 설정
Artwork.hasMany(ArtworkImage, { foreignKey: 'artwork_id', as: 'images' }); // 하나의 Artwork에 여러 ArtworkImage가 속함
ArtworkImage.belongsTo(Artwork, { foreignKey: 'artwork_id', as: 'artwork' }); // ArtworkImage는 하나의 Artwork에 속함

export default ArtworkImage;
