import React from 'react';

const VisualizerRoute = ({ children }) => {
  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="rounded-2xl border bg-card shadow-sm p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default VisualizerRoute;

