// 포트 설정 및 시작 파일
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './config/swagger-output.json' assert { type: 'json' };
import express from 'express';
import postsRoutes from 'express';
import pool from './config/database.js'; // MySQL 연결
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:3000',  // 필요한 프론트엔드 URL 추후에 연결 후  설정
    credentials: true
  }));
  app.use(express.json());
  
  // MySQL 연결 테스트 API
  
  app.get('/', (req, res) => {
    res.send('Welcome to the API!');
  });
  
  app.get('/api/test', async (req, res) => {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ solution: rows[0].solution });
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });


// function handleListening (){
//     console.log(`Listening on: http://localhost:${PORT}`);
// }

// function handleHome(req, res){
//     res.send("hello");
// }

// app.get("/", handleHome);

// app.listen(PORT, handleListening);

// swagger
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Route를 Express 앱에 등록
app.use('/api', postsRoutes);