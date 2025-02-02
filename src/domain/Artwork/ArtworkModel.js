import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js'; 
import Author from '../Author/AuthorModel.js'; 

class Artwork extends Model {
  // 작품 생성
  static async createArtwork(artworkData) {
    try {
      const artwork = await Artwork.create(artworkData);
      return artwork;
    } catch (error) {
      throw error;
    }
  }

  // 작품 조회
  static async findArtworkById(artworkId) {
    try {
      const artwork = await Artwork.findOne({
        where: { id: artworkId },
        include: [{ model: Author, as: 'author' }] // Author 모델 포함
      });

      return artwork;
    } catch (error) {
      throw error;
    }
  }

  // 작품 수정
  static async updateArtwork(artworkId, updateData) {
    try {
      const [updated] = await Artwork.update(updateData, {
        where: { id: artworkId },
      });

      if (updated) {
        return Artwork.findOne({ where: { id: artworkId } });
      }
      throw new Error('Artwork not found');
    } catch (error) {
      throw error;
    }
  }

  // 작품 삭제
  static async deleteArtwork(artworkId) {
    try {
      const deleted = await Artwork.destroy({
        where: { id: artworkId },
      });

      if (deleted) {
        return { message: 'Artwork deleted successfully' };
      }
      throw new Error('Artwork not found');
    } catch (error) {
      throw error;
    }
  }

  // 작가별 작품 조회
  static async findArtworksByAuthor(authorId) {
    try {
      const artworks = await Artwork.findAll({
        where: { author_id: authorId },
        include: [{ model: Author, as: 'author' }] // Author 모델 포함
      });

      return artworks;
    } catch (error) {
      throw error;
    }
  }
}

// 모델 정의
Artwork.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    author_id: { type: DataTypes.BIGINT, references: { model: 'Authors', key: 'id' } },
    title: { type: DataTypes.STRING },
    thumbnail_image_url: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    information: { type: DataTypes.TEXT },
    year: { type: DataTypes.STRING },
    material: { type: DataTypes.STRING },
    height: { type: DataTypes.DECIMAL(10, 2), comment: '작품 높이 (cm 단위)' },
    width: { type: DataTypes.DECIMAL(10, 2), comment: '작품 넓이 (cm 단위)' },
    number: { type: DataTypes.INTEGER, comment: '작품 호수 (예: 10)' },
    theme: { type: DataTypes.ENUM('풍경', '인물', '정물', '동물', '추상', '팝아트', '오브제') },
    form: { type: DataTypes.ENUM('정방향', '가로형', '세로형', '원형', '셋트', '입체/설치', '미디어') },
    genre: { type: DataTypes.STRING },
    frame: { type: DataTypes.STRING, comment: '액자 정보' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatead_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize, // Sequelize 인스턴스 전달
    timestamps: false, // timestamps 비활성화
  }
);


export default Artwork;
