#!/bin/bash

# Deploy script for Escrow contract
# This deploys the simplified contract without approved_staker mechanism
# Access control is now handled entirely by the frontend using approved_profile from database

echo "🚀 Starting deployment of simplified Escrow contract..."

# Navigate to escrow directory
cd escrow

# Build the contract
echo "📦 Building contract..."
anchor build

# Copy IDL to frontend
echo "📄 Copying IDL to frontend..."
cp target/idl/escrow.json ../src/lib/escrow-idl.json

# Deploy to devnet
echo "🌐 Deploying to devnet..."
anchor deploy --provider.cluster devnet

echo "✅ Deployment complete!"
echo ""
echo "📋 Summary:"
echo "- Removed approved_staker mechanism from contract"
echo "- Access control now handled by frontend using approved_profile from database"
echo "- Contract only stores basic escrow data (no approved addresses)"
echo "- Frontend checks apartment.approved_profile for tenant access" 