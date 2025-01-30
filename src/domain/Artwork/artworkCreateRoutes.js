import express from 'express';
import { createArtwork } from './artworkCreateController.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';
import uploadMiddleware from '../../../config/uploadMiddleware.js';  
import { response } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';

const router = express.Router();

router.post(
  '/artworks',
  verifyToken,
  uploadMiddleware,
  async (req, res) => {
    try {
      if (req.fileError) {
        return res.status(400).json(response(status.UPLOAD_ERROR, null));
      }
      
      await createArtwork(req, res);  
    } catch (error) {
      console.error('Unexpected error during artwork creation:', error);
      return res.status(500).json(response(status.INTERNAL_SERVER_ERROR, null));
    }
  }
);

export default router;
