import React, { useState } from 'react';
import StudyGroupCard from '../components/StudyGroupCard';
import { ArrowLeft } from 'lucide-react';  // Add this import for the back arrow

const CreatedGroupPage = ({ onBack }) => {
  const [upcomingStudyGroups] = useState([
    {
      name: "For fun study group",
      currentMembers: 1,
      maxMembers: 4,
      meetingTime: "Mon/Wed 4-5:30pm",
      location: "Starbucks Cafe",
      description: "Intro to CS",
      tags: ["Cafe", "Practice Problems", "Homework"]
    }
  ]);

  const [pastStudyGroups] = useState([
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

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-12">
          <button onClick={onBack} className="p-2 border-2 border-black hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-6 h-6" /> {/* The back icon */}
          </button>
        </div>


{/* Welcome Section */}
<div className="flex items-center mb-12 text-left">  {/* Use flexbox to align them side by side */}
  <h1 className="text-4xl font-bold mr-4">Your group has been created!</h1>  {/* Add margin-right for spacing */}
</div>


        {/* Upcoming Study Sessions */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-left">Upcoming Study Sessions</h2>
          <div className="space-y-4">
            {upcomingStudyGroups.map((group, index) => (
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

        {/* Past Sessions */}
        <section>
          <h2 className="text-xl font-semibold mb-6 text-left">Past study sessions</h2>
          <div className="space-y-4">
            {pastStudyGroups.map((group, index) => (
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

export default CreatedGroupPage;  {/* Fix: This should export CreatedGroupPage */}
