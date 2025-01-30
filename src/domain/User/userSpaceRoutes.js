import express from 'express';
import { createUserSpace } from './userSpaceController.js';
import { response } from '../../../config/response.js';
import uploadMiddleware from '../../../config/uploadMiddleware.js'; 
import { status } from '../../../config/response.status.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/userspace',
  verifyToken,
  uploadMiddleware,
  async (req, res) => {
    try {
      if (req.fileError) {
        return res.status(400).json(response(status.UPLOAD_ERROR, null));
      }
      
      await createUserSpace(req, res);  
    } catch (error) {
      console.error('Unexpected error during user space creation:', error);
      return res.status(500).json(response(status.INTERNAL_SERVER_ERROR, null));
    }
  }
);

export default router;
