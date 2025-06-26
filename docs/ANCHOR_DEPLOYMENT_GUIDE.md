# Complete Anchor Deployment Guide

This is a comprehensive, step-by-step guide for deploying any Anchor project to Solana networks (localnet, devnet, testnet, mainnet).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Development](#project-development)
4. [Local Testing](#local-testing)
5. [Network Deployment](#network-deployment)
6. [Post-Deployment](#post-deployment)
7. [Common Commands](#common-commands)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Install Node.js (v16+)
# Download from https://nodejs.org/ or use package manager

# Install Yarn (recommended) or npm
npm install -g yarn

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Verify installations
solana --version
anchor --version
node --version
yarn --version
```

## Initial Setup

### 1. Create New Anchor Project
```bash
# Create new project
anchor init my-project
cd my-project

# Project structure will be created:
# my-project/
# ├── Anchor.toml
# ├── Cargo.toml
# ├── package.json
# ├── programs/
# │   └── my-project/
# │       ├── Cargo.toml
# │       └── src/
# │           └── lib.rs
# ├── tests/
# │   └── my-project.ts
# └── target/
```

### 2. Configure Anchor.toml
```toml
[toolchain]
package_manager = "yarn"  # or "npm"

[features]
resolution = true
skip-lint = false

[programs.localnet]
my_program = "PROGRAM_ID_PLACEHOLDER"

[programs.devnet]
my_program = "PROGRAM_ID_PLACEHOLDER"

[programs.testnet]
my_program = "PROGRAM_ID_PLACEHOLDER"

[programs.mainnet]
my_program = "PROGRAM_ID_PLACEHOLDER"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "localnet"  # Change as needed
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

### 3. Set Up Solana Wallet
```bash
# Generate new keypair (if needed)
solana-keygen new --outfile ~/.config/solana/id.json

# Or use existing keypair
solana config set --keypair /path/to/your/keypair.json

# Check wallet address
solana address

# Check current configuration
solana config get
```

## Project Development

### 1. Write Your Program
Edit `programs/my-project/src/lib.rs`:

```rust
use anchor_lang::prelude::*;

declare_id!("PROGRAM_ID_PLACEHOLDER");

#[program]
pub mod my_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // Your logic here
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

### 2. Update Program Dependencies
Edit `programs/my-project/Cargo.toml`:

```toml
[dependencies]
anchor-lang = "0.29.0"
# Add other dependencies as needed
```

### 3. Install Node Dependencies
```bash
# Install frontend dependencies
yarn install
# or
npm install
```

## Local Testing

### 1. Start Local Validator
```bash
# In a separate terminal, start test validator
solana-test-validator

# Or with specific options
solana-test-validator \
    --ledger test-ledger \
    --reset \
    --quiet
```

### 2. Configure for Local Testing
```bash
# Set Solana to localhost
solana config set --url localhost

# Airdrop SOL for testing
solana airdrop 10
```

### 3. Build and Test
```bash
# Build the program
anchor build

# Run tests
anchor test

# Test with local validator (if not already running)
anchor test --skip-local-validator
```

### 4. Deploy Locally
```bash
# Deploy to local validator
anchor deploy
```

## Network Deployment

### 1. Devnet Deployment

#### Configure for Devnet
```bash
# Set Solana to devnet
solana config set --url devnet

# Update Anchor.toml
[provider]
cluster = "devnet"

# Airdrop devnet SOL
solana airdrop 2
```

#### Deploy to Devnet
```bash
# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show PROGRAM_ID
```

### 2. Testnet Deployment

#### Configure for Testnet
```bash
# Set Solana to testnet
solana config set --url testnet

# Update Anchor.toml
[provider]
cluster = "testnet"

# Airdrop testnet SOL
solana airdrop 2
```

#### Deploy to Testnet
```bash
anchor deploy --provider.cluster testnet
```

### 3. Mainnet Deployment

⚠️ **WARNING**: Mainnet deployment costs real SOL and is irreversible!

#### Configure for Mainnet
```bash
# Set Solana to mainnet
solana config set --url mainnet-beta

# Update Anchor.toml
[provider]
cluster = "mainnet"

# Ensure you have real SOL for deployment
solana balance
```

#### Deploy to Mainnet
```bash
# Final build
anchor build

# Deploy to mainnet (costs real SOL)
anchor deploy --provider.cluster mainnet-beta

# Verify deployment
solana program show PROGRAM_ID
```

## Post-Deployment

### 1. Update Program IDs
After deployment, update your `Anchor.toml` and `lib.rs` with the actual program ID:

```rust
// In lib.rs
declare_id!("ACTUAL_PROGRAM_ID_FROM_DEPLOYMENT");
```

```toml
# In Anchor.toml
[programs.devnet]
my_program = "ACTUAL_PROGRAM_ID_FROM_DEPLOYMENT"
```

### 2. Generate and Copy IDL
```bash
# IDL is automatically generated during build
# Copy to your frontend if needed
cp target/idl/my_program.json frontend/src/idl/

# Or upload IDL to chain
anchor idl init --filepath target/idl/my_program.json PROGRAM_ID
```

### 3. Verify Deployment
```bash
# Check program account
solana program show PROGRAM_ID

# Check program logs
solana logs PROGRAM_ID

# Test program functionality
anchor test --provider.cluster NETWORK
```

## Common Commands

### Building and Testing
```bash
anchor build          # Build program
anchor test           # Run tests (starts local validator)
anchor test --skip-local-validator  # Run tests on existing validator
anchor clean          # Clean build artifacts
```

### Deployment
```bash
anchor deploy                           # Deploy to configured cluster
anchor deploy --provider.cluster devnet # Deploy to specific cluster
anchor deploy --program-id PROGRAM_ID   # Deploy with specific program ID
```

### IDL Management
```bash
anchor idl init --filepath target/idl/program.json PROGRAM_ID
anchor idl upgrade --filepath target/idl/program.json PROGRAM_ID
anchor idl fetch PROGRAM_ID --out idl.json
```

### Account Management
```bash
solana address                    # Show wallet address
solana balance                    # Show SOL balance
solana airdrop 2                  # Airdrop SOL (devnet/testnet only)
solana config get                 # Show current configuration
solana config set --url NETWORK   # Switch networks
```

### Program Management
```bash
solana program show PROGRAM_ID                # Show program info
solana program deploy program.so              # Deploy raw program
solana program upgrade program.so PROGRAM_ID  # Upgrade program
```

## Troubleshooting

### Common Build Errors

#### "Feature not found" errors
```bash
# Update Cargo.toml dependencies
[dependencies]
anchor-lang = "0.29.0"
```

#### "Program ID mismatch"
```bash
# Make sure lib.rs declare_id! matches Anchor.toml
# Regenerate program ID if needed:
solana-keygen grind --starts-with abc:1
```

### Common Deployment Errors

#### "Insufficient funds"
```bash
# Check balance
solana balance

# Airdrop more SOL (devnet/testnet)
solana airdrop 5

# For mainnet, transfer real SOL to wallet
```

#### "Program already exists"
```bash
# Use upgrade instead of deploy
anchor upgrade target/deploy/program.so --program-id PROGRAM_ID
```

#### "RPC request failed"
```bash
# Network issues - try different RPC
solana config set --url https://api.devnet.solana.com

# Or use custom RPC
solana config set --url https://your-rpc-url.com
```

### Common Test Errors

#### "Connection refused"
```bash
# Start local validator
solana-test-validator

# Or skip local validator in tests
anchor test --skip-local-validator
```

#### "Account not found"
```bash
# Reset local validator state
solana-test-validator --reset

# Or use fresh ledger
solana-test-validator --ledger fresh-ledger
```

### Network-Specific Issues

#### Devnet/Testnet Instability
```bash
# Use alternative RPC endpoints
solana config set --url https://api.devnet.solana.com
solana config set --url https://devnet.genesysgo.net
```

#### Mainnet Rate Limits
```bash
# Use premium RPC services
# - QuickNode
# - Alchemy
# - Helius
# - GenesysGo
```

## Best Practices

### Development Workflow
1. Develop and test on localnet
2. Deploy and test on devnet
3. Optional: Deploy and test on testnet
4. Deploy to mainnet (with caution)

### Security Considerations
- Always test thoroughly before mainnet
- Use multisig for mainnet program upgrades
- Consider program immutability for sensitive programs
- Audit code before mainnet deployment

### Cost Optimization
- Optimize program size to reduce deployment costs
- Use efficient account structures
- Consider rent-exempt account requirements

---

**Note**: Always test thoroughly on devnet/testnet before deploying to mainnet. Mainnet deployments cost real SOL and cannot be easily reversed. 