const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('./User');

const Agreement = sequelize.define('Agreement', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, references: { model: User, key: 'id' } },
  email_status: { type: DataTypes.BOOLEAN },
  sms_status: { type: DataTypes.BOOLEAN },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

Agreement.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Agreement;
