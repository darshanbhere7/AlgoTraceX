import React from 'react';

const Skeleton = ({ className = '', variant = 'default' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    default: '',
    card: 'h-48',
    text: 'h-4',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
  };

  return <div className={`${baseClasses} ${variants[variant]} ${className}`} />;
};

export default Skeleton;

