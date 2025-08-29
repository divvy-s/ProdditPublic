import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import Post from '../components/Post';

const CommunityDetail = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchCommunityAndPosts();
  }, [id, sortBy, currentPage]);

  const fetchCommunityAndPosts = async () => {
    try {
      setLoading(true);
      
      const communityResponse = await API.get(`/communities/${id}`);
      const communityData = communityResponse.data.community;
      
      setCommunity(communityData);
      
      const postsResponse = await API.get(`/communities/${id}/posts`, {
        params: {
          page: currentPage,
          limit: 10,
          sort: sortBy
        }
      });
      
      const postsData = postsResponse.data;
      setPosts(postsData.posts || []);
      setTotalPosts(postsData.pagination?.totalPosts || 0);
      setHasNext(postsData.pagination?.hasNext || false);
      setHasPrev(postsData.pagination?.hasPrev || false);
      
    } catch (err) {
      setError('Failed to fetch community');
      console.error('Error fetching community:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const handleCommunityAvatarUpload = async (e) => {
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

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await API.post(`/communities/${id}/upload-avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setCommunity(prev => ({
          ...prev,
          avatar: response.data.avatar
        }));
      }
    } catch (error) {
      console.error('Community avatar upload error:', error);
      alert('Failed to upload community avatar');
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-proddit-orange mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-4">Error Loading Community</h2>
          <p className="text-gray-600 dark:text-dark-text-secondary mb-4">{error}</p>
          <Link to="/communities" className="btn-primary">
            Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Community Header */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-proddit-orange rounded-full flex items-center justify-center overflow-hidden">
                {community.avatar ? (
                  <img 
                    src={community.avatar} 
                    alt={community.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">C</span>
                )}
              </div>
              {(community.creator?._id === user?._id || community.moderators?.some(mod => mod._id === user?._id)) && (
                <div className="absolute -bottom-1 -right-1">
                  <label className="cursor-pointer bg-proddit-orange text-white rounded-full p-1 hover:bg-orange-600 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCommunityAvatarUpload}
                      className="hidden"
                    />
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </label>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text">r/{community.name}</h1>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Community
                </span>
              </div>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4">{community.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-dark-text-secondary">
                <span>{community.memberCount} members</span>
                <span>•</span>
                <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                className={community?.isMember ? 'btn-outline text-sm' : 'btn-primary text-sm'}
                onClick={async () => {
                  try {
                    const { data } = await API.post(`/communities/${id}/join`);
                    setCommunity((prev) => ({ 
                      ...(prev || {}), 
                      isMember: data.isMember, 
                      memberCount: data.memberCount || prev?.memberCount || 0
                    }));
                  } catch (e) {
                    console.error('Failed to join/leave community', e);
                  }
                }}
              >
                {community?.isMember ? 'Joined' : 'Join Community'}
              </button>
            </div>
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort posts by:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    sortBy === 'newest'
                      ? 'bg-proddit-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => handleSortChange('oldest')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    sortBy === 'oldest'
                      ? 'bg-proddit-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Oldest
                </button>
                <button
                  onClick={() => handleSortChange('karma')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    sortBy === 'karma'
                      ? 'bg-proddit-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Top Karma
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {totalPosts > 0 && `${totalPosts} total posts`}
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts in this community yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share something in r/{community.name}!</p>
              {user && (
                <Link 
                  to={`/create-post?community=${community._id}`} 
                  className="btn-primary"
                >
                  Create Post
                </Link>
              )}
            </div>
          ) : (
            posts.map(post => (
              <Post 
                key={post._id} 
                post={post} 
                onVoteUpdate={handleVoteUpdate}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {posts.length > 0 && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrev}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Back to Communities */}
        <div className="mt-8 text-center">
          <Link 
            to="/communities" 
            className="text-proddit-orange hover:text-orange-600 font-medium"
          >
            ← Back to Communities
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
