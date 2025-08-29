import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { createDM, createGroup, getMyChats, getChatMessages, listPublicChats, joinPublicChat, setChatPublic, deleteChat } from '../controllers/chatController.js';

const router = express.Router();

router.post('/dm', auth, createDM);
router.post('/group', auth, createGroup);
router.get('/', auth, getMyChats);
router.get('/public/list', listPublicChats);
router.post('/public/:chatId/join', auth, joinPublicChat);
router.put('/:chatId/public', auth, setChatPublic);
router.delete('/:chatId', auth, deleteChat);
router.get('/:chatId/messages', auth, getChatMessages);

export default router;


