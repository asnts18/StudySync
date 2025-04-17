// controllers/achievementController.js
const achievementService = require('../services/achievementService');

exports.createAchievement = async (req, res) => {
  try {
    console.log('Controller: createAchievement called with body:', req.body);
    
    const { name, description, is_platform_default, group_id } = req.body;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Achievement name is required' });
    }
    
    const achievement = await achievementService.createAchievement({
      name,
      description,
      is_platform_default,
      group_id,
    });
    
    console.log('Controller: Achievement created successfully:', achievement);
    res.status(201).json(achievement);
  } catch (err) {
    console.error('Controller: Error creating achievement:', err);
    res.status(500).json({ 
      message: 'Failed to create achievement',
      error: err.message 
    });
  }
};

exports.listAchievements = async (_req, res) => {
  try {
    console.log('Controller: listAchievements called');
    
    const rows = await achievementService.listAchievements();
    
    console.log(`Controller: Found ${rows.length} achievements`);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Controller: Error listing achievements:', err);
    res.status(500).json({ 
      message: 'Failed to list achievements',
      error: err.message 
    });
  }
};

exports.getAchievement = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Controller: getAchievement called for ID:', id);
    
    const achievement = await achievementService.getAchievementById(id);
    if (!achievement) {
      console.log('Controller: Achievement not found for ID:', id);
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    console.log('Controller: Achievement found:', achievement);
    res.status(200).json(achievement);
  } catch (err) {
    console.error('Controller: Error getting achievement:', err);
    res.status(500).json({ 
      message: 'Failed to get achievement',
      error: err.message 
    });
  }
};

exports.updateAchievement = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Controller: updateAchievement called for ID:', id, 'with body:', req.body);
    
    const updated = await achievementService.updateAchievement(id, req.body);
    
    console.log('Controller: Achievement updated successfully:', updated);
    res.status(200).json(updated);
  } catch (err) {
    console.error('Controller: Error updating achievement:', err);
    res.status(500).json({ 
      message: 'Failed to update achievement',
      error: err.message 
    });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Controller: deleteAchievement called for ID:', id);
    
    const result = await achievementService.deleteAchievement(id);
    
    console.log('Controller: Achievement deleted successfully');
    res.status(200).json(result);
  } catch (err) {
    console.error('Controller: Error deleting achievement:', err);
    res.status(500).json({ 
      message: 'Failed to delete achievement',
      error: err.message 
    });
  }
};

/* ───────────── group‑scoped logic (owner only) ───────────── */

exports.createGroupAchievement = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const ownerId = req.userId;
    
    console.log(`Controller: createGroupAchievement called for group ${groupId} by user ${ownerId} with body:`, req.body);
    
    if (!req.body.name || typeof req.body.name !== 'string') {
      return res.status(400).json({ message: 'Achievement name is required' });
    }
    
    const ach = await achievementService.createGroupAchievement(
      groupId,
      ownerId,
      req.body
    );
    
    console.log('Controller: Group achievement created successfully:', ach);
    res.status(201).json(ach);
  } catch (err) {
    console.error('Controller: Error creating group achievement:', err);
    
    // Determine the appropriate status code based on the error
    let statusCode = 500;
    if (err.message.includes('not found')) {
      statusCode = 404;
    } else if (err.message.includes('only the group owner')) {
      statusCode = 403;
    } else if (err.message.includes('Invalid')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      message: err.message || 'Failed to create group achievement',
      error: err.message 
    });
  }
};
  
exports.awardAchievement = async (req, res) => {
  try {
    const { groupId, achievementId, memberId } = req.params;
    const ownerId = req.userId;
    
    console.log(`Controller: awardAchievement called for group ${groupId}, achievement ${achievementId}, member ${memberId} by user ${ownerId}`);
    
    const result = await achievementService.awardAchievement(
      groupId,
      ownerId,
      memberId,
      achievementId
    );
    
    console.log('Controller: Achievement awarded successfully:', result);
    res.json(result);
  } catch (err) {
    console.error('Controller: Error awarding achievement:', err);
    
    // Determine the appropriate status code based on the error
    let statusCode = 500;
    if (err.message.includes('not found')) {
      statusCode = 404;
    } else if (err.message.includes('only the group owner')) {
      statusCode = 403;
    } else if (err.message.includes('Invalid')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      message: err.message || 'Failed to award achievement',
      error: err.message 
    });
  }
};
  
exports.revokeAchievement = async (req, res) => {
  try {
    const { groupId, achievementId, memberId } = req.params;
    const ownerId = req.userId;
    
    console.log(`Controller: revokeAchievement called for group ${groupId}, achievement ${achievementId}, member ${memberId} by user ${ownerId}`);
    
    const result = await achievementService.revokeAchievement(
      groupId,
      ownerId,
      memberId,
      achievementId
    );
    
    console.log('Controller: Achievement revoked successfully:', result);
    res.json(result);
  } catch (err) {
    console.error('Controller: Error revoking achievement:', err);
    
    // Determine the appropriate status code based on the error
    let statusCode = 500;
    if (err.message.includes('not found')) {
      statusCode = 404;
    } else if (err.message.includes('only the group owner')) {
      statusCode = 403;
    } else if (err.message.includes('Invalid')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      message: err.message || 'Failed to revoke achievement',
      error: err.message 
    });
  }
};

// New controller methods for the added endpoints
exports.getUserAchievements = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Controller: getUserAchievements called for user ${userId}`);
    
    const achievements = await achievementService.getUserAchievements(userId);
    
    console.log(`Controller: Found ${achievements.length} achievements for user ${userId}`);
    res.status(200).json(achievements);
  } catch (err) {
    console.error('Controller: Error fetching user achievements:', err);
    
    res.status(500).json({ 
      message: 'Failed to fetch user achievements',
      error: err.message 
    });
  }
};

exports.getGroupAchievements = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    console.log(`Controller: getGroupAchievements called for group ${groupId}`);
    
    const achievements = await achievementService.getGroupAchievements(groupId);
    
    console.log(`Controller: Found ${achievements.length} achievements for group ${groupId}`);
    res.status(200).json(achievements);
  } catch (err) {
    console.error('Controller: Error fetching group achievements:', err);
    
    res.status(500).json({ 
      message: 'Failed to fetch group achievements',
      error: err.message 
    });
  }
};