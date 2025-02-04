import express from 'express';
import {getMainHomeData} from './mainHomeController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/main', async (req, res) => {
    if (req.headers.authorization) {
      verifyToken(req, res, async () => {
        await getMainHomeData(req, res);
      });
    } else {
      await getMainHomeData(req, res);
    }
  });
export default router;