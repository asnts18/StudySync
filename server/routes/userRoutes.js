// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { userProfileValidation } = require('../middleware/validators');

// Protected routes - requires authentication
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userProfileValidation, userController.updateProfile);
router.get('/profile/complete', auth, userController.getProfileWithAchievements);
router.get('/profile/complete-sp', auth, userController.getCompleteProfile);

module.exports = router;