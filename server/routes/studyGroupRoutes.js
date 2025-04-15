const express = require('express');
const router = express.Router();
const groupController = require('../controllers/studygroupController');
const auth = require('../middleware/auth.middleware');

// Protected routes - require authentication
router.post('/', auth.verifyToken, groupController.createStudyGroup);
router.get('/my-groups', auth.verifyToken, groupController.getUserGroups); // This needs to come BEFORE the '/:id' route

// Public routes
router.get('/', groupController.listStudyGroups);
router.get('/:id', groupController.getGroupDetail);
router.post('/:id/join', auth.verifyToken, groupController.joinStudyGroup);
router.delete('/:id/members', auth.verifyToken, groupController.leaveStudyGroup);
// New membership management endpoints:
router.get('/:id/members', auth.verifyToken, groupController.listMembers);
router.delete('/:id/members/:memberId', auth.verifyToken, groupController.removeMember);

module.exports = router;