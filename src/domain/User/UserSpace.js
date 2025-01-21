const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('./User');

const UserSpace = sequelize.define('UserSpace', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, references: { model: User, key: 'id' } },
  name: { type: DataTypes.STRING },
  image_url: { type: DataTypes.STRING },
  area: { type: DataTypes.STRING },
});

UserSpace.belongsTo(User, { foreignKey: 'user_id' });

module.exports = UserSpace;
