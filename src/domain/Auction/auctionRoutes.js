import express from 'express';
import {getAvailableArtworks, getAuctionList, getAuctionDetail, registerAuction ,bidAuction, } from './auctionController.js';
import { addFavoriteAuction, removeFavoriteAuction } from './auctionLikeController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// 경매 등록 가능한 작품 조회 API
router.get('/available-artwork', verifyToken, async (req, res) => {
    await getAvailableArtworks(req, res);
});

// 경매 등록 API
router.post('/register', verifyToken, async (req, res) => {
    await registerAuction(req, res);
});

// 경매 입찰 API
router.post('/bid', verifyToken, async (req, res) => {
    await bidAuction(req, res);
});

// 경매 리스트 조회 API
router.get('/', verifyToken, async (req, res) => {
    await getAuctionList(req, res);
});

// 경매 상세 조회 API
router.get('/:auction_id', verifyToken, async (req, res) => {
    await getAuctionDetail(req, res);
});

// 경매 좋아요 API
router.post('/:auction_id/like', verifyToken, async (req, res) => {
    await addFavoriteAuction(req, res);
});

// 경매 좋아요 취소 API
router.post('/:auction_id/unlike', verifyToken, async (req, res) => {
    await removeFavoriteAuction(req, res);
});



export default router;