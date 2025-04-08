const courseService = require('../services/courseService');

const getCoursesByUniversity = async (req, res) => {
  try {
    const universityId = req.params.universityId;
    const courses = await courseService.getCoursesByUniversity(universityId);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error in getCoursesByUniversity controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const courses = await courseService.getUserCourses(userId);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error in getUserCourses controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addUserToCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }
    
    const result = await courseService.addUserToCourse(userId, courseId);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in addUserToCourse controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeUserFromCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    
    const result = await courseService.removeUserFromCourse(userId, courseId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in removeUserFromCourse controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCoursesByUniversity,
  getUserCourses,
  addUserToCourse,
  removeUserFromCourse
};