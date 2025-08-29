import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post is required']
  },
  value: {
    type: Number,
    required: [true, 'Vote value is required'],
    enum: [1, -1], 
    validate: {
      validator: function(v) {
        return v === 1 || v === -1;
      },
      message: 'Vote value must be either 1 (upvote) or -1 (downvote)'
    }
  }
}, {
  timestamps: true
});

voteSchema.index({ user: 1, post: 1 }, { unique: true });

voteSchema.virtual('voteType').get(function() {
  return this.value === 1 ? 'upvote' : 'downvote';
});

voteSchema.set('toJSON', {
  virtuals: true
});

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;
