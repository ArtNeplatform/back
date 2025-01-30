import express from 'express';
import { updateBankInfo, getAuthorInfo } from './authorController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/bank', verifyToken, async (req, res) => {
  await updateBankInfo(req, res);
});

router.get('/', verifyToken, async (req, res) => {
  await getAuthorInfo(req, res);
});
export default router;