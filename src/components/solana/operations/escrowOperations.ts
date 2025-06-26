import { PublicKey, Connection, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { createSolanaClient, address, Address } from 'gill';
import BN from 'bn.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import { hashString } from '../utils/crypto';
import { getApartmentEscrowPDA, getStakeRecordPDA } from '../utils/pda';
import { 
  InitializeApartmentSchema, 
  StakeForApartmentSchema, 
  ResolveStakeSchema, 
  SlashStakeSchema,
  StakeRecordSchema 
} from '../utils/schemas';

const PROGRAM_ID = new PublicKey('Edmq5WTFJL5gtwMmD9HdtJ5N14ivXMP4vprvPxRkFZRJ');
const PENALTY_WALLET = address('2c8QGXM2tRMh7yb1Zva48ZmQTPMmLZCu159x2hscxxwv');

// Create Solana client
const solanaClient = createSolanaClient({ urlOrMoniker: 'devnet' });
const { rpc } = solanaClient;

// Initialize apartment escrow
export const initializeApartment = async (
  apartmentId: string,
  apartmentOwnerPubkey: string,
  wallet: WalletContextState
): Promise<string> => {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error('Wallet not connected');
  }

  const apartmentHash = Array.from(hashString(apartmentId));
  const apartmentOwner = address(apartmentOwnerPubkey);
  const escrowPDA = getApartmentEscrowPDA(apartmentId);

  // Get latest blockhash
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  // Create instruction data
  const buffer = Buffer.alloc(1000);
  InitializeApartmentSchema.encode({
    apartment_hash: apartmentHash,
    apartment_id: apartmentId,
    apartment_owner: new PublicKey(apartmentOwner)
  }, buffer);

  const encodedSize = InitializeApartmentSchema.getSpan(buffer);
  const instructionData = buffer.subarray(0, encodedSize);

  // Create instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: new PublicKey(escrowPDA), isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([163, 134, 140, 192, 15, 6, 227, 23]), // initialize_apartment discriminator
      instructionData
    ]),
    programId: PROGRAM_ID,
  });

  // Create and send transaction
  const transaction = new Transaction();
  transaction.add(instruction);
  transaction.recentBlockhash = latestBlockhash.blockhash;
  transaction.feePayer = wallet.publicKey;

  const connection = new Connection('https://api.devnet.solana.com');
  const signature = await wallet.sendTransaction(transaction, connection);
  
  return signature;
};

// Stake SOL for apartment
export const stakeForApartment = async (
  apartmentId: string,
  amount: number,
  profileId: string,
  wallet: WalletContextState
): Promise<string> => {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error('Wallet not connected');
  }

  const amountLamports = amount * LAMPORTS_PER_SOL;
  const escrowPDA = getApartmentEscrowPDA(apartmentId);
  const stakeRecordPDA = getStakeRecordPDA(apartmentId, profileId);

  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  // Create instruction data
  const buffer = Buffer.alloc(1000);
  StakeForApartmentSchema.encode({
    apartment_hash: Array.from(hashString(apartmentId)),
    amount: new BN(amountLamports),
    profile_hash: Array.from(hashString(profileId)),
    apartment_id: apartmentId,
    tenant_profile_id: profileId
  }, buffer);

  const encodedSize = StakeForApartmentSchema.getSpan(buffer);
  const instructionData = buffer.subarray(0, encodedSize);

  // Create instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: new PublicKey(escrowPDA), isSigner: false, isWritable: true },
      { pubkey: new PublicKey(stakeRecordPDA), isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([254, 32, 189, 253, 3, 2, 123, 132]), // stake_for_apartment discriminator
      instructionData
    ]),
    programId: PROGRAM_ID,
  });

  // Create and send transaction
  const transaction = new Transaction();
  transaction.add(instruction);
  transaction.recentBlockhash = latestBlockhash.blockhash;
  transaction.feePayer = wallet.publicKey;

  const connection = new Connection('https://api.devnet.solana.com');
  const signature = await wallet.sendTransaction(transaction, connection);
  
  return signature;
};

// Resolve stake (return money to tenant)
export const resolveStake = async (
  apartmentId: string,
  stakeRecord: any,
  apartmentOwnerPubkey: string,
  referrerPubkey: string | null,
  rewardAmount: number,
  wallet: WalletContextState
): Promise<string> => {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error('Wallet not connected');
  }

  console.log('=== RESOLVE STAKE DEBUG ===');
  console.log('apartmentId:', apartmentId);
  console.log('stakeRecord:', stakeRecord);
  console.log('apartmentOwnerPubkey:', apartmentOwnerPubkey);
  console.log('referrerPubkey:', referrerPubkey);
  console.log('rewardAmount:', rewardAmount);
  console.log('wallet.publicKey:', wallet.publicKey.toBase58());
  console.log('Connected wallet === apartment owner?', wallet.publicKey.toBase58() === apartmentOwnerPubkey);

  const tenantProfileId = stakeRecord.tenant_profile_id;
  const apartmentHash = Array.from(hashString(apartmentId));
  const profileHash = Array.from(hashString(tenantProfileId));
  
  const apartmentOwner = new PublicKey(apartmentOwnerPubkey);
  const escrowPDA = getApartmentEscrowPDA(apartmentId);
  const stakeRecordPDA = getStakeRecordPDA(apartmentId, tenantProfileId);

  console.log('PDAs:');
  console.log('escrowPDA:', escrowPDA);
  console.log('stakeRecordPDA:', stakeRecordPDA);
  console.log('stakeRecord.staker:', stakeRecord.staker);

  let referrerPublicKey: PublicKey | null = null;
  if (referrerPubkey) {
    referrerPublicKey = new PublicKey(referrerPubkey);
  }

  console.log('Referrer logic:');
  console.log('Has referrerPubkey?', !!referrerPubkey);
  console.log('Final referrer will be:', (referrerPublicKey || apartmentOwner).toBase58());
  console.log('apartmentOwner pubkey:', apartmentOwner.toBase58());

  // Create instruction data
  const buffer = Buffer.alloc(1000);
  const instructionData = {
    apartmentHash,
    profileHash,
    apartmentId,
    tenantProfileId,
    apartmentOwner,
    referrerPubkey: referrerPublicKey,
    rewardAmount: new BN(rewardAmount * LAMPORTS_PER_SOL),
  };
  
  console.log('Instruction data:', instructionData);
  
  ResolveStakeSchema.encode(instructionData, buffer);

  const encodedSize = ResolveStakeSchema.getSpan(buffer);
  const instructionDataBuffer = buffer.subarray(0, encodedSize);

  // Create accounts array - always include all accounts in IDL order
  const accounts = [
    { pubkey: new PublicKey(escrowPDA), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(stakeRecordPDA), isSigner: false, isWritable: true },
    { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
    { pubkey: new PublicKey(stakeRecord.staker), isSigner: false, isWritable: true },
    { 
      pubkey: referrerPublicKey || apartmentOwner, // Use apartment owner as referrer if no actual referrer
      isSigner: false, 
      isWritable: true 
    },
  ];

  console.log('Accounts:', accounts.map(acc => ({
    pubkey: acc.pubkey.toBase58(),
    isSigner: acc.isSigner,
    isWritable: acc.isWritable
  })));

  // Create instruction
  const instruction = new TransactionInstruction({
    keys: accounts,
    programId: PROGRAM_ID,
    data: Buffer.concat([
      Buffer.from([162, 136, 9, 179, 86, 213, 52, 160]), // resolve_stake discriminator
      instructionDataBuffer
    ]),
  });

  console.log('Instruction created:', {
    programId: instruction.programId.toBase58(),
    dataLength: instruction.data.length,
    keysLength: instruction.keys.length
  });

  // Create and send transaction
  const transaction = new Transaction().add(instruction);
  const connection = new Connection('https://api.devnet.solana.com');
  
  console.log('Sending transaction...');
  const signature = await wallet.sendTransaction(transaction, connection);
  console.log('Transaction sent, confirming...');
  await connection.confirmTransaction(signature);

  return signature;
};

// Slash stake (send money to penalty wallet)
export const slashStake = async (
  apartmentId: string,
  stakeRecord: any,
  apartmentOwnerPubkey: string,
  wallet: WalletContextState
): Promise<string> => {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error('Wallet not connected');
  }

  const tenantProfileId = stakeRecord.tenant_profile_id;
  const apartmentHash = Array.from(hashString(apartmentId));
  const profileHash = Array.from(hashString(tenantProfileId));
  
  const apartmentOwner = new PublicKey(apartmentOwnerPubkey);
  const escrowPDA = getApartmentEscrowPDA(apartmentId);
  const stakeRecordPDA = getStakeRecordPDA(apartmentId, tenantProfileId);

  // Create instruction data
  const buffer = Buffer.alloc(1000);
  SlashStakeSchema.encode({
    apartmentHash,
    profileHash,
    apartmentId,
    tenantProfileId,
    apartmentOwner,
  }, buffer);

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
    programId: PROGRAM_ID,
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

  return signature;
};

// Fetch stake records for an apartment
export const fetchStakeRecords = async (apartmentId: string): Promise<any[]> => {
  try {
    const programAccounts = await rpc.getProgramAccounts(address(PROGRAM_ID.toBase58() as Address), {
      encoding: 'base64'
    }).send();

    const stakeRecords = [];
    
    for (const accountInfo of programAccounts) {
      try {
        const buffer = Buffer.from(accountInfo.account.data[0], 'base64');
        
        // Check if this account has the right discriminator for StakeRecord
        const expectedDiscriminator = [174, 163, 11, 208, 150, 236, 11, 205];
        const actualDiscriminator = Array.from(buffer.slice(0, 8));
        
        if (JSON.stringify(actualDiscriminator) === JSON.stringify(expectedDiscriminator)) {
          const accountData = buffer.slice(8);
          const decoded = StakeRecordSchema.decode(accountData);
          
          // Only include stakes for this apartment
          if (decoded.apartment_id === apartmentId) {
            stakeRecords.push({
              ...decoded,
              amount: decoded.amount.toString(),
              address: accountInfo.pubkey
            });
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    return stakeRecords;
  } catch (error) {
    console.error('Error fetching stake records:', error);
    return [];
  }
};

// Check if escrow exists
export const checkEscrowExists = async (apartmentId: string): Promise<boolean> => {
  try {
    const escrowPDA = getApartmentEscrowPDA(apartmentId);
    const { value: escrowAccount } = await rpc.getAccountInfo(escrowPDA, { encoding: 'base64' }).send();
    return escrowAccount !== null;
  } catch (error) {
    return false;
  }
}; 