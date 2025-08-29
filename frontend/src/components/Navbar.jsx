import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-dark-bg shadow-md border-b border-gray-200 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-proddit-orange rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-2xl font-bold text-proddit-orange">Proddit</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 dark:text-dark-text hover:text-proddit-orange px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/communities" 
              className="text-gray-700 dark:text-dark-text hover:text-proddit-orange px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Communities
            </Link>
            {user && (
              <>
                <Link 
                  to="/chats" 
                  className="text-gray-700 dark:text-dark-text hover:text-proddit-orange px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Chats
                </Link>
                <Link 
                  to="/study-rooms" 
                  className="text-gray-700 dark:text-dark-text hover:text-proddit-orange px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Study Rooms
                </Link>
                <Link 
                  to="/tasks" 
                  className="text-gray-700 dark:text-dark-text hover:text-proddit-orange px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Tasks
                </Link>
                <Link 
                  to="/habits" 
                  className="text-gray-700 dark:text-dark-text hover:text-proddit-orange px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Habits
                </Link>
              </>
            )}
            {user && (
              <Link 
                to="/create-community" 
                className="text-gray-700 dark:text-dark-text hover:text-proddit-orange px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Create Community
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            {user ? (
              <>
                <div className="flex items-center space-x-3 bg-gray-100 dark:bg-dark-card rounded-full px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Karma:</span>
                    <span className="text-sm font-bold text-proddit-orange">{user.karma || 0}</span>
                  </div>
                  <div className="w-1 h-4 bg-gray-300 dark:bg-dark-border rounded-full"></div>
                  <Link 
                    to={`/profile/${user.username}`}
                    className="text-sm font-semibold text-gray-900 dark:text-dark-text hover:text-proddit-orange transition-colors duration-200"
                  >
                    u/{user.username}
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn-outline text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
