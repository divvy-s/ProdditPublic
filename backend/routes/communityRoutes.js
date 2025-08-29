import express from 'express';
import { 
  createCommunity, 
  getAllCommunities, 
  getCommunityById, 
  getCommunityPosts,
  joinCommunity 
} from '../controllers/communityController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createCommunity);
router.get('/', getAllCommunities);
router.get('/:id', getCommunityById);
router.get('/:id/posts', getCommunityPosts);
router.post('/:id/join', authMiddleware, joinCommunity);

export default router;
