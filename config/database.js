// 데이터베이스 관련 설정
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('database_name', 'username', 'password', {
//   host: 'localhost',
//   dialect: 'mysql', // MySQL 사용 시
//   logging: false,
// });

// const connectDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Database connected successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// };

// module.exports = { sequelize, connectDB };

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// MySQL 연결 테스트
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL Database connected successfully');
    connection.release(); // 연결 해제
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

testConnection(); // 서버 시작 시 연결 테스트

export default pool;