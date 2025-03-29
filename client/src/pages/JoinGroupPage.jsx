
import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import GroupDetailModal from '../components/GroupDetailModal';
import StudyGroupCard from '../components/StudyGroupCard';

const JoinGroupPage = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Example data
  const allGroups = [
    {
      name: "CS 11 Study Group",
      currentMembers: 3,
      maxMembers: 5,
      meetingTime: "Tues/Thurs 3-5 pm",
      location: "Tisch Library",
      tags: ["Quiet Study", "Group Assignment"]
    },
    {
      name: "Calculus II Group",
      currentMembers: 4,
      maxMembers: 6,
      meetingTime: "Mon/Wed 2-4 pm",
      location: "Science Center",
      tags: ["Problem Solving", "Exam Prep"]
    },
    {
      name: "Biology 101 Study Session",
      currentMembers: 2,
      maxMembers: 4,
      meetingTime: "Fri 1-3 pm",
      location: "Science Center",
      tags: ["Discussion Based", "Lab Review"]
    }
  ];

  const allTags = useMemo(() => {
    const tagSet = new Set();
    allGroups.forEach(group => {
      group.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [allGroups]);

  const filteredGroups = useMemo(() => {
    return allGroups.filter(group => {
      const searchFields = [
        group.name.toLowerCase(),
        group.location.toLowerCase(),
        ...group.tags.map(tag => tag.toLowerCase())
      ].join(' ');

      const matchesSearch = searchQuery === '' || 
        searchFields.includes(searchQuery.toLowerCase());

      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => group.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [allGroups, searchQuery, selectedTags]);

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

  return (
    <div className="min-h-screen bg-white">

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 border-2 border-black hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold">find a study group</h1>
        </div>

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

        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 border-2 border-black transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-light-orange text-black'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Group Listings */}
        <div className="space-y-4">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group, index) => (
              <StudyGroupCard 
                key={index} 
                group={group}
                onViewMore={handleViewMore} 
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