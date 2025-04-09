// services/universityService.js
const db = require('../config/db.config');

const getAllUniversities = async () => {
  try {
    const rows = await db.query('SELECT university_id, name, location FROM University ORDER BY name');
    return rows;
  } catch (error) {
    console.error('Error in getAllUniversities service:', error);
    throw new Error('Failed to fetch universities');
  }
};

const getUniversityById = async (universityId) => {
  try {
    const rows = await db.query(
      'SELECT university_id, name, location FROM University WHERE university_id = ?',
      [universityId]
    );
    
    return rows[0] || null;
  } catch (error) {
    console.error('Error in getUniversityById service:', error);
    throw new Error('Failed to fetch university');
  }
};

module.exports = {
  getAllUniversities,
  getUniversityById
};