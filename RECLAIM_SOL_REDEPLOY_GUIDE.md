# Reclaim SOL & Redeploy Anchor Program - Quick Guide

## Overview
- **Goal**: Reclaim SOL from program buffers and redeploy with new Program ID
- **Result**: Get your SOL back (~1.88 SOL) and have working program again

## Step 1: Check for Reclaimable SOL
```bash
# Check for program buffers that can be closed
solana program show --buffers

# Check your current program details
solana program show YOUR_PROGRAM_ID
```

## Step 2: Switch to Program Authority Wallet
```bash
# Check current wallet
solana address

# Switch to program authority wallet (if different)
solana config set --keypair ~/.config/solana/id.json

# Verify you're now the authority
solana address
```

## Step 3: Close Program to Reclaim SOL
```bash
# ⚠️ WARNING: This permanently closes the program!
solana program close YOUR_PROGRAM_ID --bypass-warning

# Check your new balance
solana balance
```

## Step 4: Generate New Program ID
```bash
# Navigate to your Anchor project
cd your-anchor-project

# Remove old keypair and rebuild to get new Program ID
rm target/deploy/your-program-keypair.json
anchor build

# Get the new Program ID
solana-keygen pubkey target/deploy/your-program-keypair.json
```

## Step 5: Update Program ID in Code
```rust
// In programs/your-program/src/lib.rs
declare_id!("NEW_PROGRAM_ID_HERE");
```

```toml
# In Anchor.toml
[programs.devnet]
your_program = "NEW_PROGRAM_ID_HERE"

[programs.localnet]
your_program = "NEW_PROGRAM_ID_HERE"
```

## Step 6: Rebuild and Deploy
```bash
# Rebuild with new Program ID
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show NEW_PROGRAM_ID
```

## Step 7: Update Frontend (if applicable)
```typescript
// Update Program ID in your frontend
const PROGRAM_ID = new PublicKey('NEW_PROGRAM_ID_HERE');
```

```bash
# Copy new IDL to frontend
cp target/idl/your-program.json frontend/src/lib/
```

## Quick Commands Summary
```bash
# 1. Check program details
solana program show PROGRAM_ID

# 2. Switch to authority wallet
solana config set --keypair ~/.config/solana/id.json

# 3. Close program (RECLAIM SOL)
solana program close PROGRAM_ID --bypass-warning

# 4. Generate new Program ID
rm target/deploy/*-keypair.json && anchor build

# 5. Get new Program ID
solana-keygen pubkey target/deploy/your-program-keypair.json

# 6. Deploy with new ID
anchor deploy --provider.cluster devnet
```

## Expected Results
- ✅ **SOL Reclaimed**: ~1.88 SOL back in your wallet
- ✅ **New Program**: Fresh deployment with new Program ID
- ✅ **Total Cost**: ~0.003 SOL for new deployment
- ✅ **Net Gain**: Almost 2 SOL profit

## Important Notes
- ⚠️ **Closing is permanent** - old Program ID can never be used again
- ⚠️ **Update all references** - Frontend, tests, docs need new Program ID
- ✅ **Same functionality** - Program works exactly the same
- ✅ **Fresh start** - No old state or accounts carry over

## Troubleshooting
- **"Program has been closed"**: Use new Program ID, can't reuse old one
- **"Insufficient funds"**: Airdrop more devnet SOL: `solana airdrop 2`
- **"Wrong authority"**: Make sure you're using the correct keypair
- **Build errors**: Run `anchor clean` then `anchor build` 