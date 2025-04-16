// services/studygroupService.js
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
    // Create a connection to manage the transaction
    const connection = await db.pool.getConnection();
    
    try {
      // Start transaction
      await connection.beginTransaction();
      
      // Validate max_capacity
      const validatedCapacity = Math.min(Math.max(parseInt(max_capacity) || 8, 1), 8);
      
      // Set university_id default if not provided (should not happen due to NOT NULL constraint)
      if (!university_id) {
        throw new Error('university_id is required for study group creation');
      }
      
      // Insert study group
      const [groupResult] = await connection.execute(
        `INSERT INTO StudyGroup (name, description, owner_id, course_code, university_id, max_capacity, is_private)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, description, owner_id, course_code, university_id, validatedCapacity, is_private === true ? 1 : 0]
      );
      
      const studyGroupId = groupResult.insertId;
      
      // Add the creator as a member of the group
      await connection.execute(
        `INSERT INTO User_StudyGroup (user_id, study_group_id) VALUES (?, ?)`,
        [owner_id, studyGroupId]
      );
      
      // Commit the transaction
      await connection.commit();
      
      // Fetch the newly created group
      const [groupDetails] = await connection.execute(
        `SELECT study_group_id, name, description, owner_id, course_code, university_id, 
                max_capacity, is_private, created_at, updated_at
         FROM StudyGroup 
         WHERE study_group_id = ?`,
        [studyGroupId]
      );
      
      return groupDetails[0];
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

// Update study group - only name and description can be updated
const updateStudyGroup = async (groupId, userId, updateData) => {
  try {
    // First, verify that the user is the owner of the group
    const ownerCheck = await db.query(
      'SELECT owner_id FROM StudyGroup WHERE study_group_id = ?',
      [groupId]
    );
    
    if (!ownerCheck || ownerCheck.length === 0) {
      throw new Error('Study group not found');
    }
    
    if (ownerCheck[0].owner_id !== userId) {
      throw new Error('Only the owner can update the group');
    }
    
    // Extract only the fields that are allowed to be updated
    // Ensure no undefined values are passed to the query
    const name = updateData.name || ''; // Default empty string if null
    const description = updateData.description === undefined ? null : updateData.description;
    
    console.log('Update params:', { groupId, name, description });
    
    // Update only name and description
    await db.query(
      'UPDATE StudyGroup SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE study_group_id = ?',
      [name, description === undefined ? null : description, groupId]
    );
    
    // Fetch and return the updated group
    return getStudyGroupById(groupId);
  } catch (error) {
    console.error('DB error updating study group:', error);
    throw error;
  }
};

const deleteStudyGroup = async (groupId, userId) => {
  try {
    // First verify that the user is the owner of the group
    const ownerCheck = await db.query(
      'SELECT owner_id FROM StudyGroup WHERE study_group_id = ?',
      [groupId]
    );
    
    if (!ownerCheck || ownerCheck.length === 0) {
      throw new Error('Study group not found');
    }
    
    if (ownerCheck[0].owner_id !== userId) {
      throw new Error('Only the owner can delete the group');
    }
    
    // Delete the group
    // Note: Assuming cascade delete is set up in the database for related records
    const result = await db.query(
      'DELETE FROM StudyGroup WHERE study_group_id = ?',
      [groupId]
    );
    
    return { success: true, message: 'Study group deleted successfully' };
  } catch (error) {
    console.error('DB error deleting study group:', error);
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

const getStudyGroupsByUniversity = async (universityId) => {
  try {
    let sql = `
      SELECT sg.*, 
        (SELECT COUNT(*) FROM User_StudyGroup usg WHERE usg.study_group_id = sg.study_group_id) as current_members,
        c.name as course_name
      FROM StudyGroup sg
      LEFT JOIN Course c ON sg.course_code = c.course_code AND sg.university_id = c.university_id
      WHERE sg.university_id = ? AND sg.is_private = 0
      ORDER BY sg.created_at DESC
      LIMIT 10
    `;
    
    const groups = await db.query(sql, [universityId]);
    
    // For each group, fetch associated tags through meetings
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
    console.error('DB error getting university study groups:', error);
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
  getStudyGroupsByUniversity,
  getStudyGroupById,
  updateStudyGroup,
  deleteStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  listGroupMembers,
  removeGroupMember,
  requestJoinGroup
};