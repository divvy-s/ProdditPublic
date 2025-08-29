import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyRoom', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinTime: { type: Date, required: true, default: Date.now },
  leaveTime: { type: Date },
  totalTime: { type: Number, default: 0 } 
}, { timestamps: true });

const StudySession = mongoose.model('StudySession', studySessionSchema);
export default StudySession;


