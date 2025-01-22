// 포트 설정 및 시작 파일
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './config/swagger-output.json' assert { type: 'json' };
import express from 'express';
import postsRoutes from 'express';
import pool from './config/database.js'; // MySQL 연결
import { response } from './config/response.js'; 
import { status } from './config/response.status.js';
import dotenv from 'dotenv';
import cors from 'cors';

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
  
  app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.status(status.SUCCESS.status).json(response(status.SUCCESS, { solution: rows[0].solution }));
    } catch (error) {
        console.error(error);
        res.status(status.INTERNAL_SERVER_ERROR.status).json(response(status.INTERNAL_SERVER_ERROR, null));
    }
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
