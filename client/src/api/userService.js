import api from './axios';

const userService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // TODO: Get user profile with achievements (when endpoint is implemented)
  getProfileWithAchievements: async () => {
    const response = await api.get('/users/profile/complete');
    return response.data;
  }
};

export default userService;