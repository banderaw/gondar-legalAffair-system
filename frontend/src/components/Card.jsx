import React from 'react';

const Card = ({ children, className = '', elevation = 'default' }) => {
  const elevations = {
    default: 'shadow-card',
    elevated: 'shadow-elevated',
  };
  
  return (
    <div className={`bg-surface border border-border rounded-lg ${elevations[elevation]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
