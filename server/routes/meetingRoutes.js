// server/routes/meetingRoutes.js
const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const auth = require('../middleware/auth.middleware');

// Protected endpoint: Create a new meeting (requires authentication)
router.post('/', auth.verifyToken, meetingController.createMeeting);

// Get meetings with a group
router.get('/group/:groupId', auth.verifyToken, meetingController.getGroupMeetings);


module.exports = router;
