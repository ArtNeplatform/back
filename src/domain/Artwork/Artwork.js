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
    height: { type: DataTypes.DECIMAL(10, 2), comment: '작품 높이 (cm 단위)' },
    width: { type: DataTypes.DECIMAL(10, 2), comment: '작품 넓이 (cm 단위)' },
    number: { type: DataTypes.INTEGER, comment: '작품 호수 (예: 10)' },
    theme: {  type: DataTypes.ENUM('풍경', '인물', '정물', '동물', '추상', '팝아트', '오브제')  },
    form: { type: DataTypes.ENUM('정방향', '가로형', '세로형', '원형', '셋트', '입체/설치', '미디어') },
    genre: { type: DataTypes.STRING },
    frame: { type: DataTypes.STRING, comment: '액자 정보' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
};

Artwork.associate = (models) => {
  Artwork.belongsTo(models.Author, { foreignKey: 'author_id' });
};

export default Artwork;
