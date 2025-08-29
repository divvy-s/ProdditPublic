import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', auth, sendMessage);

export default router;


