// 포트 설정 및 시작 파일
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './config/swagger-output.json' assert { type: 'json' };
import express from 'express';
import postsRoutes from 'express';
import pool from './src/domain/sequelize.js'; // MySQL 연결
import { response } from './config/response.js'; 
import { status } from './config/response.status.js';
import dotenv from 'dotenv';
import cors from 'cors';
import { verifyToken,getTempTokenByUserId } from './middlewares/authMiddleware.js';
import authRoutes from './src/domain/Authentication/authRoutes.js';
import authorRoutes from './src/domain/Author/authorRoutes.js';
import './src/domain/sequelizeRelations.js'; // 관계 설정
import userSpaceRoutes from './src/domain/User/userSpaceRoutes.js'; 
import artworkRoutes from './src/domain/Artwork/artworkCreateRoutes.js';
import artworkDetailRoutes from './src/domain/Artwork/artworkDetailRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173',  // 필요한 프론트엔드 URL 추후에 연결 후  설정
    credentials: true
  }));
  app.use(express.json());
  
  // MySQL 연결 테스트 API
  
  app.get('/', (req, res) => {
    res.send('Welcome to the Artne Server!');
  });

  app.use('/auth', authRoutes);
  app.use('/author', verifyToken, authorRoutes);

  // 인증 필요 route 정의 예시
  // 실제로는 route 파일로 분리하여 사용
  app.get('/ping', verifyToken, (req, res) => {
    res.send('Pong!');
  });

  //임시토큰발급(삭제예정)
  app.post('/temp-token/:userId',getTempTokenByUserId);

  app.use('/api', userSpaceRoutes); // 내 공간 등록
  app.use('/api', artworkRoutes); // 작품 등록
  app.use('/api', artworkDetailRoutes); // 작품 상세 조회

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

// swagger
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Route를 Express 앱에 등록
app.use('/api', postsRoutes);
