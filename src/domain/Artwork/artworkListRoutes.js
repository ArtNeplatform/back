import express from 'express';
import { getArtworkList } from './artworkListController.js';

const router = express.Router();

router.get('/artworks', async (req, res) => {
  await getArtworkList(req, res);
});

export default router;