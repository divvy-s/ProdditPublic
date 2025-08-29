import Task from '../models/Task.js';

export const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user._id });
    res.json(task);
  } catch (e) {
    res.status(500).json({ message: 'Failed to create task' });
  }
};

export const listTasks = async (req, res) => {
  try {
    const { status, due } = req.query;
    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (due) query.deadline = { $lte: new Date(due) };
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list tasks' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndUpdate({ _id: id, userId: req.user._id }, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (e) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};


