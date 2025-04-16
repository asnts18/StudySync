// server/routes/meetingRoutes.js
const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const auth = require('../middleware/auth.middleware');

router.post('/', auth.verifyToken, meetingController.createMeeting);
// router.put('/:meetingId', auth.verifyToken, meetingController.updateMeeting);
// router.delete('/:meetingId', auth.verifyToken, meetingController.deleteMeeting);
router.get('/group/:groupId', auth.verifyToken, meetingController.getGroupMeetings);


module.exports = router;