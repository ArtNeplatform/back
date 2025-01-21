import { DataTypes } from 'sequelize';

const Agreement = (sequelize) => {
  return sequelize.define('Agreement', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_or_author_id: { 
      type: DataTypes.BIGINT, 
      allowNull: false,
    },
    role: { 
      type: DataTypes.ENUM('BUYER', 'AUTHOR'), 
      allowNull: false 
    },
    email_status: { type: DataTypes.BOOLEAN },
    sms_status: { type: DataTypes.BOOLEAN },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
};

Agreement.associate = (models) => {
  Agreement.belongsTo(models.User, { 
    foreignKey: 'user_or_author_id', 
    targetKey: 'id',
    constraints: false, 
    scope: { role: 'BUYER' },
  });

  Agreement.belongsTo(models.Author, { 
    foreignKey: 'user_or_author_id', 
    targetKey: 'id',
    constraints: false, 
    scope: { role: 'AUTHOR' },
  });
};

export default Agreement;
