import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../api/userService'; // Import existing user service

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userMetrics, setUserMetrics] = useState({
    courses: 0,
    created_groups: 0,
    joined_groups: 0,
    achievements: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user metrics when component mounts
    const fetchUserMetrics = async () => {
      try {
        console.log('Fetching user metrics...');
        const metrics = await userService.getUserMetrics();
        console.log('Received metrics:', metrics);
        setUserMetrics(metrics);
      } catch (err) {
        console.error('Error fetching user metrics:', err);
        setError('Failed to load user statistics');
      } finally {
        setLoading(false);
      }
    };
  
    if (currentUser) {
      fetchUserMetrics();
    } else {
      setLoading(false);
    }
  }, [currentUser]);
  
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-8 py-12">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/home')} 
              className="p-2 border-2 border-black hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-4xl font-bold">my profile</h1>
          </div>
          <button 
            onClick={() => navigate('/profile/edit')} 
            className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-primary-yellow hover:bg-dark-yellow transition-colors"
          >
            <Edit className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile information cards */}
        <div className="space-y-8">
          {/* Personal Information */}
          <div className="border-2 border-black p-6">
            <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg">{currentUser.first_name} {currentUser.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg">{currentUser.email}</p>
              </div>
              {currentUser.university_name && (
                <div>
                  <p className="text-sm text-gray-500">University</p>
                  <p className="text-lg">{currentUser.university_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="border-2 border-black p-6">
            <h2 className="text-2xl font-semibold mb-4">About Me</h2>
            <p className="text-lg whitespace-pre-wrap">
              {currentUser.bio || "No bio provided yet. Click 'Edit Profile' to add a bio."}
            </p>
          </div>

          {/* Study Stats */}
          <div className="border-2 border-black p-6">
            <h2 className="text-2xl font-semibold mb-4">Study Stats</h2>
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : loading ? (
              <p className="text-gray-500">Loading statistics...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{userMetrics.courses || 0}</p>
                  <p className="text-sm text-gray-500">Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{userMetrics.created_groups || 0}</p>
                  <p className="text-sm text-gray-500">Groups Created</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{userMetrics.joined_groups || 0}</p>
                  <p className="text-sm text-gray-500">Groups Joined</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{userMetrics.achievements || 0}</p>
                  <p className="text-sm text-gray-500">Achievements</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;