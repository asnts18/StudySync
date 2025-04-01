import React from 'react';
import Logo from './Logo';  // Assuming Logo component is imported correctly

const Header = ({ onBack }) => {
  return (
    <header className="border-b border-gray-200 py-4">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex items-center justify-between">
          {/* Clickable Logo to go back to home */}
          <button onClick={onBack} className="flex items-center space-x-2">
            <Logo className="text-2xl" /> 
          </button>


        </div>
      </div>
    </header>
  );
};

export default Header;
