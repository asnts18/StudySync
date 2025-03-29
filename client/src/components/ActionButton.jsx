import React from 'react';

const ActionButton = ({ children, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="border-2 border-black bg-primary-yellow px-12 py-4 text-xl font-medium hover:bg-dark-yellow transition-colors"
    >
      {children}
    </button>
  );
};

export default ActionButton;