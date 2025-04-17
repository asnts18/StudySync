// server/services/meetingService.js
const db = require('../config/db.config');

const createMeeting = async (meetingData) => {
  try {
    // Validation: if recurring then required fields must be provided
    if (meetingData.is_recurring) {
      if (!meetingData.start_date || !meetingData.end_date || !meetingData.recurrence_days) {
        throw new Error("For recurring meetings, start_date, end_date, and recurrence_days are required.");
      }
      // Optional: validate that start_date is before end_date
      if (new Date(meetingData.start_date) >= new Date(meetingData.end_date)) {
        throw new Error("start_date must be before end_date.");
      }
    } else {
      // One-time meeting: meeting_date is required
      if (!meetingData.meeting_date) {
        throw new Error("For one-time meetings, meeting_date is required.");
      }
    }
    
    const sql = `
      INSERT INTO Meeting 
        (study_group_id, name, start_time, end_time, location, description, created_by, is_recurring, meeting_date, start_date, end_date, recurrence_days)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      meetingData.study_group_id,
      meetingData.name,
      meetingData.start_time,               // e.g., "18:00:00"
      meetingData.end_time,                 // e.g., "20:00:00"
      meetingData.location,
      meetingData.description,
      meetingData.created_by,               // from req.userId in controller
      meetingData.is_recurring ? 1 : 0,
      meetingData.is_recurring ? null : meetingData.meeting_date,
      meetingData.is_recurring ? meetingData.start_date : null,
      meetingData.is_recurring ? meetingData.end_date : null,
      meetingData.is_recurring ? meetingData.recurrence_days : null
    ];
    
    const result = await db.query(sql, params);
    const meetingId = result.insertId;
    // Optionally, you can fetch and return the new meeting details from the DB:
    const [newMeeting] = await db.query('SELECT * FROM Meeting WHERE meeting_id = ?', [meetingId]);
    return newMeeting;
  } catch (error) {
    console.error("DB error creating meeting:", error);
    throw error;
  }
};

const getGroupMeetings = async (groupId) => {
  try {
    const sql = 'SELECT * FROM Meeting WHERE study_group_id = ?';
    const meetings = await db.query(sql, [groupId]);
    return meetings;
  } catch (error) {
    console.error("DB error fetching group meetings:", error);
    throw error;
  }
};

const getMeetingById = async (meetingId) => {
  try {
    const sql = 'SELECT * FROM Meeting WHERE meeting_id = ?';
    const meetings = await db.query(sql, [meetingId]);
    
    if (meetings.length === 0) {
      throw new Error('Meeting not found');
    }
    
    return meetings[0];
  } catch (error) {
    console.error("DB error fetching meeting:", error);
    throw error;
  }
};

const updateMeeting = async (meetingId, meetingData, userId) => {
  try {
    // First check if the meeting exists and if the user is authorized to update it
    const meeting = await getMeetingById(meetingId);
    
    // Check if the user is the creator or group owner (this would require a lookup to the group)
    const studyGroup = await db.query(
      'SELECT owner_id FROM StudyGroup WHERE study_group_id = ?', 
      [meeting.study_group_id]
    );
    
    const isCreator = meeting.created_by === userId;
    const isGroupOwner = studyGroup[0]?.owner_id === userId;
    
    if (!isCreator && !isGroupOwner) {
      throw new Error('Not authorized to update this meeting');
    }
    
    // Proceed with the update
    let sql;
    let params;
    
    if (meetingData.is_recurring) {
      sql = `
        UPDATE Meeting SET 
          name = ?, 
          start_time = ?, 
          end_time = ?, 
          location = ?, 
          description = ?, 
          is_recurring = ?, 
          meeting_date = NULL, 
          start_date = ?, 
          end_date = ?, 
          recurrence_days = ?
        WHERE meeting_id = ?
      `;
      
      params = [
        meetingData.name,
        meetingData.start_time,
        meetingData.end_time,
        meetingData.location,
        meetingData.description,
        1, // is_recurring = true
        meetingData.start_date,
        meetingData.end_date,
        meetingData.recurrence_days,
        meetingId
      ];
    } else {
      sql = `
        UPDATE Meeting SET 
          name = ?, 
          start_time = ?, 
          end_time = ?, 
          location = ?, 
          description = ?, 
          is_recurring = ?, 
          meeting_date = ?, 
          start_date = NULL, 
          end_date = NULL, 
          recurrence_days = NULL
        WHERE meeting_id = ?
      `;
      
      params = [
        meetingData.name,
        meetingData.start_time,
        meetingData.end_time,
        meetingData.location,
        meetingData.description,
        0, // is_recurring = false
        meetingData.meeting_date,
        meetingId
      ];
    }
    
    await db.query(sql, params);
    return getMeetingById(meetingId);
  } catch (error) {
    console.error("DB error updating meeting:", error);
    throw error;
  }
};

const deleteMeeting = async (meetingId, userId) => {
  try {
    // First check if the meeting exists and if the user is authorized to delete it
    const meeting = await getMeetingById(meetingId);
    
    // Check if the user is the creator or group owner
    const studyGroup = await db.query(
      'SELECT owner_id FROM StudyGroup WHERE study_group_id = ?', 
      [meeting.study_group_id]
    );
    
    const isCreator = meeting.created_by === userId;
    const isGroupOwner = studyGroup[0]?.owner_id === userId;
    
    if (!isCreator && !isGroupOwner) {
      throw new Error('Not authorized to delete this meeting');
    }
    
    // Proceed with the deletion
    const sql = 'DELETE FROM Meeting WHERE meeting_id = ?';
    await db.query(sql, [meetingId]);
    
    return { success: true, message: 'Meeting deleted successfully' };
  } catch (error) {
    console.error("DB error deleting meeting:", error);
    throw error;
  }
};

module.exports = { 
  createMeeting, 
  getGroupMeetings, 
  getMeetingById, 
  updateMeeting, 
  deleteMeeting 
};