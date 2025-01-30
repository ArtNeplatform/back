import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js'; 
import User from '../User/UserModel.js'; 
import Artwork from '../Artwork/ArtworkModel.js'; 

class Author extends Model {
  // 작가 생성
  static async createAuthor(authorData) {
    try {
      const author = await Author.create(authorData);
      return author;
    } catch (error) {
      throw error;
    }
  }

  // 작가 조회
  static async findAuthorById(authorId) {
    try {
      const author = await Author.findOne({
        where: { id: authorId },
      });
      return author;
    } catch (error) {
      throw error;
    }
  }

  // 작가 수정
  static async updateAuthor(authorId, updateData) {
    try {
      const [updated] = await Author.update(updateData, {
        where: { id: authorId },
      });

      if (updated) {
        return Author.findOne({ where: { id: authorId } });
      }
      throw new Error('Author not found');
    } catch (error) {
      throw error;
    }
  }

  // 작가 삭제
  static async deleteAuthor(authorId) {
    try {
      const deleted = await Author.destroy({
        where: { id: authorId },
      });

      if (deleted) {
        return { message: 'Author deleted successfully' };
      }
      throw new Error('Author not found');
    } catch (error) {
      throw error;
    }
  }
}

// 모델 정의
Author.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: {
        type: DataTypes.BIGINT,
        references: { model: User, key: 'id' }, // User 모델 참조
      },
      author_name: { type: DataTypes.STRING },
      author_image_url: { type: DataTypes.STRING },
      introduction_image_url: { type: DataTypes.STRING },
      education: { type: DataTypes.TEXT },
      award: { type: DataTypes.TEXT },
      experience: { type: DataTypes.TEXT },
      description: { type: DataTypes.TEXT },
      work_style: { type: DataTypes.TEXT },
      bank_name: { type: DataTypes.STRING },
      account_holder: { type: DataTypes.STRING },
      account_number: { type: DataTypes.STRING },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize, // Sequelize 인스턴스 전달
      timestamps: false, // timestamps 비활성화
    }
);


// Author.belongsTo(User, { foreignKey: 'user_id' }); 
// Artwork.belongsTo(Author, { foreignKey: 'author_id', as: 'author' });
// Author.hasMany(Artwork, { foreignKey: 'author_id', as: 'artworks' });


export default Author;
