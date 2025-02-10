import express from 'express';
import { kakaoPayReady } from './PaymentController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// 유저 정보 수정 API
router.post('/kakaopay/ready/:payment_id', verifyToken, async (req, res) => {
  await kakaoPayReady(req, res);
});

export default router;