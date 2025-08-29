import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import Post from '../components/Post';

const Profile = () => {
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [votedPosts, setVotedPosts] = useState([]);
  const [votedPostsLoading, setVotedPostsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  const { user: currentUser } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();

  const isOwnProfile = currentUser && currentUser.username === username;

  useEffect(() => {
    if (username) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [username]);

  useEffect(() => {
    console.log('useEffect triggered:', { isOwnProfile, activeTab, username });
    if (isOwnProfile && (activeTab === 'upvoted' || activeTab === 'downvoted')) {
      console.log('Calling fetchVotedPosts');
      fetchVotedPosts();
    } else if (isOwnProfile && activeTab === 'comments') {
      console.log('Calling fetchComments');
      fetchComments();
    }
  }, [activeTab, isOwnProfile, username]);

  const fetchProfile = async () => {
    try {
      const response = await API.get(`/users/${username}`);
      setProfileUser(response.data.user);
      setEditForm({
        bio: response.data.user.bio || ''
      });
    } catch (error) {
      setError('Failed to load profile');
      console.error('Profile fetch error:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await API.get(`/users/${username}/posts?limit=20`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Posts fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotedPosts = async () => {
    try {
      setVotedPostsLoading(true);
      console.log('Fetching voted posts for:', username, 'voteType:', activeTab);
      const response = await API.get(`/users/${username}/voted-posts?voteType=${activeTab}`);
      console.log('Voted posts response:', response.data);
      setVotedPosts(response.data.posts || []);
    } catch (error) {
      console.error('Voted posts fetch error:', error);
    } finally {
      setVotedPostsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await API.get(`/users/${username}/comments?limit=20`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Comments fetch error:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleVoteUpdate = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
    setVotedPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    setVotedPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const response = await API.put(`/users/${username}`, editForm);
      if (response.data.success) {
        setProfileUser(response.data.user);
        setIsEditing(false);
        setEditForm({
          bio: response.data.user.bio || ''
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await API.post(`/users/${username}/upload-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfileUser(prev => ({
          ...prev,
          profilePicture: response.data.profilePicture
        }));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-proddit-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
          <p className="text-gray-600 mb-4">The user "{username}" doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-proddit-orange rounded-full flex items-center justify-center overflow-hidden">
              {profileUser.profilePicture ? (
                <img 
                  src={profileUser.profilePicture} 
                  alt={profileUser.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-3xl">
                  {profileUser.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  u/{profileUser.username}
                </h1>
                {isOwnProfile && (
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="btn-outline text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEditSubmit}
                          disabled={editLoading}
                          className="btn-primary text-sm disabled:opacity-50"
                        >
                          {editLoading ? 'Saving...' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-outline text-sm"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-proddit-orange">
                    {profileUser.karma || 0}
                  </div>
                  <div className="text-sm text-gray-600">Karma</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {posts.length}
                  </div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {profileUser.createdAt ? 
                      new Date(profileUser.createdAt).getFullYear() : 
                      'N/A'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Member Since</div>
                </div>
              </div>
              
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-proddit-orange rounded-full flex items-center justify-center overflow-hidden">
                        {profileUser.profilePicture ? (
                          <img 
                            src={profileUser.profilePicture} 
                            alt={profileUser.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {profileUser.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="cursor-pointer bg-proddit-orange text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                          {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          JPG, PNG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleEditChange}
                      className="form-input"
                      rows={3}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {editForm.bio.length}/500 characters
                    </p>
                  </div>
                </form>
              ) : (
                <>
                  {profileUser.bio && (
                    <p className="text-gray-700">{profileUser.bio}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-proddit-orange text-proddit-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Posts
              </button>
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'comments'
                        ? 'border-proddit-orange text-proddit-orange'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Comments
                  </button>
                  <button
                    onClick={() => setActiveTab('upvoted')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'upvoted'
                        ? 'border-proddit-orange text-proddit-orange'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Upvoted
                  </button>
                  <button
                    onClick={() => setActiveTab('downvoted')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'downvoted'
                        ? 'border-proddit-orange text-proddit-orange'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Downvoted
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="space-y-6">
          {activeTab === 'posts' && (
            <>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-4">
                    {isOwnProfile ? "You haven't created any posts yet." : `${profileUser.username} hasn't created any posts yet.`}
                  </p>
                  {isOwnProfile && (
                    <button 
                      onClick={() => navigate('/create-post')}
                      className="btn-primary"
                    >
                      Create Your First Post
                    </button>
                  )}
                </div>
              ) : (
                posts.map(post => (
                  <Post 
                    key={post._id} 
                    post={post} 
                    onVoteUpdate={handleVoteUpdate}
                    onDelete={handleDeletePost}
                  />
                ))
              )}
            </>
          )}
          
          {activeTab === 'comments' && isOwnProfile && (
            <>
              {commentsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-proddit-orange mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-600">Start commenting on posts to see them here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-proddit-orange rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {comment.author.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-sm text-gray-900">
                              {comment.author.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                          <div className="text-xs text-gray-500">
                            Comment on: <Link to={`/post/${comment.post._id}`} className="text-proddit-orange hover:underline">
                              {comment.post.title}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'upvoted' && isOwnProfile && (
            <>
              {votedPostsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-proddit-orange mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading upvoted posts...</p>
                </div>
              ) : votedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upvoted posts yet</h3>
                  <p className="text-gray-600">Start upvoting posts to see them here!</p>
                </div>
              ) : (
                votedPosts.map(post => (
                  <Post 
                    key={post._id} 
                    post={post} 
                    onVoteUpdate={handleVoteUpdate}
                    onDelete={handleDeletePost}
                  />
                ))
              )}
            </>
          )}
          
          {activeTab === 'downvoted' && isOwnProfile && (
            <>
              {votedPostsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-proddit-orange mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading downvoted posts...</p>
                </div>
              ) : votedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No downvoted posts yet</h3>
                  <p className="text-gray-600">Start downvoting posts to see them here!</p>
                </div>
              ) : (
                votedPosts.map(post => (
                  <Post 
                    key={post._id} 
                    post={post} 
                    onVoteUpdate={handleVoteUpdate}
                    onDelete={handleDeletePost}
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
