// server/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes
router.get('/university/:universityId', courseController.getCoursesByUniversity);

// Protected routes
router.get('/my-courses', verifyToken, courseController.getUserCourses);
router.post('/enroll', verifyToken, courseController.addUserToCourse);
router.delete('/unenroll/:courseId', verifyToken, courseController.removeUserFromCourse);
router.post('/create', verifyToken, courseController.createCourse);


module.exports = router;