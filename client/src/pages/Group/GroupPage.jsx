// pages/GroupPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Plus, CalendarClock, Calendar, Repeat, Edit, AlertCircle, Trash2, UserMinus, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { useGroupPage } from './useGroupPage'; 
import GroupHeader from './GroupHeader';
import GroupDetailsSection from './GroupDetailsSection';
import GroupMembers from './GroupMembers';
import GroupMeetings from './GroupMeetings';
import ConfirmationModals from './ConfirmationModals';
import GroupEditModal from './GroupEditModal';
import { isBefore, isAfter, startOfDay } from 'date-fns';


const GroupPage = () => {
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  
  const {
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
    
    // Various state and handlers
    deleteSuccess,
    deleteError,
    removeMemberSuccess,
    removeMemberError,
    navigateBack,
    handleCreateMeeting,
    handleEditMeeting,
    handleDeleteMeeting,
    handleDeleteGroup,
    handleGroupUpdate,
    handleRemoveMember,
    handleLeaveGroup,
    
    // Modals state and handlers
    isConfirmDeleteOpen,
    meetingToDelete,
    deleteLoading,
    confirmDeleteMeeting,
    cancelDeleteMeeting,
    
    isConfirmDeleteGroupOpen,
    deleteGroupLoading,
    deleteGroupError,
    confirmDeleteGroup,
    cancelDeleteGroup,
    
    isConfirmRemoveMemberOpen,
    memberToRemove,
    removeMemberLoading,
    confirmRemoveMember,
    cancelRemoveMember,
    
    isConfirmLeaveGroupOpen,
    leaveGroupLoading,
    leaveGroupError,
    confirmLeaveGroup,
    cancelLeaveGroup
  } = useGroupPage(groupId, currentUser);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="p-6 border-2 border-red-500 bg-red-100 text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="p-6 border-2 border-black">Group not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Group Header */}
        <GroupHeader 
          group={group}
          isOwner={isOwner}
          isCurrentUserMember={isCurrentUserMember}
          navigateBack={navigateBack}
          onEditGroup={() => setIsEditModalOpen(true)}
          onDeleteGroup={handleDeleteGroup}
          onLeaveGroup={handleLeaveGroup}
        />
        
        {/* Success message for member removal */}
        {removeMemberSuccess && (
          <div className="mb-6 p-3 border-2 border-green-500 bg-green-100 text-green-700">
            {removeMemberSuccess}
          </div>
        )}

        {/* Group Details */}
        <GroupDetailsSection group={group} />

        {/* Members Section */}
        <GroupMembers 
          members={members}
          isOwner={isOwner}
          currentUserId={currentUser?.user_id}
          removeMemberError={removeMemberError}
          onRemoveMember={handleRemoveMember}
        />

        {/* Meetings Section */}
        <GroupMeetings 
          filteredMeetings={filteredMeetings}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          groupId={groupId}
          isOwner={isOwner}
          deleteSuccess={deleteSuccess}
          deleteError={deleteError}
          onCreateMeeting={handleCreateMeeting}
          onEditMeeting={handleEditMeeting}
          onDeleteMeeting={handleDeleteMeeting}
        />
      </main>

      {/* Confirmation Modals */}
      <ConfirmationModals 
        // Meeting deletion props
        isConfirmDeleteOpen={isConfirmDeleteOpen}
        meetingToDelete={meetingToDelete}
        deleteLoading={deleteLoading}
        confirmDeleteMeeting={confirmDeleteMeeting}
        cancelDeleteMeeting={cancelDeleteMeeting}
        
        // Group deletion props
        isConfirmDeleteGroupOpen={isConfirmDeleteGroupOpen}
        deleteGroupLoading={deleteGroupLoading}
        deleteGroupError={deleteGroupError}
        confirmDeleteGroup={confirmDeleteGroup}
        cancelDeleteGroup={cancelDeleteGroup}
        
        // Member removal props
        isConfirmRemoveMemberOpen={isConfirmRemoveMemberOpen}
        memberToRemove={memberToRemove}
        removeMemberLoading={removeMemberLoading}
        confirmRemoveMember={confirmRemoveMember}
        cancelRemoveMember={cancelRemoveMember}
        
        // Leave group props
        isConfirmLeaveGroupOpen={isConfirmLeaveGroupOpen}
        leaveGroupLoading={leaveGroupLoading}
        leaveGroupError={leaveGroupError}
        confirmLeaveGroup={confirmLeaveGroup}
        cancelLeaveGroup={cancelLeaveGroup}
        
        // Group data
        group={group}
      />

      {/* Edit Group Modal */}
      {isEditModalOpen && (
        <GroupEditModal 
          group={group}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateSuccess={handleGroupUpdate}
        />
      )}
    </div>
  );
};

export default GroupPage;
