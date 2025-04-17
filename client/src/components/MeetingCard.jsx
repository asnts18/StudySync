// components/MeetingCard.jsx
import React from 'react';
import { Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MeetingCard = ({ 
  meeting, 
  groupId, 
  isGroupOwner, 
  onEdit, 
  onDelete 
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Check if current user is the creator of the meeting
  const isCreator = currentUser && meeting.created_by === currentUser.user_id;
  
  // User can edit/delete if they are the creator OR the group owner
  const canModify = isCreator || isGroupOwner;

  return (
    <div className="border-2 border-black p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{meeting.name}</h3>
        
        {/* Action buttons shown only to authorized users */}
        {canModify && (
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(meeting)}
              className="p-1.5 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
              title="Edit meeting"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(meeting)}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
              title="Delete meeting"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Meeting Details */}
      <div className="mt-3">
        <div className="flex items-center mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{meeting.date}</span>
        </div>
        
        <div className="flex items-center mb-2">
          <Clock className="w-4 h-4 mr-2" />
          <span>
            {meeting.time}
            {meeting.recurrence_days && (
              <span className="ml-1 text-gray-600">, {meeting.recurrence_days}</span>
            )}
          </span>
        </div>
        
        {meeting.location && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{meeting.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingCard;