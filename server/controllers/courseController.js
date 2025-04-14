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
    const userId = req.userId;
    const courses = await courseService.getUserCourses(userId);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error in getUserCourses controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addUserToCourse = async (req, res) => {
  try {
    const userId = req.userId;
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
    const userId = req.userId;
    const courseId = req.params.courseId;
    
    const result = await courseService.removeUserFromCourse(userId, courseId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in removeUserFromCourse controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { course_code, name, university_id, semester, description, course_type } = req.body;
    const userId = req.userId;
    
    // Validate required fields
    if (!course_code || !name || !university_id) {
      return res.status(400).json({ message: 'Course code, name, and university ID are required' });
    }
    
    // Check if course already exists
    const existingCourse = await courseService.getCourseByCodeAndUniversity(course_code, university_id);
    
    if (existingCourse) {
      return res.status(409).json({ 
        message: 'Course already exists', 
        course: existingCourse 
      });
    }
    
    // Create new course
    const newCourse = await courseService.createCourse({
      course_code,
      name,
      university_id,
      semester: semester || 'Current',
      description: description || null,
      course_type: course_type || 'Custom'
    });
    
    // Directly enroll the user using the course_code we just created
    try {
      console.log(`Enrolling user ${userId} in course ${course_code} at university ${university_id}`);
      await courseService.directEnrollUserToCourse(userId, course_code, university_id);
      console.log("Enrollment successful");
    } catch (enrollError) {
      console.error('Error enrolling user to course:', enrollError);
    }
    
    res.status(201).json({
      message: 'Course created successfully',
      course: newCourse
    });
  } catch (error) {
    console.error('Error in createCourse controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCoursesByUniversity,
  getUserCourses,
  addUserToCourse,
  removeUserFromCourse,
  createCourse
};