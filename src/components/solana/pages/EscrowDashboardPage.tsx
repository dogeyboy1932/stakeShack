import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Apartment, Profile } from '@/lib/schema';

interface EscrowDashboardPageProps {
  apartmentId: string;
  apartment: Apartment | null;
  apartmentOwnerProfile: Profile | null;
  approvedProfile: Profile | null;
  profile: Profile | null;
  escrowData: any;
  stakeRecords: any[];
  stakeAmount: string;
  setStakeAmount: (amount: string) => void;
  loading: boolean;
  isOwner: boolean;
  referrerPubkey: string | null;
  onRefresh: () => void;
  onStake: () => void;
  onResolve: (record: any) => void;
  onSlash: (record: any) => void;
}

export const EscrowDashboardPage: React.FC<EscrowDashboardPageProps> = ({
  apartmentId,
  apartment,
  apartmentOwnerProfile,
  approvedProfile,
  profile,
  escrowData,
  stakeRecords,
  stakeAmount,
  setStakeAmount,
  loading,
  isOwner,
  referrerPubkey,
  onRefresh,
  onStake,
  onResolve,
  onSlash
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Apartment Escrow (Gill Version)</h1>
            <p className="text-gray-600">Apartment: {apartmentId}</p>
            {apartment && (
              <p className="text-sm text-gray-500">
                {apartment.location} • ${apartment.rent}/month
              </p>
            )}
            {referrerPubkey && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Referred by:</strong> {referrerPubkey}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <WalletMultiButton />
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Access Status */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-blue-700 font-medium mb-2">🔍 Access Status</h3>
          <div className="text-sm space-y-1">
            <p><strong>Your Profile:</strong> <span className="font-mono text-blue-800">{profile?.username} ({profile?.id?.slice(0, 8)}...)</span></p>
            <p><strong>Is Owner:</strong> <span className={isOwner ? "text-green-600" : "text-red-600"}>{isOwner ? "Yes" : "No"}</span></p>
            <p><strong>Approved Tenant:</strong> {apartment?.approved_profile ? (
              <span className={apartment.approved_profile === profile?.id ? "text-green-600" : "text-gray-600"}>
                {approvedProfile?.username || apartment.approved_profile} {apartment.approved_profile === profile?.id && "(You)"}
              </span>
            ) : (
              <span className="text-gray-400">None</span>
            )}</p>
            <p>
              <strong>Referrer: </strong> 
              <span> 
                {referrerPubkey || 'None'}
              </span>
            </p>
          </div>
        </div>

        {/* Escrow Status */}
        {escrowData && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-green-700 font-medium mb-2">✅ Escrow Active</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>Total Staked:</strong> {escrowData.totalStaked ? (escrowData.totalStaked.toNumber() / LAMPORTS_PER_SOL).toFixed(4) : '0'} SOL</p>
              <p><strong>Owner:</strong> {escrowData.lessor?.toString().slice(0, 8)}...</p>
              <p><strong>Active Stakes:</strong> {stakeRecords.length}</p>
              <p><strong>Status:</strong> {escrowData.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        )}

        {/* Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staking */}
          {escrowData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Create Stake</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Amount in SOL"
                    className="flex-1 px-3 py-2 border rounded-lg"
                    step="0.001"
                    min="0"
                  />
                  <button
                    onClick={onStake}
                    disabled={loading || !stakeAmount || !profile?.id}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Staking...' : 'Stake'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Profile: {profile?.username} ({profile?.id?.slice(0, 8)}...)
                </p>
              </div>
            </div>
          )}

          {/* Stakes List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Active Stakes</h3>
            {stakeRecords.length === 0 ? (
              <p className="text-gray-500">No stakes found</p>
            ) : (
              <div className="space-y-3">
                {stakeRecords.map((record, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">Profile: {record.tenant_profile_id}</p>
                        <p className="text-sm text-gray-600">
                          Amount: {(parseFloat(record.amount) / LAMPORTS_PER_SOL).toFixed(4)} SOL
                        </p>
                        <p className="text-xs text-gray-500">
                          Staker: {record.staker.toString().slice(0, 8)}...
                        </p>
                      </div>
                      {isOwner && record.is_active && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => onResolve(record)}
                            disabled={loading}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => onSlash(record)}
                            disabled={loading}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Slash
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li><strong>Initialize:</strong> Apartment owner sets up escrow with their public key</li>
            <li><strong>Access Control:</strong> Only owner or approved tenant (from database) can access</li>
            <li><strong>Stake:</strong> Approved users can deposit SOL mapped to their profile ID</li>
            <li><strong>Resolve/Slash:</strong> Only apartment owner can return money or send to penalty wallet</li>
          </ol>
          {apartmentOwnerProfile && (
            <div className="mt-3 p-3 bg-yellow-100 rounded text-sm text-yellow-800">
              <strong>Owner:</strong> {apartmentOwnerProfile.username || 'Unknown'}
              <br />
              <strong>Owner Wallet:</strong> {apartmentOwnerProfile.pubkey?.slice(0, 8)}...{apartmentOwnerProfile.pubkey?.slice(-8)}
              {isOwner && <span className="ml-2 text-green-700">(You are the owner)</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 