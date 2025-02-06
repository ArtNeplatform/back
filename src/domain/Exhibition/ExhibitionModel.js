import { DataTypes, Model, Op } from 'sequelize';
import sequelize from '../sequelize.js';
import Author from '../Author/AuthorModel.js';
import Artwork from '../Artwork/ArtworkModel.js';

class Exhibition extends Model {
    // 전시 리스트 조회 (페이징 및 정렬 포함)
    static async getExhibitions(sortBy = 'name', page = 1, limit = 6) {
      try {
        let order = [['title', 'ASC']]; // 기본 정렬: 이름순
        if (sortBy === 'latest') order = [['created_at', 'DESC']];
        if (sortBy === 'popular') order = [['popularity', 'DESC']];

        const offset = (page - 1) * limit;
        const { count, rows } = await Exhibition.findAndCountAll({
            attributes: ['id', 'title', 'image_url', 'created_at', 'popularity'],
            order,
            limit,
            offset,
            include: [{ model: Artwork, as: 'artworks' }], // 작품 포함
        });

        return { totalItems: count, totalPages: Math.ceil(count / limit), data: rows };
    } catch (error) {
        throw error;
      }
    }
    // 전시 등록 (작품 연결 포함)
    static async createExhibition({ author_id, gallery_id, title, artworks }) {
      try {
        // 전시 생성
        const exhibition = await Exhibition.create({
          author_id,
          gallery_id,
          title,
          created_at: new Date(),
          updated_at: new Date(),
        });
        // 🎨 전시에 작품 연결 (작가의 작품만 허용)
        if (artworks && artworks.length > 0) {
          await Artwork.update(
            { exhibition_id: exhibition.id },
            { where: { id: { [Op.in]: artworks }, author_id } }
          );
        }
        return exhibition;
      } catch (error) {
        throw error;
      }
    }
    // 전시 수정 (제목 및 작품 업데이트)
    static async updateExhibition(id, { title, artworks }) {
      try {
        const exhibition = await Exhibition.findByPk(id);
        if (!exhibition) {
          throw new Error("전시를 찾을 수 없습니다.");
        }
        // 제목 업데이트
        if (title) {
          exhibition.title = title;
          await exhibition.save();
        }
        // 작품 업데이트
        if (artworks && artworks.length > 0) {
          await Artwork.update(
            { exhibition_id: id },
            { where: { id: { [Op.in]: artworks } } }
          );
        }
        return exhibition;
      } catch (error) {
        throw error;
      }
    }
    // 전시 삭제
    static async deleteExhibition(id) {
      try {
        const exhibition = await Exhibition.findByPk(id);
        if (!exhibition) {
          throw new Error("전시를 찾을 수 없습니다.");
        }
        // 전시 삭제
        await exhibition.destroy();
        return { message: "전시 삭제 완료" };
      } catch (error) {
        throw error;
      }
    }
}
// 모델 정의
Exhibition.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    author_id: { 
      type: DataTypes.BIGINT, 
      references: { model: Author, key: 'id' }
    },
    gallery_id: { 
      type: DataTypes.BIGINT, 
      allowNull: false 
    },
    title: { type: DataTypes.STRING },
    image_url: { type: DataTypes.STRING }, // 최종 전시 이미지
    background_img_url: { type: DataTypes.STRING },  // 전시 배경 이미지
    popularity: { type: DataTypes.INTEGER, defaultValue: 0 }, // 인기순 정렬을 위한 필드
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'Exhibition',
  }
);
// // 관계 설정
// Exhibition.belongsTo(Author, { foreignKey: 'author_id' });

export default Exhibition;