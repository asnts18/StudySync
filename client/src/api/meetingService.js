// api/meetingService.js
import api from './axios';

const meetingService = {
  // Create a new meeting
  createMeeting: async (meetingData) => {
    try {
      // Format data to match backend expectations
      const formattedData = {
        ...meetingData,
        // Convert boolean to 0/1 if needed (though axios should handle this)
        is_recurring: meetingData.is_recurring ? true : false
      };
      
      // Call the API
      const response = await api.post('/meetings', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating meeting:', error);
      // Extract the error message if available
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(errorMessage);
    }
  },

  // Get meetings for a specific study group
getGroupMeetings: async (groupId) => {
    try {
      const response = await api.get(`/meetings/group/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group meetings:', error);
      throw error;
    }
  },
  

  // Get a specific meeting by ID
  getMeetingById: async (meetingId) => {
    try {
      const response = await api.get(`/meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      throw error;
    }
  },

  // Update a meeting
  updateMeeting: async (meetingId, meetingData) => {
    try {
      const response = await api.put(`/meetings/${meetingId}`, meetingData);
      return response.data;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  },

  // Delete a meeting
  deleteMeeting: async (meetingId) => {
    try {
      const response = await api.delete(`/meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }
};


export default meetingService;