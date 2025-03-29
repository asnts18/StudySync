// components/StudyGroupCard.jsx
import React from 'react';
import { Users, MapPin, Clock } from 'lucide-react';

const StudyGroupCard = ({ group, onViewMore, showViewMoreButton = true, showJoinButton = true }) => (
  <div className="border-2 border-black p-4 flex justify-between items-start gap-4">
    <div className="flex-1">
      <div className="text-left mb-3">
        <h3 className="text-xl font-semibold">{group.name}</h3>
      </div>

      {/* Group details with reduced spacing */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="w-4 h-4" />
          <span>{group.currentMembers}/{group.maxMembers} members</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4" />
          <span>{group.meetingTime}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4" />
          <span>{group.location}</span>
        </div>
      </div>

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

    <div className="flex flex-col gap-2 flex-shrink-0">
      {showViewMoreButton && (
        <button 
        onClick={() => onViewMore(group)}
        className="px-4 py-2 border-2 border-black text-black hover:bg-gray-200 transition-colors"
      >
        View More
      </button>
      )}
      {showJoinButton && (
        <button className="px-4 py-2 border-2 border-black bg-primary-yellow text-black hover:bg-dark-yellow transition-colors">
          Join Group
        </button>
      )}
    </div>
  </div>
);

export default StudyGroupCard;