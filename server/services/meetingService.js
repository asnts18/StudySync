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

// todo: update meeting
// todo: delete meeting

module.exports = { createMeeting, getGroupMeetings };
