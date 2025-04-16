// pages/GroupPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Plus, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import studyGroupService from '../api/studyGroupService';
// import MeetingCard from '../components/MeetingCard'; // You'll need to create this

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
        
        // Fetch group meetings (need to create this service function)
        // const meetingsData = await meetingService.getGroupMeetings(groupId);
        // setMeetings(meetingsData);
        
        // For now, let's use placeholder data for meetings
        setMeetings([
          {
            meeting_id: 1,
            name: 'Weekly Study Session',
            date: '2023-11-15',
            time: '18:00 - 20:00'
          }
        ]);
        
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
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => navigate('/my-groups')} 
            className="p-2 border-2 border-black hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold">{group.name}</h1>
          {isOwner && (
            <span className="ml-4 px-3 py-1 bg-primary-yellow border-2 border-black text-sm">
              You are the owner
            </span>
          )}
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
          
          {meetings.length > 0 ? (
            <div className="space-y-4">
              {meetings.map(meeting => (
                <div
                  key={meeting.meeting_id}
                  className="border-2 border-black p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium text-lg">{meeting.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{meeting.date}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> 
                        {meeting.time}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    className="px-3 py-1 border-2 border-black hover:bg-gray-100 transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No meetings scheduled yet</p>
              <p className="text-sm text-gray-400 mt-2">Create a meeting to get started</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GroupPage;