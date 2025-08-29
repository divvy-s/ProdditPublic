import Vote from '../models/Vote.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

export const votePost = async (req, res) => {
  try {
    const { value } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ 
        message: 'Vote value must be 1 (upvote) or -1 (downvote)' 
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() === userId.toString()) {
      return res.status(400).json({ 
        message: 'You cannot vote on your own post' 
      });
    }

    let existingVote = await Vote.findOne({ user: userId, post: postId });
    
    let karmaChange = 0;
    let userKarmaChange = 0;
    let finalVoteValue = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        karmaChange = -value;
        userKarmaChange = -value;
        finalVoteValue = 0;
        
        await Vote.findByIdAndDelete(existingVote._id);
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
      
      await Vote.create({
        user: userId,
        post: postId,
        value
      });
    }

    post.votes += karmaChange;
    await post.save();

    const author = await User.findById(post.author);
    if (author) {
      author.karma += userKarmaChange;
      await author.save();
    }

    const updatedPost = await Post.findById(postId)
      .populate('author', 'username karma')
      .select('title content author community votes hashtags createdAt updatedAt');

    res.json({
      message: 'Vote processed successfully',
      post: updatedPost,
      voteValue: finalVoteValue,
      karmaChange
    });

  } catch (error) {
    console.error('Vote post error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }
    
    res.status(500).json({ message: 'Server error processing vote' });
  }
};

export const getUserVote = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const vote = await Vote.findOne({ user: userId, post: postId });
    
    res.json({
      hasVoted: !!vote,
      voteValue: vote ? vote.value : 0
    });
  } catch (error) {
    console.error('Get user vote error:', error);
    res.status(500).json({ message: 'Server error fetching user vote' });
  }
};
