import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

import Agreement from '../src/domain/Agreement/Agreement.js';
import Artwork from '../src/domain/Artwork/Artwork.js';
import ArtworkCategory from '../src/domain/Artwork/ArtworkCategory.js';
import ArtworkImage from '../src/domain/Artwork/ArtworkImage.js';
import Auction from '../src/domain/Auction/Auction.js';
import AuctionBid from '../src/domain/Auction/AuctionBid.js';
import Author from '../src/domain/Author/Author.js';
import Exhibition from '../src/domain/Exhibition/Exhibition.js';
import FavoriteArtwork from '../src/domain/Favorite/FavoriteArtwork.js';
import FavoriteExhibition from '../src/domain/Favorite/FavoriteExhibition.js';
import Payment from '../src/domain/Payment/Payment.js';
import User from '../src/domain/User/User.js';
import UserSpace from '../src/domain/User/UserSpace.js';

dotenv.config();

// Sequelize 초기화
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: console.log,
});

const models = [
  User, UserSpace, Agreement, Artwork, ArtworkCategory, ArtworkImage, 
  Auction, AuctionBid, Author, Exhibition, FavoriteArtwork, FavoriteExhibition, Payment
];

const registerModels = () => models.forEach(model => sequelize.models[model.name] = model(sequelize));

// Sequelize 연결
const connectSequelize = async () => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize: Database connected successfully.');
    
    registerModels(); 

    await syncModels();
  } catch (error) {
    console.error('Sequelize: Unable to connect to the database:', error);
  }
};

// Sequelize 모델 동기화 
const syncModels = async () => {
  try {
    for (const model of models) {
      await sequelize.models[model.name].sync({ alter: true });
    }

    console.log('Sequelize: All models synchronized successfully.');
  } catch (error) {
    console.error('Sequelize: Model synchronization failed:', error);
  }
};

// MySQL2 연결 풀 설정
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// MySQL 연결 확인 및 Sequelize 연결 
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL Database connected successfully');
    connection.release();
    connectSequelize();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};
testConnection();

export default pool;
