// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { userProfileValidation } = require('../middleware/validators');

router.get('/profile', authMiddleware.verifyToken, userController.getProfile);
router.put('/profile', authMiddleware.verifyToken, userProfileValidation, userController.updateProfile);
router.get('/metrics', authMiddleware.verifyToken, userController.getUserMetrics);

module.exports = router;