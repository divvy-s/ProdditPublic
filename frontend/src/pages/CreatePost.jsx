import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    hashtags: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [communities, setCommunities] = useState([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchCommunities();
    
    const communityFromUrl = searchParams.get('community');
    if (communityFromUrl) {
      setSelectedCommunity(communityFromUrl);
    }
  }, [searchParams]);

  const fetchCommunities = async () => {
    try {
      const response = await API.get('/communities');
      setCommunities(response.data.communities || []);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      const hashtags = formData.hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        hashtags,
        community: selectedCommunity || undefined
      };

      const response = await API.post('/posts', postData);
      
      if (response.data.message === 'Post created successfully') {
        navigate('/');
      } else {
        setError(response.data.message || 'Failed to create post');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You must be logged in to create a post.</p>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text">Create a New Post</h1>
          <p className="text-gray-600 dark:text-dark-text-secondary mt-2">Share your thoughts with the Proddit community</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="form-label">
                Post Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="What's your post about?"
                maxLength={300}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
                {formData.title.length}/300 characters
              </p>
            </div>

            <div>
              <label htmlFor="content" className="form-label">
                Post Content *
              </label>
              <textarea
                id="content"
                name="content"
                required
                value={formData.content}
                onChange={handleChange}
                className="form-input min-h-[200px] resize-y"
                placeholder="Share your thoughts, questions, or content..."
                maxLength={10000}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
                {formData.content.length}/10000 characters
              </p>
            </div>

            <div>
              <label htmlFor="hashtags" className="form-label">
                Hashtags (optional)
              </label>
              <input
                id="hashtags"
                name="hashtags"
                type="text"
                value={formData.hashtags}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter hashtags separated by commas (e.g., technology, programming, webdev)"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
                Separate multiple hashtags with commas
              </p>
            </div>

            <div>
              <label htmlFor="community" className="form-label">
                Community (optional)
              </label>
              <select
                id="community"
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="form-input"
              >
                <option value="">Select a community (optional)</option>
                {communities.map(community => (
                  <option key={community._id} value={community._id}>
                    r/{community.name} - {community.description.substring(0, 50)}...
                  </option>
                ))}
              </select>
              {selectedCommunity && (
                <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
                  Selected: r/{communities.find(c => c._id === selectedCommunity)?.name}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Post...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
