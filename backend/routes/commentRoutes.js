import express from 'express';
import { 
  createComment, 
  getComments, 
  updateComment, 
  deleteComment,
  voteComment,
  getUserCommentVote
} from '../controllers/commentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createComment);
router.get('/:postId', getComments);
router.put('/:id', authMiddleware, updateComment);
router.delete('/:id', authMiddleware, deleteComment);
router.post('/:id/vote', authMiddleware, voteComment);
router.get('/:id/vote', authMiddleware, getUserCommentVote);

export default router;
