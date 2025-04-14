// api/courseService.js
import api from './axios';

const courseService = {
  // Get courses by university
  getCoursesByUniversity: async (universityId) => {
    const response = await api.get(`/courses/university/${universityId}`);
    return response.data;
  },

  // Get user's enrolled courses
  getUserCourses: async () => {
    const response = await api.get('/courses/my-courses');
    return response.data;
  },

  // Enroll in a course
  enrollInCourse: async (courseId) => {
    const response = await api.post('/courses/enroll', { courseId });
    return response.data;
  },

  // Unenroll from a course
  unenrollFromCourse: async (courseId) => {
    const response = await api.delete(`/courses/unenroll/${courseId}`);
    return response.data;
  },

    // Create a new course
  createCourse: async (courseData) => {
    const response = await api.post('/courses/create', courseData);
    return response.data;
  }

};

export default courseService;