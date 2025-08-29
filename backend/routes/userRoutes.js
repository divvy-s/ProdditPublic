import express from 'express';
import { getUserProfile, getUserPosts, updateProfile, getUserVotedPosts, getUserComments } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:username', getUserProfile);
router.get('/:username/posts', getUserPosts);
router.put('/:username', authMiddleware, updateProfile);
router.get('/:username/voted-posts', authMiddleware, getUserVotedPosts);
router.get('/:username/comments', authMiddleware, getUserComments);

export default router;
