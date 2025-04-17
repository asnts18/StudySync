// components/AchievementAwardModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Award, Search, LoaderCircle, AlertCircle } from 'lucide-react';
import achievementService from '../api/achievementService';

const AchievementAwardModal = ({ 
  isOpen, 
  onClose, 
  member, 
  groupId,
  onSuccess 
}) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // State for new achievement creation
  const [newAchievement, setNewAchievement] = useState({
    name: '',
    description: ''
  });
  
  // Award action states
  const [awarding, setAwarding] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Reset form and error states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMessage('');
      setSearchQuery('');
      setNewAchievement({ name: '', description: '' });
      setIsCreatingNew(false);
    }
  }, [isOpen]);
  
  // Fetch available achievements when modal opens
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!isOpen || !groupId) return;
      
      setLoading(true);
      setError('');
      
      try {
        // First try to get platform default achievements
        let allAchievements = [];
        
        try {
          console.log('Fetching platform achievements');
          const platformAchievements = await achievementService.getAllAchievements();
          if (platformAchievements && Array.isArray(platformAchievements)) {
            allAchievements = [...platformAchievements];
            console.log(`Found ${platformAchievements.length} platform achievements`);
          }
        } catch (platformErr) {
          console.log('Error fetching platform achievements:', platformErr);
          // Continue with empty platform achievements
        }
        
        // Then try to get group-specific achievements
        try {
          console.log(`Fetching group achievements for group ${groupId}`);
          const groupAchievements = await achievementService.getGroupAchievements(groupId);
          if (groupAchievements && Array.isArray(groupAchievements)) {
            // Only add unique achievements by ID
            const existingIds = new Set(allAchievements.map(a => a.achievement_id));
            const uniqueGroupAchievements = groupAchievements.filter(a => !existingIds.has(a.achievement_id));
            
            allAchievements = [...allAchievements, ...uniqueGroupAchievements];
            console.log(`Found ${uniqueGroupAchievements.length} unique group achievements`);
          }
        } catch (groupErr) {
          console.log('Error fetching group achievements:', groupErr);
          // Continue with just platform achievements
        }
        
        console.log(`Total available achievements: ${allAchievements.length}`);
        setAchievements(allAchievements);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError('Failed to load achievements. Please try again.');
        setAchievements([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [isOpen, groupId, successMessage]); // Refetch when success changes (after creating/awarding)

  // Filter achievements based on search query
  const filteredAchievements = achievements.filter(achievement =>
    achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (achievement.description && achievement.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );


// Handle create achievement
const handleCreateAchievement = async () => {
    if (!newAchievement.name) {
      setError('Achievement name is required');
      return;
    }
    
    setCreating(true);
    setError('');
    
    try {
      console.log(`Creating achievement for group ${groupId}:`, newAchievement);
      
      // Create achievement data with the minimum required fields
      const achievementData = {
        name: newAchievement.name,
        description: newAchievement.description || '' // Ensure description is not null
      };
      
      // Call the service
      const createdAchievement = await achievementService.createGroupAchievement(
        groupId, 
        achievementData
      );
      
      console.log('Created achievement result:', createdAchievement);
      
      // Safely add the new achievement to the list
      if (createdAchievement) {
        // Create a safe copy with all required fields
        const safeAchievement = {
          achievement_id: createdAchievement.achievement_id || Date.now(),
          name: createdAchievement.name || newAchievement.name,
          description: createdAchievement.description || newAchievement.description || '',
          group_id: parseInt(groupId),
          is_platform_default: false
        };
        
        // Check if achievement is already in the list to avoid duplicates
        const existingIndex = achievements.findIndex(a => 
          a.achievement_id === safeAchievement.achievement_id ||
          (a.name === safeAchievement.name && a.group_id === safeAchievement.group_id)
        );
        
        if (existingIndex >= 0) {
          // Replace the existing achievement
          const updatedAchievements = [...achievements];
          updatedAchievements[existingIndex] = safeAchievement;
          setAchievements(updatedAchievements);
        } else {
          // Add as a new achievement
          setAchievements(prev => [...prev, safeAchievement]);
        }
      }
      
      // Reset form and show success message
      setNewAchievement({ name: '', description: '' });
      setIsCreatingNew(false);
      setSuccessMessage('Achievement created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error creating achievement:', err);
      
      // Extract detailed error message if available
      let errorMessage = 'Failed to create achievement. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  // Handle awarding achievement to a member
  const handleAwardAchievement = async (achievementId) => {
    if (!member || !member.user_id) {
      setError('Invalid member data');
      return;
    }
    
    setAwarding(true);
    setError('');
    
    try {
      console.log(`Awarding achievement ${achievementId} to member ${member.user_id} in group ${groupId}`);
      
      await achievementService.awardAchievement(groupId, achievementId, member.user_id);
      
      setSuccessMessage(`Achievement awarded to ${member.first_name} successfully!`);
      
      // Notify parent component
      if (onSuccess) {
        onSuccess();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error awarding achievement:', err);
      
      // Extract detailed error message if available
      let errorMessage = 'Failed to award achievement. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setAwarding(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto border-2 border-black">
        {/* Header */}
        <div className="border-b-2 border-black p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">Award Achievement</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 border-2 border-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-2">
            Award an achievement to <span className="font-medium">{member.first_name} {member.last_name}</span>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error / Success messages */}
          {error && (
            <div className="p-3 border-2 border-red-500 bg-red-100 text-red-700 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 border-2 border-green-500 bg-green-100 text-green-700">
              {successMessage}
            </div>
          )}
          
          {/* Create new achievement button (only visible when not in create mode) */}
          {!isCreatingNew && (
            <button 
              onClick={() => setIsCreatingNew(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-primary-yellow hover:bg-dark-yellow transition-colors w-full"
            >
              <Plus className="w-4 h-4" />
              Create New Achievement
            </button>
          )}
          
          {/* Create new achievement form */}
          {isCreatingNew && (
            <div className="border-2 border-black p-4 space-y-4">
              <h3 className="font-semibold">Create New Achievement</h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Achievement Name</label>
                <input
                  type="text"
                  value={newAchievement.name}
                  onChange={(e) => setNewAchievement({...newAchievement, name: e.target.value})}
                  className="w-full p-2 border-2 border-black"
                  placeholder="e.g., Study Champion"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                  className="w-full p-2 border-2 border-black h-20"
                  placeholder="Describe what this achievement represents..."
                />
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleCreateAchievement}
                  disabled={creating}
                  className="flex-1 px-4 py-2 border-2 border-black bg-primary-yellow hover:bg-dark-yellow transition-colors"
                >
                  {creating ? (
                    <span className="flex items-center justify-center">
                      <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Achievement'
                  )}
                </button>
                <button 
                  onClick={() => setIsCreatingNew(false)}
                  disabled={creating}
                  className="flex-1 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-2 border-2 border-black"
            />
          </div>
          
          {/* Achievement list */}
          <div className="space-y-4">
            <h3 className="font-semibold">Available Achievements</h3>
            
            {loading ? (
              <div className="text-center py-10">
                <LoaderCircle className="w-6 h-6 mx-auto animate-spin text-gray-400" />
                <p className="mt-2 text-gray-500">Loading achievements...</p>
              </div>
            ) : filteredAchievements.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {filteredAchievements.map((achievement) => (
                  <div key={achievement.achievement_id} className="border-2 border-black p-3 flex justify-between items-start">
                    <div>
                      <h4 className="font-medium flex items-center">
                        <Award className="w-4 h-4 mr-1 text-primary-yellow" />
                        {achievement.name}
                      </h4>
                      {achievement.description && (
                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                      )}
                      
                      {/* Indicate if this is a group-specific achievement */}
                      {achievement.group_id && achievement.group_id == groupId && (
                        <span className="mt-1 text-xs text-gray-500 flex items-center">
                          Group specific
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleAwardAchievement(achievement.achievement_id)}
                      disabled={awarding}
                      className="px-3 py-1 border-2 border-black bg-primary-yellow hover:bg-dark-yellow transition-colors text-sm"
                    >
                      {awarding ? 'Awarding...' : 'Award'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No achievements found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementAwardModal;