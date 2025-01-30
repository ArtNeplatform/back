import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js'; 
import Author from '../Author/AuthorModel.js'; 

class Exhibition extends Model {
  // 전시회 생성
  static async createExhibition(exhibitionData) {
    try {
      const exhibition = await Exhibition.create(exhibitionData);
      return exhibition;
    } catch (error) {
      throw error;
    }
  }

  // 전시회 조회
  static async findExhibitionById(exhibitionId) {
    try {
      const exhibition = await Exhibition.findOne({
        where: { id: exhibitionId },
      });
      return exhibition;
    } catch (error) {
      throw error;
    }
  }

  // 전시회 수정
  static async updateExhibition(exhibitionId, updateData) {
    try {
      const [updated] = await Exhibition.update(updateData, {
        where: { id: exhibitionId },
      });

      if (updated) {
        return Exhibition.findOne({ where: { id: exhibitionId } });
      }
      throw new Error('Exhibition not found');
    } catch (error) {
      throw error;
    }
  }

  // 전시회 삭제
  static async deleteExhibition(exhibitionId) {
    try {
      const deleted = await Exhibition.destroy({
        where: { id: exhibitionId },
      });

      if (deleted) {
        return { message: 'Exhibition deleted successfully' };
      }
      throw new Error('Exhibition not found');
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
      references: { model: Author, key: 'id' }, // Author 모델 참조
    },
    title: { type: DataTypes.STRING },
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
Exhibition.associate = (models) => {
  Exhibition.belongsTo(models.Author, { foreignKey: 'author_id' });
};

export default Exhibition;
