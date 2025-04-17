// components/GroupMeetings.jsx
import React from 'react';
import { Plus, CalendarClock, Calendar, Repeat, AlertCircle } from 'lucide-react';
import MeetingCard from '../../components/MeetingCard';

const GroupMeetings = ({
  filteredMeetings,
  activeTab,
  setActiveTab,
  groupId,
  isOwner,
  deleteSuccess,
  deleteError,
  onCreateMeeting,
  onEditMeeting,
  onDeleteMeeting
}) => {
  return (
    <div className="border-2 border-black p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Meetings</h2>
        
        <button 
          onClick={onCreateMeeting}
          className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-primary-yellow hover:bg-dark-yellow transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Meeting
        </button>
      </div>
      
      {/* Success/Error Messages */}
      {deleteSuccess && (
        <div className="mb-6 p-3 border-2 border-green-500 bg-green-100 text-green-700 flex items-center">
          <span>{deleteSuccess}</span>
        </div>
      )}
      
      {deleteError && (
        <div className="mb-6 p-3 border-2 border-red-500 bg-red-100 text-red-700 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span>{deleteError}</span>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex items-center gap-2 px-4 py-2 ${
            activeTab === 'upcoming' ? 'border-b-2 border-primary-yellow font-medium' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          <CalendarClock className="w-4 h-4" />
          Upcoming
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 ${
            activeTab === 'past' ? 'border-b-2 border-primary-yellow font-medium' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('past')}
        >
          <CalendarClock className="w-4 h-4" />
          Past
        </button>
      </div>
      
      {/* Recurring Meetings Section (if any) */}
      {filteredMeetings.some(m => m.is_recurring) && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Repeat className="w-4 h-4 mr-2" />
            <h3 className="font-semibold">Recurring Meetings</h3>
          </div>
          <div className="space-y-4">
            {filteredMeetings
              .filter(m => m.is_recurring)
              .map(meeting => (
                <MeetingCard 
                  key={meeting.meeting_id} 
                  meeting={meeting}
                  groupId={groupId}
                  isGroupOwner={isOwner}
                  onEdit={onEditMeeting}
                  onDelete={onDeleteMeeting}
                />
              ))
            }
          </div>
        </div>
      )}
      
      {/* One-time Meetings Section */}
      {filteredMeetings.some(m => !m.is_recurring) && (
        <div>
          {filteredMeetings.some(m => m.is_recurring) && (
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <h3 className="font-semibold">One-time Meetings</h3>
            </div>
          )}
          <div className="max-h-80 overflow-y-auto pr-2 space-y-4">
            {filteredMeetings
              .filter(m => !m.is_recurring)
              .map(meeting => (
                <MeetingCard 
                  key={meeting.meeting_id} 
                  meeting={meeting}
                  groupId={groupId} 
                  isGroupOwner={isOwner}
                  onEdit={onEditMeeting}
                  onDelete={onDeleteMeeting}
                />
              ))
            }
          </div>
        </div>
      )}
      
      {/* No meetings message */}
      {filteredMeetings.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300">
          <p className="text-gray-500">
            {activeTab === 'upcoming' 
              ? 'No upcoming meetings scheduled' 
              : 'No past meetings'
            }
          </p>
          {activeTab === 'upcoming' && (
            <p className="text-sm text-gray-400 mt-2">Create a meeting to get started</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupMeetings;