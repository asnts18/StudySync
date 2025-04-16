// api/studyGroupService.js
import api from './axios';

const studyGroupService = {
  // Get all study groups (with optional filters)
  getAllGroups: async (filters = {}) => {
    try {
      const response = await api.get('/study-groups', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching all groups:', error);
      throw error;
    }
  },

  // Get a specific study group by ID
  getGroupById: async (groupId) => {
    try {
      const response = await api.get(`/study-groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group by ID:', error);
      throw error;
    }
  },

  // Create a new study group
  createGroup: async (groupData) => {
    try {
      const response = await api.post('/study-groups', groupData);
      return response.data;
    } catch (error) {
      console.error('Error creating study group:', error);
      throw error;
    }
  },

  // Update a study group
  updateGroup: async (groupId, groupData) => {
    try {
      const response = await api.put(`/study-groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  },

  // Delete a study group
  deleteStudyGroup: async (groupId) => {
    try {
      const response = await api.delete(`/study-groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  },

  // Join a study group
  joinGroup: async (groupId) => {
    try {
      const response = await api.post(`/study-groups/${groupId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  },

  // Leave a study group
  leaveGroup: async (groupId) => {
    try {
      const response = await api.delete(`/study-groups/${groupId}/members`);
      return response.data;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  },

  // Get user's study groups (both owned and joined)
  getUserGroups: async () => {
    try {
      const response = await api.get('/study-groups/my-groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  },

  // Get members of a specific study group
getGroupMembers: async (groupId) => {
  try {
    const response = await api.get(`/study-groups/${groupId}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
},

getUniversityGroups: async (universityId) => {
  try {
    const response = await api.get(`/study-groups/university/${universityId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching university groups:', error);
    throw error;
  }
}

  
};

export default studyGroupService;