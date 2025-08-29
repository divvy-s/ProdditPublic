import Post from '../models/Post.js';
import mongoose from 'mongoose';

export const createPost = async (req, res) => {
  try {
    const { title, content, hashtags, community } = req.body;
    const author = req.user._id;

    if (!title || !content) {
      return res.status(400).json({ 
        message: 'Title and content are required' 
      });
    }

    if (community) {
      const communityExists = await mongoose.model('Community').findById(community);
      if (!communityExists) {
        return res.status(400).json({ 
          message: 'Invalid community ID' 
        });
      }
    }

    const processedHashtags = hashtags 
      ? hashtags.map(tag => tag.startsWith('#') ? tag.substring(1).trim() : tag.trim())
      : [];

    const post = await Post.create({
      title,
      content,
      author,
      community: community || undefined,
      hashtags: processedHashtags
    });

    await post.populate('author', 'username');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest', community } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'votes':
        sortObj = { votes: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    let filterObj = {};
    if (community) {
      filterObj.community = community;
    }

    const posts = await Post.find(filterObj)
      .populate('author', 'username karma')
      .populate('community', 'name')
      .select('title content author community votes karma hashtags createdAt updatedAt')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const transformedPosts = posts.map(post => {
      const postObj = post.toObject();
      if (postObj.votes === undefined && postObj.karma !== undefined) {
        postObj.votes = postObj.karma;
      }
      return postObj;
    });

    const total = await Post.countDocuments(filterObj);

    res.json({
      posts: transformedPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasNext: skip + posts.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username karma')
      .select('title content author community votes karma hashtags createdAt updatedAt');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postObj = post.toObject();
    if (postObj.votes === undefined && postObj.karma !== undefined) {
      postObj.votes = postObj.karma;
    }

    res.json({ post: postObj });
  } catch (error) {
    console.error('Get post by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }
    
    res.status(500).json({ message: 'Server error fetching post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true,
      message: 'Post deleted successfully' 
    });
  } catch (error) {
    console.error('Delete post error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }
    
    res.status(500).json({ message: 'Server error deleting post' });
  }
};
