const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('./User');
const Auction = require('./Auction');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, references: { model: User, key: 'id' } },
  auction_id: { type: DataTypes.BIGINT, references: { model: Auction, key: 'id' } },
  payment_price: { type: DataTypes.DECIMAL },
  payment_status: { type: DataTypes.ENUM('PENDING', 'COMPLETED') },
});

Payment.belongsTo(User, { foreignKey: 'user_id' });
Payment.belongsTo(Auction, { foreignKey: 'auction_id' });

module.exports = Payment;
