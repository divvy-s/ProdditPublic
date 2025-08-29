import express from 'express';
import { createPost, getAllPosts, getPostById, deletePost } from '../controllers/postController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.delete('/:id', authMiddleware, deletePost);

export default router;
