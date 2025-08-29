import mongoose from 'mongoose';

const commentVoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: [true, 'Comment is required']
  },
  value: {
    type: Number,
    required: [true, 'Vote value is required'],
    enum: [1, -1],
    validate: {
      validator: function(v) {
        return v === 1 || v === -1;
      },
      message: 'Vote value must be 1 or -1'
    }
  }
}, {
  timestamps: true
});

commentVoteSchema.index({ user: 1, comment: 1 }, { unique: true });

const CommentVote = mongoose.model('CommentVote', commentVoteSchema);

export default CommentVote;
