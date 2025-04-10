const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');

// TODO 
// Public routes
router.get('/university/:universityId', courseController.getCoursesByUniversity);

// TODO 
// Protected routes
router.get('/my-courses', auth, courseController.getUserCourses);
router.post('/enroll', auth, courseController.addUserToCourse);
router.delete('/unenroll/:courseId', auth, courseController.removeUserFromCourse);

module.exports = router;