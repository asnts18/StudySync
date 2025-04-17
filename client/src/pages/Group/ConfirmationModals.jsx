// pages/Group/ConfirmationModals.jsx
import React from 'react';

const ConfirmationModals = ({
  // Meeting deletion props
  isConfirmDeleteOpen,
  meetingToDelete,
  deleteLoading,
  confirmDeleteMeeting,
  cancelDeleteMeeting,
  
  // Group deletion props
  isConfirmDeleteGroupOpen,
  deleteGroupLoading,
  deleteGroupError,
  confirmDeleteGroup,
  cancelDeleteGroup,
  
  // Member removal props
  isConfirmRemoveMemberOpen,
  memberToRemove,
  removeMemberLoading,
  confirmRemoveMember,
  cancelRemoveMember,
  
  // Leave group props
  isConfirmLeaveGroupOpen,
  leaveGroupLoading,
  leaveGroupError,
  confirmLeaveGroup,
  cancelLeaveGroup,
  
  // Group data
  group
}) => {
  return (
    <>
      {/* Confirmation Modal for Meeting Deletion */}
      {isConfirmDeleteOpen && meetingToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md border-2 border-black p-6">
            <h3 className="text-xl font-bold mb-4">Delete Meeting</h3>
            <p className="mb-6">
              Are you sure you want to delete "{meetingToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmDeleteMeeting}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 transition-colors disabled:opacity-70"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={cancelDeleteMeeting}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Group Deletion */}
      {isConfirmDeleteGroupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md border-2 border-black p-6">
            <h3 className="text-xl font-bold mb-4">Delete Study Group</h3>
            <p className="mb-6">
              Are you sure you want to delete the study group "{group?.name}"? This will permanently delete all meetings and remove all members. This action cannot be undone.
            </p>
            {deleteGroupError && (
              <div className="mb-4 p-3 border-2 border-red-500 bg-red-100 text-red-700">
                {deleteGroupError}
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={confirmDeleteGroup}
                disabled={deleteGroupLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 transition-colors disabled:opacity-70"
              >
                {deleteGroupLoading ? "Deleting..." : "Delete Group"}
              </button>
              <button
                onClick={cancelDeleteGroup}
                disabled={deleteGroupLoading}
                className="flex-1 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Member Removal */}
      {isConfirmRemoveMemberOpen && memberToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md border-2 border-black p-6">
            <h3 className="text-xl font-bold mb-4">Remove Member</h3>
            <p className="mb-6">
              Are you sure you want to remove {memberToRemove.first_name} {memberToRemove.last_name} from the group? They will no longer have access to this group.
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmRemoveMember}
                disabled={removeMemberLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 transition-colors disabled:opacity-70"
              >
                {removeMemberLoading ? "Removing..." : "Remove Member"}
              </button>
              <button
                onClick={cancelRemoveMember}
                disabled={removeMemberLoading}
                className="flex-1 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Leaving Group */}
      {isConfirmLeaveGroupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md border-2 border-black p-6">
            <h3 className="text-xl font-bold mb-4">Leave Group</h3>
            <p className="mb-6">
              Are you sure you want to leave "{group?.name}"? You will no longer have access to this group and its meetings.
            </p>
            {leaveGroupError && (
              <div className="mb-4 p-3 border-2 border-red-500 bg-red-100 text-red-700">
                {leaveGroupError}
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={confirmLeaveGroup}
                disabled={leaveGroupLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 transition-colors disabled:opacity-70"
              >
                {leaveGroupLoading ? "Leaving..." : "Leave Group"}
              </button>
              <button
                onClick={cancelLeaveGroup}
                disabled={leaveGroupLoading}
                className="flex-1 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmationModals;