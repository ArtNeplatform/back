import express from 'express';
import { updateBankInfo, getAuthorInfo, updateAuthorProfile} from './authorController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// 작가 계좌 정보 등록 API
router.post('/bank', verifyToken, async (req, res) => {
  await updateBankInfo(req, res);
});

// 작가 프로필 정보 조회 API
router.get('/', verifyToken, async (req, res) => {
  await getAuthorInfo(req, res);
});

//작가 프로필 정보 수정 API
router.patch('/profile/', verifyToken, async (req, res) => {
  await updateAuthorProfile(req, res);
});

export default router;