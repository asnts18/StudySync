import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudyGroupCard from '../components/StudyGroupCard';
import ActionButton from '../components/ActionButton';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const [userName, setUserName] = useState('');
  const [currentStudyGroups] = useState([
    {
      name: "Comp11 study group",
      currentMembers: 3,
      maxMembers: 5,
      meetingTime: "Tue/Thu 3-5pm",
      location: "Library",
      description: "CS-0011 - Intro to Computer Science",
      tags: ["Intro Level", "Programming"]
    }
  ]);

  // Update username when currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.first_name) {
      setUserName(currentUser.first_name);
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Welcome Section */}
        <h1 className="text-4xl font-bold mb-12 text-left">
          {loading ? (
            "Loading..."
          ) : userName ? (
            `welcome back, ${userName}!`
          ) : (
            "welcome back!"
          )}
        </h1>

        {/* Action Buttons */}
        <div className="flex gap-6 mb-16">
          <ActionButton onClick={() => navigate('/join')}>
            find a study group
          </ActionButton>
          <ActionButton onClick={() => navigate('/create')}>
            create a study group
          </ActionButton>
        </div>

        {/* Past Sessions */}
        <section>
          <h2 className="text-xl mb-6 text-left">Past study sessions</h2>
          <div className="space-y-4">
            {currentStudyGroups.map((group, index) => (
              <StudyGroupCard
                key={index}
                group={group}
                showViewMoreButton={false}
                showJoinButton={false}
                onViewMore={(group) => console.log('View more:', group.name)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;