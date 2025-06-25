'use client';

import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   Connection, 
//   PublicKey, 
//   SystemProgram, 
//   LAMPORTS_PER_SOL,
// } from '@solana/web3.js';
// import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { useProfile } from '@/contexts/ProfileContext';

// // Import IDL from separate file
// import escrowIdl from '@/lib/escrow-idl.json';

// // Program ID from your smart contract
// const PROGRAM_ID = new PublicKey('Edmq5WTFJL5gtwMmD9HdtJ5N14ivXMP4vprvPxRkFZRJ');
// const PENALTY_WALLET = new PublicKey('2c8QGXM2tRMh7yb1Zva48ZmQTPMmLZCu159x2hscxxwv');

// interface ApartmentEscrow {
//   apartmentId: BN;
//   lessor: PublicKey;
//   totalStaked: BN;
//   isActive: boolean;
//   bump: number;
// }

// interface StakeRecord {
//   tenantProfileId: BN;
//   apartmentId: BN;
//   staker: PublicKey;
//   amount: BN;
//   isActive: boolean;
//   bump: number;
// }

export default function EscrowPage() {
  // const { connection } = useConnection();
  // const wallet = useWallet();
  // const { profile } = useProfile();
  
  // const [program, setProgram] = useState<Program | null>(null);
  // const [apartmentEscrows, setApartmentEscrows] = useState<Map<string, ApartmentEscrow>>(new Map());
  // const [stakeRecords, setStakeRecords] = useState<Map<string, StakeRecord>>(new Map());
  // const [loading, setLoading] = useState(false);
  
  // // Form states
  // const [apartmentId, setApartmentId] = useState('1'); // Default apartment
  // const [stakeAmount, setStakeAmount] = useState('');
  // const [selectedTenantId, setSelectedTenantId] = useState('');
  // const [selectedApartmentForAction, setSelectedApartmentForAction] = useState('');

  // // Initialize program when wallet connects
  // useEffect(() => {
  //   if (wallet.publicKey && wallet.signTransaction) {
  //     const provider = new AnchorProvider(
  //       connection,
  //       {
  //         publicKey: wallet.publicKey,
  //         signTransaction: wallet.signTransaction,
  //         signAllTransactions: wallet.signAllTransactions,
  //       } as any,
  //       { commitment: 'confirmed' }
  //     );
  //     const programInstance = new Program(escrowIdl as any, provider);
  //     setProgram(programInstance);
  //   }
  // }, [wallet, connection]);

  // // Get apartment escrow PDA
  // const getApartmentEscrowPDA = useCallback((apartmentId: string) => {
  //   const apartmentBytes = new BN(apartmentId).toArrayLike(Buffer, 'le', 8);
  //   return PublicKey.findProgramAddressSync(
  //     [Buffer.from('escrow'), apartmentBytes],
  //     PROGRAM_ID
  //   )[0];
  // }, []);

  // // Get stake record PDA
  // const getStakeRecordPDA = useCallback((apartmentId: string, tenantProfileId: string) => {
  //   const apartmentBytes = new BN(apartmentId).toArrayLike(Buffer, 'le', 8);
  //   const tenantBytes = new BN(tenantProfileId).toArrayLike(Buffer, 'le', 8);
  //   return PublicKey.findProgramAddressSync(
  //     [Buffer.from('stake'), apartmentBytes, tenantBytes],
  //     PROGRAM_ID
  //   )[0];
  // }, []);

  // // Check if escrow exists for apartment
  // const checkEscrowExists = useCallback(async (apartmentId: string) => {
  //   if (!program) return false;
    
  //   try {
  //     const escrowPDA = getApartmentEscrowPDA(apartmentId);
  //     const accountInfo = await (program.account as any).apartmentEscrow.fetch(escrowPDA);
  //     return !!accountInfo;
  //   } catch (error) {
  //     return false;
  //   }
  // }, [program, getApartmentEscrowPDA]);

  // // Note: Auto-initialization is now handled automatically in the contract

  // // Fetch apartment escrow data
  // const fetchApartmentEscrow = useCallback(async (apartmentId: string) => {
  //   if (!program) return;
    
  //   try {
  //     const escrowPDA = getApartmentEscrowPDA(apartmentId);
  //     const accountInfo = await (program.account as any).apartmentEscrow.fetch(escrowPDA);
      
  //     const escrowData: ApartmentEscrow = {
  //       apartmentId: accountInfo.apartmentId,
  //       lessor: accountInfo.lessor,
  //       totalStaked: accountInfo.totalStaked,
  //       isActive: accountInfo.isActive,
  //       bump: accountInfo.bump
  //     };
      
  //     setApartmentEscrows(prev => new Map(prev.set(apartmentId, escrowData)));
  //   } catch (error) {
  //     console.log('Escrow account not found for apartment', apartmentId);
  //   }
  // }, [program, getApartmentEscrowPDA]);

  // // Fetch stake records for apartment
  // const fetchStakeRecordsForApartment = useCallback(async (apartmentId: string) => {
  //   if (!program) return;
    
  //   try {
  //     const accounts = await (program.account as any).stakeRecord.all();
      
  //     for (const account of accounts) {
  //       const key = `${account.account.apartmentId}-${account.account.tenantProfileId}`;
  //       setStakeRecords(prev => new Map(prev.set(key, {
  //         tenantProfileId: account.account.tenantProfileId,
  //         apartmentId: account.account.apartmentId,
  //         staker: account.account.staker,
  //         amount: account.account.amount,
  //         isActive: account.account.isActive,
  //         bump: account.account.bump
  //       })));
  //     }
  //   } catch (error) {
  //     console.error('Error fetching stake records:', error);
  //   }
  // }, [program]);

  // // Create stake (escrow auto-initializes if needed)
  // const createStake = async () => {
  //   if (!program || !wallet.publicKey || !stakeAmount || !apartmentId || !profile) return;
    
  //   setLoading(true);
  //   try {
  //     const tenantProfileId = profile.id.toString();
      
  //     const amount = new BN(parseFloat(stakeAmount) * LAMPORTS_PER_SOL);
  //     const escrowPDA = getApartmentEscrowPDA(apartmentId);
  //     const stakeRecordPDA = getStakeRecordPDA(apartmentId, tenantProfileId);
      
  //     const tx = await program.methods
  //       .stakeForApartment(new BN(apartmentId), amount, new BN(tenantProfileId))
  //       .accounts({
  //         escrowAccount: escrowPDA,
  //         stakeRecord: stakeRecordPDA,
  //         staker: wallet.publicKey,
  //         systemProgram: SystemProgram.programId,
  //       })
  //       .rpc();
        
  //     console.log('Stake transaction (auto-initialized):', tx);
  //     setStakeAmount('');
      
  //     // Refresh data
  //     await Promise.all([
  //       fetchApartmentEscrow(apartmentId),
  //       fetchStakeRecordsForApartment(apartmentId)
  //     ]);
  //   } catch (error) {
  //     console.error('Error creating stake:', error);
  //     alert('Error creating stake: ' + error);
  //   }
  //   setLoading(false);
  // };

  // // Slash stake
  // const slashStake = async (apartmentId: string, tenantProfileId: string) => {
  //   if (!program || !wallet.publicKey) return;
    
  //   setLoading(true);
  //   try {
  //     const escrowPDA = getApartmentEscrowPDA(apartmentId);
  //     const stakeRecordPDA = getStakeRecordPDA(apartmentId, tenantProfileId);
      
  //     const tx = await program.methods
  //       .slashStake(new BN(apartmentId), new BN(tenantProfileId))
  //       .accounts({
  //         escrowAccount: escrowPDA,
  //         stakeRecord: stakeRecordPDA,
  //         lessor: wallet.publicKey,
  //         penaltyWallet: PENALTY_WALLET,
  //       })
  //       .rpc();
        
  //     console.log('Slash stake transaction:', tx);
      
  //     // Refresh data
  //     await Promise.all([
  //       fetchApartmentEscrow(apartmentId),
  //       fetchStakeRecordsForApartment(apartmentId)
  //     ]);
  //   } catch (error) {
  //     console.error('Error slashing stake:', error);
  //     alert('Error slashing stake: ' + error);
  //   }
  //   setLoading(false);
  // };

  // // Resolve stake
  // const resolveStake = async (apartmentId: string, tenantProfileId: string, stakerKey: PublicKey) => {
  //   if (!program || !wallet.publicKey) return;
    
  //   setLoading(true);
  //   try {
  //     const escrowPDA = getApartmentEscrowPDA(apartmentId);
  //     const stakeRecordPDA = getStakeRecordPDA(apartmentId, tenantProfileId);
      
  //     const tx = await program.methods
  //       .resolveStake(new BN(apartmentId), new BN(tenantProfileId))
  //       .accounts({
  //         escrowAccount: escrowPDA,
  //         stakeRecord: stakeRecordPDA,
  //         lessor: wallet.publicKey,
  //         staker: stakerKey,
  //       })
  //       .rpc();
        
  //     console.log('Resolve stake transaction:', tx);
      
  //     // Refresh data
  //     await Promise.all([
  //       fetchApartmentEscrow(apartmentId),
  //       fetchStakeRecordsForApartment(apartmentId)
  //     ]);
  //   } catch (error) {
  //     console.error('Error resolving stake:', error);
  //     alert('Error resolving stake: ' + error);
  //   }
  //   setLoading(false);
  // };

  // // Refresh data
  // const refreshData = useCallback(async () => {
  //   if (!apartmentId) return;
  //   await Promise.all([
  //     fetchApartmentEscrow(apartmentId),
  //     fetchStakeRecordsForApartment(apartmentId)
  //   ]);
  // }, [apartmentId, fetchApartmentEscrow, fetchStakeRecordsForApartment]);

  // useEffect(() => {
  //   if (program && apartmentId) {
  //     refreshData();
  //   }
  // }, [program, apartmentId, refreshData]);

  // if (!wallet.connected) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-3xl font-bold text-gray-900 mb-8">Apartment Escrow System</h1>
  //         <WalletMultiButton className="bg-purple-600 hover:bg-purple-700" />
  //       </div>
  //     </div>
  //   );
  // }

  // const currentEscrow = apartmentEscrows.get(apartmentId);
  // const currentStakes = Array.from(stakeRecords.entries()).filter(([key]) => 
  //   key.startsWith(apartmentId + '-')
  // );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      HI
    </div>
  );
} 




// {/* <div className="max-w-6xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Apartment Escrow System</h1>
//           <div className="flex gap-4">
//             <WalletMultiButton className="bg-purple-600 hover:bg-purple-700" />
//             <button
//               onClick={refreshData}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//               disabled={loading}
//             >
//               Refresh Data
//             </button>
//           </div>
//         </div>

//         {/* Redirect Message */}
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
//           <h2 className="text-xl font-bold text-blue-900 mb-4">🏠 Apartment-Specific Escrow</h2>
//           <p className="text-blue-800 mb-4">
//             The escrow system now uses apartment-specific URLs. Each apartment has its own escrow page.
//           </p>
//           <div className="bg-white border border-blue-300 rounded-lg p-4">
//             <h3 className="font-semibold text-blue-900 mb-2">How to Access:</h3>
//             <ul className="list-disc list-inside text-blue-700 space-y-1">
//               <li>Go to an apartment page and click "Initialize Escrow" button</li>
//               <li>Or visit directly: <code className="bg-blue-100 px-2 py-1 rounded">/escrow/[apartmentId]</code></li>
//               <li>Example: <code className="bg-blue-100 px-2 py-1 rounded">/escrow/1</code> for apartment 1</li>
//             </ul>
//           </div>
//         </div>

//         {/* Quick Access */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//           <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h2>
//           <div className="flex gap-4 items-center">
//             <label className="font-medium">Go to apartment:</label>
//             <input
//               type="text"
//               value={apartmentId}
//               onChange={(e) => setApartmentId(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               placeholder="Enter apartment ID"
//             />
//             <button
//               onClick={() => window.location.href = `/escrow/${apartmentId}`}
//               disabled={!apartmentId}
//               className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
//             >
//               Go to Escrow
//             </button>
//           </div>
//           <p className="text-sm text-gray-600 mt-2">
//             Profile ID: {profile?.id || 'Loading...'}
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Escrow Management */}
//           <div className="bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Staking Interface</h2>
            
//             {/* Show escrow details if exists */}
//             {currentEscrow && (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
//                 <h3 className="font-semibold text-green-800 mb-2">Escrow Details</h3>
//                 <p className="text-sm text-green-700">
//                   <span className="font-medium">Apartment:</span> {currentEscrow.apartmentId.toString()}
//                 </p>
//                 <p className="text-sm text-green-700">
//                   <span className="font-medium">Lessor:</span> {currentEscrow.lessor.toString().slice(0, 8)}...
//                 </p>
//                 <p className="text-sm text-green-700">
//                   <span className="font-medium">Total Staked:</span> {(currentEscrow.totalStaked.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL
//                 </p>
//                 <p className="text-sm text-green-700">
//                   <span className="font-medium">Status:</span> {currentEscrow.isActive ? 'Active' : 'Inactive'}
//                 </p>
//               </div>
//             )}

//             {/* Show ready message if no escrow yet */}
//             {!currentEscrow && (
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//                 <h3 className="font-semibold text-blue-800 mb-2">🚀 Ready to Stake!</h3>
//                 <p className="text-sm text-blue-700">
//                   No escrow exists yet for apartment {apartmentId}. When you create your first stake, 
//                   the escrow will automatically initialize and your SOL will be deposited to the contract.
//                 </p>
//               </div>
//             )}

//             {/* Stake Creation - Always visible */}
//             <div className="border-t pt-4">
//               <h3 className="font-semibold text-gray-900 mb-3">
//                 {currentEscrow ? 'Add More Stake' : 'Create Your First Stake'}
//               </h3>
//               <div className="flex gap-2">
//                 <input
//                   type="number"
//                   value={stakeAmount}
//                   onChange={(e) => setStakeAmount(e.target.value)}
//                   placeholder="Amount in SOL"
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   step="0.001"
//                   min="0"
//                 />
//                 <button
//                   onClick={createStake}
//                   className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
//                   disabled={loading || !stakeAmount || !profile}
//                 >
//                   {loading ? 'Staking...' : currentEscrow ? 'Add Stake' : 'Stake & Initialize'}
//                 </button>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Will stake for profile #{profile?.id} on apartment #{apartmentId}
//               </p>
//               {!profile && (
//                 <p className="text-xs text-red-500 mt-1">
//                   Profile not loaded yet. Please wait...
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Stake Management */}
//           <div className="bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Active Stakes</h2>
            
//             {currentStakes.length === 0 ? (
//               <div className="text-center py-8">
//                 <p className="text-gray-600">No stakes found for apartment {apartmentId}</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {currentStakes.map(([key, stake]) => (
//                   <div key={key} className="border border-gray-200 rounded-lg p-4">
//                     <div className="flex justify-between items-start mb-3">
//                       <div>
//                         <p className="text-sm font-medium text-gray-900">
//                           Tenant Profile: #{stake.tenantProfileId.toString()}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           Staker: {stake.staker.toString().slice(0, 8)}...{stake.staker.toString().slice(-8)}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           Amount: {(stake.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           Status: <span className={stake.isActive ? "text-green-600" : "text-red-600"}>
//                             {stake.isActive ? "Active" : "Inactive"}
//                           </span>
//                         </p>
//                       </div>
                      
//                       {stake.isActive && currentEscrow && 
//                         wallet.publicKey?.toString() === currentEscrow.lessor.toString() && (
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => resolveStake(
//                               stake.apartmentId.toString(), 
//                               stake.tenantProfileId.toString(),
//                               stake.staker
//                             )}
//                             className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
//                             disabled={loading}
//                           >
//                             Resolve
//                           </button>
//                           <button
//                             onClick={() => slashStake(
//                               stake.apartmentId.toString(), 
//                               stake.tenantProfileId.toString()
//                             )}
//                             className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
//                             disabled={loading}
//                           >
//                             Slash
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Instructions */}
//         <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
//           <h3 className="font-semibold text-blue-900 mb-2">💰 Simple Staking System:</h3>
//           <div className="text-sm text-blue-800 space-y-2">
//             <p><strong>🎯 How it works:</strong></p>
//             <ul className="list-disc list-inside ml-4 space-y-1">
//               <li>Enter apartment ID and stake amount</li>
//               <li>Click "Stake & Initialize" to deposit SOL to the contract</li>
//               <li>Your money is mapped to your address in the contract</li>
//               <li>Lessor can "Resolve" to return your money or "Slash" as penalty</li>
//               <li>Each apartment + tenant combination gets its own stake record</li>
//             </ul>
//           </div>
//           <div className="mt-3 p-3 bg-green-100 rounded text-sm text-green-800">
//             <strong>✨ No complex setup needed!</strong> Just stake and the contract handles everything automatically.
//             Your SOL is safely held until the lessor resolves or slashes your stake.
//           </div>
//         </div>
//       </div> */}