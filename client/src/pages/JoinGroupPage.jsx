import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import GroupDetailModal from '../components/GroupDetailModal';
import StudyGroupCard from '../components/StudyGroupCard';
import JoinGroupConfirmation from '../components/JoinGroupConfirmation';
import { useAuth } from '../contexts/AuthContext';
import studyGroupService from '../api/studyGroupService';
import tagService from '../api/tagService';

const JoinGroupPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [joinConfirmGroup, setJoinConfirmGroup] = useState(null);
  const [allGroups, setAllGroups] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch groups and tags when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !currentUser.university_id) return;
      
      setLoading(true);
      try {
        // Load user state first to get joined and pending groups
        await loadUserState();
        
        // Fetch groups from user's university
        const groups = await studyGroupService.getUniversityGroups(currentUser.university_id);
        
        // Format the groups and check for ownership
        const formattedGroups = groups.map(group => ({
          study_group_id: group.study_group_id,
          name: group.name,
          description: group.description,
          current_members: group.current_members || 1,
          maxMembers: group.max_capacity,
          course_code: group.course_code,
          course_name: group.course_name,
          tags: group.tags || [],
          is_private: group.is_private === 1 || group.is_private === true,
          // Check if the current user is the owner of this group
          is_owner: group.owner_id === currentUser.user_id
        }));
        
        setAllGroups(formattedGroups);
        
        // Fetch all available tags
        const tagsData = await tagService.getAllTags();
        setAllTags(tagsData.map(tag => tag.name));
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load groups. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);
  
  // Separate function to load user state (groups joined and pending)
  const loadUserState = async () => {
    try {
      // Fetch user's joined groups
      const userGroups = await studyGroupService.getUserGroups();
      setJoinedGroups(userGroups.map(group => group.study_group_id));
      
      // Fetch pending join requests from the database
      try {
        const pendingRequests = await studyGroupService.getPendingJoinRequests();
        setPendingGroups(pendingRequests.map(request => request.study_group_id));
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        // Set empty pending groups instead of failing completely
        setPendingGroups([]);
      }
    } catch (error) {
      console.error('Error loading user state:', error);
    }
  };

  // Filter groups based on search query and selected tags
  const filteredGroups = allGroups.filter(group => {
    const searchFields = [
      group.name.toLowerCase(),
      group.course_code?.toLowerCase() || '',
      group.course_name?.toLowerCase() || '',
      group.description?.toLowerCase() || '',
      ...(group.tags || []).map(tag => tag.toLowerCase())
    ].join(' ');

    const matchesSearch = searchQuery === '' || 
      searchFields.includes(searchQuery.toLowerCase());

    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => (group.tags || []).includes(tag));

    return matchesSearch && matchesTags;
  });

  const handleTagClick = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleViewMore = (group) => {
    setSelectedGroup(group);
  };

  const handleCloseModal = () => {
    setSelectedGroup(null);
  };

  const handleJoinGroup = (group) => {
    // Check if already joined
    if (joinedGroups.includes(group.study_group_id)) {
      // Already joined, navigate to group page
      navigate(`/groups/${group.study_group_id}`);
      return;
    }
    
    // Check if already pending
    if (pendingGroups.includes(group.study_group_id)) {
      // Already pending, show message
      setError(`You already have a pending request to join "${group.name}".`);
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }
    
    // Show confirmation modal
    setJoinConfirmGroup(group);
  };
  
  const handleJoinSuccess = (group) => {
    if (group.is_private) {
      // For private groups, add to pendingGroups
      setPendingGroups(prev => [...prev, group.study_group_id]);
      setSuccessMessage(`Request to join "${group.name}" has been sent to the group owner.`);
    } else {
      // For public groups, add to joinedGroups
      setJoinedGroups(prev => [...prev, group.study_group_id]);
      setSuccessMessage(`You have successfully joined "${group.name}".`);
    }
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  const isGroupJoined = (groupId) => {
    return joinedGroups.includes(groupId);
  };
  
  const isGroupPending = (groupId) => {
    return pendingGroups.includes(groupId);
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/home')}
            className="p-2 border-2 border-black hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold">find a study group</h1>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 border-2 border-green-500 bg-green-100 text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-100 text-red-700">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by course, subject, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-black focus:outline-none"
          />
        </div>

        {/* Tags filter (optional) */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <p className="font-medium mb-2">Filter by tags:</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 border-2 ${
                    selectedTags.includes(tag) ? 'border-black bg-primary-yellow' : 'border-gray-300 bg-white'
                  } rounded-full transition-colors`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Group Listings */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-6 text-center">Loading study groups...</div>
          ) : filteredGroups.length > 0 ? (
            filteredGroups.map((group, index) => (
              <StudyGroupCard 
                key={`group-${group.study_group_id || index}`}
                group={group}
                onViewMore={handleViewMore}
                onJoinGroup={handleJoinGroup}
                isJoined={isGroupJoined(group.study_group_id)}
                isPending={isGroupPending(group.study_group_id)}
                // Show join button for all groups except ones the user owns
                showJoinButton={!group.is_owner}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-black p-6">
              No study groups match your search criteria
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedGroup && (
        <GroupDetailModal 
          group={selectedGroup}
          onClose={handleCloseModal}
        />
      )}

      {/* Join Confirmation Modal */}
      {joinConfirmGroup && (
        <JoinGroupConfirmation
          group={joinConfirmGroup}
          onClose={() => setJoinConfirmGroup(null)}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
};

export default JoinGroupPage;