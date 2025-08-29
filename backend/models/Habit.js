import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  completions: [{
    date: { type: Date, required: true }
  }]
}, { timestamps: true });

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;


