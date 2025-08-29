import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import Post from '../components/Post';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; 

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [showCommunityFilter, setShowCommunityFilter] = useState(false);
  const [communitySearch, setCommunitySearch] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Home component - user state:', user);
    console.log('Home component - loading state:', loading);
    fetchPosts();
    fetchCommunities();
  }, [sortBy, currentPage, selectedCommunity]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCommunityFilter && !event.target.closest('.community-filter')) {
        setShowCommunityFilter(false);
        setCommunitySearch(''); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCommunityFilter]);

  const fetchCommunities = async () => {
    try {
      const response = await API.get('/communities?limit=50');
      setCommunities(response.data.communities || []);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(communitySearch.toLowerCase()) ||
    community.description.toLowerCase().includes(communitySearch.toLowerCase())
  );

  const fetchPosts = async () => {
    try {
      console.log('fetchPosts called - user:', user, 'loading:', loading);
      setLoading(true);
      let url = `/posts?page=${currentPage}&limit=10&sort=${sortBy}`;
      if (selectedCommunity) {
        url += `&community=${selectedCommunity}`;
      }
      console.log('Fetching posts from URL:', url);
      
      const response = await API.get(url);
      console.log('Posts response:', response.data);
      
      const { posts: fetchedPosts, pagination } = response.data;
      setPosts(fetchedPosts);
      setHasNext(pagination.hasNext);
      setHasPrev(pagination.hasPrev);
      setTotalPosts(pagination.totalPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (updatedPost) => {
    console.log('handleVoteUpdate called with:', updatedPost);
    console.log('Current posts:', posts);
    
    setPosts(prevPosts => {
      const newPosts = prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      );
      console.log('New posts after update:', newPosts);
      return newPosts;
    });
  };

  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-proddit-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  const shouldShowPosts = posts.length > 0 || !loading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-4">Welcome to Proddit</h1>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                {user 
                  ? 'Discover and share the best content on the internet'
                  : 'Discover amazing content from our community. Log in to vote, comment, and create posts!'
                }
              </p>
            </div>
            {user && (
              <button 
                onClick={() => navigate('/create-post')}
                className="btn-primary"
              >
                Create Post
              </button>
            )}
          </div>
          
          {/* Non-logged-in user message */}
          {!user && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-800">
                    You're browsing as a guest. <Link to="/login" className="font-semibold hover:underline">Log in</Link> or <Link to="/register" className="font-semibold hover:underline">register</Link> to vote, comment, and create posts!
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sort and Filter Controls */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Sort by:</span>
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
                  onClick={() => handleSortChange('votes')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    sortBy === 'votes'
                      ? 'bg-proddit-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Top Votes
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Community Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowCommunityFilter(!showCommunityFilter)}
                  className={`community-filter px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    selectedCommunity
                      ? 'bg-proddit-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedCommunity ? 'Filtered' : 'Filter by Community'}
                </button>
                
                {showCommunityFilter && (
                  <div className="community-filter absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-3 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search communities..."
                        value={communitySearch}
                        onChange={(e) => setCommunitySearch(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-proddit-orange"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedCommunity('');
                          setShowCommunityFilter(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                          !selectedCommunity ? 'bg-proddit-orange text-white' : 'text-gray-700'
                        }`}
                      >
                        All Communities
                      </button>
                      {filteredCommunities.map(community => (
                        <button
                          key={community._id}
                          onClick={() => {
                            setSelectedCommunity(community._id);
                            setShowCommunityFilter(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                            selectedCommunity === community._id ? 'bg-proddit-orange text-white' : 'text-gray-700'
                          }`}
                        >
                          r/{community.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                {totalPosts > 0 && `${totalPosts} total posts`}
              </div>
            </div>
          </div>
          
          {/* Selected Community Display */}
          {selectedCommunity && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Filtering by: <span className="font-medium text-gray-900">
                    r/{communities.find(c => c._id === selectedCommunity)?.name}
                  </span>
                </span>
                <button
                  onClick={() => setSelectedCommunity('')}
                  className="text-sm text-proddit-orange hover:text-orange-600"
                >
                  Clear Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {!shouldShowPosts ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share something amazing!</p>
              {user && (
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

        {/* Loading More Indicator */}
        {loading && posts.length > 0 && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-proddit-orange mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading more posts...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
