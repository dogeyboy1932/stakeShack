import React from 'react';

export const LoadingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-semibold mb-2">Loading Apartment Data... (Gill)</h1>
        <p className="text-gray-600">Using Gill library for Solana operations</p>
      </div>
    </div>
  );
}; 