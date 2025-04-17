// pages/Group/GroupMembers.jsx
import React from 'react';
import { UserMinus, AlertCircle } from 'lucide-react';

const GroupMembers = ({ 
  members, 
  isOwner, 
  currentUserId, 
  removeMemberError, 
  removeMemberSuccess, 
  onRemoveMember 
}) => {
  return (
    <div className="mb-12 border-2 border-black p-6">
      <h2 className="text-2xl font-semibold mb-4">Members</h2>
      
      {/* Success message */}
      {removeMemberSuccess && (
        <div className="mb-4 p-3 border-2 border-green-500 bg-green-100 text-green-700">
          {removeMemberSuccess}
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
              
              {/* Remove member button (only visible to owner and not for themselves) */}
              {isOwner && currentUserId !== member.user_id && (
                <button 
                  onClick={() => onRemoveMember(member)}
                  className="absolute top-2 right-2 p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  title="Remove member"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No members found.</p>
      )}
    </div>
  );
};

export default GroupMembers;