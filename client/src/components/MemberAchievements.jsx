// components/MemberAchievements.jsx
import React, { useState, useEffect } from 'react';
import { Award, Star, LoaderCircle, X } from 'lucide-react';
import achievementService from '../api/achievementService';

const MemberAchievements = ({ memberId, groupId, isOwner, onRevokeSuccess }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  // Fetch member achievements when component mounts or achievements change
  useEffect(() => {
    const fetchMemberAchievements = async () => {
      if (!memberId) return;
      
      setLoading(true);
      try {
        // Fetch achievements for this member
        const userAchievements = await achievementService.getUserAchievements(memberId);
        setAchievements(userAchievements);
      } catch (err) {
        console.error('Error fetching member achievements:', err);
        setError('Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberAchievements();
  }, [memberId, groupId]);

  // Handle revoking an achievement
  const handleRevokeAchievement = async (achievementId) => {
    if (!isOwner || !memberId || !groupId) return;
    
    setRevoking(true);
    setRevokingId(achievementId);
    
    try {
      await achievementService.revokeAchievement(groupId, achievementId, memberId);
      
      // Update local state to remove the revoked achievement
      setAchievements(prev => prev.filter(a => a.achievement_id !== achievementId));
      
      // Notify parent component if callback exists
      if (onRevokeSuccess) {
        onRevokeSuccess();
      }
    } catch (err) {
      console.error('Error revoking achievement:', err);
      setError('Failed to revoke achievement');
    } finally {
      setRevoking(false);
      setRevokingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-2">
        <LoaderCircle className="w-4 h-4 mx-auto animate-spin text-gray-400" />
        <p className="mt-1 text-sm text-gray-500">Loading achievements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No achievements yet
      </div>
    );
  }

  return (
    <div className="mt-2">
      <h4 className="text-sm font-medium mb-1">Achievements:</h4>
      <div className="flex flex-wrap gap-2">
        {achievements.map((achievement) => (
          <div 
            key={achievement.achievement_id} 
            className="inline-flex items-center px-2 py-1 bg-light-orange border border-black text-xs group relative"
            title={achievement.description || achievement.name}
          >
            <Award className="w-3 h-3 mr-1" />
            {achievement.name}
            
            {/* Revoke button (only visible to owner on hover) */}
            {isOwner && (
              <button
                onClick={() => handleRevokeAchievement(achievement.achievement_id)}
                disabled={revoking && revokingId === achievement.achievement_id}
                className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 hover:bg-red-100 rounded-full transition-opacity"
                title="Revoke achievement"
              >
                {revoking && revokingId === achievement.achievement_id ? (
                  <LoaderCircle className="w-3 h-3 animate-spin text-red-600" />
                ) : (
                  <X className="w-3 h-3 text-red-600" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberAchievements;