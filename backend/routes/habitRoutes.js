import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { createHabit, listHabits, updateHabit, deleteHabit, checkIn } from '../controllers/habitController.js';

const router = express.Router();

router.post('/', auth, createHabit);
router.get('/', auth, listHabits);
router.put('/:id', auth, updateHabit);
router.delete('/:id', auth, deleteHabit);
router.post('/:id/checkin', auth, checkIn);

export default router;


