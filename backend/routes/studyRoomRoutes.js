import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { createRoom, listRooms, joinRoom, leaveRoom, roomActiveTimes } from '../controllers/studyRoomController.js';

const router = express.Router();

router.post('/', auth, createRoom);
router.get('/', auth, listRooms);
router.post('/:roomId/join', auth, joinRoom);
router.post('/:roomId/leave', auth, leaveRoom);
router.get('/:roomId/active-times', auth, roomActiveTimes);

export default router;


