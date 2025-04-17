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

module.exports = {
  getUserProfile,
  updateUserProfile
};