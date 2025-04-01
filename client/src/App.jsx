import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import JoinGroupPage from './pages/JoinGroupPage';
import CreateGroupPage from './pages/CreateGroupPage';
import CreatedGroupPage from './pages/CreatedGroupPage';
import Header from './components/Header';  
import Footer from './components/Footer'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/join" element={<JoinGroupPage />} />
            <Route path="/create" element={<CreateGroupPage />} />
            <Route path="/created" element={<CreatedGroupPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;