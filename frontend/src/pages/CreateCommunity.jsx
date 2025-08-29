import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';

const CreateCommunity = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    isPrivate: false,
    isNSFW: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.name.length < 3) {
      setError('Community name must be at least 3 characters long');
      return;
    }

    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/communities', formData);
      
      if (response.data.success) {
        navigate(`/communities/${response.data.community._id}`);
      } else {
        setError(response.data.message || 'Failed to create community');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community');
      console.error('Error creating community:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">You must be logged in to create a community.</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-4">Create a Community</h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Start a community around a topic that interests you and bring people together.
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                Community Name *
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-dark-text-secondary text-lg mr-2">r/</span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field flex-1"
                  placeholder="community_name"
                  minLength={3}
                  maxLength={21}
                  pattern="[a-zA-Z0-9_]+"
                  title="Community name can only contain letters, numbers, and underscores"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
                Community names cannot be changed later. Use 3-21 characters, letters and numbers only.
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                placeholder="Briefly describe what your community is about..."
                minLength={10}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div>
              <label htmlFor="rules" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                Community Rules
              </label>
              <textarea
                id="rules"
                name="rules"
                rows={5}
                value={formData.rules}
                onChange={handleChange}
                className="input-field"
                placeholder="Set guidelines for your community members (optional)..."
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
                {formData.rules.length}/1000 characters
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Community Guidelines</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Be respectful and inclusive</li>
                <li>• Follow Reddit's content policy</li>
                <li>• Encourage meaningful discussions</li>
                <li>• Moderate content appropriately</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="isPrivate"
                  name="isPrivate"
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="h-4 w-4 text-proddit-orange focus:ring-proddit-orange border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                  Make this community private (invite-only)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isNSFW"
                  name="isNSFW"
                  type="checkbox"
                  checked={formData.isNSFW}
                  onChange={handleChange}
                  className="h-4 w-4 text-proddit-orange focus:ring-proddit-orange border-gray-300 rounded"
                />
                <label htmlFor="isNSFW" className="ml-2 block text-sm text-gray-900">
                  This community is NSFW (18+ content)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/communities')}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Community...' : 'Create Community'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What makes a good community?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Clear Purpose</h4>
              <p>Define what your community is about and who it's for.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Active Moderation</h4>
              <p>Set clear rules and enforce them consistently.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Engagement</h4>
              <p>Encourage discussions and participation from members.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Growth</h4>
              <p>Promote your community to attract like-minded people.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunity;
