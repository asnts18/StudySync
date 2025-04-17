// hooks/useGroupPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isBefore, isAfter, startOfDay } from 'date-fns';
import studyGroupService from '../../api/studyGroupService';
import meetingService from '../../api/meetingService';
import { formatMeetingData, sortMeetings } from '../../utils/groupUtils';

export const useGroupPage = (groupId, currentUser) => {
  const navigate = useNavigate();
  
  // State for data
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Meeting deletion state
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  
  // Group deletion state
  const [isConfirmDeleteGroupOpen, setIsConfirmDeleteGroupOpen] = useState(false);
  const [deleteGroupLoading, setDeleteGroupLoading] = useState(false);
  const [deleteGroupError, setDeleteGroupError] = useState('');

  // Member management state
  const [isConfirmRemoveMemberOpen, setIsConfirmRemoveMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removeMemberLoading, setRemoveMemberLoading] = useState(false);
  const [removeMemberError, setRemoveMemberError] = useState('');
  const [removeMemberSuccess, setRemoveMemberSuccess] = useState('');
  
  // Leave group state
  const [isConfirmLeaveGroupOpen, setIsConfirmLeaveGroupOpen] = useState(false);
  const [leaveGroupLoading, setLeaveGroupLoading] = useState(false);
  const [leaveGroupError, setLeaveGroupError] = useState('');

  // Fetch data
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
          const formattedMeetings = formatMeetingData(meetingsData);
          const sortedMeetings = sortMeetings(formattedMeetings);
          setMeetings(sortedMeetings);
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

  // Derived state
  const filteredMeetings = meetings.filter(meeting => {
    const today = startOfDay(new Date());
    
    if (activeTab === 'upcoming') {
      if (meeting.is_recurring) {
        return isAfter(new Date(meeting.end_date), today);
      }
      return isAfter(new Date(meeting.meeting_date), today);
    } else {
      if (meeting.is_recurring) {
        return isBefore(new Date(meeting.end_date), today);
      }
      return isBefore(new Date(meeting.meeting_date), today);
    }
  });

  const isCurrentUserMember = members.some(member => 
    member.user_id === currentUser?.user_id && !isOwner
  );

  // Handler functions
  const handleCreateMeeting = () => {
    navigate(`/groups/${groupId}/meetings/create`);
  };

  const handleEditMeeting = (meeting) => {
    navigate(`/groups/${groupId}/meetings/${meeting.meeting_id}/edit`);
  };

  const handleDeleteMeeting = (meeting) => {
    setMeetingToDelete(meeting);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteMeeting = async () => {
    if (!meetingToDelete) return;
    
    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      await meetingService.deleteMeeting(meetingToDelete.meeting_id);
      setMeetings(meetings.filter(m => m.meeting_id !== meetingToDelete.meeting_id));
      
      setDeleteSuccess(`"${meetingToDelete.name}" has been deleted successfully`);
      setTimeout(() => setDeleteSuccess(''), 3000);
      
      setIsConfirmDeleteOpen(false);
      setMeetingToDelete(null);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setDeleteError('Failed to delete meeting. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDeleteMeeting = () => {
    setIsConfirmDeleteOpen(false);
    setMeetingToDelete(null);
  };

  const handleDeleteGroup = () => {
    setIsConfirmDeleteGroupOpen(true);
  };

  const confirmDeleteGroup = async () => {
    try {
      setDeleteGroupLoading(true);
      setDeleteGroupError('');
      
      await studyGroupService.deleteStudyGroup(groupId);
      
      setIsConfirmDeleteGroupOpen(false);
      
      navigate('/home', { 
        state: { 
          message: 'Study group deleted successfully',
          type: 'success'
        } 
      });
    } catch (error) {
      console.error('Error deleting study group:', error);
      setDeleteGroupError('Failed to delete study group. Please try again.');
      setDeleteGroupLoading(false);
    }
  };

  const cancelDeleteGroup = () => {
    setIsConfirmDeleteGroupOpen(false);
  };

  const handleGroupUpdate = (updatedGroup) => {
    setGroup(prevGroup => ({
      ...prevGroup,
      name: updatedGroup.name,
      description: updatedGroup.description
    }));
  };

  const handleRemoveMember = (member) => {
    setMemberToRemove(member);
    setIsConfirmRemoveMemberOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      setRemoveMemberLoading(true);
      setRemoveMemberError('');
      
      await studyGroupService.removeGroupMember(groupId, memberToRemove.user_id);
      
      setMembers(members.filter(m => m.user_id !== memberToRemove.user_id));
      
      setRemoveMemberSuccess(`${memberToRemove.first_name} ${memberToRemove.last_name} has been removed from the group`);
      setTimeout(() => setRemoveMemberSuccess(''), 3000);
      
      setIsConfirmRemoveMemberOpen(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error('Error removing member:', error);
      setRemoveMemberError('Failed to remove member. Please try again.');
    } finally {
      setRemoveMemberLoading(false);
    }
  };

  const cancelRemoveMember = () => {
    setIsConfirmRemoveMemberOpen(false);
    setMemberToRemove(null);
  };

  const handleLeaveGroup = () => {
    setIsConfirmLeaveGroupOpen(true);
  };

  const confirmLeaveGroup = async () => {
    try {
      setLeaveGroupLoading(true);
      setLeaveGroupError('');
      
      await studyGroupService.leaveGroup(groupId);
      
      navigate('/home', {
        state: {
          message: `You have left "${group.name}" successfully`,
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error leaving group:', error);
      setLeaveGroupError('Failed to leave group. Please try again.');
      setLeaveGroupLoading(false);
    }
  };

  const cancelLeaveGroup = () => {
    setIsConfirmLeaveGroupOpen(false);
  };

  const navigateBack = () => {
    navigate('/home');
  };

  return {
    // Data
    group,
    members,
    filteredMeetings,
    
    // UI state
    loading,
    error,
    isOwner,
    isCurrentUserMember,
    activeTab,
    setActiveTab,
    isEditModalOpen,
    setIsEditModalOpen,
    
    // Meeting state
    deleteSuccess,
    deleteError,
    
    // Group state
    isConfirmDeleteGroupOpen,
    deleteGroupLoading,
    deleteGroupError,
    
    // Member state
    removeMemberSuccess,
    removeMemberError,
    isConfirmRemoveMemberOpen,
    memberToRemove,
    removeMemberLoading,
    
    // Leave group state
    isConfirmLeaveGroupOpen,
    leaveGroupLoading,
    leaveGroupError,
    
    // Meeting deletion state
    isConfirmDeleteOpen,
    meetingToDelete,
    deleteLoading,
    
    // Handlers
    navigateBack,
    handleCreateMeeting,
    handleEditMeeting,
    handleDeleteMeeting,
    confirmDeleteMeeting,
    cancelDeleteMeeting,
    handleDeleteGroup,
    confirmDeleteGroup,
    cancelDeleteGroup,
    handleGroupUpdate,
    handleRemoveMember,
    confirmRemoveMember,
    cancelRemoveMember,
    handleLeaveGroup,
    confirmLeaveGroup,
    cancelLeaveGroup
  };
};