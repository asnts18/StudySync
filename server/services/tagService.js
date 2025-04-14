// services/tagService.js
const db = require('../config/db.config');

const getAllTags = async () => {
  try {
    const tags = await db.query('SELECT tag_id, name, description FROM Tags ORDER BY name');
    return tags;
  } catch (error) {
    console.error('Error in getAllTags service:', error);
    throw new Error('Failed to fetch tags');
  }
};

module.exports = {
  getAllTags
};