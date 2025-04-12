const express = require('express');
const router = express.Router();
const db = require('../config/db.config');

// 1. Import the controller (we’ll create it next)
const groupController = require('../controllers/studygroupController');

// 2. Import auth middleware to secure the route
const auth = require('../middleware/auth.middleware'); 
// Adjust the path if your file is named differently (e.g. 'auth.js' or 'authMiddleware.js').

// 3. Define the POST route for creating a study group
router.post('/', auth.verifyToken, groupController.createStudyGroup);

module.exports = router;
