// components/StudyGroupCard.jsx
import React from 'react';
import { Users, BookOpen, Star, Lock, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const StudyGroupCard = ({ 
  group, 
  showViewMoreButton = true, 
  showJoinButton = true,
  onViewMore,
  onJoinGroup
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the JoinGroupPage
  const isJoinPage = location.pathname === '/join';
  
  // Ensure consistent boolean interpretation of is_private
  const isPrivate = group.is_private === 1 || group.is_private === true;
  
  // Ensure consistent boolean interpretation of is_owner
  const isOwner = group.is_owner === 1 || group.is_owner === true;

  const handleViewGroup = () => {
    navigate(`/groups/${group.study_group_id}`);
  };

  return (
    <div className="border-2 border-black p-4 flex justify-between items-start gap-4">
      <div className="flex-1">
        <div className="text-left mb-3 flex items-center gap-2">
          <h3 className="text-xl font-semibold">{group.name}</h3>
          {isOwner && (
            <span className="flex items-center text-sm bg-primary-yellow px-2 py-1 border border-black">
              <Star className="w-3 h-3 mr-1" /> Owner
            </span>
          )}
          {/* Privacy indicator */}
          <span className={`flex items-center text-sm px-2 py-1 border border-black ml-auto ${
            isPrivate ? "bg-gray-100" : "bg-light-orange"
          }`}>
            {isPrivate ? (
              <><Lock className="w-3 h-3 mr-1" /> Private</>
            ) : (
              <><Globe className="w-3 h-3 mr-1" /> Public</>
            )}
          </span>
        </div>

        {/* Group details with reduced info */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4" />
            <span>{group.currentMembers}/{group.maxMembers} members</span>
          </div>
          {group.course_code && (
            <div className="flex items-center gap-2 text-gray-700">
              <BookOpen className="w-4 h-4" />
              <span>{group.course_code}{group.course_name ? `: ${group.course_name}` : ''}</span>
            </div>
          )}
        </div>

        {/* Description section - can be added if needed */}
        {group.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0">
        {showViewMoreButton && (
          <button 
            onClick={() => onViewMore?.(group)}
            className="px-4 py-2 border-2 border-black text-black hover:bg-gray-200 transition-colors"
          >
            {isJoinPage ? "See Details" : "View Group"}
          </button>
        )}
        {showJoinButton && !isOwner && (
          <button 
            onClick={() => onJoinGroup?.(group)}
            className="px-4 py-2 border-2 border-black bg-primary-yellow text-black hover:bg-dark-yellow transition-colors"
          >
            Join Group
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyGroupCard;