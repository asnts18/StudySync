import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JoinGroupPage from './pages/JoinGroupPage';
import CreateGroupPage from './pages/CreateGroupPage';
import CreatedGroupPage from './pages/CreatedGroupPage';
import ProfilePage from './pages/ProfilePage'; 
import ProfileEditPage from './pages/ProfileEditPage'; // Import the new ProfileEditPage
import Header from './components/Header';  
import Footer from './components/Footer'; 
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
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
              <Route path="/created" element={
                <ProtectedRoute>
                  <CreatedGroupPage />
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