import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/axios';

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await API.get('/communities');
      setCommunities(response.data.communities || []);
    } catch (err) {
      setError('Failed to fetch communities');
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleJoin = async (communityId) => {
    try {
      const { data } = await API.post(`/communities/${communityId}/join`);
      setCommunities((prev) => prev.map((c) => {
        if (c._id !== communityId) return c;
        const memberCount = data.isMember ? (c.memberCount || 0) + 1 : Math.max(0, (c.memberCount || 0) - 1);
        return { ...c, isMember: data.isMember, memberCount };
      }));
    } catch (e) {
      console.error('Failed to toggle join', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-proddit-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-4">Communities</h1>
                      <p className="text-gray-600 dark:text-dark-text-secondary">Discover and join communities that interest you</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Communities List */}
        <div className="space-y-6">
          {communities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No communities yet</h3>
              <p className="text-gray-600 mb-4">
                Communities feature is coming soon! This will allow users to create and join topic-based communities.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  • Create topic-based communities
                </p>
                <p className="text-sm text-gray-500">
                  • Join communities of interest
                </p>
                <p className="text-sm text-gray-500">
                  • Share posts within communities
                </p>
              </div>
            </div>
          ) : (
            communities.map(community => (
              <div key={community._id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-proddit-orange rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      <Link to={`/communities/${community._id}`} className="hover:text-proddit-orange">
                        r/{community.name}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm">{community.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{community.memberCount} members</span>
                      <span>•</span>
                      <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button className={community.isMember ? 'btn-outline text-sm' : 'btn-primary text-sm'} onClick={() => toggleJoin(community._id)}>
                    {community.isMember ? 'Joined' : 'Join'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Community CTA */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Want to create a community?</h3>
            <p className="text-gray-600 mb-4">
              Start a community around a topic that interests you and bring people together.
            </p>
            <Link to="/create-community" className="btn-primary">
              Create Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communities;
