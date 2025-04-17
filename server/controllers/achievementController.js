// controllers/achievementController.js
const achievementService = require('../services/achievementService');
const groupAchievementService = require('../services/achievementService');
exports.createAchievement = async (req, res) => {
  try {
    const { name, description, is_platform_default, group_id } = req.body;
    const achievement = await achievementService.createAchievement({
      name,
      description,
      is_platform_default,
      group_id,
    });
    res.status(201).json(achievement);
  } catch (err) {
    console.error('Error creating achievement:', err);
    res.status(500).json({ message: 'Failed to create achievement' });
  }
};

exports.listAchievements = async (_req, res) => {
  try {
    const rows = await achievementService.listAchievements();
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error listing achievements:', err);
    res.status(500).json({ message: 'Failed to list achievements' });
  }
};

exports.getAchievement = async (req, res) => {
  try {
    const achievement = await achievementService.getAchievementById(req.params.id);
    if (!achievement) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(achievement);
  } catch (err) {
    console.error('Error getting achievement:', err);
    res.status(500).json({ message: 'Failed to get achievement' });
  }
};

exports.updateAchievement = async (req, res) => {
  try {
    const updated = await achievementService.updateAchievement(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating achievement:', err);
    res.status(500).json({ message: 'Failed to update achievement' });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const result = await achievementService.deleteAchievement(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error deleting achievement:', err);
    res.status(500).json({ message: 'Failed to delete achievement' });
  }
};


/* ───────────── group‑scoped logic (owner only) ───────────── */

exports.createGroupAchievement = async (req, res) => {
    const ach = await achievementService.createGroupAchievement(
      req.params.groupId,
      req.userId,
      req.body
    );
    res.status(201).json(ach);
  };
  
  exports.awardAchievement = async (req, res) => {
    const { groupId, achievementId, memberId } = req.params;
    const result = await achievementService.awardAchievement(
      groupId,
      req.userId,
      memberId,
      achievementId
    );
    res.json(result);
  };
  
  exports.revokeAchievement = async (req, res) => {
    const { groupId, achievementId, memberId } = req.params;
    const result = await achievementService.revokeAchievement(
      groupId,
      req.userId,
      memberId,
      achievementId
    );
    res.json(result);
  };