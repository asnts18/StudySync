// components/GroupDetailModal.jsx
import React from 'react';
import { X, Users, MapPin, Clock, BookOpen, Calendar } from 'lucide-react';

const GroupDetailModal = ({ group, onClose }) => {
  if (!group) return null;

  // Helper functions to separate meeting days and time
  const getMeetingDays = (meetingTimeString) => {
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
  };

  const getMeetingTime = (meetingTimeString) => {
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
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black">
        {/* Header */}
        <div className="border-b-2 border-black p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">{group.name}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 border-2 border-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
        
          {/* Description */}
          <div className="border-2 border-black p-4">
            <h3 className="font-semibold mb-2">About this group</h3>
            <p className="text-gray-700">
              {group.description || "Join us for focused study sessions where we work through course material, practice problems, and prepare for exams together."}
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-black p-4">
              <div className="flex items-center gap-2 text-black">
                <Users className="w-4 h-4" />
                <span className="font-medium">Members</span>
              </div>
              <p className="mt-1 text-left">{group.currentMembers}/{group.maxMembers} members</p>
            </div>
            
            <div className="border-2 border-black p-4">
              <div className="flex items-center gap-2 text-black">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Meeting Days</span>
              </div>
              <p className="mt-1 text-left">{getMeetingDays(group.meetingTime)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-black p-4">
              <div className="flex items-center gap-2 text-black">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Meeting Time</span>
              </div>
              <p className="mt-1 text-left">{getMeetingTime(group.meetingTime)}</p>
            </div>
            
            <div className="border-2 border-black p-4">
              <div className="flex items-center gap-2 text-black">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Location</span>
              </div>
              <p className="mt-1 text-left">{group.location}</p>
            </div>
          </div>

          {/* Study Style */}
          <div className="border-2 border-black p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Study Style
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 border-2 border-black bg-light-orange text-black text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailModal;