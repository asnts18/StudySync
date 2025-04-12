const db = require('../config/db.config');

const createStudyGroup = async ({
  name,
  description,
  owner_id,
  course_code,
  university_id,
  max_capacity,
  is_private
}) => {
  try {
    // Do not destructure if db.query returns an object
    const result = await db.query(
      `INSERT INTO studygroup (name, description, owner_id, course_code, university_id, max_capacity, is_private)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, owner_id, course_code, university_id, max_capacity, is_private]
    );
    
    // Access the insertId property directly
    const insertId = result.insertId;
    
    // Now fetch the newly inserted record
    const newGroup = await db.query(
      `SELECT * FROM studygroup WHERE study_group_id = ?`,
      [insertId]
    );
    
    // Assuming newGroup is an array of rows:
    return newGroup[0];
  } catch (error) {
    console.error('DB error creating study group:', error);
    throw error;
  }
};

module.exports = { createStudyGroup };
