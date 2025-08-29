import User from '../models/User.js';
import Post from '../models/Post.js';
import Vote from '../models/Vote.js';

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        karma: user.karma,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'karma':
        sortObj = { karma: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await Post.find({ author: user._id })
      .populate('author', 'username karma')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments({ author: user._id });

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPosts,
        totalPages: Math.ceil(totalPosts / parseInt(limit)),
        hasNext: skip + posts.length < totalPosts,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error while fetching user posts' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const { bio, profilePicture } = req.body;
    const userId = req.user._id;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        karma: user.karma,
        bio: user.bio,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

export const getUserVotedPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const { voteType, page = 1, limit = 20 } = req.query; // voteType: 'upvoted' or 'downvoted'
    const userId = req.user._id;

    console.log('getUserVotedPosts called with:', { username, voteType, userId });

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this user\'s voted posts' });
    }

    const voteValue = voteType === 'upvoted' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('Looking for votes with:', { user: user._id, value: voteValue });
    
    const allUserVotes = await Vote.find({ user: user._id });
    console.log('All votes for user:', allUserVotes.length);
    
    const votes = await Vote.find({ user: user._id, value: voteValue })
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'username karma'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log('Found votes:', votes.length);

    const posts = votes.map(vote => vote.post).filter(post => post); // Filter out any null posts

    const totalVotes = await Vote.countDocuments({ user: user._id, value: voteValue });

    console.log('Total votes:', totalVotes, 'Posts after filtering:', posts.length);

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPosts: totalVotes,
        totalPages: Math.ceil(totalVotes / parseInt(limit)),
        hasNext: skip + votes.length < totalVotes,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user voted posts error:', error);
    res.status(500).json({ message: 'Server error while fetching voted posts' });
  }
};

export const getUserComments = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this user\'s comments' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const { default: Comment } = await import('../models/Comment.js');
    
    const comments = await Comment.find({ author: user._id })
      .populate('author', 'username')
      .populate({
        path: 'post',
        select: 'title _id',
        populate: {
          path: 'author',
          select: 'username'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments({ author: user._id });

    res.json({
      success: true,
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalComments,
        totalPages: Math.ceil(totalComments / parseInt(limit)),
        hasNext: skip + comments.length < totalComments,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
};
