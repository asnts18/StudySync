import React from 'react';

const Logo = ({ className = "" }) => {
  return (
    <div className={`font-semibold ${className}`}>
      <span className="text-black">study</span>
      <span className="text-primary-yellow [text-shadow:_1px_1px_1px_rgb(0_0_0)]">sync</span>
    </div>
  );
};

export default Logo;