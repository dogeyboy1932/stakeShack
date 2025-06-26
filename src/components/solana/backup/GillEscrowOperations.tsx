import React, { useState, useEffect, useCallback } from 'react';
import { 
  createSolanaClient, 
  address,
  Address
} from 'gill';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { createHash } from 'crypto';
import { PublicKey, Transaction, TransactionInstruction, SystemProgram, Connection } from '@solana/web3.js';
import * as borsh from '@coral-xyz/borsh';
import BN from 'bn.js';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/contexts/ProfileContext';
import { Apartment, Profile } from '@/lib/schema';
import { getApartmentById } from '@/lib/database';

// Constants
const PROGRAM_ID = new PublicKey('Edmq5WTFJL5gtwMmD9HdtJ5N14ivXMP4vprvPxRkFZRJ');
const PENALTY_WALLET = address('2c8QGXM2tRMh7yb1Zva48ZmQTPMmLZCu159x2hscxxwv');
const LAMPORTS_PER_SOL = 1_000_000_000;

// Utility functions
const hashString = (input: string): Buffer => {
  return createHash('sha256').update(input).digest();
};

// Note: This is a simplified PDA derivation - in practice you'd need proper implementation
// const getApartmentEscrowPDA = async (apartmentId: string): Promise<Address> => {
//   // For demo purposes, create a deterministic but non-existent address
//   // This simulates the escrow not being initialized yet
//   return address('Escr0wNotIn1tia1izedY3tF0rTh1sApar7men7');
// };

// const getStakeRecordPDA = async (apartmentId: string, profileId: string): Promise<Address> => {
//   // For demo purposes, create a deterministic but non-existent address
//   return address('Stak3R3c0rdN0tIn1tia1izedY3tF0rTh1sPr0f1le');
// };

const getApartmentEscrowPDA = (apartmentId: string): Address => {
  const apartmentHash = hashString(apartmentId);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), apartmentHash],
    PROGRAM_ID
  );
  return address(pda.toBase58() as Address);
};

const getStakeRecordPDA = (apartmentId: string, profileId: string): Address => {
  const apartmentHash = hashString(apartmentId);
  const profileHash = hashString(profileId);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('stake'), apartmentHash, profileHash],
    PROGRAM_ID
  );
  return address(pda.toBase58() as Address);
};

// No longer needed - using web3.js TransactionInstruction directly

// Instruction schemas for Borsh serialization
const InitializeApartmentSchema = borsh.struct([
  borsh.array(borsh.u8(), 32, 'apartment_hash'),
  borsh.str('apartment_id'),
  borsh.publicKey('apartment_owner')
]);

const StakeForApartmentSchema = borsh.struct([
  borsh.array(borsh.u8(), 32, 'apartment_hash'),
  borsh.u64('amount'),
  borsh.array(borsh.u8(), 32, 'profile_hash'),
  borsh.str('apartment_id'),
  borsh.str('tenant_profile_id')
]);

// Account data schemas for Borsh deserialization
const StakeRecordSchema = borsh.struct([
  borsh.str('tenant_profile_id'),
  borsh.str('apartment_id'),
  borsh.publicKey('staker'),
  borsh.u64('amount'),
  borsh.bool('is_active'),
  borsh.u8('bump')
]);

const ApartmentEscrowSchema = borsh.struct([
  borsh.str('apartment_id'),
  borsh.publicKey('lessor'),
  borsh.u64('total_staked'),
  borsh.bool('is_active'),
  borsh.u8('bump')
]);

// Add Borsh schemas for resolve and slash instructions
const ResolveStakeSchema = borsh.struct([
  borsh.array(borsh.u8(), 32, 'apartmentHash'),
  borsh.array(borsh.u8(), 32, 'profileHash'),
  borsh.str('apartmentId'),
  borsh.str('tenantProfileId'),
  borsh.publicKey('apartmentOwner'),
  borsh.option(borsh.publicKey(), 'referrerPubkey'),
  borsh.u64('rewardAmount'),
]);

const SlashStakeSchema = borsh.struct([
  borsh.array(borsh.u8(), 32, 'apartmentHash'),
  borsh.array(borsh.u8(), 32, 'profileHash'),
  borsh.str('apartmentId'),
  borsh.str('tenantProfileId'),
  borsh.publicKey('apartmentOwner'),
]);

// Instruction data encoding with proper Borsh serialization
const encodeInstructionData = (instructionName: string, args: any[]): Uint8Array => {
  const discriminators: { [key: string]: number[] } = {
    'initialize_apartment': [163, 134, 140, 192, 15, 6, 227, 23],
    'stake_for_apartment': [254, 32, 189, 253, 3, 2, 123, 132],
    'resolve_stake': [162, 136, 9, 179, 86, 213, 52, 160],
    'slash_stake': [190, 242, 137, 27, 41, 18, 233, 37]
  };

  const discriminator = discriminators[instructionName];
  if (!discriminator) {
    throw new Error(`Unknown instruction: ${instructionName}`);
  }

  let dataBuffer: Uint8Array;

  if (instructionName === 'initialize_apartment') {
    const [apartment_hash, apartment_id, apartment_owner] = args;
    
    // Create a large buffer for encoding
    const buffer = Buffer.alloc(1000);
    InitializeApartmentSchema.encode({
      apartment_hash,
      apartment_id,
      apartment_owner: new PublicKey(apartment_owner)
    }, buffer);
    
    // Get the actual encoded size and slice the buffer
    const encodedSize = InitializeApartmentSchema.getSpan(buffer);
    dataBuffer = buffer.subarray(0, encodedSize);
    
  } else if (instructionName === 'stake_for_apartment') {
    const [apartment_hash, amount, profile_hash, apartment_id, tenant_profile_id] = args;
    
    // Create a large buffer for encoding
    const buffer = Buffer.alloc(1000);
    StakeForApartmentSchema.encode({
      apartment_hash,
      amount: new BN(amount),
      profile_hash,
      apartment_id,
      tenant_profile_id
    }, buffer);
    
    // Get the actual encoded size and slice the buffer
    const encodedSize = StakeForApartmentSchema.getSpan(buffer);
    dataBuffer = buffer.subarray(0, encodedSize);
    
  } else {
    // For other instructions, use simple discriminator for now
    dataBuffer = new Uint8Array(0);
  }

  // Combine discriminator with data
  const result = new Uint8Array(8 + dataBuffer.length);
  result.set(discriminator, 0);
  result.set(dataBuffer, 8);
  
  return result;
};

interface GillEscrowOperationsProps {
  apartmentId: string;
}

export const GillEscrowOperations: React.FC<GillEscrowOperationsProps> = ({ apartmentId }) => {
  const wallet = useWallet();
  const { profile } = useProfile();
  
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [apartmentOwnerProfile, setApartmentOwnerProfile] = useState<Profile | null>(null);
  const [approvedProfile, setApprovedProfile] = useState<Profile | null>(null);
  const [escrowData, setEscrowData] = useState<any>(null);
  const [stakeRecords, setStakeRecords] = useState<any[]>([]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [referrerPubkey, setReferrerPubkey] = useState<string | null>(null);

  // Create Gill Solana client (memoized to prevent recreation)
  const solanaClient = React.useMemo(() => createSolanaClient({
    urlOrMoniker: 'devnet' // Change to mainnet for production
  }), []);
  
  const { rpc, sendAndConfirmTransaction } = solanaClient;
  
  // Create standard web3.js connection for wallet integration
  const connection = React.useMemo(() => new Connection('https://api.devnet.solana.com', 'confirmed'), []);

  // Helper function to fetch stake records for this apartment
  const fetchStakeRecords = useCallback(async (apartmentId: string) => {
    try {
      // Get all program accounts to find stake records
      const programAccounts = await rpc.getProgramAccounts(address(PROGRAM_ID.toBase58() as Address), {
        encoding: 'base64'
      }).send();

      console.log('Found program accounts:', programAccounts.length);
      const stakeRecords = [];
      
      for (const accountInfo of programAccounts) {
        try {
          // Try to decode as stake record
          const buffer = Buffer.from(accountInfo.account.data[0], 'base64');
          
          // Check if this account has the right discriminator for StakeRecord (8 bytes at start)
          const expectedDiscriminator = [174, 163, 11, 208, 150, 236, 11, 205]; // From IDL
          const actualDiscriminator = Array.from(buffer.slice(0, 8));
          
          if (JSON.stringify(actualDiscriminator) === JSON.stringify(expectedDiscriminator)) {
            // Skip discriminator and decode the rest
            const accountData = buffer.slice(8);
            const decoded = StakeRecordSchema.decode(accountData);
            
            // Only include stakes for this apartment
            if (decoded.apartment_id === apartmentId) {
              stakeRecords.push({
                ...decoded,
                amount: decoded.amount.toString(), // Convert BN to string for display
                address: accountInfo.pubkey
              });
            }
          }
        } catch (e) {
          // Skip accounts that can't be decoded as stake records
          continue;
        }
      }
      
      return stakeRecords;
    } catch (error) {
      console.error('Error fetching stake records:', error);
      return [];
    }
  }, [rpc]);

  // Helper function to check if current profile has access
  const checkAccess = useCallback((): boolean => {
    if (!profile?.id || !wallet.publicKey) return false;
    
    const isOwner = apartment?.owner === profile.id;
    const isApproved = apartment?.approved_profile === profile.id;

    return isOwner || isApproved;
  }, [profile, apartment, wallet.publicKey]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!apartmentId) return;

    setDataLoading(true);
    try {
      const apartmentData = await getApartmentById(apartmentId);
      
      if (!apartmentData) {
        console.error('Apartment not found');
        setDataLoading(false);
        return;
      }

      setApartment(apartmentData);

      if (apartmentData?.approved_profile && apartmentData?.referrers_pubkeys) {
        let referrerPubkey: string | undefined;
        
        if (apartmentData.referrers_pubkeys instanceof Map) {
          referrerPubkey = apartmentData.referrers_pubkeys.get(apartmentData.approved_profile);
        } else if (typeof apartmentData.referrers_pubkeys === 'object') {
          referrerPubkey = (apartmentData.referrers_pubkeys as any)[apartmentData.approved_profile];
        }

        setReferrerPubkey(referrerPubkey || null);
      }

      // Fetch apartment owner's profile
      if (apartmentData?.owner) {
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', apartmentData.owner)
          .single();
        
        setApartmentOwnerProfile(ownerProfile);
      }

      // Fetch approved profile if exists
      if (apartmentData?.approved_profile) {
        const { data: approvedProfileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', apartmentData.approved_profile)
          .single();
        
        setApprovedProfile(approvedProfileData);
      }

      // Fetch escrow data using Gill RPC
      try {
        const escrowPDA = getApartmentEscrowPDA(apartmentId);
        const { value: escrowAccount } = await rpc.getAccountInfo(escrowPDA, { encoding: 'base64' }).send();
        
        setEscrowData(escrowAccount);
      } catch (error) {
        console.log('No escrow found');
        setEscrowData(null);
      }

      // Fetch stake records for this apartment
      const stakes = await fetchStakeRecords(apartmentId);
      console.log('Fetched stakes:', stakes);
      setStakeRecords(stakes);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [apartmentId, fetchStakeRecords]);

  useEffect(() => {
    if (apartment && profile && wallet.publicKey) {
      setHasAccess(checkAccess());
    } else {
      setHasAccess(false);
    }
  }, [apartment, profile, wallet.publicKey, checkAccess]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Initialize apartment using Gill
  const handleInitialize = async () => {
    if (!apartmentOwnerProfile?.pubkey || !wallet.publicKey) {
      console.log('Missing required data for initialization');
      return;
    }

    setInitializing(true);
    try {
      const apartmentHash = Array.from(hashString(apartmentId));
      const apartmentOwner = address(apartmentOwnerProfile.pubkey);
      const escrowPDA = getApartmentEscrowPDA(apartmentId);
      const userAddress = address(wallet.publicKey.toString());

      // Get latest blockhash
      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

      // Create instruction data
      const instructionData = encodeInstructionData('initialize_apartment', [
        apartmentHash,
        apartmentId,
        apartmentOwner
      ]);

      // Create standard web3.js transaction instruction
      const initializeInstruction = new TransactionInstruction({
        keys: [
          {
            pubkey: new PublicKey(escrowPDA),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: wallet.publicKey!,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
                 ],
         data: Buffer.from(instructionData),
         programId: PROGRAM_ID,
       });

      // Create standard web3.js transaction
      const transaction = new Transaction();
      transaction.add(initializeInstruction);
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey!;

      // Use wallet to sign and send the transaction
      const signature = await wallet.sendTransaction!(transaction, connection);

      console.log('Initialize tx:', signature);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setInitializing(false);
    }
  };

  // Create stake using Gill
  const handleStake = async () => {
    if (!profile?.id || !stakeAmount || !wallet.publicKey) {
      console.log('Missing profile or stake amount');
      return;
    }

        setLoading(true);
    try {
      const amount = parseFloat(stakeAmount) * LAMPORTS_PER_SOL;
      const userAddress = address(wallet.publicKey.toString());
      
      const escrowPDA = getApartmentEscrowPDA(apartmentId);
      const stakeRecordPDA = getStakeRecordPDA(apartmentId, profile.id);

      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

      const instructionData = encodeInstructionData('stake_for_apartment', [
        Array.from(hashString(apartmentId)),
        amount,
        Array.from(hashString(profile.id)),
        apartmentId,
        profile.id
      ]);

      // Create standard web3.js transaction instruction
      const stakeInstruction = new TransactionInstruction({
        keys: [
          {
            pubkey: new PublicKey(escrowPDA),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: new PublicKey(stakeRecordPDA),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: wallet.publicKey!,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: Buffer.from(instructionData),
        programId: PROGRAM_ID,
      });

      // Create standard web3.js transaction
      const transaction = new Transaction();
      transaction.add(stakeInstruction);
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey!;

      // Use wallet to sign and send the transaction
      const signature = await wallet.sendTransaction!(transaction, connection);

      console.log('Stake tx:', signature);
      setStakeAmount('');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resolve stake (lessor action - tenant fulfilled terms)
  const handleResolve = async (stakeRecord: any) => {
    if (!apartmentOwnerProfile?.pubkey || !wallet.publicKey) {
      console.log('Missing apartment owner public key or wallet not connected');
      return;
    }

    console.log('=== RESOLVE DEBUG ===');
    console.log('stakeRecord:', stakeRecord);
    console.log('apartmentId:', apartmentId);
    console.log('stakeRecord.tenantProfileId:', stakeRecord.tenantProfileId);
    console.log('stakeRecord.account:', stakeRecord.account);
    console.log('stakeRecord.account?.tenantProfileId:', stakeRecord.account?.tenantProfileId);

    setLoading(true);
    try {
      const apartmentHash = Array.from(hashString(apartmentId));
      
      // Check which field actually exists
      let tenantProfileId;
      if (stakeRecord.tenantProfileId) {
        tenantProfileId = stakeRecord.tenantProfileId;
      } else if (stakeRecord.account?.tenantProfileId) {
        tenantProfileId = stakeRecord.account.tenantProfileId;
      } else if (stakeRecord.tenant_profile_id) {
        tenantProfileId = stakeRecord.tenant_profile_id;
      } else {
        console.error('Cannot find tenantProfileId in stake record');
        return;
      }
      
      console.log('Using tenantProfileId:', tenantProfileId);
      const profileHash = Array.from(hashString(tenantProfileId));
      
      let apartmentOwner: PublicKey;
      try {
        apartmentOwner = new PublicKey(apartmentOwnerProfile.pubkey);
      } catch (pkError) {
        console.error('Failed to create apartment owner PublicKey:', pkError);
        return;
      }

      // Prepare referrer parameters
      let referrerPublicKey: PublicKey | null = null;
      const rewardAmount = new BN((apartment?.reward || 0) * LAMPORTS_PER_SOL);
      
      // Get referrer public key if available
      if (referrerPubkey && apartment?.approved_profile) {
        try {
          referrerPublicKey = new PublicKey(referrerPubkey);
          console.log('Referrer pubkey:', referrerPublicKey.toString());
          console.log('Reward amount (SOL):', apartment.reward);
          console.log('Reward amount (lamports):', rewardAmount.toString());
        } catch (error) {
          console.error('Invalid referrer pubkey:', error);
          referrerPublicKey = null;
        }
      }

      const escrowPDA = getApartmentEscrowPDA(apartmentId);
      const stakeRecordPDA = getStakeRecordPDA(apartmentId, tenantProfileId);

      // Create instruction data
      const buffer = Buffer.alloc(1000); // Allocate sufficient buffer
      ResolveStakeSchema.encode({
        apartmentHash,
        profileHash,
        apartmentId,
        tenantProfileId: tenantProfileId,
        apartmentOwner,
        referrerPubkey: referrerPublicKey,
        rewardAmount: rewardAmount,
      }, buffer);
      
      // Get the actual encoded size and slice the buffer
      const encodedSize = ResolveStakeSchema.getSpan(buffer);
      const instructionData = buffer.subarray(0, encodedSize);

      // Create accounts array
      const accounts = [
        { pubkey: new PublicKey(escrowPDA), isSigner: false, isWritable: true },
        { pubkey: new PublicKey(stakeRecordPDA), isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: new PublicKey(stakeRecord.staker), isSigner: false, isWritable: true },
      ];

      // Add referrer account if available
      if (referrerPublicKey) {
        accounts.push({ pubkey: referrerPublicKey, isSigner: false, isWritable: true });
      }

      // Create instruction
      const instruction = new TransactionInstruction({
        keys: accounts,
        programId: new PublicKey(PROGRAM_ID),
        data: Buffer.concat([
          Buffer.from([162, 136, 9, 179, 86, 213, 52, 160]), // resolve_stake discriminator
          instructionData
        ]),
      });

      // Create and send transaction
      const transaction = new Transaction().add(instruction);
      const connection = new Connection('https://api.devnet.solana.com');
      
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      console.log('Resolve tx:', signature);
      console.log('Stake resolved successfully!');
      fetchData();
    } catch (error) {
      console.error('Error resolving stake:', error);
    } finally {
      setLoading(false);
    }
  };

  // Slash stake (lessor action - tenant broke terms)
  const handleSlash = async (stakeRecord: any) => {
    if (!apartmentOwnerProfile?.pubkey || !wallet.publicKey) {
      console.log('Missing apartment owner public key or wallet not connected');
      return;
    }

    console.log('=== SLASH DEBUG ===');
    console.log('stakeRecord:', stakeRecord);

    setLoading(true);
    try {
      const apartmentHash = Array.from(hashString(apartmentId));
      
      // Check which field actually exists
      let tenantProfileId;
      if (stakeRecord.tenantProfileId) {
        tenantProfileId = stakeRecord.tenantProfileId;
      } else if (stakeRecord.account?.tenantProfileId) {
        tenantProfileId = stakeRecord.account.tenantProfileId;
      } else if (stakeRecord.tenant_profile_id) {
        tenantProfileId = stakeRecord.tenant_profile_id;
      } else {
        console.error('Cannot find tenantProfileId in stake record');
        return;
      }
      
      const profileHash = Array.from(hashString(tenantProfileId));
      
      let apartmentOwner: PublicKey;
      try {
        apartmentOwner = new PublicKey(apartmentOwnerProfile.pubkey);
      } catch (pkError) {
        console.error('Failed to create apartment owner PublicKey:', pkError);
        return;
      }

      const escrowPDA = getApartmentEscrowPDA(apartmentId);
      const stakeRecordPDA = getStakeRecordPDA(apartmentId, tenantProfileId);

      // Create instruction data
      const buffer = Buffer.alloc(1000); // Allocate sufficient buffer
      SlashStakeSchema.encode({
        apartmentHash,
        profileHash,
        apartmentId,
        tenantProfileId: tenantProfileId,
        apartmentOwner,
      }, buffer);
      
      // Get the actual encoded size and slice the buffer
      const encodedSize = SlashStakeSchema.getSpan(buffer);
      const instructionData = buffer.subarray(0, encodedSize);

      // Create instruction
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: new PublicKey(escrowPDA), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(stakeRecordPDA), isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: new PublicKey(PENALTY_WALLET), isSigner: false, isWritable: true },
        ],
        programId: new PublicKey(PROGRAM_ID),
        data: Buffer.concat([
          Buffer.from([190, 242, 137, 27, 41, 18, 233, 37]), // slash_stake discriminator
          instructionData
        ]),
      });

      // Create and send transaction
      const transaction = new Transaction().add(instruction);
      const connection = new Connection('https://api.devnet.solana.com');
      
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      console.log('Slash tx:', signature);
      console.log('Stake slashed successfully!');
      fetchData();
    } catch (error) {
      console.error('Error slashing stake:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is the apartment owner
  const isOwner = profile &&
                  apartmentOwnerProfile &&
                  apartmentOwnerProfile.pubkey === wallet.publicKey?.toString() &&
                  apartment?.owner === profile?.id;

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Connect Wallet (Gill Version)</h1>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold mb-2">Loading Apartment Data... (Gill)</h1>
          <p className="text-gray-600">Using Gill library for Solana operations</p>
        </div>
      </div>
    );
  }

  // Show "No Access" page if user doesn't have permission
  if (hasAccess === false) {
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
            <div className="text-xs text-red-500 mb-4">
              <p>Only the apartment owner or approved tenant can access this escrow.</p>
              <p>Your profile: {profile?.username} ({profile?.id?.slice(0, 8)}...)</p>
            </div>
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
              <h1 className="text-2xl font-bold text-blue-800 mb-2">Waiting for Initialization</h1>
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Apartment Escrow</h1>
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
              onClick={fetchData}
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
              <strong>Referer: </strong> 
              <span> 
                {referrerPubkey}
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
                    onClick={handleStake}
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
                        <p className="text-xs text-gray-400">
                          Status: {record.is_active ? '🟢 Active' : '🔴 Inactive'}
                        </p>
                      </div>
                      {isOwner && record.is_active && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleResolve(record)}
                            disabled={loading}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleSlash(record)}
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