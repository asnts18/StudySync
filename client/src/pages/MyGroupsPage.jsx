import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StudyGroupCard from '../components/StudyGroupCard';
import { ArrowLeft, Plus } from 'lucide-react';
import studyGroupService from '../api/studyGroupService';

const MyGroupsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State variables
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

  // Fetch user's groups when component mounts
  useEffect(() => {
    const fetchUserGroups = async () => {
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
        
        setUserGroups(formattedGroups);
      } catch (err) {
        console.error('Error fetching user groups:', err);
        setError('Failed to load your study groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserGroups();
  }, []);

  const handleViewMore = (group) => {
    navigate(`/groups/${group.study_group_id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/home')} 
            className="p-2 border-2 border-black hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold">my groups</h1>
        </div>

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

        {/* Create New Group Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 px-6 py-3 border-2 border-black bg-primary-yellow hover:bg-dark-yellow transition-colors"
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
              {userGroups.filter(group => group.is_owner).length > 0 ? (
                userGroups
                  .filter(group => group.is_owner)
                  .map((group, index) => (
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
              {userGroups.filter(group => !group.is_owner).length > 0 ? (
                userGroups
                  .filter(group => !group.is_owner)
                  .map((group, index) => (
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
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MyGroupsPage;