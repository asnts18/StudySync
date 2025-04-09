import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogoClick = () => {
    // Navigate to home if logged in, or landing page if not
    navigate(currentUser ? '/home' : '/');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="border-b border-gray-200 py-4">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex items-center justify-between">
          {/* Clickable Logo */}
          <button onClick={handleLogoClick} className="flex items-center space-x-2">
            <Logo className="text-2xl" /> 
          </button>

          {/* User Navigation */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                {/* Logged in state */}
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center space-x-2 hover:text-primary-yellow">
                    <User className="w-5 h-5" />
                    <span>{currentUser.first_name}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-black"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Logged out state */}
                <Link 
                  to="/login" 
                  className="px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 border-2 border-black bg-primary-yellow hover:bg-dark-yellow transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;