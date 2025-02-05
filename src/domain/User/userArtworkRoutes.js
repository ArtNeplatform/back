import express from 'express';
import { getUserPurchasedArtworks } from './userArtworkController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// 작가 작품/경매/전시 조회 API
router.get('/user/purchased-artworks', verifyToken, getUserPurchasedArtworks);

export default router;