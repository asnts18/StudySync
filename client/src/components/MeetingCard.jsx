// components/MeetingCard.jsx
import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const MeetingCard = ({ meeting }) => {
  return (
    <div className="border-2 border-black p-4 hover:bg-gray-50 transition-colors">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 className="text-lg font-semibold">{meeting.name}</h3>
      </div>

      {/* Meeting Details */}
      <div className="mt-3">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <Calendar className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
          <span>{meeting.date}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <Clock className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
          <span>
            {meeting.time}
            {meeting.recurrence_days && (
              <span>, {meeting.recurrence_days}</span>
            )}
          </span>
        </div>
        
        {meeting.location && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MapPin className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
            <span>{meeting.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingCard;