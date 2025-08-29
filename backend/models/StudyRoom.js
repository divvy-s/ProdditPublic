import mongoose from 'mongoose';

const studyRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

const StudyRoom = mongoose.model('StudyRoom', studyRoomSchema);
export default StudyRoom;


