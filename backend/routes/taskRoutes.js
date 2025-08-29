import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { createTask, listTasks, updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.post('/', auth, createTask);
router.get('/', auth, listTasks);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

export default router;


