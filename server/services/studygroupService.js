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

// group listing and filtering API

const listStudyGroups = async (filters) => {
  try {
    let sql = 'SELECT * FROM studygroup';
    let conditions = [];
    let params = [];

    if (filters.name) {
      conditions.push('name LIKE ?');
      params.push(`%${filters.name}%`);
    }
    if (filters.course_code) {
      conditions.push('course_code = ?');
      params.push(filters.course_code);
    }
    if (filters.university_id) {
      conditions.push('university_id = ?');
      params.push(filters.university_id);
    }
    if (filters.is_private !== undefined) {
      conditions.push('is_private = ?');
      params.push(filters.is_private ? 1 : 0);
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Execute the query; assume db.query returns an array of rows for SELECT queries.
    const groups = await db.query(sql, params);
    return groups;
  } catch (error) {
    console.error('DB error listing study groups:', error);
    throw error;
  }
};

module.exports = { createStudyGroup, listStudyGroups };

