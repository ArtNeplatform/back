import { DataTypes } from 'sequelize';
import Author from '../Author/Author.js';

const Artwork = (sequelize) => {
  return sequelize.define('Artwork', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    author_id: { type: DataTypes.BIGINT, references: { model: Author(sequelize), key: 'id' } },
    title: { type: DataTypes.STRING },
    thumbnail_image_url: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    information: { type: DataTypes.TEXT },
    year: { type: DataTypes.STRING },
    material: { type: DataTypes.STRING },
    size: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING },
    genre: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
};

Artwork.associate = (models) => {
  Artwork.belongsTo(models.Author, { foreignKey: 'author_id' });
};

export default Artwork;
