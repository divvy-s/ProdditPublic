import Habit from '../models/Habit.js';

export const createHabit = async (req, res) => {
  try {
    const habit = await Habit.create({ ...req.body, userId: req.user._id });
    res.json(habit);
  } catch (e) {
    res.status(500).json({ message: 'Failed to create habit' });
  }
};

export const listHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list habits' });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findOneAndUpdate({ _id: id, userId: req.user._id }, req.body, { new: true });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (e) {
    res.status(500).json({ message: 'Failed to update habit' });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete habit' });
  }
};

export const checkIn = async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date();
    today.setHours(0,0,0,0);
    const habit = await Habit.findOne({ _id: id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    const exists = habit.completions.some(c => new Date(c.date).setHours(0,0,0,0) === today.getTime());
    if (!exists) {
      habit.completions.push({ date: new Date() });
      await habit.save();
    }
    res.json(habit);
  } catch (e) {
    res.status(500).json({ message: 'Failed to check in' });
  }
};


