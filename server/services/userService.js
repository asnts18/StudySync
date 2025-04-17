// services/userService.js
const db = require('../config/db.config');

const getUserProfile = async (userId) => {
  try {
    // Simple user profile without detailed stats
    const results = await db.callProcedure('sp_GetUserProfile', [userId]);
    
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }
    
    return {
      userInfo: results[0][0],
      achievements: results[1] || [],
      groups: results[2] || [],
      courses: results[3] || []
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
};


const updateUserProfile = async (userId, userData) => {
  try {
    const { first_name, last_name, email, bio, university_id } = userData;
    await db.query(
      'UPDATE User SET first_name = ?, last_name = ?, email = ?, bio = ?, university_id = ? WHERE user_id = ?',
      [first_name, last_name, email, bio, university_id, userId]
    );
    return getUserProfile(userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
};

const getUserMetrics = async (userId) => {
  try {
    // Call the stored procedure
    const result = await db.callProcedure('sp_GetUserMetrics', [userId]);
    
    // Check if we have a valid result structure
    // The data we want is in the first element (an array of result rows)
    if (!result || !Array.isArray(result[0]) || !result[0][0]) {
      return {
        created_groups: 0,
        joined_groups: 0,
        achievements: 0,
        courses: 0
      };
    }

    // Extract the first row from the first result set
    const metrics = result[0][0];
    
    return {
      created_groups: metrics.created_groups || 0,
      joined_groups: metrics.joined_groups || 0,
      achievements: metrics.achievements || 0,
      courses: metrics.courses || 0
    };
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    throw new Error('Failed to fetch user metrics');
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserMetrics
};