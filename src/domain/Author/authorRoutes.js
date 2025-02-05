import express from 'express';
import { updateBankInfo, getAuthorInfo, updateAuthorProfile, getAuthors, getAuthorDetail, updateAuthorInfo} from './authorController.js';
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

//작가 리스트 조회 API
router.get('/list', verifyToken, async (req, res, next) => {
  await getAuthors(req, res, next);
});

//작가 상세 조회 API
router.get('/:authorId', verifyToken, async (req, res, next) => {
  await getAuthorDetail(req, res, next);
});

//작가 계정 정보 수정 API
router.patch('/update', verifyToken, async (req, res, next) => {
  await updateAuthorInfo(req, res);
});

export default router;