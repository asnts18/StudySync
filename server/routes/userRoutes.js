// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { userProfileValidation } = require('../middleware/validators');

router.get('/profile', authMiddleware.verifyToken, userController.getProfile);
router.put('/profile', authMiddleware.verifyToken, userProfileValidation, userController.updateProfile);

module.exports = router;