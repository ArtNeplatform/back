import express from 'express';
import { updateBankInfo } from './authorController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/bank', verifyToken, async (req, res) => {
  await updateBankInfo(req, res);
});
export default router;