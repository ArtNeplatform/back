import express from 'express';
import {getMainHomeData} from './mainHomeController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/main', verifyToken, async (req, res) => {
    await getMainHomeData(req, res);
});

export default router;