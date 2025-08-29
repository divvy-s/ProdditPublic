import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import CommentVote from '../models/CommentVote.js';

export const createComment = async (req, res) => {
  try {
    const { content, postId, parentCommentId } = req.body;
    const author = req.user._id;

    if (!content || !postId) {
      return res.status(400).json({ 
        message: 'Content and post ID are required' 
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      content,
      author,
      post: postId,
      parentComment: parentCommentId || null
    });

    await comment.populate('author', 'username karma');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error creating comment' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
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

    const comments = await Comment.find({ 
      post: postId, 
      parentComment: null 
    })
      .populate('author', 'username karma')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments({ 
      post: postId, 
      parentComment: null 
    });

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
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    await comment.populate('author', 'username karma');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error updating comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.deleteMany({
      $or: [
        { _id: id },
        { parentComment: id }
      ]
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
};

export const voteComment = async (req, res) => {
  try {
    const { value } = req.body;
    const commentId = req.params.id;
    const userId = req.user._id;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ 
        message: 'Vote value must be 1 (upvote) or -1 (downvote)' 
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() === userId.toString()) {
      return res.status(400).json({ 
        message: 'You cannot vote on your own comment' 
      });
    }

    let existingVote = await CommentVote.findOne({ user: userId, comment: commentId });
    
    let karmaChange = 0;
    let userKarmaChange = 0;
    let finalVoteValue = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        karmaChange = -value;
        userKarmaChange = -value;
        finalVoteValue = 0;
        
        await CommentVote.findByIdAndDelete(existingVote._id);
      } else {
        if (existingVote.value === 1 && value === -1) {
          karmaChange = -2;
          userKarmaChange = -2;
        } else if (existingVote.value === -1 && value === 1) {
          karmaChange = 2;
          userKarmaChange = 2;
        }
        
        existingVote.value = value;
        finalVoteValue = value;
        await existingVote.save();
      }
    } else {
      karmaChange = value;
      userKarmaChange = value;
      finalVoteValue = value;
      
      await CommentVote.create({
        user: userId,
        comment: commentId,
        value
      });
    }

    comment.karma += karmaChange;
    await comment.save();

    const commentAuthor = await User.findById(comment.author);
    if (commentAuthor) {
      commentAuthor.karma += userKarmaChange;
      await commentAuthor.save();
    }

    const updatedComment = await Comment.findById(commentId)
      .populate('author', 'username karma');

    res.json({
      success: true,
      message: 'Vote processed successfully',
      comment: updatedComment,
      voteValue: finalVoteValue,
      karmaChange
    });
  } catch (error) {
    console.error('Vote comment error:', error);
    res.status(500).json({ message: 'Server error processing vote' });
  }
};

export const getUserCommentVote = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;

    const vote = await CommentVote.findOne({ user: userId, comment: commentId });
    
    res.json({
      hasVoted: !!vote,
      voteValue: vote ? vote.value : 0
    });
  } catch (error) {
    console.error('Get user comment vote error:', error);
    res.status(500).json({ message: 'Server error fetching user comment vote' });
  }
};
