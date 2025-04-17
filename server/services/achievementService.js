// services/achievementService.js
const db = require('../config/db.config');

const createAchievement = async ({ name, description, is_platform_default = true, group_id = null }) => {
  try {
    console.log('Creating achievement with params:', { name, description, is_platform_default, group_id });
    
    const [result] = await db.query(
      `INSERT INTO Achievements (name, description, is_platform_default, group_id)
       VALUES (?, ?, ?, ?)`,
      [name, description, is_platform_default ? 1 : 0, group_id]
    );
    
    console.log('Achievement created with ID:', result.insertId);
    
    const [rows] = await db.query('SELECT * FROM Achievements WHERE achievement_id = ?', [result.insertId]);
    return rows[0];
  } catch (error) {
    console.error('Error in createAchievement:', error);
    throw error;
  }
};

const listAchievements = async () => {
  try {
    console.log('Listing all achievements');
    const achievements = await db.query('SELECT * FROM Achievements');
    console.log(`Found ${achievements.length} achievements`);
    return achievements;
  } catch (error) {
    console.error('Error in listAchievements:', error);
    throw error;
  }
};

const getAchievementById = async (id) => {
  try {
    console.log('Getting achievement by ID:', id);
    const rows = await db.query('SELECT * FROM Achievements WHERE achievement_id = ?', [id]);
    if (rows.length === 0) {
      console.log('No achievement found with ID:', id);
      return null;
    }
    return rows[0];
  } catch (error) {
    console.error('Error in getAchievementById:', error);
    throw error;
  }
};

const updateAchievement = async (id, { name, description, is_platform_default, group_id }) => {
  try {
    console.log('Updating achievement:', { id, name, description, is_platform_default, group_id });
    
    await db.query(
      `UPDATE Achievements
         SET name = ?, description = ?, is_platform_default = ?, group_id = ?
       WHERE achievement_id = ?`,
      [name, description, is_platform_default ? 1 : 0, group_id, id]
    );
    
    return getAchievementById(id);
  } catch (error) {
    console.error('Error in updateAchievement:', error);
    throw error;
  }
};

const deleteAchievement = async (id) => {
  try {
    console.log('Deleting achievement with ID:', id);
    
    await db.query('DELETE FROM Achievements WHERE achievement_id = ?', [id]);
    return { success: true, message: 'Achievement deleted' };
  } catch (error) {
    console.error('Error in deleteAchievement:', error);
    throw error;
  }
};

// Make sure the caller really owns the study‑group
const assertIsOwner = async (groupId, userId) => {
  try {
    console.log(`Checking if user ${userId} is owner of group ${groupId}`);
    
    const rows = await db.query(
      'SELECT owner_id FROM StudyGroup WHERE study_group_id = ?',
      [groupId]
    );
    
    if (!rows || rows.length === 0) {
      console.log('Study group not found:', groupId);
      throw new Error('Study group not found');
    }
    
    if (rows[0].owner_id !== userId) {
      console.log(`User ${userId} is not the owner of group ${groupId}, owner is ${rows[0].owner_id}`);
      throw new Error('Only the group owner may perform this action');
    }
    
    console.log(`User ${userId} confirmed as owner of group ${groupId}`);
    return true;
  } catch (error) {
    console.error('Error in assertIsOwner:', error);
    throw error;
  }
};

// ────────── 1. create achievement inside a given group ────────────
const createGroupAchievement = async (groupId, ownerId, { name, description }) => {
  try {
    console.log(`Creating group achievement for group ${groupId} by owner ${ownerId}:`, { name, description });
    
    // Make sure numbers are properly parsed
    const parsedGroupId = parseInt(groupId, 10);
    const parsedOwnerId = parseInt(ownerId, 10);
    
    if (isNaN(parsedGroupId)) {
      throw new Error(`Invalid group ID: ${groupId}`);
    }
    
    if (isNaN(parsedOwnerId)) {
      throw new Error(`Invalid owner ID: ${ownerId}`);
    }
    
    // Check if owner
    await assertIsOwner(parsedGroupId, parsedOwnerId);
    
    // Validate input
    if (!name || typeof name !== 'string') {
      throw new Error('Achievement name is required');
    }
    
    // Create the achievement
    const [result] = await db.query(
      `INSERT INTO Achievements (name, description, is_platform_default, group_id)
       VALUES (?, ?, 0, ?)`,
      [name, description || null, parsedGroupId]
    );
    
    console.log('Group achievement created with ID:', result.insertId);
    
    const rows = await db.query('SELECT * FROM Achievements WHERE achievement_id = ?', [result.insertId]);
    
    if (!rows || rows.length === 0) {
      throw new Error('Failed to retrieve created achievement');
    }
    
    return rows[0];
  } catch (error) {
    console.error('Error in createGroupAchievement:', error);
    throw error;
  }
};

// ────────── 2. award an achievement to a member ──────────────────
const awardAchievement = async (groupId, ownerId, memberId, achievementId) => {
  try {
    console.log(`Awarding achievement ${achievementId} to member ${memberId} in group ${groupId} by owner ${ownerId}`);
    
    // Parse all IDs to ensure they're numbers
    const parsedGroupId = parseInt(groupId, 10);
    const parsedOwnerId = parseInt(ownerId, 10);
    const parsedMemberId = parseInt(memberId, 10);
    const parsedAchievementId = parseInt(achievementId, 10);
    
    if (isNaN(parsedGroupId) || isNaN(parsedOwnerId) || isNaN(parsedMemberId) || isNaN(parsedAchievementId)) {
      console.error('Invalid ID(s):', { groupId, ownerId, memberId, achievementId });
      throw new Error('Invalid ID parameters');
    }
    
    // Check if owner
    await assertIsOwner(parsedGroupId, parsedOwnerId);
    
    // Check if the member exists
    const memberRows = await db.query('SELECT user_id FROM User WHERE user_id = ?', [parsedMemberId]);
    if (!memberRows || memberRows.length === 0) {
      throw new Error(`Member with ID ${memberId} not found`);
    }
    
    // Check if the member is in the group
    const memberInGroupRows = await db.query(
      'SELECT * FROM User_StudyGroup WHERE user_id = ? AND study_group_id = ?',
      [parsedMemberId, parsedGroupId]
    );
    if (!memberInGroupRows || memberInGroupRows.length === 0) {
      throw new Error(`Member with ID ${memberId} is not in group ${groupId}`);
    }
    
    // Check if the achievement exists and belongs to this group or is a platform achievement
    const achievementRows = await db.query(
      'SELECT * FROM Achievements WHERE achievement_id = ?',
      [parsedAchievementId]
    );
    
    if (!achievementRows || achievementRows.length === 0) {
      throw new Error(`Achievement with ID ${achievementId} not found`);
    }
    
    const achievement = achievementRows[0];
    
    // Check if this is a group-specific achievement that belongs to this group
    if (!achievement.is_platform_default && achievement.group_id !== parsedGroupId) {
      throw new Error(`Achievement with ID ${achievementId} does not belong to group ${groupId}`);
    }
    
    // Upsert pattern: ignore duplicates
    try {
      await db.query(
        'INSERT IGNORE INTO UserAchievements (user_id, achievement_id) VALUES (?, ?)',
        [parsedMemberId, parsedAchievementId]
      );
      
      console.log(`Successfully awarded achievement ${achievementId} to member ${memberId}`);
      return { success: true, message: 'Achievement awarded successfully' };
    } catch (insertError) {
      console.error('Error inserting into UserAchievements:', insertError);
      throw new Error(`Failed to award achievement: ${insertError.message}`);
    }
  } catch (error) {
    console.error('Error in awardAchievement:', error);
    throw error;
  }
};

// ────────── 3. remove / revoke an award ───────────────────────────
const revokeAchievement = async (groupId, ownerId, memberId, achievementId) => {
  try {
    console.log(`Revoking achievement ${achievementId} from member ${memberId} in group ${groupId} by owner ${ownerId}`);
    
    // Parse all IDs to ensure they're numbers
    const parsedGroupId = parseInt(groupId, 10);
    const parsedOwnerId = parseInt(ownerId, 10);
    const parsedMemberId = parseInt(memberId, 10);
    const parsedAchievementId = parseInt(achievementId, 10);
    
    if (isNaN(parsedGroupId) || isNaN(parsedOwnerId) || isNaN(parsedMemberId) || isNaN(parsedAchievementId)) {
      console.error('Invalid ID(s):', { groupId, ownerId, memberId, achievementId });
      throw new Error('Invalid ID parameters');
    }
    
    // Check if owner
    await assertIsOwner(parsedGroupId, parsedOwnerId);
    
    // Check if the achievement exists
    const achievementRows = await db.query(
      'SELECT * FROM Achievements WHERE achievement_id = ?',
      [parsedAchievementId]
    );
    
    if (!achievementRows || achievementRows.length === 0) {
      throw new Error(`Achievement with ID ${achievementId} not found`);
    }
    
    await db.query(
      'DELETE FROM UserAchievements WHERE user_id = ? AND achievement_id = ?',
      [parsedMemberId, parsedAchievementId]
    );
    
    console.log(`Successfully revoked achievement ${achievementId} from member ${memberId}`);
    return { success: true, message: 'Achievement revoked successfully' };
  } catch (error) {
    console.error('Error in revokeAchievement:', error);
    throw error;
  }
};

// New function: Get user achievements
const getUserAchievements = async (userId) => {
  try {
    console.log(`Getting achievements for user ${userId}`);
    
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      throw new Error(`Invalid user ID: ${userId}`);
    }
    
    const achievements = await db.query(`
      SELECT a.* 
      FROM Achievements a
      JOIN UserAchievements ua ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ?
    `, [parsedUserId]);
    
    console.log(`Found ${achievements.length} achievements for user ${userId}`);
    return achievements;
  } catch (error) {
    console.error('Error in getUserAchievements:', error);
    throw error;
  }
};

// New function: Get group achievements
const getGroupAchievements = async (groupId) => {
  try {
    console.log(`Getting achievements for group ${groupId}`);
    
    const parsedGroupId = parseInt(groupId, 10);
    if (isNaN(parsedGroupId)) {
      throw new Error(`Invalid group ID: ${groupId}`);
    }
    
    const achievements = await db.query(`
      SELECT * FROM Achievements
      WHERE group_id = ?
    `, [parsedGroupId]);
    
    console.log(`Found ${achievements.length} achievements for group ${groupId}`);
    return achievements;
  } catch (error) {
    console.error('Error in getGroupAchievements:', error);
    throw error;
  }
};

module.exports = {
  createAchievement,
  listAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  createGroupAchievement,
  awardAchievement,
  revokeAchievement,
  getUserAchievements,
  getGroupAchievements
};