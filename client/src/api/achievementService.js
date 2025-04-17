// api/achievementService.js
import api from './axios';

const achievementService = {
  // Get all achievements
  getAllAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data;
  },

  // Get a specific achievement by ID
  getAchievementById: async (achievementId) => {
    const response = await api.get(`/achievements/${achievementId}`);
    return response.data;
  },

  // Create a new achievement for a specific group
  createGroupAchievement: async (groupId, achievementData) => {
    try {
      const response = await api.post(`/achievements/group/${groupId}`, achievementData);
      return response.data;
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
      return response.data;
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  },
  
  // Get all group-specific achievements
  getGroupAchievements: async (groupId) => {
    try {
      const response = await api.get(`/achievements/group/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group achievements:', error);
      throw error;
    }
  }
};

export default achievementService;