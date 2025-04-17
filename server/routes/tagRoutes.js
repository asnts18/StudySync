// server/routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// Get all tags
router.get('/', tagController.getAllTags);

module.exports = router;