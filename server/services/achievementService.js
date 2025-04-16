// services/achievementService.js
const db = require('../config/db.config');

const createAchievement = async ({ name, description, is_platform_default = true, group_id = null }) => {
  const [result] = await db.query(
    `INSERT INTO Achievements (name, description, is_platform_default, group_id)
     VALUES (?, ?, ?, ?)`,
    [name, description, is_platform_default ? 1 : 0, group_id]
  );
  const [rows] = await db.query('SELECT * FROM Achievements WHERE achievement_id = ?', [result.insertId]);
  return rows[0];
};

const listAchievements = async () => {
  return db.query('SELECT * FROM Achievements');
};

const getAchievementById = async (id) => {
  const rows = await db.query('SELECT * FROM Achievements WHERE achievement_id = ?', [id]);
  return rows[0] || null;
};

const updateAchievement = async (id, { name, description, is_platform_default, group_id }) => {
  await db.query(
    `UPDATE Achievements
       SET name = ?, description = ?, is_platform_default = ?, group_id = ?
     WHERE achievement_id = ?`,
    [name, description, is_platform_default ? 1 : 0, group_id, id]
  );
  return getAchievementById(id);
};

const deleteAchievement = async (id) => {
  await db.query('DELETE FROM Achievements WHERE achievement_id = ?', [id]);
  return { success: true, message: 'Achievement deleted' };
};

module.exports = {
  createAchievement,
  listAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
};
