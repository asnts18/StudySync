// api/studyGroupService.js
import api from './axios';

const studyGroupService = {
  // Get all study groups (with optional filters)
  getAllGroups: async (filters = {}) => {
    const response = await api.get('/study-groups', { params: filters });
    return response.data;
  },

  // Get a specific study group by ID
  getGroupById: async (groupId) => {
    const response = await api.get(`/study-groups/${groupId}`);
    return response.data;
  },

  // Create a new study group
  createGroup: async (groupData) => {
    const response = await api.post('/study-groups', groupData);
    return response.data;
  },

  // Update a study group
  updateGroup: async (groupId, groupData) => {
    const response = await api.put(`/study-groups/${groupId}`, groupData);
    return response.data;
  },

  // Join a study group
  joinGroup: async (groupId) => {
    const response = await api.post(`/study-groups/${groupId}/join`);
    return response.data;
  },

  // Leave a study group
  leaveGroup: async (groupId) => {
    const response = await api.delete(`/study-groups/${groupId}/members`);
    return response.data;
  },

  // Get user's study groups
  getUserGroups: async () => {
    const response = await api.get('/study-groups/my-groups');
    return response.data;
  },
  
  // Get all tags
  getTags: async () => {
    const response = await api.get('/tags');
    return response.data;
  }
};

export default studyGroupService;