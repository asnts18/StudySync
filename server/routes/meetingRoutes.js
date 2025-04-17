// server/routes/meetingRoutes.js
const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const auth = require('../middleware/auth.middleware');

// Protected endpoint: Create a new meeting (requires authentication)
router.post('/', auth.verifyToken, meetingController.createMeeting);

// Get meetings for a group
router.get('/group/:groupId', auth.verifyToken, meetingController.getGroupMeetings);

// Get a specific meeting by ID
router.get('/:meetingId', auth.verifyToken, meetingController.getMeetingById);

// Update a meeting
router.put('/:meetingId', auth.verifyToken, meetingController.updateMeeting);

// Delete a meeting
router.delete('/:meetingId', auth.verifyToken, meetingController.deleteMeeting);

module.exports = router;