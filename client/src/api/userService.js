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

  getUserMetrics: async () => {
    try {
      const response = await api.get('/users/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      throw error;
    }
  }
};

export default userService;