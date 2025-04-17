// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth.middleware');
const { userProfileValidation } = require('../middleware/validators');

// Protected routes - requires authentication
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);
router.put('/profile', authMiddleware.verifyToken, userProfileValidation, userController.updateProfile);
// TODO
// router.get('/profile/complete', authMiddleware.verifyToken, userController.getProfileWithAchievements);
// TODO
// router.get('/profile/complete-sp', authMiddleware.verifyToken, userController.getCompleteProfile);

module.exports = router;