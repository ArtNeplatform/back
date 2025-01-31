import express from 'express';
import {getAvailableArtworks, getAuctionList, getAuctionDetail, createAuction } from './auctionController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// 경매 등록 가능한 작품 조회 API
router.get('/available-artwork', verifyToken, async (req, res) => {
    await getAvailableArtworks(req, res);
});

// 경매 리스트 조회 API
router.get('/', async (req, res) => {
    await getAuctionList(req, res);
});

// 경매 상세 조회 API
router.get('/:auctionId', async (req, res) => {
    await getAuctionDetail(req, res);
});

// 경매 등록 API
router.post('/', verifyToken, async (req, res) => {
    await createAuction(req, res);
});

export default router;