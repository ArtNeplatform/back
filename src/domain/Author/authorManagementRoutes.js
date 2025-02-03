import express from 'express';
import { getAuthorDetails } from './authorManagementController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// 작가 작품/경매/전시 조회 API
router.get('/author/artworks-exhibitions', verifyToken, getAuthorDetails);

export default router;