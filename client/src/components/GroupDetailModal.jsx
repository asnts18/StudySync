// components/GroupDetailModal.jsx
import React from 'react';
import { X, Users, BookOpen, Calendar, Tag } from 'lucide-react';
import { formatDateString } from '../utils/groupUtils';

const GroupDetailModal = ({ group, onClose }) => {
  if (!group) return null;

  // Format the created_at date nicely
  const formattedCreatedDate = group.created_at ? formatDateString(group.created_at) : 'Unknown';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black">
        {/* Header */}
        <div className="border-b-2 border-black p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">{group.name}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 border-2 border-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
        
          {/* Description */}
          <div className="border-2 border-black p-4">
            <h3 className="font-semibold mb-2">About this group</h3>
            <p className="text-gray-700">
              {group.description || "Join us for focused study sessions where we work through course material, practice problems, and prepare for exams together."}
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-black p-4">
              <div className="flex items-center gap-2 text-black">
                <Users className="w-4 h-4" />
                <span className="font-medium">Members</span>
              </div>
              <p className="mt-1 text-left">{group.current_members}/{group.maxMembers} members</p>
            </div>
            
            <div className="border-2 border-black p-4">
              <div className="flex items-center gap-2 text-black">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">Course</span>
              </div>
              <p className="mt-1 text-left">
                {group.course_code ? `${group.course_code}${group.course_name ? `: ${group.course_name}` : ''}` : 'No specific course'}
              </p>
            </div>
          </div>

          {/* Study Style Tags */}
          {group.tags && group.tags.length > 0 && (
            <div className="border-2 border-black p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Study Style
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 border-2 border-black bg-light-orange text-black text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetailModal;