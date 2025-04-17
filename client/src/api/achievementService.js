// api/achievementService.js
import api from './axios';

const achievementService = {
  // Get all achievements
  getAllAchievements: async () => {
    try {
      const response = await api.get('/achievements');
      // Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('getAllAchievements: Response is not an array:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching all achievements:', error);
      return []; // Return empty array instead of throwing to prevent UI errors
    }
  },

  // Get a specific achievement by ID
  getAchievementById: async (achievementId) => {
    try {
      const response = await api.get(`/achievements/${achievementId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching achievement by ID:', error);
      throw error;
    }
  },

  // Create a new achievement for a specific group
  createGroupAchievement: async (groupId, achievementData) => {
    try {
      console.log(`Creating group achievement for group ${groupId}:`, achievementData);
      
      // Make sure we have required fields
      if (!achievementData.name) {
        throw new Error('Achievement name is required');
      }
      
      const response = await api.post(`/achievements/group/${groupId}`, achievementData);
      
      console.log('Create achievement response:', response.data);
      
      // If response.data is null or undefined, return a default object
      if (!response.data) {
        console.warn('Empty response when creating achievement');
        return {
          achievement_id: Date.now(), // Temporary ID for UI purposes
          name: achievementData.name,
          description: achievementData.description || '',
          group_id: parseInt(groupId),
          is_platform_default: false
        };
      }
      
      // Ensure the response has the expected structure
      return {
        achievement_id: response.data.achievement_id || Date.now(),
        name: response.data.name || achievementData.name,
        description: response.data.description || achievementData.description || '',
        group_id: response.data.group_id || parseInt(groupId),
        is_platform_default: response.data.is_platform_default || false
      };
    } catch (error) {
      console.error('Error creating group achievement:', error);
      throw error;
    }
  },
  // Award an achievement to a group member
  awardAchievement: async (groupId, achievementId, memberId) => {
    try {
      const response = await api.post(`/achievements/group/${groupId}/${achievementId}/award/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
  },

  // Revoke an achievement from a group member
  revokeAchievement: async (groupId, achievementId, memberId) => {
    try {
      const response = await api.delete(`/achievements/group/${groupId}/${achievementId}/award/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error revoking achievement:', error);
      throw error;
    }
  },
  
  // Get all achievements for a specific user
  getUserAchievements: async (userId) => {
    try {
      const response = await api.get(`/achievements/user/${userId}`);
      // Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('getUserAchievements: Response is not an array:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return []; // Return empty array instead of throwing to prevent UI errors
    }
  },
  
  // Get all group-specific achievements
  getGroupAchievements: async (groupId) => {
    try {
      const response = await api.get(`/achievements/group/${groupId}`);
      // Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('getGroupAchievements: Response is not an array:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching group achievements:', error);
      return []; // Return empty array instead of throwing to prevent UI errors
    }
  }
};

export default achievementService;