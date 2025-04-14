const db = require('../config/db.config');

const createStudyGroup = async ({
  name,
  description,
  owner_id,
  course_code,
  university_id,
  max_capacity,
  is_private,
  tags,
  location,
  meeting_time
}) => {
  try {
    // Create a connection to manage the transaction
    const connection = await db.pool.getConnection();
    
    try {
      // Start transaction
      await connection.beginTransaction();
      
      // Insert study group
      const [groupResult] = await connection.execute(
        `INSERT INTO StudyGroup (name, description, owner_id, course_code, university_id, max_capacity, is_private)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, description, owner_id, course_code, university_id, max_capacity, is_private]
      );
      
      const studyGroupId = groupResult.insertId;
      
      // Add the creator as a member of the group
      await connection.execute(
        `INSERT INTO User_StudyGroup (user_id, study_group_id) VALUES (?, ?)`,
        [owner_id, studyGroupId]
      );
      
      // Create a meeting for the study group
      const [meetingResult] = await connection.execute(
        `INSERT INTO Meeting (study_group_id, name, start_time, end_time, location, created_by, is_recurring)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [studyGroupId, `${name} Meeting`, '18:00:00', '20:00:00', location, owner_id, false]
      );
      
      const meetingId = meetingResult.insertId;
      
      // If tags are provided, add them to the meeting
      if (tags && tags.length > 0) {
        // Get tag IDs from tag names
        for (const tagName of tags) {
          // Get the tag ID
          const [tagRows] = await connection.execute(
            `SELECT tag_id FROM Tags WHERE name = ?`,
            [tagName]
          );
          
          if (tagRows.length > 0) {
            const tagId = tagRows[0].tag_id;
            
            // Associate the tag with the meeting
            await connection.execute(
              `INSERT INTO Meeting_Tags (meeting_id, tag_id) VALUES (?, ?)`,
              [meetingId, tagId]
            );
          }
        }
      }
      
      // Commit the transaction
      await connection.commit();
      
      // Fetch the newly created group with all its details
      const [groupDetails] = await connection.execute(
        `SELECT * FROM StudyGroup WHERE study_group_id = ?`,
        [studyGroupId]
      );
      
      // Get the tags associated with the meeting
      const [meetingTags] = await connection.execute(
        `SELECT t.name FROM Tags t
         JOIN Meeting_Tags mt ON t.tag_id = mt.tag_id
         WHERE mt.meeting_id = ?`,
        [meetingId]
      );
      
      const tagList = meetingTags.map(tag => tag.name);
      
      // Return the group details with tags
      return {
        ...groupDetails[0],
        tags: tagList,
        location,
        meeting_time
      };
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      throw error;
    } finally {
      // Release connection
      connection.release();
    }
  } catch (error) {
    console.error('DB error creating study group:', error);
    throw error;
  }
};

// group listing and filtering API
const listStudyGroups = async (filters) => {
  try {
    let sql = `
      SELECT sg.*, 
        (SELECT COUNT(*) FROM User_StudyGroup usg WHERE usg.study_group_id = sg.study_group_id) as current_members,
        m.location,
        CONCAT(
          TIME_FORMAT(m.start_time, '%h:%i%p'), ' - ', 
          TIME_FORMAT(m.end_time, '%h:%i%p')
        ) as meeting_time
      FROM StudyGroup sg
      LEFT JOIN Meeting m ON sg.study_group_id = m.study_group_id
    `;
    
    let conditions = [];
    let params = [];

    if (filters.name) {
      conditions.push('sg.name LIKE ?');
      params.push(`%${filters.name}%`);
    }
    if (filters.course_code) {
      conditions.push('sg.course_code = ?');
      params.push(filters.course_code);
    }
    if (filters.university_id) {
      conditions.push('sg.university_id = ?');
      params.push(filters.university_id);
    }
    if (filters.is_private !== undefined) {
      conditions.push('sg.is_private = ?');
      params.push(filters.is_private ? 1 : 0);
    }
    if (filters.tag) {
      sql += `
        INNER JOIN Meeting m2 ON sg.study_group_id = m2.study_group_id
        INNER JOIN Meeting_Tags mt ON m2.meeting_id = mt.meeting_id
        INNER JOIN Tags t ON mt.tag_id = t.tag_id
      `;
      conditions.push('t.name = ?');
      params.push(filters.tag);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY sg.study_group_id';

    // Execute the query
    const groups = await db.query(sql, params);
    
    // For each group, fetch associated tags
    for (const group of groups) {
      // Get all meetings for this group
      const meetings = await db.query(
        `SELECT meeting_id FROM Meeting WHERE study_group_id = ?`,
        [group.study_group_id]
      );
      
      // Collect all tag names for all meetings of this group
      const tags = [];
      for (const meeting of meetings) {
        const meetingTags = await db.query(
          `SELECT t.name 
           FROM Tags t
           JOIN Meeting_Tags mt ON t.tag_id = mt.tag_id
           WHERE mt.meeting_id = ?`,
          [meeting.meeting_id]
        );
        
        meetingTags.forEach(tag => {
          if (!tags.includes(tag.name)) {
            tags.push(tag.name);
          }
        });
      }
      
      group.tags = tags;
    }
    
    return groups;
  } catch (error) {
    console.error('DB error listing study groups:', error);
    throw error;
  }
};

module.exports = { createStudyGroup, listStudyGroups };