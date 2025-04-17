import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StudyGroupCard from '../components/StudyGroupCard';
import ActionButton from '../components/ActionButton';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import studyGroupService from '../api/studyGroupService';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading: authLoading } = useAuth();
  
  const [userName, setUserName] = useState('');
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Check for new group creation success message
  useEffect(() => {
    if (location.state?.newGroupCreated) {
      setSuccessMessage(`Your group "${location.state.groupName}" has been created successfully!`);
      
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);
  
  // Update username when currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.first_name) {
      setUserName(currentUser.first_name);
    }
  }, [currentUser]);

  // Fetch user's groups when component mounts
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const groups = await studyGroupService.getUserGroups();
        
        // Format the groups for StudyGroupCard component
        const formattedGroups = groups.map(group => ({
          study_group_id: group.study_group_id,
          name: group.name,
          description: group.description,
          current_members: group.current_members || 1,
          maxMembers: group.max_capacity,
          course_code: group.course_code,
          course_name: group.course_name,
          tags: group.tags || [],
          is_owner: group.is_owner === 1 || group.is_owner === true,
          is_private: group.is_private === 1 || group.is_private === true
        }));
        
        setUserGroups(formattedGroups);
      } catch (err) {
        console.error('Error fetching user groups:', err);
        setError('Failed to load your study groups');
      } finally {
        setLoading(false);
      }
    };

    fetchUserGroups();
  }, [currentUser]);

  const handleViewMore = (group) => {
    navigate(`/groups/${group.study_group_id}`);
  };

  // Filter groups owned by the user
  const ownedGroups = userGroups.filter(group => group.is_owner);
  
  // Filter groups joined by the user (not owned)
  const joinedGroups = userGroups.filter(group => !group.is_owner);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Welcome Section */}
        <h1 className="text-4xl font-bold mb-12 text-left">
          {authLoading ? (
            "Loading..."
          ) : userName ? (
            `welcome back, ${userName}!`
          ) : (
            "welcome back!"
          )}
        </h1>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 border-2 border-green-500 bg-green-100 text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-100 text-red-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-6 mb-16">
          <ActionButton onClick={() => navigate('/join')}>
            find a study group
          </ActionButton>
          <ActionButton onClick={() => navigate('/create')}>
            create a study group
          </ActionButton>
        </div>

        {/* Create New Group Button (Mobile Friendly) */}
        <div className="mb-8 md:hidden">
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 px-6 py-3 border-2 border-black bg-primary-yellow hover:bg-dark-yellow transition-colors w-full justify-center"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Group</span>
          </button>
        </div>

        {/* Groups I Own */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-left">Groups I Own</h2>
          
          {loading ? (
            <div className="py-6 text-center">Loading your groups...</div>
          ) : (
            <div className="space-y-4">
              {ownedGroups.length > 0 ? (
                ownedGroups.map((group, index) => (
                  <StudyGroupCard
                    key={`owned-${group.study_group_id || index}`}
                    group={group}
                    onViewMore={handleViewMore}
                    showJoinButton={false}
                  />
                ))
              ) : (
                <div className="py-6 text-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">You haven't created any groups yet</p>
                  <button 
                    onClick={() => navigate('/create')}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Create a group
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Groups I've Joined */}
        <section>
          <h2 className="text-xl font-semibold mb-6 text-left">Groups I've Joined</h2>
          
          {loading ? (
            <div className="py-6 text-center">Loading your groups...</div>
          ) : (
            <div className="space-y-4">
              {joinedGroups.length > 0 ? (
                joinedGroups.map((group, index) => (
                  <StudyGroupCard
                    key={`joined-${group.study_group_id || index}`}
                    group={group}
                    onViewMore={handleViewMore}
                    showJoinButton={false}
                  />
                ))
              ) : (
                <div className="py-6 text-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">You haven't joined any groups yet</p>
                  <button 
                    onClick={() => navigate('/join')}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Find a group to join
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;