import { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import JoinGroupPage from './pages/JoinGroupPage';
import CreateGroupPage from './pages/CreateGroupPage';
import CreatedGroupPage from './pages/CreatedGroupPage';
import Header from './components/Header';  
import Footer from './components/Footer'; 

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleJoinGroup = () => {
    setCurrentPage('join');
  };

  const handleCreateGroup = () => {
    setCurrentPage('create');
  };

  const handleCreatedGroup = () => {
    setCurrentPage('created'); // Navigate to CreatedGroupPage
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen flex flex-col">  {/* Ensure the page is always flexible */}
      <Header /> 
      <div className="flex-1">  {/* The main content is flexible */}
        {/* Conditional rendering of pages */}
        {currentPage === 'home' ? (
          <HomePage onJoinGroup={handleJoinGroup} onCreateGroup={handleCreateGroup} />
        ) : currentPage === 'join' ? (
          <JoinGroupPage onBack={handleBack} />
        ) : currentPage === 'create' ? (
          <CreateGroupPage onBack={handleBack} onCreateGroup={handleCreatedGroup} />
        ) : currentPage === 'created' ? (
          <CreatedGroupPage onBack={handleBack}/>
        ) : null}
      </div>
      <Footer />  {/* Footer is always rendered at the bottom */}
    </div>
  );
}

export default App;
