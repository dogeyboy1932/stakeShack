import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Apartment, Profile } from '@/lib/schema';

interface WaitingForInitializationPageProps {
  apartment: Apartment | null;
  apartmentOwnerProfile: Profile | null;
  onRefresh: () => void;
  onInitialize: () => void;
  isOwner: boolean;
  initializing: boolean;
}

export const WaitingForInitializationPage: React.FC<WaitingForInitializationPageProps> = ({
  apartment,
  apartmentOwnerProfile,
  onRefresh,
  onInitialize,
  isOwner,
  initializing
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-blue-100 border border-blue-400 rounded-lg p-6 mb-6">
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-blue-600 rounded-full mx-auto mb-4"></div>
          </div>
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Waiting for Initialization</h1>
          <p className="text-blue-700 mb-4">
            The escrow system for this apartment hasn't been set up yet. 
            {isOwner 
              ? ' Click the button below to initialize it now.'
              : ' Please wait for the apartment owner to initialize it.'
            }
          </p>
          {apartment && (
            <div className="text-sm text-blue-600 mb-4">
              <p><strong>Apartment:</strong> {apartment.location}</p>
              <p><strong>Rent:</strong> ${apartment.rent}/month</p>
              <p><strong>Owner:</strong> {apartmentOwnerProfile?.username || 'Unknown'}</p>
            </div>
          )}
        </div>
        <div className="flex gap-4 justify-center">
          <WalletMultiButton />
          {isOwner && (
            <button
              onClick={onInitialize}
              disabled={initializing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {initializing ? 'Initializing...' : 'Initialize Escrow'}
            </button>
          )}
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Check Again
          </button>
        </div>
      </div>
    </div>
  );
}; 