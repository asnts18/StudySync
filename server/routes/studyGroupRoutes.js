const express = require('express');
const router = express.Router();
const groupController = require('../controllers/studygroupController');
const auth = require('../middleware/auth.middleware');


router.post('/', auth.verifyToken, groupController.createStudyGroup);
router.get('/my-groups', auth.verifyToken, groupController.getUserGroups); 
router.put('/:groupId', auth.verifyToken, groupController.updateStudyGroup); 
router.delete('/:id', auth.verifyToken, groupController.deleteStudyGroup);


router.get('/', groupController.listStudyGroups);
router.get('/university/:universityId', groupController.getUniversityGroups);
router.get('/:id', groupController.getGroupDetail);

router.get('/join-requests', auth.verifyToken, groupController.getPendingRequests);
// TODO: accept request

router.post('/:id/join', auth.verifyToken, groupController.joinStudyGroup);
router.delete('/:id/members', auth.verifyToken, groupController.leaveStudyGroup);

router.get('/:id/members', auth.verifyToken, groupController.listMembers);
router.delete('/:id/members/:memberId', auth.verifyToken, groupController.removeMember);

router.post('/:id/request-join', auth.verifyToken, groupController.requestJoinGroup);

module.exports = router;