import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import GroupDetailModal from '../components/GroupDetailModal';
import StudyGroupCard from '../components/StudyGroupCard';
import { useAuth } from '../contexts/AuthContext';
import studyGroupService from '../api/studyGroupService';
import tagService from '../api/tagService';

const JoinGroupPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [allGroups, setAllGroups] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch groups and tags when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !currentUser.university_id) return;
      
      setLoading(true);
      try {
        // Fetch groups from user's university
        const groups = await studyGroupService.getUniversityGroups(currentUser.university_id);
        
        // Format the groups and check for ownership
        const formattedGroups = groups.map(group => ({
          study_group_id: group.study_group_id,
          name: group.name,
          description: group.description,
          currentMembers: group.current_members || 1,
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
    navigate(`/groups/${group.study_group_id}`);
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
                // Don't show the Join button for groups the user owns
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
    </div>
  );
};

export default JoinGroupPage;