// services/achievementService.js
const db = require('../config/db.config');

const getUserAchievements = async (userId) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.name, a.description, a.points, a.icon_url, ua.earned_at
       FROM achievements a
       JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = ?
       ORDER BY ua.earned_at DESC`,
      [userId]
    );
    return rows;
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    throw new Error('Failed to fetch user achievements');
  }
};

// For future use: Function to award an achievement to a user
const awardAchievement = async (userId, achievementId) => {
  try {
    // Check if user already has this achievement
    const [existing] = await db.query(
      'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
      [userId, achievementId]
    );
    
    if (existing.length > 0) {
      return { success: false, message: 'User already has this achievement' };
    }
    
    // Award the achievement
    await db.query(
      'INSERT INTO user_achievements (user_id, achievement_id, earned_at) VALUES (?, ?, NOW())',
      [userId, achievementId]
    );
    
    // Get the awarded achievement details
    const [achievement] = await db.query(
      'SELECT id, name, description, points, icon_url FROM achievements WHERE id = ?',
      [achievementId]
    );
    
    return { 
      success: true, 
      achievement: achievement[0]
    };
  } catch (error) {
    console.error('Error awarding achievement:', error);
    throw new Error('Failed to award achievement');
  }
};

module.exports = {
  getUserAchievements,
  awardAchievement
};