import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import { Link } from 'react-router-dom';

const Post = ({ post, onVoteUpdate, onDelete }) => {
  const { user } = useAuth();
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentVotes, setCommentVotes] = useState({});

  useEffect(() => {
    if (user && post._id) {
      console.log('Post component mounted with user:', user);
      console.log('Post data:', post);
      fetchUserVote();
    }
  }, [user, post._id]);

  const fetchUserVote = async () => {
    try {
      const response = await API.get(`/posts/${post._id}/vote`);
      setUserVote(response.data.voteValue || 0);
    } catch (error) {
      console.error('Failed to fetch user vote:', error);
      setUserVote(0);
    }
  };

  const handleVote = async (value) => {
    if (!user) {
      console.log('No user logged in');
      return;
    }
    
    console.log('Voting on post:', post._id, 'with value:', value);
    console.log('User ID:', user._id, 'Post author ID:', post.author._id);
    console.log('Are they the same?', user._id === post.author._id);
    
    if (post.author._id === user._id) {
      console.log('Cannot vote on own post');
      return;
    }
    
    setVoting(true);
    try {
      console.log('Sending vote request to:', `/posts/${post._id}/vote`);
      const response = await API.post(`/posts/${post._id}/vote`, { value });
      console.log('Vote response:', response.data);
      
      const { post: updatedPost } = response.data;
      console.log('Updated post from response:', updatedPost);
      console.log('Updated post votes:', updatedPost.votes);
      
      onVoteUpdate(updatedPost);
      
      if (response.data.voteValue === 0) {
        setUserVote(0);
      } else {
        setUserVote(response.data.voteValue);
      }
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVoting(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await API.get(`/comments/${post._id}`);
      setComments(response.data.comments || []);
      
      if (user) {
        const commentVotesData = {};
        for (const comment of response.data.comments || []) {
          try {
            const voteResponse = await API.get(`/comments/${comment._id}/vote`);
            commentVotesData[comment._id] = voteResponse.data.voteValue;
          } catch (error) {
            commentVotesData[comment._id] = 0;
          }
        }
        setCommentVotes(commentVotesData);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await API.post('/comments', {
        content: commentContent,
        postId: post._id
      });
      
      if (response.data.success) {
        setCommentContent('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (e) {
      console.error('Failed to delete comment', e);
    }
  };

  const handleCommentVote = async (commentId, value) => {
    if (!user) return;
    
    try {
      const response = await API.post(`/comments/${commentId}/vote`, { value });
      if (response.data.success) {
        setCommentVotes(prev => ({
          ...prev,
          [commentId]: response.data.voteValue
        }));
        
        setComments(prev => 
          prev.map(comment => 
            comment._id === commentId 
              ? { ...comment, karma: response.data.comment.karma }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Comment vote failed:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await API.delete(`/posts/${post._id}`);
      if (response.data.success) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      fetchComments();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card mb-4 hover:shadow-lg transition-shadow duration-200">
      {/* Post Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-proddit-orange rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {post.community && (
              <>
                <span className="text-sm text-gray-600">Posted in</span>
                <Link to={`/communities/${post.community._id}`} className="text-sm font-semibold text-proddit-blue hover:text-blue-600">
                  r/{post.community.name}
                </Link>
                <span className="text-sm text-gray-500">•</span>
              </>
            )}
            <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Posted by</span>
            <Link to={`/profile/${post.author.username}`} className="font-semibold text-gray-900 dark:text-dark-text hover:text-proddit-orange">
              {post.author.username}
            </Link>
            <span className="text-sm text-gray-500 dark:text-dark-text-secondary">•</span>
            <span className="text-sm text-gray-500 dark:text-dark-text-secondary">{formatDate(post.createdAt)}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
            Karma: {post.author.karma}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2">{post.title}</h2>
        <p className="text-gray-700 dark:text-dark-text leading-relaxed">{post.content}</p>
      </div>

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.hashtags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Voting Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Non-logged-in user message */}
          {!user && (
            <div className="text-sm text-gray-500 dark:text-dark-text-secondary italic">
              Log in to vote
            </div>
          )}
          
          {/* Upvote Button */}
          <button
            onClick={() => handleVote(1)}
            disabled={voting || !user}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
              userVote === 1 
                ? 'text-proddit-orange bg-orange-50' 
                : 'text-gray-500 hover:text-proddit-orange hover:bg-orange-50'
            } ${(!user || post.author._id === user._id) ? 'opacity-50' : ''}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Upvote</span>
          </button>

          {/* Karma Display */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">{post.votes || 0}</span>
            <span className="text-sm text-gray-500 dark:text-dark-text-secondary">votes</span>
          </div>

          {/* Downvote Button */}
          <button
            onClick={() => handleVote(-1)}
            disabled={voting || !user}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
              userVote === -1 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            } ${(!user || post.author._id === user._id) ? 'opacity-50' : ''}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Downvote</span>
          </button>
        </div>

        {/* Post Stats */}
        <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
          {post.comments ? `${post.comments} comments` : '0 comments'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
        <div className="flex items-center space-x-4">
          {/* Comment Button */}
          <button
            onClick={toggleComments}
            className="flex items-center space-x-2 text-gray-500 hover:text-proddit-orange transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">
              {showComments ? 'Hide Comments' : 'Comments'}
            </span>
          </button>
        </div>

        {/* Delete Button (only for post author) */}
        {user && post.author._id === user._id && (
          <button
            onClick={handleDeletePost}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200"
          >
            Delete Post
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-proddit-orange"
                rows={3}
                maxLength={10000}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {commentContent.length}/10000 characters
                </span>
                <button
                  type="submit"
                  disabled={submittingComment || !commentContent.trim()}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 text-sm">
                <Link to="/login" className="text-proddit-orange hover:underline font-medium">Log in</Link> to comment on this post
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {loadingComments ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-proddit-orange mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-proddit-orange rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {comment.author.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link to={`/profile/${comment.author.username}`} className="font-medium text-sm text-gray-900 hover:text-proddit-orange">
                          {comment.author.username}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                        {comment.isEdited && (
                          <span className="text-xs text-gray-400">(edited)</span>
                        )}
                        {user && comment.author._id === user._id && (
                          <button
                            className="ml-auto text-xs text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                      
                      {/* Comment Voting */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCommentVote(comment._id, 1)}
                          disabled={!user || comment.author._id === user._id}
                          className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors duration-200 ${
                            commentVotes[comment._id] === 1 
                              ? 'text-proddit-orange bg-orange-50' 
                              : 'text-gray-500 hover:text-proddit-orange hover:bg-orange-50'
                          } ${(!user || comment.author._id === user._id) ? 'opacity-50' : ''}`}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <span className="text-xs font-medium text-gray-700 min-w-[2rem] text-center">
                          {comment.karma || 0}
                        </span>
                        
                        <button
                          onClick={() => handleCommentVote(comment._id, -1)}
                          disabled={!user || comment.author._id === user._id}
                          className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors duration-200 ${
                            commentVotes[comment._id] === -1 
                              ? 'text-blue-600 bg-blue-50' 
                              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                          } ${(!user || comment.author._id === user._id) ? 'opacity-50' : ''}`}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
