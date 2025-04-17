// components/StudyGroupCard.jsx
import React from 'react';
import { Users, BookOpen, Star, Lock, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const StudyGroupCard = ({ 
  group, 
  showViewMoreButton = true, 
  showJoinButton = true,
  isJoined = false,
  isPending = false,
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
    if (isJoined || isOwner) {
      // If already joined or owner, navigate directly to group page
      navigate(`/groups/${group.study_group_id}`);
    } else if (onViewMore) {
      // Otherwise use the view more function (typically shows modal)
      onViewMore(group);
    }
  };
  
  // Determine button state and text based on group membership status
  const getJoinButtonState = () => {
    if (isJoined) {
      return {
        text: "Joined",
        className: "bg-green-100 text-green-800 hover:bg-green-200 cursor-not-allowed opacity-80",
        disabled: true
      };
    } else if (isPending) {
      return {
        text: "Pending",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-not-allowed opacity-80",
        disabled: true
      };
    } else {
      return {
        text: "Join Group",
        className: "bg-primary-yellow text-black hover:bg-dark-yellow",
        disabled: false
      };
    }
  };
  
  const buttonState = getJoinButtonState();

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
            <span>{group.current_members}/{group.maxMembers} members</span>
          </div>
          {group.course_code && (
            <div className="flex items-center gap-2 text-gray-700">
              <BookOpen className="w-4 h-4" />
              <span>{group.course_code}{group.course_name ? `: ${group.course_name}` : ''}</span>
            </div>
          )}
        </div>
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
        {/* Always show the button, but its state changes based on status */}
        {showJoinButton && !isOwner && (
          <button 
            onClick={() => !buttonState.disabled && onJoinGroup?.(group)}
            disabled={buttonState.disabled}
            className={`px-4 py-2 border-2 border-black ${buttonState.className} transition-colors`}
          >
            {buttonState.text}
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyGroupCard;