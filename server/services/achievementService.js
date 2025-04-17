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


// Make sure the caller really owns the study‑group
const assertIsOwner = async (groupId, userId) => {
  const rows = await db.query(
    'SELECT owner_id FROM StudyGroup WHERE study_group_id = ?',
    [groupId]
  );
  if (!rows.length) throw new Error('Study group not found');
  if (rows[0].owner_id !== userId) throw new Error('Only the group owner may perform this action');
};

// ────────── 1.  create achievement inside a given group ────────────
const createGroupAchievement = async (groupId, ownerId, { name, description }) => {
  await assertIsOwner(groupId, ownerId);

  const [result] = await db.query(
    `INSERT INTO Achievements (name, description, is_platform_default, group_id)
     VALUES (?, ?, 0, ?)`,
    [name, description, groupId]
  );
  const [rows] = await db.query('SELECT * FROM Achievements WHERE achievement_id = ?', [result.insertId]);
  return rows[0];
};

// ────────── 2.  award an achievement to a member  ──────────────────
const awardAchievement = async (groupId, ownerId, memberId, achievementId) => {
  await assertIsOwner(groupId, ownerId);

  // make sure the achievement belongs to this group
  const [ach] = await db.query(
    'SELECT * FROM Achievements WHERE achievement_id = ? AND group_id = ?',
    [achievementId, groupId]
  );
  if (!ach.length) throw new Error('Achievement does not belong to this group');

  // upsert pattern: ignore duplicates
  await db.query(
    'INSERT IGNORE INTO UserAchievements (user_id, achievement_id) VALUES (?, ?)',
    [memberId, achievementId]
  );
  return { success: true, message: 'Achievement awarded' };
};

// ────────── 3.  remove / revoke an award  ───────────────────────────
const revokeAchievement = async (groupId, ownerId, memberId, achievementId) => {
  await assertIsOwner(groupId, ownerId);

  // same group‑ownership test as above
  const [ach] = await db.query(
    'SELECT * FROM Achievements WHERE achievement_id = ? AND group_id = ?',
    [achievementId, groupId]
  );
  if (!ach.length) throw new Error('Achievement does not belong to this group');

  await db.query(
    'DELETE FROM UserAchievements WHERE user_id = ? AND achievement_id = ?',
    [memberId, achievementId]
  );
  return { success: true, message: 'Achievement revoked' };
};

module.exports = {
  createAchievement,
  listAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  createGroupAchievement,
  awardAchievement,
  revokeAchievement
};
