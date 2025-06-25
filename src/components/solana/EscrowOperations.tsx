import React, { useState, useEffect, useCallback } from 'react';
import { SystemProgram, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createHash } from 'crypto';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/contexts/ProfileContext';
import escrowIdl from '@/lib/escrow-idl.json';
import { Profile } from '@/lib/schema';

// Constants
const PROGRAM_ID = new PublicKey('Edmq5WTFJL5gtwMmD9HdtJ5N14ivXMP4vprvPxRkFZRJ');
const PENALTY_WALLET = new PublicKey('2c8QGXM2tRMh7yb1Zva48ZmQTPMmLZCu159x2hscxxwv');

// Utility functions
const hashString = (input: string): Buffer => {
  return createHash('sha256').update(input).digest();
};

const getApartmentEscrowPDA = (apartmentId: string): PublicKey => {
  const apartmentHash = hashString(apartmentId);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), apartmentHash],
    PROGRAM_ID
  );
  return pda;
};

const getStakeRecordPDA = (apartmentId: string, profileId: string): PublicKey => {
  const apartmentHash = hashString(apartmentId);
  const profileHash = hashString(profileId);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('stake'), apartmentHash, profileHash],
    PROGRAM_ID
  );
  return pda;
};

interface EscrowOperationsProps {
  apartmentId: string;
}

export const EscrowOperations: React.FC<EscrowOperationsProps> = ({ apartmentId }) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { profile } = useProfile();
  
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [apartment, setApartment] = useState<any>(null);
  const [apartmentOwnerProfile, setApartmentOwnerProfile] = useState<Profile | null>(null);
  const [escrowData, setEscrowData] = useState<any>(null);
  const [stakeRecords, setStakeRecords] = useState<any[]>([]);
  const [stakeAmount, setStakeAmount] = useState('');

  // Get program instance
  const getProgram = useCallback(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );
    
    return new Program(escrowIdl as any, provider);
  }, [connection, wallet]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!apartmentId) return;

    setDataLoading(true);
    try {
      // Fetch apartment data
      const { data: apartmentData } = await supabase
        .from('apartments')
        .select('*')
        .eq('id', apartmentId)
        .single();
      
      setApartment(apartmentData);

      // Fetch apartment owner's profile to get their public key
      if (apartmentData?.owner) {
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', apartmentData.owner)
          .single();
        
        setApartmentOwnerProfile(ownerProfile);
      }

      const program = getProgram();
      if (!program) return;

      // Fetch escrow data
      try {
        const escrowPDA = getApartmentEscrowPDA(apartmentId);
        const escrowAccount = await (program.account as any).apartmentEscrow.fetch(escrowPDA);
        setEscrowData(escrowAccount);
      } catch (error) {
        console.log('No escrow found');
        setEscrowData(null);
      }

      // Fetch stake records
      try {
        const accounts = await (program.account as any).stakeRecord.all();
        const filteredAccounts = accounts.filter((account: any) => 
          account.account.apartmentId === apartmentId
        );
        setStakeRecords(filteredAccounts);
      } catch (error) {
        console.error('Error fetching stakes:', error);
        setStakeRecords([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [apartmentId, getProgram]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  
  
  // Initialize apartment
  const handleInitialize = async () => {
    if (!apartmentOwnerProfile?.pubkey) {
      console.log('Apartment owner public key not found');
      return;
    }

    // Debug the pubkey value
    console.log('Owner profile:', apartmentOwnerProfile);
    console.log('Raw pubkey:', apartmentOwnerProfile.pubkey);
    console.log('Pubkey type:', typeof apartmentOwnerProfile.pubkey);
    console.log('Pubkey length:', apartmentOwnerProfile.pubkey?.length);

    // Validate pubkey format
    if (!apartmentOwnerProfile.pubkey || typeof apartmentOwnerProfile.pubkey !== 'string') {
      console.log('Invalid pubkey format - not a string');
      return;
    }

    if (apartmentOwnerProfile.pubkey.length !== 44) {
      console.log('Invalid pubkey length - should be 44 characters for base58');
      return;
    }

    const program = getProgram();
    if (!program || !wallet.publicKey) {
      console.log('Wallet not connected');
      return;
    }

    setInitializing(true);
    try {

      console.log("HERE")

      const apartmentHash = Array.from(hashString(apartmentId));
      console.log(apartmentHash);

      // Try to create PublicKey with validation
      let apartmentOwner: PublicKey;
      try {
        apartmentOwner = new PublicKey(apartmentOwnerProfile.pubkey);
        console.log('PublicKey created successfully:', apartmentOwner.toString());
      } catch (pkError) {
        console.error('Failed to create PublicKey:', pkError);
        console.log('Invalid base58 string:', apartmentOwnerProfile.pubkey);
        return;
      }

      const escrowPDA = getApartmentEscrowPDA(apartmentId);
      console.log(escrowPDA);

      const tx = await program.methods
        .initializeApartment(apartmentHash, apartmentId, apartmentOwner)
        .accounts({
          escrowAccount: escrowPDA,
          initializer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Initialize tx:', tx);
      console.log('Apartment initialized successfully!');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      console.log('Error: ' + error);
    } finally {
      setInitializing(false);
    }
  };




  // Create stake
  const handleStake = async () => {
    if (!profile?.id || !stakeAmount) {
      console.log('Missing profile or stake amount');
      return;
    }

    const program = getProgram();
    if (!program || !wallet.publicKey) {
      console.log('Wallet not connected');
      return;
    }

    setLoading(true);
    try {
      const amount = new BN(parseFloat(stakeAmount) * LAMPORTS_PER_SOL);
      const apartmentHash = Array.from(hashString(apartmentId));
      const profileHash = Array.from(hashString(profile.id));
      
      const escrowPDA = getApartmentEscrowPDA(apartmentId);
      const stakeRecordPDA = getStakeRecordPDA(apartmentId, profile.id);

      const tx = await program.methods
        .stakeForApartment(apartmentHash, amount, profileHash, apartmentId, profile.id)
        .accounts({
          escrowAccount: escrowPDA,
          stakeRecord: stakeRecordPDA,
          staker: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Stake tx:', tx);
      console.log('Stake created successfully!');
      setStakeAmount('');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      console.log('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // Resolve stake
  const handleResolve = async (stakeRecord: any) => {
    if (!apartmentOwnerProfile?.pubkey) {
      console.log('Apartment owner public key not found');
      return;
    }

    // Validate pubkey format
    if (!apartmentOwnerProfile.pubkey || typeof apartmentOwnerProfile.pubkey !== 'string' || apartmentOwnerProfile.pubkey.length !== 44) {
      console.log('Invalid apartment owner pubkey format');
      return;
    }

    const program = getProgram();
    if (!program || !wallet.publicKey) {
      console.log('Wallet not connected');
      return;
    }

    setLoading(true);
    try {
      const apartmentHash = Array.from(hashString(apartmentId));
      const profileHash = Array.from(hashString(stakeRecord.account.tenantProfileId));
      
      let apartmentOwner: PublicKey;
      try {
        apartmentOwner = new PublicKey(apartmentOwnerProfile.pubkey);
      } catch (pkError) {
        console.error('Failed to create apartment owner PublicKey:', pkError);
        return;
      }
      
      const escrowPDA = getApartmentEscrowPDA(apartmentId);
      const stakeRecordPDA = getStakeRecordPDA(apartmentId, stakeRecord.account.tenantProfileId);

      // DEBUG: Check actual account balances before resolve
      const escrowAccountInfo = await connection.getAccountInfo(escrowPDA);
      const stakeRecordAccountInfo = await connection.getAccountInfo(stakeRecordPDA);
      const stakerAccountInfo = await connection.getAccountInfo(stakeRecord.account.staker);
      
      // console.log("=== PRE-RESOLVE DEBUG ===");
      // console.log("Stake Record Amount:", stakeRecord.account.amount.toString());
      // console.log("Escrow Total Staked:", escrowData?.totalStaked?.toString());
      // console.log("Escrow Account Lamports:", escrowAccountInfo?.lamports || 'Account not found');
      // console.log("Stake Record Lamports:", stakeRecordAccountInfo?.lamports || 'Account not found');
      // console.log("Staker Lamports (before):", stakerAccountInfo?.lamports || 'Account not found');
      // console.log("Escrow PDA:", escrowPDA.toString());
      // console.log("Stake Record PDA:", stakeRecordPDA.toString());
      // console.log("Staker:", stakeRecord.account.staker.toString());


      const tx = await program.methods
        .resolveStake(apartmentHash, profileHash, apartmentId, stakeRecord.account.tenantProfileId, apartmentOwner)
        .accounts({
          escrowAccount: escrowPDA,
          stakeRecord: stakeRecordPDA,
          lessor: wallet.publicKey,
          staker: stakeRecord.account.staker,
        })
        .rpc();

      console.log('Resolve tx:', tx);
      console.log('Stake resolved successfully!');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      console.log('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // Slash stake
  const handleSlash = async (stakeRecord: any) => {
    if (!apartmentOwnerProfile?.pubkey) {
      console.log('Apartment owner public key not found');
      return;
    }

    // Validate pubkey format
    if (!apartmentOwnerProfile.pubkey || typeof apartmentOwnerProfile.pubkey !== 'string' || apartmentOwnerProfile.pubkey.length !== 44) {
      console.log('Invalid apartment owner pubkey format');
      return;
    }

    const program = getProgram();
    if (!program || !wallet.publicKey) {
      console.log('Wallet not connected');
      return;
    }

    setLoading(true);
    try {
      const apartmentHash = Array.from(hashString(apartmentId));
      const profileHash = Array.from(hashString(stakeRecord.account.tenantProfileId));
      
      let apartmentOwner: PublicKey;
      try {
        apartmentOwner = new PublicKey(apartmentOwnerProfile.pubkey);
      } catch (pkError) {
        console.error('Failed to create apartment owner PublicKey:', pkError);
        return;
      }
      
      const escrowPDA = getApartmentEscrowPDA(apartmentId);
      const stakeRecordPDA = getStakeRecordPDA(apartmentId, stakeRecord.account.tenantProfileId);

      // DEBUG: Check actual account balances before slash
      const escrowAccountInfo = await connection.getAccountInfo(escrowPDA);
      const stakeRecordAccountInfo = await connection.getAccountInfo(stakeRecordPDA);
      
      console.log("=== PRE-SLASH DEBUG ===");
      console.log("Stake Record Amount:", stakeRecord.account.amount.toString());
      console.log("Escrow Total Staked:", escrowData?.totalStaked?.toString());
      console.log("Escrow Account Lamports:", escrowAccountInfo?.lamports || 'Account not found');
      console.log("Stake Record Lamports:", stakeRecordAccountInfo?.lamports || 'Account not found');
      console.log("Escrow PDA:", escrowPDA.toString());
      console.log("Stake Record PDA:", stakeRecordPDA.toString());

      const tx = await program.methods
        .slashStake(apartmentHash, profileHash, apartmentId, stakeRecord.account.tenantProfileId, apartmentOwner)
        .accounts({
          escrowAccount: escrowPDA,
          stakeRecord: stakeRecordPDA,
          lessor: wallet.publicKey,
          penaltyWallet: PENALTY_WALLET,
        })
        .rpc();

      console.log('Slash tx:', tx);
      console.log('Stake slashed successfully!');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      console.log('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is the apartment owner
  const isOwner = wallet.publicKey && 
                  apartmentOwnerProfile?.pubkey === wallet.publicKey.toString() &&
                  apartment?.owner === profile?.id;

  // console.log(wallet.publicKey?.toString());
  // console.log(apartmentOwnerProfile?.pubkey);
  // console.log(apartment?.owner);
  // console.log(profile?.id);

  // console.log(isOwner);
  // console.log(stakeRecords);



  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Connect Wallet</h1>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  // Show loading while fetching initial data
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold mb-2">Loading Apartment Data...</h1>
          <p className="text-gray-600">Please wait while we fetch the apartment information</p>
        </div>
      </div>
    );
  }

  // Show different states based on escrow initialization and ownership
  if (!escrowData) {
    // Escrow not initialized
    if (isOwner) {
      // Owner needs to initialize
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            {initializing ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                <h1 className="text-2xl font-semibold mb-2">Initializing Escrow...</h1>
                <p className="text-gray-600">Setting up the escrow system for this apartment</p>
              </>
            ) : (
              <>
                <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-6 mb-6">
                  <h1 className="text-2xl font-bold text-yellow-800 mb-2">Escrow Not Initialized</h1>
                  <p className="text-yellow-700 mb-4">
                    As the apartment owner, you need to initialize the escrow system before tenants can stake.
                  </p>
                  {apartment && (
                    <div className="text-sm text-yellow-600 mb-4">
                      <p><strong>Apartment:</strong> {apartment.location}</p>
                      <p><strong>Rent:</strong> ${apartment.rent}/month</p>
                    </div>
                  )}
                  <button
                    onClick={handleInitialize}
                    disabled={!apartmentOwnerProfile?.pubkey}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Initialize Escrow System
                  </button>
                  {!apartmentOwnerProfile?.pubkey && (
                    <p className="text-xs text-red-600 mt-2">
                      No public key found in your profile. Please update your profile.
                    </p>
                  )}
                </div>
                <div className="flex gap-4 justify-center">
                  <WalletMultiButton />
                  <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Refresh
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      );
    } else {
      // Non-owner waiting for initialization
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-blue-100 border border-blue-400 rounded-lg p-6 mb-6">
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-blue-600 rounded-full mx-auto mb-4"></div>
              </div>
              <h1 className="text-2xl font-bold text-blue-800 mb-2">Waiting for Initialization. If you are the owner, please connect to your wallet</h1>
              <p className="text-blue-700 mb-4">
                The escrow system for this apartment hasn't been set up yet. Please wait for the apartment owner to initialize it.
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
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Check Again
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Apartment Escrow</h1>
            <p className="text-gray-600">Apartment: {apartmentId}</p>
            {apartment && (
              <p className="text-sm text-gray-500">
                {apartment.location} • ${apartment.rent}/month
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <WalletMultiButton />
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Staking */}
          <div className="space-y-6">
            {/* Staking */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Create Stake</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Amount in SOL"
                  className="flex-1 px-3 py-2 border rounded-lg"
                  step="0.001"
                />
                <button
                  onClick={handleStake}
                  disabled={loading || !stakeAmount || !profile?.id}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Staking...' : 'Stake'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Profile: {profile?.id} | Apartment: {apartmentId}
              </p>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Escrow Status:</strong> ✅ Active</p>
                <p><strong>Total Staked:</strong> {escrowData.totalStaked ? (escrowData.totalStaked.toNumber() / LAMPORTS_PER_SOL).toFixed(4) : '0'} SOL</p>
                <p><strong>Owner:</strong> {escrowData.lessor?.toString().slice(0, 8)}...</p>
              </div>
            </div>
          </div>

          {/* Right Column: Stakes List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Active Stakes</h3>
            {stakeRecords.length === 0 ? (
              <p className="text-gray-500">No stakes found</p>
            ) : (
              <div className="space-y-4">
                {stakeRecords.map((record, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Profile: {record.account.tenantProfileId}</p>
                        <p className="text-sm text-gray-600">
                          Amount: {(record.account.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL
                        </p>
                        <p className="text-xs text-gray-500">
                          Staker: {record.account.staker.toString().slice(0, 8)}...
                        </p>
                      </div>
                      {isOwner && record.account.isActive && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolve(record)}
                            disabled={loading}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleSlash(record)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
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
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li><strong>Initialize:</strong> Set up escrow with apartment owner's public key</li>
            <li><strong>Stake:</strong> Anyone can deposit SOL mapped to their profile ID</li>
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