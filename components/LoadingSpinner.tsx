
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-t-primary border-gray-200 dark:border-gray-600 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
