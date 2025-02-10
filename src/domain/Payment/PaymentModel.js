import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js'; 
import User from '../User/UserModel.js';

class Payment extends Model {
  // 결제 생성
  static async createPayment(paymentData) {
    try {
      const payment = await Payment.create(paymentData);
      return payment;
    } catch (error) {
      throw error;
    }
  }

  // 결제 조회
  static async findPaymentById(paymentId) {
    try {
      const payment = await Payment.findOne({
        where: { id: paymentId },
      });
      return payment;
    } catch (error) {
      throw error;
    }
  }

  // 결제 수정
  static async updatePayment(paymentId, updateData) {
    try {
      const [updated] = await Payment.update(updateData, {
        where: { id: paymentId },
      });

      if (updated) {
        return Payment.findOne({ where: { id: paymentId } });
      }
      throw new Error('Payment not found');
    } catch (error) {
      throw error;
    }
  }

  // 결제 삭제
  static async deletePayment(paymentId) {
    try {
      const deleted = await Payment.destroy({
        where: { id: paymentId },
      });

      if (deleted) {
        return { message: 'Payment deleted successfully' };
      }
      throw new Error('Payment not found');
    } catch (error) {
      throw error;
    }
  }

  // 상태 업데이트
  static async updatePaymentStatus(paymentId, status) {
    try {
      const [updated] = await Payment.update(
        { payment_status: status },
        {
          where: { id: paymentId },
        }
      );

      if (updated) {
        return Payment.findOne({ where: { id: paymentId } });
      }
      throw new Error('Payment not found');
    } catch (error) {
      throw error;
    }
  }

  // kakaopay tid 저장
  static async updateKakaoPayTid(paymentId, tid) {
    try {
      const [updated] = await Payment.update(
        { kakaopay_tid: tid },
        {
          where: { id: paymentId },
        }
      );

      if (updated) {
        return Payment.findOne({ where: { id: paymentId } });
      }
      throw new Error('Payment not found');
    } catch (error) {
      throw error;
    }
  }
}

// 모델 정의
Payment.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: {
        type: DataTypes.BIGINT,
        references: { model: User, key: 'id' },
      },
      auction_id: { 
        type: DataTypes.BIGINT, 
        references: { model: 'Auctions', key: 'id' } // Auction은 문자열로 참조
      },
      payment_price: { type: DataTypes.DECIMAL },
      payment_status: { type: DataTypes.ENUM('PENDING', 'COMPLETED') },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      kakaopay_tid: { type: DataTypes.STRING },
    },
    {
      sequelize, 
      timestamps: false, 
    }
);


export default Payment;
