// server/routes/meetingRoutes.js
const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const auth = require('../middleware/auth.middleware');

// Protected endpoint: Create a new meeting (requires authentication)
router.post('/', auth.verifyToken, meetingController.createMeeting);

// Optionally, secure GET as well, or leave it public:
router.get('/', auth.verifyToken, meetingController.getAllMeetings);

module.exports = router;
