import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import Agreement from './Agreement/Agreement.js';
import Artwork from './Artwork/Artwork.js';
import ArtworkCategory from './Artwork/ArtworkCategory.js';
import ArtworkImage from './Artwork/ArtworkImage.js';
import Auction from './Auction/Auction.js';
import AuctionBid from './Auction/AuctionBid.js';
import Exhibition from './Exhibition/Exhibition.js';
import FavoriteArtwork from './Favorite/FavoriteArtwork.js';
import FavoriteExhibition from './Favorite/FavoriteExhibition.js';
import UserSpace from './User/UserSpace.js';


dotenv.config();

// Sequelize 초기화
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: console.log,
  timezone : 'Asia/Seoul'
});

// // 모델 초기화
// const initModels = () => {
//   // User(sequelize);
//   // Author(sequelize);
//   UserSpace(sequelize);
//   Agreement(sequelize);
//   Artwork(sequelize);
//   ArtworkCategory(sequelize);
//   ArtworkImage(sequelize);
//   Auction(sequelize);
//   AuctionBid(sequelize);
//   Exhibition(sequelize);
//   FavoriteArtwork(sequelize);
//   FavoriteExhibition(sequelize);
//   //Payment(sequelize);
// };

// initModels(); // 모델 초기화

// const removeDuplicateIndexes = async () => {
//   const [results] = await sequelize.query(`
//     SELECT CONCAT('DROP INDEX ', INDEX_NAME, ' ON Users;') AS drop_query
//     FROM information_schema.STATISTICS
//     WHERE TABLE_SCHEMA = DATABASE()
//       AND TABLE_NAME = 'Users'
//       AND INDEX_NAME NOT IN ('PRIMARY', 'email', 'social_id');
//   `);

//   for (const row of results) {
//     await sequelize.query(row.drop_query);
//   }
// };

// 데이터베이스 연결 및 동기화
const connectSequelize = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // await removeDuplicateIndexes();

    await sequelize.sync({ alter: false });
    console.log('All models synchronized successfully');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

connectSequelize();

export default sequelize;
