import express from 'express';
import { getArtworkList } from './artworkListController.js';
import { addFavoriteArtwork } from './artworkLikeController.js'; 
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/artworks', async (req, res) => {
  await getArtworkList(req, res);
});

// 좋아요 추가 API
router.post('/artworks/:artworkId/like', verifyToken, addFavoriteArtwork);

export default router;