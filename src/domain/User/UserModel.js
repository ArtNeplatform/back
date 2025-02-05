import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js'; // Sequelize 인스턴스 가져오기

class User extends Model {
  static async createUser(userData) {
    try {
      const { email, social_id } = userData;

      // 이메일 중복 확인
      const existingEmail = await User.findOne({
        where: { email },
      });

      if (existingEmail) {
        throw new Error('Email already exists');
      }

      // 소셜 ID 중복 확인
      const existingId = await User.findOne({
        where: { social_id },
      });

      if (existingId) {
        throw new Error('Social ID already exists');
      }

      // 사용자 생성
      const user = await User.create(userData);
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  static async findUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  static async userUpdate(userData) {
    try {
      const { email } = userData;

      // 사용자 정보 업데이트 (닉네임, 생년월일, 주소)만 업데이트
      let newData = {};
      if (userData.nickname) newData.nickname = userData.nickname;
      if (userData.birth) newData.birth = userData.birth;
      if (userData.address) newData.address = userData.address;
      
      await User.update(newData, {
        where: { email },
      });

      const updatedUser = await User.findOne({
        where: { email },
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}

// 모델 정의
User.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    social_id : { type: DataTypes.STRING, unique: true},
    profile_image_url: { type: DataTypes.STRING },
    nickname: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    social_type: { type: DataTypes.ENUM('KAKAO', 'GOOGLE') },
    name: { type: DataTypes.STRING },
    phone_number: { type: DataTypes.STRING },
    birth: { type: DataTypes.DATE },
    address: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM('BUYER', 'AUTHOR') },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize, // Sequelize 인스턴스 전달
    timestamps: false, // timestamps 비활성화
  }
);

export default User;