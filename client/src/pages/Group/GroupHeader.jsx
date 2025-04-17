// pages/Group/GroupHeader.jsx
import React from 'react';
import { ArrowLeft, Edit, Trash2, LogOut } from 'lucide-react';

const GroupHeader = ({ 
  group, 
  isOwner, 
  isCurrentUserMember, 
  navigateBack, 
  onEditGroup, 
  onDeleteGroup, 
  onLeaveGroup 
}) => {
  return (
    <div className="flex items-center justify-between mb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={navigateBack} 
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
      
      <div className="flex gap-2">
        {isOwner ? (
          <>
            <button 
              onClick={onEditGroup}
              className="px-3 py-2 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors text-sm flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit Group
            </button>
            <button 
              onClick={onDeleteGroup}
              className="px-3 py-2 bg-red-500 text-white border-2 border-red-600 hover:bg-red-600 transition-colors text-sm flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete Group
            </button>
          </>
        ) : (
          isCurrentUserMember && (
            <button 
              onClick={onLeaveGroup}
              className="px-3 py-2 bg-red-100 text-red-700 border-2 border-red-200 hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Leave Group
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default GroupHeader;