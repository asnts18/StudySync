// pages/Group/GroupDetailsSection.jsx
import React from 'react';
import { Users, BookOpen } from 'lucide-react';

const GroupDetailsSection = ({ group }) => {
  return (
    <div className="mb-12 border-2 border-black p-6">
      <h2 className="text-2xl font-semibold mb-4">Group Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Members</p>
            <p className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              {group.current_members}/{group.maxMembers} members
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
  );
};

export default GroupDetailsSection;