// services/userService.js
const db = require('../config/db.config');

const getUserProfile = async (userId) => {
  try {
    const rows = await db.query(
      'SELECT user_id, email, first_name, last_name, bio, university_id FROM User WHERE user_id = ?', 
      [userId]
    );
    return rows[0];
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

const achievementService = require('./achievementService');

// Get comprehensive user profile with achievements
const getFullUserProfile = async (userId) => {
  try {
    // Get basic user info
    const userRows = await db.query(
      `SELECT u.user_id, u.email, u.first_name, u.last_name, u.bio,
              univ.name as university_name
       FROM User u
       LEFT JOIN University univ ON u.university_id = univ.university_id
       WHERE u.user_id = ?`,
      [userId]
    );
    
    if (userRows.length === 0) {
      return null;
    }
    
    const user = userRows[0];
    
    // Get user achievements
    const achievements = await achievementService.getUserAchievements(userId);
    
    // Get number of courses the user is enrolled in
    const courseCountResult = await db.query(
      'SELECT COUNT(*) as course_count FROM User_Course WHERE user_id = ?',
      [userId]
    );
    const courseCount = courseCountResult[0].course_count;
    
    // Get number of study groups the user belongs to
    const groupCountResult = await db.query(
      'SELECT COUNT(*) as group_count FROM User_StudyGroup WHERE user_id = ?',
      [userId]
    );
    const groupCount = groupCountResult[0].group_count;
    
    // Calculate total achievement points
    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.point_value || 0, 0);
    
    // Return combined profile
    return {
      ...user,
      stats: {
        totalAchievements: achievements.length,
        totalPoints,
        courseCount,
        groupCount
      },
      achievements
    };
  } catch (error) {
    console.error('Error fetching full user profile:', error);
    throw new Error('Failed to fetch user profile with achievements');
  }
};

// Add the stored procedure implementation from userController
const getCompleteUserProfileUsingProcedures = async (userId) => {
  try {
    // Call stored procedure instead of direct queries
    const result = await db.callProcedure('sp_GetUserProfile', [userId]);
    
    if (!result || result.length === 0) {
      return null;
    }
    
    return result[0]; // Return first row of result set
  } catch (error) {
    console.error('Error fetching complete user profile using procedures:', error);
    throw new Error('Failed to fetch complete user profile');
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getFullUserProfile,
  getCompleteUserProfileUsingProcedures
};