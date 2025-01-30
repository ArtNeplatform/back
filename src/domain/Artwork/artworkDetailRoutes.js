import express from 'express';
import { getArtworkDetails } from './artworkDetailController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/artworks/:artworkId', verifyToken, async (req, res) => {
  await getArtworkDetails(req, res);
});

export default router;