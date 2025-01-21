import { DataTypes } from 'sequelize';
import User from '../User/User.js';
import Auction from '../Auction/Auction.js';

const Payment = (sequelize) => {
  return sequelize.define('Payment', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { 
      type: DataTypes.BIGINT, 
      references: { model: User(sequelize), key: 'id' } 
    },
    auction_id: { 
      type: DataTypes.BIGINT, 
      references: { model: Auction(sequelize), key: 'id' } 
    },
    payment_price: { type: DataTypes.DECIMAL },
    payment_status: { type: DataTypes.ENUM('PENDING', 'COMPLETED') },
  });
};

Payment.associate = (models) => {
  Payment.belongsTo(models.User, { foreignKey: 'user_id' });
  Payment.belongsTo(models.Auction, { foreignKey: 'auction_id' });
};

export default Payment;
