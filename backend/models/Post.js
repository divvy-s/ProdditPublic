import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot exceed 10,000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: false 
  },
  votes: {
    type: Number,
    default: 0
  },
  hashtags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

postSchema.index({ title: 'text', content: 'text', hashtags: 'text' });

postSchema.virtual('summary').get(function() {
  return this.content.length > 200 
    ? this.content.substring(0, 200) + '...' 
    : this.content;
});

postSchema.set('toJSON', {
  virtuals: true
});

const Post = mongoose.model('Post', postSchema);

export default Post;
