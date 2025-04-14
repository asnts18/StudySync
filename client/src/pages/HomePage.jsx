import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudyGroupCard from '../components/StudyGroupCard';
import ActionButton from '../components/ActionButton';
import GroupDetailModal from '../components/GroupDetailModal';
import { useAuth } from '../contexts/AuthContext';
import studyGroupService from '../api/studyGroupService';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  
  const [userName, setUserName] = useState('');
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);

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
          currentMembers: group.current_members || 1,
          maxMembers: group.max_capacity,
          meetingTime: group.meeting_time,
          location: group.location,
          tags: group.tags || [],
          is_owner: group.is_owner
        }));
        
        // Only show the last 3 joined groups on the homepage
        setUserGroups(formattedGroups.slice(0, 3));
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
    setSelectedGroup(group);
  };

  const handleCloseModal = () => {
    setSelectedGroup(null);
  };

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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-6 mb-16">
          <ActionButton onClick={() => navigate('/join')}>
            find a study group
          </ActionButton>
          <ActionButton onClick={() => navigate('/create')}>
            create a study group
          </ActionButton>
          <ActionButton onClick={() => navigate('/my-groups')}>
            my groups
          </ActionButton>
        </div>

        {/* Your Recent Groups */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Recent Groups</h2>
            <button 
              onClick={() => navigate('/my-groups')}
              className="text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
          
          {loading ? (
            <div className="py-6 text-center">Loading your groups...</div>
          ) : error ? (
            <div className="py-6 text-center text-red-500">{error}</div>
          ) : userGroups.length > 0 ? (
            <div className="space-y-4">
              {userGroups.map((group, index) => (
                <StudyGroupCard
                  key={index}
                  group={group}
                  onViewMore={handleViewMore}
                  showJoinButton={false}
                />
              ))}
            </div>
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
        </section>
      </main>

      {/* Detail Modal */}
      {selectedGroup && (
        <GroupDetailModal 
          group={selectedGroup}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default HomePage;