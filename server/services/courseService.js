// Updated courseService.js
const db = require('../config/db.config');

const getCoursesByUniversity = async (universityId) => {
  try {
    const courses = await db.query(
      'SELECT course_code, university_id, name, semester, description, course_type FROM Course WHERE university_id = ?',
      [universityId]
    );
    return courses;
  } catch (error) {
    console.error('Error in getCoursesByUniversity service:', error);
    throw new Error('Failed to fetch courses for university');
  }
};

const getUserCourses = async (userId) => {
  try {
    const courses = await db.query(
      `SELECT c.course_code, c.university_id, c.name, c.semester, c.description, c.course_type, u.name as university_name
       FROM Course c
       JOIN User_Course uc ON c.course_code = uc.course_code AND c.university_id = uc.university_id
       JOIN University u ON c.university_id = u.university_id
       WHERE uc.user_id = ?`,
      [userId]
    );
    return courses;
  } catch (error) {
    console.error('Error in getUserCourses service:', error);
    throw new Error('Failed to fetch user courses');
  }
};

const addUserToCourse = async (userId, courseId) => {
  try {
    // Parse courseId to extract course_code and university_id
    // Format could be "COURSE_CODE@UNIVERSITY_ID" or similar
    const [courseCode, universityId] = courseId.split('@');
    
    // Check if user is already enrolled
    const existingEnrollments = await db.query(
      'SELECT * FROM User_Course WHERE user_id = ? AND course_code = ? AND university_id = ?',
      [userId, courseCode, universityId]
    );
    
    if (existingEnrollments.length > 0) {
      return { message: 'User is already enrolled in this course' };
    }
    
    // Ensure the course exists before attempting to enroll
    const courseExists = await db.query(
      'SELECT 1 FROM Course WHERE course_code = ? AND university_id = ?',
      [courseCode, universityId]
    );
    
    if (courseExists.length === 0) {
      throw new Error(`Course ${courseCode} at university ${universityId} does not exist`);
    }
    
    // Enroll user in course
    await db.query(
      'INSERT INTO User_Course (user_id, course_code, university_id) VALUES (?, ?, ?)',
      [userId, courseCode, universityId]
    );
    
    return { message: 'User enrolled in course successfully' };
  } catch (error) {
    console.error('Error in addUserToCourse service:', error);
    throw new Error('Failed to enroll user in course');
  }
};

// New direct enrollment method that ensures proper table case sensitivity
const directEnrollUserToCourse = async (userId, courseCode, universityId) => {
  try {
    // Check if user is already enrolled
    const existingEnrollments = await db.query(
      'SELECT * FROM User_Course WHERE user_id = ? AND course_code = ? AND university_id = ?',
      [userId, courseCode, universityId]
    );
    
    if (existingEnrollments.length > 0) {
      return { message: 'User is already enrolled in this course' };
    }
    
    // Verify the course exists before enrollment
    const courseExists = await db.query(
      'SELECT * FROM Course WHERE course_code = ? AND university_id = ?',
      [courseCode, universityId]
    );
    
    if (courseExists.length === 0) {
      throw new Error(`Course ${courseCode} at university ${universityId} does not exist`);
    }
    
    // Explicitly wait for a short period to ensure the course is fully committed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Enroll user in course
    await db.query(
      'INSERT INTO User_Course (user_id, course_code, university_id) VALUES (?, ?, ?)',
      [userId, courseCode, universityId]
    );
    
    return { message: 'User enrolled in course successfully' };
  } catch (error) {
    console.error('Error in directEnrollUserToCourse service:', error);
    throw new Error('Failed to directly enroll user in course');
  }
};

const removeUserFromCourse = async (userId, courseId) => {
  try {
    // Parse courseId to extract course_code and university_id
    const [courseCode, universityId] = courseId.split('@');
    
    // Unenroll user from course
    const result = await db.query(
      'DELETE FROM User_Course WHERE user_id = ? AND course_code = ? AND university_id = ?',
      [userId, courseCode, universityId]
    );
    
    if (result.affectedRows === 0) {
      return { message: 'User was not enrolled in this course' };
    }
    
    return { message: 'User unenrolled from course successfully' };
  } catch (error) {
    console.error('Error in removeUserFromCourse service:', error);
    throw new Error('Failed to unenroll user from course');
  }
};

// Get a course by code and university ID
const getCourseByCodeAndUniversity = async (courseCode, universityId) => {
  try {
    const courses = await db.query(
      'SELECT course_code, university_id, name, semester, description, course_type FROM Course WHERE course_code = ? AND university_id = ?',
      [courseCode, universityId]
    );
    return courses.length > 0 ? courses[0] : null;
  } catch (error) {
    console.error('Error in getCourseByCodeAndUniversity service:', error);
    throw new Error('Failed to fetch course');
  }
};

const createCourse = async (courseData) => {
  try {
    const { course_code, name, university_id, semester, description, course_type } = courseData;
    
    // Insert new course
    await db.query(
      `INSERT INTO Course (course_code, university_id, name, semester, description, course_type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [course_code, university_id, name, semester, description, course_type]
    );
    
    // Return the newly created course
    return getCourseByCodeAndUniversity(course_code, university_id);
  } catch (error) {
    console.error('Error in createCourse service:', error);
    throw new Error('Failed to create course');
  }
};

module.exports = {
  getCoursesByUniversity,
  getUserCourses,
  addUserToCourse,
  directEnrollUserToCourse,
  removeUserFromCourse,
  getCourseByCodeAndUniversity,
  createCourse
};