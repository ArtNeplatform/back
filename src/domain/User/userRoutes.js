import express from 'express';
import { updateUserInfo } from './userController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// 유저 정보 수정 API
router.patch('/update', verifyToken, async (req, res) => {
  await updateUserInfo(req, res);
});
export default router;