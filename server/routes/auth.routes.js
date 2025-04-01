// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Registration route
router.post('/signup', authController.signup);

// Login route
router.post('/signin', authController.signin);

module.exports = router;