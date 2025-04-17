// pages/Group/GroupMembers.jsx
import React, { useState } from 'react';
import { UserMinus, AlertCircle, Award } from 'lucide-react';
import AchievementAwardModal from '../../components/achievementAwardModal';
import MemberAchievements from '../../components/MemberAchievements';

const GroupMembers = ({ 
  members, 
  isOwner, 
  currentUserId, 
  groupId,
  removeMemberError, 
  removeMemberSuccess, 
  onRemoveMember 
}) => {
  // State for achievement award modal
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [achievementSuccess, setAchievementSuccess] = useState('');
  const [achievementError, setAchievementError] = useState('');

  // Function to open the award modal
  const handleOpenAwardModal = (member) => {
    setSelectedMember(member);
    setIsAwardModalOpen(true);
  };

  // Function to close the award modal
  const handleCloseAwardModal = () => {
    setIsAwardModalOpen(false);
    setSelectedMember(null);
  };

  // Handle successful achievement award
  const handleAchievementSuccess = () => {
    // Set success message
    setAchievementSuccess('Achievement awarded successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setAchievementSuccess('');
    }, 3000);
  };

  // Handle achievement revoke success
  const handleRevokeSuccess = () => {
    // Set success message
    setAchievementSuccess('Achievement revoked successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setAchievementSuccess('');
    }, 3000);
  };

  return (
    <div className="mb-12 border-2 border-black p-6">
      <h2 className="text-2xl font-semibold mb-4">Members</h2>
      
      {/* Success messages */}
      {removeMemberSuccess && (
        <div className="mb-4 p-3 border-2 border-green-500 bg-green-100 text-green-700">
          {removeMemberSuccess}
        </div>
      )}
      
      {/* Achievement success message */}
      {achievementSuccess && (
        <div className="mb-4 p-3 border-2 border-green-500 bg-green-100 text-green-700">
          {achievementSuccess}
        </div>
      )}
      
      {/* Achievement error message */}
      {achievementError && (
        <div className="mb-4 p-3 border-2 border-red-500 bg-red-100 text-red-700 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span>{achievementError}</span>
        </div>
      )}
      
      {/* Member removal error message */}
      {removeMemberError && (
        <div className="mb-4 p-3 border-2 border-red-500 bg-red-100 text-red-700 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span>{removeMemberError}</span>
        </div>
      )}
      
      {members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <div key={member.user_id} className="border-2 border-black p-4 relative">
              <p className="font-medium">{member.first_name} {member.last_name}</p>
              {member.bio && <p className="text-sm text-gray-600 line-clamp-2">{member.bio}</p>}
              
              {/* Display member achievements */}
              <MemberAchievements 
                memberId={member.user_id} 
                groupId={groupId}
                isOwner={isOwner}
                onRevokeSuccess={handleRevokeSuccess}
              />
              
              {/* Action buttons (only visible to owner) */}
              {isOwner && (
                <div className="absolute top-2 right-2 flex">
                  {/* Award achievement button */}
                  <button 
                    onClick={() => handleOpenAwardModal(member)}
                    className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-full transition-colors mr-1"
                    title="Award achievement"
                  >
                    <Award className="w-4 h-4" />
                  </button>
                  
                  {/* Remove member button (not for themselves) */}
                  {currentUserId !== member.user_id && (
                    <button 
                      onClick={() => onRemoveMember(member)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      title="Remove member"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No members found.</p>
      )}
      
      {/* Achievement Award Modal */}
      <AchievementAwardModal 
        isOpen={isAwardModalOpen}
        onClose={handleCloseAwardModal}
        member={selectedMember}
        groupId={groupId}
        onSuccess={handleAchievementSuccess}
      />
    </div>
  );
};

export default GroupMembers;