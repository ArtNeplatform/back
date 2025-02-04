import express from 'express';
import { getArtworkList } from './artworkListController.js';
import { toggleFavoriteArtwork } from './artworkLikeController.js'; 
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// router.get('/artworks', async (req, res) => {
//   await getArtworkList(req, res);
// });

// 작품 리스트 조회
router.get('/artworks', (req, res, next) => {
  // Authorization 헤더가 있을 경우에만 verifyToken 미들웨어 실행
  if (req.headers.authorization) {
    return verifyToken(req, res, next);
  }
  next();
}, async (req, res) => {
  await getArtworkList(req, res);
});

// 좋아요 API
router.post('/artworks/:artworkId/like', verifyToken, toggleFavoriteArtwork);

export default router;