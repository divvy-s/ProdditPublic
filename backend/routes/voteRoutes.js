import express from 'express';
import { votePost, getUserVote } from '../controllers/voteController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:id/vote', authMiddleware, votePost);
router.get('/:id/vote', authMiddleware, getUserVote);

export default router;
