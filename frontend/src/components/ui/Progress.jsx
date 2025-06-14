import React from 'react';

const Progress = ({ value, className = '' }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-4 ${className}`}>
      <div
        className={`h-full rounded-full bg-blue-500`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

export { Progress }; 