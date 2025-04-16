// pages/GroupPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Plus, CalendarClock, Calendar, Repeat, Edit, Trash } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import studyGroupService from '../api/studyGroupService';
import meetingService from '../api/meetingService';
import MeetingCard from '../components/MeetingCard';
import GroupEditModal from '../components/GroupEditModal';
import { format, parseISO, isBefore, isAfter, startOfDay } from 'date-fns';

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Helper function to format date strings
  const formatDateString = (dateString) => {
    if (!dateString) return '';
    
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Helper function to format time from "HH:MM:SS" to "HH:MM AM/PM"
  const formatTime = (timeString) => {
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

  // Helper function to format recurrence days
  const formatRecurrenceDays = (recurrenceDays) => {
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

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch group details
        const groupData = await studyGroupService.getGroupById(groupId);
        setGroup(groupData);
        
        // Check if current user is the owner
        setIsOwner(groupData.owner_id === currentUser?.user_id);
        
        // Fetch group members
        const membersData = await studyGroupService.getGroupMembers(groupId);
        setMembers(membersData);
        
        // Fetch group meetings
        try {
          const meetingsData = await meetingService.getGroupMeetings(groupId);
          
          // Format meetings for display - ALL FORMATTING IN ONE PLACE
          const formattedMeetings = meetingsData.map(meeting => {
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
              end_date: meeting.end_date
            };
          });
          
          // Sort meetings: recurring meetings first, then by date
          formattedMeetings.sort((a, b) => {
            // First, sort by recurring status (recurring first)
            if (a.is_recurring !== b.is_recurring) {
              return a.is_recurring ? -1 : 1;
            }
            // Then sort by date (ascending)
            return new Date(a.raw_date) - new Date(b.raw_date);
          });
          
          setMeetings(formattedMeetings);
        } catch (meetingError) {
          console.error('Error fetching meetings:', meetingError);
          setMeetings([]);
        }
        
      } catch (err) {
        console.error('Error fetching group data:', err);
        setError('Failed to load group information');
      } finally {
        setLoading(false);
      }
    };
    
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId, currentUser]);

  const handleCreateMeeting = () => {
    navigate(`/groups/${groupId}/meetings/create`);
  };

  const handleViewMeetingDetails = (meeting) => {
    // Navigate to meeting details page
    navigate(`/groups/${groupId}/meetings/${meeting.meeting_id}`);
  };

  const handleGroupUpdate = (updatedGroup) => {
    setGroup(prevGroup => ({
      ...prevGroup,
      name: updatedGroup.name,
      description: updatedGroup.description
    }));
  };

  const handleDeleteGroup = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGroup = async () => {
    try {
      setLoading(true);
      
      await studyGroupService.deleteStudyGroup(groupId);
            
      navigate('/my-groups', { 
        state: { deletedGroup: true, groupName: group.name } 
      });
      
      setShowDeleteConfirm(false);
      setLoading(false);
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Failed to delete group. Please try again.');
      setShowDeleteConfirm(false);
      setLoading(false);
    }
  };

  // Filter meetings based on active tab
  const filteredMeetings = meetings.filter(meeting => {
    const today = startOfDay(new Date());
    
    if (activeTab === 'upcoming') {
      // For a recurring meeting, check if end_date is in the future
      if (meeting.is_recurring) {
        return isAfter(new Date(meeting.end_date), today);
      }
      // For a one-time meeting, check if meeting_date is in the future
      return isAfter(new Date(meeting.meeting_date), today);
    } else { // 'past' tab
      // For a recurring meeting, check if end_date is in the past
      if (meeting.is_recurring) {
        return isBefore(new Date(meeting.end_date), today);
      }
      // For a one-time meeting, check if meeting_date is in the past
      return isBefore(new Date(meeting.meeting_date), today);
    }
  });

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="p-6 border-2 border-red-500 bg-red-100 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="p-6 border-2 border-black">
            Group not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-8 py-12">
{/* Header with back button and group name */}
<div className="mb-12">
  <div className="flex items-center justify-between">
    {/* Left side: back button and group name */}
    <div className="flex items-center gap-4">
      <button 
        onClick={() => navigate('/my-groups')} 
        className="p-2 border-2 border-black hover:bg-gray-200 transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div>
        <h1 className="text-4xl font-bold">{group.name}</h1>
      </div>
    </div>
    
    {/* Right side: action buttons */}
    {isOwner && (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="px-3 py-1 bg-primary-yellow border-2 border-black text-sm flex items-center gap-1"
        >
          <Edit className="w-3 h-3" />
          Edit Group
        </button>
        <button 
          onClick={handleDeleteGroup}
          className="px-3 py-1 bg-red-500 text-white border-2 border-black text-sm flex items-center gap-1"
        >
          <Trash className="w-3 h-3" />
          Delete Group
        </button>
      </div>
    )}
  </div>
</div>
        {/* Group Details Section */}
        <div className="mb-12 border-2 border-black p-6">
          <h2 className="text-2xl font-semibold mb-4">Group Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Members</p>
                <p className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {group.currentMembers}/{group.maxMembers} members
                </p>
              </div>
              
              {group.course_code && (
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {group.course_code}{group.course_name ? `: ${group.course_name}` : ''}
                  </p>
                </div>
              )}
            </div>
            
            {/* Right column - description */}
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-lg whitespace-pre-wrap">{group.description || "No description provided."}</p>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="mb-12 border-2 border-black p-6">
          <h2 className="text-2xl font-semibold mb-4">Members</h2>
          
          {members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map(member => (
                <div key={member.user_id} className="border-2 border-black p-4">
                  <p className="font-medium">{member.first_name} {member.last_name}</p>
                  {member.bio && <p className="text-sm text-gray-600 line-clamp-2">{member.bio}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No members found.</p>
          )}
        </div>

        {/* Meetings Section */}
        <div className="border-2 border-black p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Meetings</h2>
            
            <button 
              onClick={handleCreateMeeting}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-primary-yellow hover:bg-dark-yellow transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Meeting
            </button>
          </div>
          
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
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <GroupEditModal 
          group={group}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateSuccess={handleGroupUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md border-2 border-black p-6">
            <h2 className="text-2xl font-bold mb-4">Delete Group</h2>
            <p className="mb-6">Are you sure you want to delete "{group.name}"? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGroup}
                className="flex-1 px-4 py-2 bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPage;