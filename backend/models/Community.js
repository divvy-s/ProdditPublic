import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Community name must be at least 3 characters long'],
    maxlength: [21, 'Community name cannot exceed 21 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Community name can only contain letters, numbers, and underscores']
  },
  description: {
    type: String,
    required: [true, 'Community description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  rules: {
    type: String,
    trim: true,
    maxlength: [1000, 'Rules cannot exceed 1000 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Community creator is required']
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  memberCount: {
    type: Number,
    default: 1
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isNSFW: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

communitySchema.virtual('displayName').get(function() {
  return `r/${this.name}`;
});

communitySchema.set('toJSON', {
  virtuals: true
});

communitySchema.pre('save', function(next) {
  if (this.isModified('members')) {
    this.memberCount = this.members.length;
  }
  next();
});

const Community = mongoose.model('Community', communitySchema);

export default Community;
