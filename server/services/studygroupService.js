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
      
      // Get current date for meeting
      const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Create a meeting for the study group
      // Note: We're creating a one-time meeting (is_recurring = false) with today's date as meeting_date
      const [meetingResult] = await connection.execute(
        `INSERT INTO Meeting (study_group_id, name, start_time, end_time, location, created_by, is_recurring, meeting_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [studyGroupId, `${name} Meeting`, '18:00:00', '20:00:00', location, owner_id, false, currentDate]
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

// Group listing and filtering API
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

// Get user's study groups (both owned and joined)
const getUserStudyGroups = async (userId) => {
  try {
    const sql = `
      SELECT 
        sg.*,
        (SELECT COUNT(*) FROM User_StudyGroup usg WHERE usg.study_group_id = sg.study_group_id) as current_members,
        sg.owner_id = ? as is_owner,
        m.location,
        m.start_time,
        m.end_time,
        CONCAT(
          TIME_FORMAT(m.start_time, '%h:%i%p'), ' - ', 
          TIME_FORMAT(m.end_time, '%h:%i%p')
        ) as meeting_time
      FROM StudyGroup sg
      JOIN User_StudyGroup usg ON sg.study_group_id = usg.study_group_id
      LEFT JOIN (
        SELECT study_group_id, location, start_time, end_time
        FROM Meeting
        WHERE meeting_id IN (
          SELECT MIN(meeting_id) 
          FROM Meeting 
          GROUP BY study_group_id
        )
      ) m ON sg.study_group_id = m.study_group_id
      WHERE usg.user_id = ?
    `;
    
    const groups = await db.query(sql, [userId, userId]);
    
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
    console.error('DB error getting user study groups:', error);
    throw error;
  }
};


// Get a specific study group by its ID
const getStudyGroupById = async (groupId) => {
  try {
    const sql = `
      SELECT sg.*, 
        (SELECT COUNT(*) FROM User_StudyGroup usg WHERE usg.study_group_id = sg.study_group_id) as current_members
      FROM StudyGroup sg
      WHERE sg.study_group_id = ?
      LIMIT 1
    `;
    const groups = await db.query(sql, [groupId]);
    return groups[0] || null;
  } catch (error) {
    console.error('DB error getting study group by ID:', error);
    throw error;
  }
};

// Join a study group with privacy logic
const joinStudyGroup = async (userId, groupId) => {
  try {
    // Fetch the study group record
    const group = await getStudyGroupById(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }
    
    // Check if user is already a member
    const existingMembership = await db.query(
      'SELECT 1 FROM User_StudyGroup WHERE user_id = ? AND study_group_id = ?',
      [userId, groupId]
    );
    if (existingMembership.length > 0) {
      return { success: false, message: 'User is already a member of this group' };
    }
    
    // Check if the group is full
    if (group.current_members >= group.max_capacity) {
      return { success: false, message: 'Group is already at full capacity' };
    }
    
    // Check the group's privacy setting:
    if (group.is_private === 1 || group.is_private === true) {
      // For a private group, insert a join request into GroupJoinRequests.
      await db.query(
        'INSERT INTO GroupJoinRequests (user_id, study_group_id) VALUES (?, ?)',
        [userId, groupId]
      );
      return { success: true, message: 'Join request submitted successfully (private group).' };
    } else {
      // For a public group, add the user directly to User_StudyGroup.
      await db.query(
        'INSERT INTO User_StudyGroup (user_id, study_group_id) VALUES (?, ?)',
        [userId, groupId]
      );
      return { success: true, message: 'Successfully joined the study group (public group).' };
    }
  } catch (error) {
    console.error('DB error joining study group:', error);
    throw error;
  }
};


// Leave a study group
const leaveStudyGroup = async (userId, groupId) => {
  try {
    // Check if group exists
    const group = await getStudyGroupById(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }
    
    // Check if user is a member
    const existingMembership = await db.query(
      'SELECT 1 FROM User_StudyGroup WHERE user_id = ? AND study_group_id = ?',
      [userId, groupId]
    );
    
    if (existingMembership.length === 0) {
      return { success: false, message: 'User is not a member of this group' };
    }
    
    // Check if user is the owner
    if (group.owner_id === userId) {
      return { success: false, message: 'Group owner cannot leave the group. Consider deleting the group instead.' };
    }
    
    // Remove user from group
    await db.query(
      'DELETE FROM User_StudyGroup WHERE user_id = ? AND study_group_id = ?',
      [userId, groupId]
    );
    
    return { success: true, message: 'Successfully left the study group' };
  } catch (error) {
    console.error('DB error leaving study group:', error);
    throw error;
  }
};


// List all members of a study group
const listGroupMembers = async (studyGroupId) => {
  try {
    console.log('Fetching members for group ID:', studyGroupId);
    const sql = `
      SELECT u.user_id, u.email, u.first_name, u.last_name, u.bio, univ.name as university_name
      FROM User_StudyGroup usg
      JOIN User u ON usg.user_id = u.user_id
      LEFT JOIN University univ ON u.university_id = univ.university_id
      WHERE usg.study_group_id = ?
    `;
    const members = await db.query(sql, [studyGroupId]);
    return members;
  } catch (error) {
    console.error('DB error listing group members:', error);
    throw error;
  }
};

// Remove a member from a study group
const removeGroupMember = async (studyGroupId, memberId) => {
  try {
    // Check if the user is a member first
    const membership = await db.query(
      'SELECT 1 FROM User_StudyGroup WHERE study_group_id = ? AND user_id = ?',
      [studyGroupId, memberId]
    );
    if (membership.length === 0) {
      return { success: false, message: 'Member not found in this group' };
    }
    // Remove membership
    await db.query(
      'DELETE FROM User_StudyGroup WHERE study_group_id = ? AND user_id = ?',
      [studyGroupId, memberId]
    );
    return { success: true, message: 'Member removed from the study group successfully' };
  } catch (error) {
    console.error('DB error removing group member:', error);
    throw error;
  }
};

const requestJoinGroup = async ({ study_group_id, user_id }) => {
  try {
    // Check if a request already exists to avoid duplicates:
    const existingRequest = await db.query(
      'SELECT * FROM GroupJoinRequests WHERE study_group_id = ? AND user_id = ?',
      [study_group_id, user_id]
    );
    if (existingRequest.length > 0) {
      return { success: false, message: 'Join request already exists for this group' };
    }
    
    // Insert the join request
    const result = await db.query(
      'INSERT INTO GroupJoinRequests (user_id, study_group_id) VALUES (?, ?)',
      [user_id, study_group_id]
    );
    return { success: true, message: 'Join request submitted successfully', request_id: result.insertId };
  } catch (error) {
    console.error('DB error requesting join:', error);
    throw error;
  }
};

module.exports = { 
  createStudyGroup, 
  listStudyGroups,
  getUserStudyGroups,
  getStudyGroupById,
  joinStudyGroup,
  leaveStudyGroup,
  listGroupMembers,
  removeGroupMember,
  requestJoinGroup
};