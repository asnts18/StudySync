import api from './axios';

const universityService = {
  // Get all universities
  getAllUniversities: async () => {
    const response = await api.get('/universities');
    return response.data;
  },

  // Get a specific university by ID
  getUniversityById: async (universityId) => {
    const response = await api.get(`/universities/${universityId}`);
    return response.data;
  }
};

export default universityService;