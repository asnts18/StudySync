import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JoinGroupPage from './pages/JoinGroupPage';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupPage from './pages/Group/GroupPage';
import CreateMeetingPage from './pages/CreateMeetingPage';
import EditMeetingPage from './pages/EditMeetingPage';
import ProfilePage from './pages/ProfilePage'; 
import ProfileEditPage from './pages/ProfileEditPage';
import Header from './components/Header';  
import Footer from './components/Footer'; 
import { AuthProvider, useAuth } from './contexts/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';

// Create a new component to handle the root route redirection
const RootRedirect = () => {
  const { currentUser } = useAuth();
  
  // If user is logged in, redirect to /home, otherwise show the landing page
  return currentUser ? <Navigate to="/home" replace /> : <LandingPage />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1">
            <Routes>
              {/* Change the root route to use the RootRedirect component */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route path="/home" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/join" element={
                <ProtectedRoute>
                  <JoinGroupPage />
                </ProtectedRoute>
              } />
              <Route path="/create" element={
                <ProtectedRoute>
                  <CreateGroupPage />
                </ProtectedRoute>
              } />
              <Route path="/groups/:groupId" element={
                <ProtectedRoute>
                  <GroupPage />
                </ProtectedRoute>
              } />
              {/* Meeting routes */}
              <Route path="/groups/:groupId/meetings/create" element={
                <ProtectedRoute>
                  <CreateMeetingPage />
                </ProtectedRoute>
              } />
              <Route path="/groups/:groupId/meetings/:meetingId/edit" element={
                <ProtectedRoute>
                  <EditMeetingPage />
                </ProtectedRoute>
              } />
              {/* Profile routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/profile/edit" element={
                <ProtectedRoute>
                  <ProfileEditPage />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;