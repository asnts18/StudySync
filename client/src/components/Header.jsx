import React from 'react';
import Logo from './Logo';  // Assuming Logo component is imported correctly

const Header = ({ onBack }) => {
  return (
    <header className="border-b border-gray-200 py-4">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex items-center justify-between">
          {/* Clickable Logo to go back to home */}
          <button onClick={onBack} className="flex items-center space-x-2">
            <Logo className="text-2xl" />  {/* Assuming your Logo component handles the styling */}
          </button>

          <div className="flex items-center gap-4">
            <div className="relative w-48">
              <select className="w-full border-2 border-black rounded p-2 appearance-none bg-white">
                <option>Tufts University</option>
              </select>
            </div>
            
            <div className="w-10 h-10 border-2 border-black rounded-full overflow-hidden">
              <img 
                src="/api/placeholder/40/40" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
