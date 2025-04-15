// components/StudyGroupCard.jsx
import React from 'react';
import { Users, MapPin, Clock, Star, Calendar } from 'lucide-react';

const StudyGroupCard = ({ 
  group, 
  onViewMore, 
  showViewMoreButton = true, 
  showJoinButton = true,
  onJoinGroup
}) => (
  <div className="border-2 border-black p-4 flex justify-between items-start gap-4">
    <div className="flex-1">
      <div className="text-left mb-3 flex items-center gap-2">
        <h3 className="text-xl font-semibold">{group.name}</h3>
        {group.is_owner && (
          <span className="flex items-center text-sm bg-primary-yellow px-2 py-1 border border-black">
            <Star className="w-3 h-3 mr-1" /> Owner
          </span>
        )}
      </div>

      {/* Group details with reduced spacing */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="w-4 h-4" />
          <span>{group.currentMembers}/{group.maxMembers} members</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-4 h-4" />
          <span>{getMeetingDays(group.meetingTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4" />
          <span>{getMeetingTime(group.meetingTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4" />
          <span>{group.location}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {group.tags && group.tags.map((tag, index) => (
          <span 
            key={index}
            className="px-3 py-1 border-2 border-black bg-light-orange text-black text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>

    <div className="flex flex-col gap-2 flex-shrink-0">
      {showViewMoreButton && (
        <button 
          onClick={() => onViewMore(group)}
          className="px-4 py-2 border-2 border-black text-black hover:bg-gray-200 transition-colors"
        >
          View More
        </button>
      )}
      {showJoinButton && !group.is_owner && (
        <button 
          onClick={() => onJoinGroup?.(group)}
          className="px-4 py-2 border-2 border-black bg-primary-yellow text-black hover:bg-dark-yellow transition-colors"
        >
          Join Group
        </button>
      )}
    </div>
  </div>
);

// Helper functions to separate meeting days and time
function getMeetingDays(meetingTimeString) {
  if (!meetingTimeString) return "Not specified";
  
  // Check if the meeting time contains day abbreviations
  const dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const foundDays = dayAbbreviations.filter(day => meetingTimeString.includes(day));
  
  if (foundDays.length > 0) {
    return foundDays.join('/');
  }
  
  // If we don't find day abbreviations in the standard format
  // Try to extract days if they're in another format
  const parts = meetingTimeString.split(' ');
  if (parts.length > 1) {
    // Check if the first part might contain days
    const firstPart = parts[0];
    if (firstPart.includes('/')) {
      return firstPart;
    }
  }
  
  return "Not specified";
}

function getMeetingTime(meetingTimeString) {
  if (!meetingTimeString) return "Not specified";
  
  // If the format is "Mon/Wed 2:30pm - 4:30pm"
  const timePattern = /\d{1,2}:\d{2}(am|pm)\s*-\s*\d{1,2}:\d{2}(am|pm)/i;
  const match = meetingTimeString.match(timePattern);
  
  if (match) {
    return match[0];
  }
  
  // If the format has days first, try to get just the time part
  const parts = meetingTimeString.split(' ');
  if (parts.length > 1) {
    // Assume the first part is days, the rest is time
    return parts.slice(1).join(' ');
  }
  
  return meetingTimeString; // Return the original if we can't parse it
}

export default StudyGroupCard;