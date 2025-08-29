import Community from '../models/Community.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

export const createCommunity = async (req, res) => {
  try {
    const { name, description, rules, isPrivate, isNSFW } = req.body;
    const creator = req.user._id;

    const existingCommunity = await Community.findOne({ name: name.toLowerCase() });
    if (existingCommunity) {
      return res.status(400).json({ 
        message: 'Community name already exists' 
      });
    }

    const community = await Community.create({
      name: name.toLowerCase(),
      description,
      rules,
      creator,
      moderators: [creator],
      members: [creator],
      isPrivate: isPrivate || false,
      isNSFW: isNSFW || false
    });

    await community.populate('creator', 'username');

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      community
    });
  } catch (error) {
    console.error('Create community error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ message: 'Server error creating community' });
  }
};

export const getAllCommunities = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const communities = await Community.find(searchQuery)
      .populate('creator', 'username')
      .populate('members', 'username')
      .sort({ memberCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Community.countDocuments(searchQuery);

    res.json({
      success: true,
      communities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCommunities: total,
        hasNext: skip + communities.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all communities error:', error);
    res.status(500).json({ message: 'Server error fetching communities' });
  }
};

export const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'username')
      .populate('moderators', 'username')
      .populate('members', 'username');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    let isMember = false;
    if (req.user) {
      isMember = community.members.some(member => 
        member._id.toString() === req.user._id.toString()
      );
    }

    res.json({
      success: true,
      community: {
        ...community.toObject(),
        isMember
      }
    });
  } catch (error) {
    console.error('Get community by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid community ID format' });
    }
    
    res.status(500).json({ message: 'Server error fetching community' });
  }
};


export const getCommunityPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'newest' } = req.query;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
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
    
    const posts = await Post.find({ community: communityId })
      .populate('author', 'username karma')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments({ community: communityId });

    res.json({
      success: true,
      posts,
      community: {
        _id: community._id,
        name: community.name,
        description: community.description
      },
      pagination: {
        currentPage: parseInt(page),
        totalPosts,
        totalPages: Math.ceil(totalPosts / parseInt(limit)),
        hasNext: skip + posts.length < totalPosts,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({ message: 'Server error fetching community posts' });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = community.members.includes(userId);
    
    if (isMember) {
      community.members = community.members.filter(id => id.toString() !== userId.toString());
      await community.save();
      
      res.json({
        success: true,
        message: 'Left community successfully',
        isMember: false,
        memberCount: community.memberCount
      });
    } else {
      community.members.push(userId);
      await community.save();
      
      res.json({
        success: true,
        message: 'Joined community successfully',
        isMember: true,
        memberCount: community.memberCount
      });
    }
  } catch (error) {
    console.error('Join/Leave community error:', error);
    res.status(500).json({ message: 'Server error processing join/leave request' });
  }
};
