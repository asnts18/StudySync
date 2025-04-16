// controllers/achievementController.js
const achievementService = require('../services/achievementService');

/* =======  CREATE  ======= */
const createAchievement = async (req, res) => {
  try {
    const achievement = await achievementService.createAchievement(req.body);
    res.status(201).json(achievement);
  } catch (err) {
    console.error('Error creating achievement:', err);
    res.status(500).json({ message: 'Failed to create achievement' });
  }
};

/* =======  READ  ======= */
const getAchievement = async (req, res) => {
  try {
    const achievement = await achievementService.getAchievementById(
      req.params.id
    );
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    res.json(achievement);
  } catch (err) {
    console.error('Error fetching achievement:', err);
    res.status(500).json({ message: 'Failed to fetch achievement' });
  }
};

const listAchievements = async (req, res) => {
  try {
    const achievements = await achievementService.listAchievements({
      group_id: req.query.group_id
    });
    res.json(achievements);
  } catch (err) {
    console.error('Error listing achievements:', err);
    res.status(500).json({ message: 'Failed to list achievements' });
  }
};

/* =======  UPDATE  ======= */
const updateAchievement = async (req, res) => {
  try {
    const updated = await achievementService.updateAchievement(
      req.params.id,
      req.body
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating achievement:', err);
    res.status(500).json({ message: 'Failed to update achievement' });
  }
};

/* =======  DELETE  ======= */
const deleteAchievement = async (req, res) => {
  try {
    const result = await achievementService.deleteAchievement(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Error deleting achievement:', err);
    res.status(500).json({ message: 'Failed to delete achievement' });
  }
};

module.exports = {
  createAchievement,
  getAchievement,
  listAchievements,
  updateAchievement,
  deleteAchievement
};
