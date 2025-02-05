import express from 'express';
import { getArtworkDetails } from './artworkDetailController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/artworks/:artworkId', (req, res, next) => {
  // Authorization 헤더가 있을 경우에만 verifyToken 미들웨어 실행
  if (req.headers.authorization) {
    return verifyToken(req, res, next);
  }
  next();
}, async (req, res) => {
  await getArtworkDetails(req, res);
});

export default router;