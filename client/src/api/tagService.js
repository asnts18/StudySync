// api/tagService.js
import api from './axios';

const tagService = {
  // Get all tags
  getAllTags: async () => {
    const response = await api.get('/tags');
    return response.data;
  }
};

export default tagService;