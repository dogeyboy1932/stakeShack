'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  Transaction,
} from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Program ID from your smart contract (deployed locally)
const PROGRAM_ID = new PublicKey('6ZfXLAEikAaXVeYR6cUaRNxiyHbss1tW2JehtjV4DbqK');
const PENALTY_WALLET = new PublicKey('2c8QGXM2tRMh7yb1Zva48ZmQTPMmLZCu159x2hscxxwv');

// IDL for the escrow program
const IDL = {
  "address": "6ZfXLAEikAaXVeYR6cUaRNxiyHbss1tW2JehtjV4DbqK",
  "metadata": {
    "name": "escrow",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initialize_escrow",
      "discriminator": [
        243,
        160,
        77,
        153,
        11,
        92,
        48,
        209
      ],
      "accounts": [
        {
          "name": "escrow_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "resolve_stake",
      "discriminator": [
        162,
        136,
        9,
        179,
        86,
        213,
        52,
        160
      ],
      "accounts": [
        {
          "name": "stake_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "stake_account.staker",
                "account": "StakeAccount"
              }
            ]
          }
        },
        {
          "name": "escrow_account",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "staker",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "slash_stake",
      "discriminator": [
        190,
        242,
        137,
        27,
        41,
        18,
        233,
        37
      ],
      "accounts": [
        {
          "name": "stake_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "stake_account.staker",
                "account": "StakeAccount"
              }
            ]
          }
        },
        {
          "name": "escrow_account",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "penalty_wallet",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "discriminator": [
        206,
        176,
        202,
        18,
        200,
        209,
        179,
        108
      ],
      "accounts": [
        {
          "name": "stake_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "staker"
              }
            ]
          }
        },
        {
          "name": "staker",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "EscrowAccount",
      "discriminator": [
        36,
        69,
        48,
        18,
        128,
        225,
        125,
        135
      ]
    },
    {
      "name": "StakeAccount",
      "discriminator": [
        80,
        158,
        67,
        124,
        50,
        189,
        192,
        255
      ]
    }
  ],
  "events": [
    {
      "name": "StakeCreated",
      "discriminator": [
        167,
        95,
        138,
        168,
        40,
        144,
        148,
        196
      ]
    },
    {
      "name": "StakeResolved",
      "discriminator": [
        196,
        106,
        171,
        221,
        2,
        51,
        161,
        56
      ]
    },
    {
      "name": "StakeSlashed",
      "discriminator": [
        43,
        41,
        196,
        25,
        218,
        235,
        244,
        35
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAmount",
      "msg": "Invalid amount: must be greater than 0"
    },
    {
      "code": 6001,
      "name": "StakeNotActive",
      "msg": "Stake is not active"
    },
    {
      "code": 6002,
      "name": "UnauthorizedOwner",
      "msg": "Unauthorized: only the owner can perform this action"
    },
    {
      "code": 6003,
      "name": "InvalidPenaltyWallet",
      "msg": "Invalid penalty wallet: must match the fixed penalty wallet"
    }
  ],
  "types": [
    {
      "name": "EscrowAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "StakeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "staker",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "is_active",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "StakeCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "staker",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "stake_account",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "StakeResolved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "staker",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "StakeSlashed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "staker",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "penalty_wallet",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
}

interface EscrowAccount {
  owner: PublicKey;
  bump: number;
}

interface StakeAccount {
  staker: PublicKey;
  amount: BN;
  isActive: boolean;
  bump: number;
}

export default function EscrowPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [program, setProgram] = useState<Program | null>(null);
  const [escrowAccount, setEscrowAccount] = useState<EscrowAccount | null>(null);
  const [stakeAccounts, setStakeAccounts] = useState<Map<string, StakeAccount>>(new Map());
  const [loading, setLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedStaker, setSelectedStaker] = useState('');
  const [escrowBalance, setEscrowBalance] = useState(0);

  // Initialize program when wallet connects
  useEffect(() => {
    if (wallet.publicKey && wallet.signTransaction) {
      const provider = new AnchorProvider(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        } as any,
        { commitment: 'confirmed' }
      );
      const programInstance = new Program(IDL as any, provider);
      setProgram(programInstance);
    }
  }, [wallet, connection]);

  // Get escrow PDA
  const getEscrowPDA = useCallback(() => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('escrow')],
      PROGRAM_ID
    )[0];
  }, []);

  // Get stake PDA for a specific staker
  const getStakePDA = useCallback((staker: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('stake'), staker.toBuffer()],
      PROGRAM_ID
    )[0];
  }, []);

  // Fetch escrow account data
  const fetchEscrowAccount = useCallback(async () => {
    if (!program) return;
    
    try {
      const escrowPDA = getEscrowPDA();
      const accountInfo = await (program.account as any).escrowAccount.fetch(escrowPDA);
      setEscrowAccount({
        owner: accountInfo.owner,
        bump: accountInfo.bump
      });
      
      // Get SOL balance of escrow account
      const balance = await connection.getBalance(escrowPDA);
      setEscrowBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.log('Escrow account not found or error fetching:', error);
      setEscrowAccount(null);
      setEscrowBalance(0);
    }
  }, [program, connection, getEscrowPDA]);

  // Fetch all stake accounts
  const fetchStakeAccounts = useCallback(async () => {
    if (!program) return;
    
    try {
      const accounts = await (program.account as any).stakeAccount.all();
      const stakeMap = new Map();
      
      for (const account of accounts) {
        const stakePDA = getStakePDA(account.account.staker);
        const balance = await connection.getBalance(stakePDA);
        
        stakeMap.set(account.account.staker.toString(), {
          staker: account.account.staker,
          amount: account.account.amount,
          isActive: account.account.isActive,
          bump: account.account.bump,
          balance: balance / LAMPORTS_PER_SOL
        });
      }
      
      setStakeAccounts(stakeMap);
    } catch (error) {
      console.error('Error fetching stake accounts:', error);
    }
  }, [program, connection, getStakePDA]);

  // Initialize escrow
  const initializeEscrow = async () => {
    if (!program || !wallet.publicKey) return;
    
    setLoading(true);
    try {
      const escrowPDA = getEscrowPDA();
      
      const tx = await program.methods
        .initializeEscrow(wallet.publicKey)
        .accounts({
          escrowAccount: escrowPDA,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
        
      console.log('Initialize escrow transaction:', tx);
      await fetchEscrowAccount();
    } catch (error) {
      console.error('Error initializing escrow:', error);
      alert('Error initializing escrow: ' + error);
    }
    setLoading(false);
  };

  // Create stake
  const createStake = async () => {
    if (!program || !wallet.publicKey || !stakeAmount) return;
    
    setLoading(true);
    try {
      const amount = new BN(parseFloat(stakeAmount) * LAMPORTS_PER_SOL);
      const stakePDA = getStakePDA(wallet.publicKey);
      
      const tx = await program.methods
        .stake(amount)
        .accounts({
          stakeAccount: stakePDA,
          staker: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
        
      console.log('Stake transaction:', tx);
      setStakeAmount('');
      await fetchStakeAccounts();
      await fetchEscrowAccount();
    } catch (error) {
      console.error('Error creating stake:', error);
      alert('Error creating stake: ' + error);
    }
    setLoading(false);
  };

  // Slash stake
  const slashStake = async (stakerKey: string) => {
    if (!program || !wallet.publicKey || !escrowAccount) return;
    
    setLoading(true);
    try {
      const stakerPubkey = new PublicKey(stakerKey);
      const stakePDA = getStakePDA(stakerPubkey);
      const escrowPDA = getEscrowPDA();
      
      const tx = await program.methods
        .slashStake()
        .accounts({
          stakeAccount: stakePDA,
          escrowAccount: escrowPDA,
          owner: wallet.publicKey,
          penaltyWallet: PENALTY_WALLET,
        })
        .rpc();
        
      console.log('Slash stake transaction:', tx);
      await fetchStakeAccounts();
      await fetchEscrowAccount();
    } catch (error) {
      console.error('Error slashing stake:', error);
      alert('Error slashing stake: ' + error);
    }
    setLoading(false);
  };

  // Resolve stake
  const resolveStake = async (stakerKey: string) => {
    if (!program || !wallet.publicKey || !escrowAccount) return;
    
    setLoading(true);
    try {
      const stakerPubkey = new PublicKey(stakerKey);
      const stakePDA = getStakePDA(stakerPubkey);
      const escrowPDA = getEscrowPDA();
      
      const tx = await program.methods
        .resolveStake()
        .accounts({
          stakeAccount: stakePDA,
          escrowAccount: escrowPDA,
          owner: wallet.publicKey,
          staker: stakerPubkey,
        })
        .rpc();
        
      console.log('Resolve stake transaction:', tx);
      await fetchStakeAccounts();
      await fetchEscrowAccount();
    } catch (error) {
      console.error('Error resolving stake:', error);
      alert('Error resolving stake: ' + error);
    }
    setLoading(false);
  };

  // Refresh data
  const refreshData = async () => {
    await Promise.all([fetchEscrowAccount(), fetchStakeAccounts()]);
  };

  useEffect(() => {
    if (program) {
      refreshData();
    }
  }, [program]);

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Solana Escrow Interface</h1>
          <WalletMultiButton className="bg-purple-600 hover:bg-purple-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Solana Escrow Interface</h1>
          <div className="flex gap-4">
            <WalletMultiButton className="bg-purple-600 hover:bg-purple-700" />
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              Refresh Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Escrow Management */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Escrow Management</h2>
            
            {!escrowAccount ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No escrow account found</p>
                <button
                  onClick={initializeEscrow}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={loading}
                >
                  Initialize Escrow
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-green-800 mb-2">Escrow Details</h3>
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Owner:</span> {escrowAccount.owner.toString()}
                  </p>
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Bump:</span> {escrowAccount.bump}
                  </p>
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Balance:</span> {escrowBalance.toFixed(4)} SOL
                  </p>
                </div>

                {/* Stake Creation */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Create Stake</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="Amount in SOL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      step="0.001"
                      min="0"
                    />
                    <button
                      onClick={createStake}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      disabled={loading || !stakeAmount}
                    >
                      Stake
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stake Management */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Stakes</h2>
            
            {stakeAccounts.size === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No active stakes found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(stakeAccounts.entries()).map(([stakerKey, stake]) => (
                  <div key={stakerKey} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Staker: {stakerKey.slice(0, 8)}...{stakerKey.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: {(stake.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: <span className={stake.isActive ? "text-green-600" : "text-red-600"}>
                            {stake.isActive ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>
                      
                      {stake.isActive && escrowAccount && 
                        wallet.publicKey?.toString() === escrowAccount.owner.toString() && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => resolveStake(stakerKey)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                            disabled={loading}
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => slashStake(stakerKey)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                            disabled={loading}
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
          <h3 className="font-semibold text-blue-900 mb-2">How to use this interface:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Connect your Solana wallet using the button above</li>
            <li>Initialize an escrow account (only needed once per owner)</li>
            <li>Anyone can create stakes by depositing SOL</li>
            <li>As the escrow owner, you can resolve stakes (return SOL to staker) or slash stakes (send SOL to penalty wallet)</li>
            <li>Use the "Refresh Data" button to update the displayed information</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 