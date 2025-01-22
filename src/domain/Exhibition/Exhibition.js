import { DataTypes } from 'sequelize';
import Author from '../Author/Author.js'; 

const Exhibition = (sequelize) => {
  return sequelize.define('Exhibition', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    author_id: { 
      type: DataTypes.BIGINT, 
      references: { model: Author(sequelize), key: 'id' } 
    },
    title: { type: DataTypes.STRING },
    image_url: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
};

Exhibition.associate = (models) => {
  Exhibition.belongsTo(models.Author, { foreignKey: 'author_id' });
};

export default Exhibition;
