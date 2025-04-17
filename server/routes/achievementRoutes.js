// routes/achievementRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const achievementController = require('../controllers/achievementController');

// IMPORTANT: Order matters for routes with similar patterns
// More specific routes should come before more general ones

/* ───────────────── User and Group Achievements ───────────────── */
// These need to be BEFORE the '/:id' route to avoid conflicts

// Get all group achievements
router.get('/group/:groupId', auth.verifyToken, achievementController.getGroupAchievements);

// Create a new group achievement
router.post('/group/:groupId', auth.verifyToken, achievementController.createGroupAchievement);

// Award an achievement to a member
router.post('/group/:groupId/:achievementId/award/:memberId', auth.verifyToken, achievementController.awardAchievement);

// Revoke an achievement from a member
router.delete('/group/:groupId/:achievementId/award/:memberId', auth.verifyToken, achievementController.revokeAchievement);

// Get all user achievements
router.get('/user/:userId', auth.verifyToken, achievementController.getUserAchievements);

/* ───────────────── General Achievement Routes ───────────────── */
// Get all achievements
router.get('/', achievementController.listAchievements);

// Get a specific achievement
router.get('/:id', achievementController.getAchievement);

// Create a new achievement
router.post('/', auth.verifyToken, achievementController.createAchievement);

// Update an achievement
router.put('/:id', auth.verifyToken, achievementController.updateAchievement);

// Delete an achievement
router.delete('/:id', auth.verifyToken, achievementController.deleteAchievement);

module.exports = router;