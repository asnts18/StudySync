
const pool = require('../database'); // Assuming you have a database connection set up

const getUserProfile = async (userId) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, first_name, last_name, university_id, created_at FROM users WHERE id = ?', 
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
    const { first_name, last_name, email, university_id } = userData;
    await pool.query(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, university_id = ? WHERE id = ?',
      [first_name, last_name, email, university_id, userId]
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
    const [userRows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
              u.created_at, univ.name as university_name
       FROM users u
       LEFT JOIN universities univ ON u.university_id = univ.id
       WHERE u.id = ?`,
      [userId]
    );
    
    if (userRows.length === 0) {
      return null;
    }
    
    const user = userRows[0];
    
    // Get user achievements
    const achievements = await achievementService.getUserAchievements(userId);
    
    // Get number of courses the user is enrolled in
    const [courseCountResult] = await pool.query(
      'SELECT COUNT(*) as course_count FROM user_courses WHERE user_id = ?',
      [userId]
    );
    const courseCount = courseCountResult[0].course_count;
    
    // Get number of study groups the user belongs to
    const [groupCountResult] = await pool.query(
      'SELECT COUNT(*) as group_count FROM user_study_groups WHERE user_id = ?',
      [userId]
    );
    const groupCount = groupCountResult[0].group_count;
    
    // Calculate total achievement points
    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
    
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

module.exports = {
  getUserProfile,
  updateUserProfile,
  getFullUserProfile
};