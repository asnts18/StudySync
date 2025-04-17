// utils/groupUtils.js
import { format } from 'date-fns';

// Format a date string to a readable format (e.g., "Jan 15, 2023")
export const formatDateString = (dateString) => {
  if (!dateString) return '';
  
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Format time from "HH:MM:SS" to "HH:MM AM/PM"
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

// Format recurrence days to human-readable text
export const formatRecurrenceDays = (recurrenceDays) => {
  if (!recurrenceDays) return '';
  
  const dayMap = {
    '0': 'Sunday',
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday'
  };
  
  const days = recurrenceDays.split(',').map(day => dayMap[day.trim()]);
  
  if (days.length === 1) {
    return `every ${days[0]} (weekly)`;
  } else if (days.length > 1) {
    const lastDay = days.pop();
    return `every ${days.join(', ')} and ${lastDay} (weekly)`;
  }
  
  return '';
};

// Format meeting data for display
export const formatMeetingData = (meetingsData) => {
  if (!meetingsData || !Array.isArray(meetingsData)) {
    return [];
  }
  
  return meetingsData.map(meeting => {
    // Convert is_recurring to a strict boolean
    const isRecurring = meeting.is_recurring === 1 || meeting.is_recurring === true;
    
    // Format the meeting date string appropriately
    const formattedDate = isRecurring
      ? `${formatDateString(meeting.start_date)} to ${formatDateString(meeting.end_date)}`
      : formatDateString(meeting.meeting_date);
      
    // Format the time string
    const timeString = `${formatTime(meeting.start_time)} - ${formatTime(meeting.end_time)}`;
    
    // Format recurrence days if applicable
    const recurrenceDaysFormatted = isRecurring 
      ? formatRecurrenceDays(meeting.recurrence_days) 
      : '';
    
    // Return the completely formatted meeting object
    return {
      meeting_id: meeting.meeting_id,
      name: meeting.name || "Unnamed Meeting",
      date: formattedDate,
      time: timeString,
      recurrence_days: recurrenceDaysFormatted,
      location: meeting.location || "",
      is_recurring: isRecurring,
      raw_date: isRecurring ? meeting.start_date : meeting.meeting_date,
      meeting_date: meeting.meeting_date,
      start_date: meeting.start_date,
      end_date: meeting.end_date,
      created_by: meeting.created_by
    };
  });
};

// Sort meetings: recurring meetings first, then by date
export const sortMeetings = (meetings) => {
  return [...meetings].sort((a, b) => {
    // First, sort by recurring status (recurring first)
    if (a.is_recurring !== b.is_recurring) {
      return a.is_recurring ? -1 : 1;
    }
    // Then sort by date (ascending)
    return new Date(a.raw_date) - new Date(b.raw_date);
  });
};