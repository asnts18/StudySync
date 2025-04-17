// components/JoinGroupConfirmation.jsx
import React, { useState } from 'react';
import { X, Check, LoaderCircle } from 'lucide-react';
import studyGroupService from '../api/studyGroupService';

const JoinGroupConfirmation = ({ group, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleJoinGroup = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if it's a private or public group
      if (group.is_private) {
        // For private groups, we send a join request
        // This will trigger the tr_AfterJoinRequest trigger which creates a notification for the owner
        await studyGroupService.requestJoinGroup(group.study_group_id);
      } else {
        // For public groups, we join directly
        await studyGroupService.joinGroup(group.study_group_id);
      }
      
      setSuccess(true);
      
      // Notify parent component about successful join
      if (onSuccess) {
        onSuccess(group);
      }
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error joining group:', err);
      
      // Check for specific error message about duplicate request
      if (err.response?.data?.message?.includes('already exists')) {
        setError('You already have a pending request to join this group.');
      } else {
        setError(err.response?.data?.message || 'Failed to join the group. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md border-2 border-black p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">
            {group.is_private ? 'Request to Join Group' : 'Join Group'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 border-2 border-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!success ? (
          <>
            <p className="mb-6">
              {group.is_private 
                ? `This is a private group. Your request to join "${group.name}" will be sent to the group owner for approval.`
                : `You are about to join "${group.name}". You'll have immediate access to the group after joining.`
              }
            </p>
            
            {/* Group details */}
            <div className="mb-6 p-3 border border-gray-200 bg-gray-50">
              <p className="font-medium">{group.name}</p>
              <p className="text-sm text-gray-600">{group.currentMembers}/{group.maxMembers} members</p>
              {group.course_code && (
                <p className="text-sm text-gray-600">
                  {group.course_code}{group.course_name ? `: ${group.course_name}` : ''}
                </p>
              )}
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mb-6 p-3 border border-red-300 bg-red-50 text-red-700">
                {error}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleJoinGroup}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                    {group.is_private ? 'Sending Request...' : 'Joining...'}
                  </>
                ) : (
                  group.is_private ? 'Send Join Request' : 'Join Group'
                )}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-500 mb-4">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-lg font-medium">
              {group.is_private 
                ? 'Join request sent successfully!'
                : 'You have joined the group successfully!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinGroupConfirmation;