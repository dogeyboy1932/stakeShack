import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Apartment, Profile } from '@/lib/schema';

interface NoAccessPageProps {
  apartment: Apartment | null;
  apartmentOwnerProfile: Profile | null;
  approvedProfile: Profile | null;
  onRefresh: () => void;
}

export const NoAccessPage: React.FC<NoAccessPageProps> = ({
  apartment,
  apartmentOwnerProfile,
  approvedProfile,
  onRefresh
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-red-100 border border-red-400 rounded-lg p-6 mb-6">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-700 mb-4">
            You don't have permission to access this apartment's escrow system.
          </p>
          {apartment && (
            <div className="text-sm text-red-600 mb-4">
              <p><strong>Apartment:</strong> {apartment.location}</p>
              <p><strong>Rent:</strong> ${apartment.rent}/month</p>
              <p><strong>Owner:</strong> {apartmentOwnerProfile?.username || 'Unknown'}</p>
              {apartment.approved_profile && (
                <p><strong>Approved Tenant:</strong> {approvedProfile?.username || apartment.approved_profile}</p>
              )}
            </div>
          )}
          <p className="text-xs text-red-500">
            Only the apartment owner or approved tenant can access this page.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <WalletMultiButton />
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