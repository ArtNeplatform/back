import { DataTypes } from 'sequelize';
import User from './User.js';

const UserSpace = (sequelize) => {
  return sequelize.define('UserSpace', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, references: { model: User(sequelize), key: 'id' } },
    name: { type: DataTypes.STRING },
    image_url: { type: DataTypes.STRING },
    area: { type: DataTypes.STRING },
  });
};

UserSpace.associate = (models) => {
  UserSpace.belongsTo(models.User, { foreignKey: 'user_id' });
};

export default UserSpace;
