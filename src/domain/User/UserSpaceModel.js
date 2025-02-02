import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js'; 
import User from './UserModel.js'; 

class UserSpace extends Model {
  // 사용자 공간 생성
  static async createUserSpace(userSpaceData) {
    try {
      const userSpace = await UserSpace.create(userSpaceData);
      return userSpace;
    } catch (error) {
      throw error;
    }
  }

  // 사용자 공간 조회
  static async findUserSpaceById(userSpaceId) {
    try {
      const userSpace = await UserSpace.findOne({
        where: { id: userSpaceId },
      });
      return userSpace;
    } catch (error) {
      throw error;
    }
  }

  // 사용자 공간 수정
  static async updateUserSpace(userSpaceId, updateData) {
    try {
      const [updated] = await UserSpace.update(updateData, {
        where: { id: userSpaceId },
      });

      if (updated) {
        return UserSpace.findOne({ where: { id: userSpaceId } });
      }
      throw new Error('UserSpace not found');
    } catch (error) {
      throw error;
    }
  }

  // 사용자 공간 삭제
  static async deleteUserSpace(userSpaceId) {
    try {
      const deleted = await UserSpace.destroy({
        where: { id: userSpaceId },
      });

      if (deleted) {
        return { message: 'UserSpace deleted successfully' };
      }
      throw new Error('UserSpace not found');
    } catch (error) {
      throw error;
    }
  }
}

// 모델 정의
UserSpace.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.BIGINT,
      references: { model: User, key: 'id' }, // User 모델 참조
    },
    name: { type: DataTypes.STRING },
    image_url: { type: DataTypes.STRING },
    area: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize, // Sequelize 인스턴스 전달
    timestamps: false, // timestamps 비활성화
  }
);

// 관계 설정
UserSpace.associate = (models) => {
  UserSpace.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
};

export default UserSpace;
