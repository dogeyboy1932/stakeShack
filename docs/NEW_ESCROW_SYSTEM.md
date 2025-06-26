# NEW ESCROW SYSTEM

## Overview
This document describes the updated apartment-specific escrow system with explicit initialization workflow.

## Key Changes

### 1. Explicit Initialization Required
- **Before**: Escrows auto-initialized when first stake was created
- **After**: Escrows must be explicitly initialized with apartment owner's public key first

### 2. Simple Key-Value Mapping
- **Concept**: `[profile_id + apartment_id] → money_deposited`
- Anyone can stake SOL mapped to their profile ID
- Only apartment owner can resolve (return money) or slash (send to penalty wallet)

### 3. Contract Functions

#### `initialize_apartment(apartment_id, apartment_owner)`
- Sets up escrow for specific apartment
- Stores apartment owner's public key
- Must be called before anyone can stake

#### `stake_for_apartment(apartment_id, profile_id, amount)`
- Anyone can call this to deposit SOL
- Requires escrow to be initialized first
- Maps deposited amount to `[profile_id + apartment_id]`

#### `resolve_stake(apartment_id, profile_id, apartment_owner)`
- Only apartment owner can call
- Returns deposited SOL back to original staker
- Contract balance reduces by deposited amount

#### `slash_stake(apartment_id, profile_id, apartment_owner)`
- Only apartment owner can call  
- Sends deposited SOL to penalty wallet
- Contract balance reduces by deposited amount

## Workflow

1. **Initialize**: Apartment owner (or anyone) calls `initialize_apartment()` with apartment owner's public key
2. **Stake**: Tenants stake SOL using `stake_for_apartment()` 
3. **Resolve/Slash**: Only apartment owner can resolve (return money) or slash (penalty)

## Security Features

- **Apartment-specific ownership**: Each apartment has its own owner who controls stakes
- **Simple mapping**: No complex logic, just direct money mapping
- **Penalty system**: Slashed funds go to fixed penalty wallet
- **Hash-based PDAs**: Handles long apartment/profile IDs using SHA-256 hashing

## Frontend Integration

- **Dynamic routing**: `/escrow/[apartmentId]` gets apartment ID from URL
- **Auto-owner detection**: Fetches apartment owner from database
- **Two-step UI**: Initialize button → Staking form (only shows after initialization)
- **Owner controls**: Only apartment owner sees resolve/slash buttons

## 🚀 **System Overview**

The new escrow system is designed for **infinite scalability** and **automatic initialization**. It solves the key limitations you identified:

### ✅ **Problems Solved:**
- **64-account limitation** - Now supports unlimited apartments and tenants
- **Manual initialization** - Escrows auto-create when needed
- **Rigid framework** - Map-based staking for flexibility
- **Previous stake visibility** - Each stake is unique to apartment + tenant combo
- **Complex setup** - One transaction does everything

## 🏗️ **Architecture**

### **Auto-Initialization Logic**
```rust
// When someone stakes for apartment + tenant combination:
// 1. Check if escrow exists for apartment_id
// 2. If not, create it automatically
// 3. Create unique stake record for (apartment_id, tenant_profile_id)
// 4. Transfer SOL and emit events
```

### **Account Structure**
```
apartment_escrow_1 -> { apartment_id: 1, lessor: X, total_staked: 5.0 SOL }
apartment_escrow_2 -> { apartment_id: 2, lessor: Y, total_staked: 3.2 SOL }

stake_1_101 -> { apartment: 1, tenant: 101, staker: A, amount: 2.0 SOL }
stake_1_102 -> { apartment: 1, tenant: 102, staker: B, amount: 3.0 SOL }
stake_2_101 -> { apartment: 2, tenant: 101, staker: A, amount: 3.2 SOL }
```

### **Map-Based Scaling**
- **Unlimited apartments**: Each apartment gets its own escrow
- **Unlimited tenants**: Each tenant gets unique stake per apartment
- **No collisions**: Stakes are isolated by (apartment_id, tenant_profile_id)
- **Fresh state**: New apartment/tenant combos start clean

## 🔧 **Key Features**

### **1. Auto-Initialization**
```typescript
// Before: Manual setup required
await initializeEscrow(apartmentId, lessorKey)
await stakeForApartment(apartmentId, amount, tenantId)

// After: Everything automatic
await stakeForApartment(apartmentId, amount, tenantId) // Auto-initializes!
```

### **2. Map-Based Staking**
- **PDA Seeds**: `[b"escrow", apartment_id]` for escrows
- **Stake Seeds**: `[b"stake", apartment_id, tenant_profile_id]` for stakes
- **Infinite Scale**: No hardcoded account limits

### **3. Unique Stakes**
```
Tenant 101 + Apartment 1 = Unique Stake
Tenant 101 + Apartment 2 = Different Unique Stake
Tenant 102 + Apartment 1 = Another Unique Stake
```

### **4. Simplified Workflow**
```
User Flow:
1. Select apartment ID
2. Enter stake amount
3. Click "Stake" 
4. ✅ Everything else happens automatically!
```

## 📝 **Smart Contract Functions**

### **Core Functions**
1. **`stake_for_apartment`** - Auto-initializes escrow + creates stake
2. **`slash_stake`** - Lessor penalizes tenant (sends to penalty wallet)
3. **`resolve_stake`** - Lessor returns stake to tenant
4. **`close_escrow`** - Lessor closes escrow when done

### **Removed Functions**
- ❌ `initialize_apartment_escrow` - Now automatic
- ❌ Manual escrow management - Now seamless

## 🎯 **Usage Examples**

### **Tenant Staking**
```typescript
// Tenant 101 stakes 0.5 SOL for apartment 5
await program.methods
  .stakeForApartment(
    new BN(5),        // apartment_id  
    new BN(0.5 * LAMPORTS_PER_SOL), // amount
    new BN(101)       // tenant_profile_id
  )
  .accounts({
    escrowAccount: escrowPDA,     // Auto-created if needed
    stakeRecord: stakeRecordPDA,  // Auto-created if needed
    staker: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### **Lessor Actions**
```typescript
// Resolve stake (return money)
await program.methods
  .resolveStake(new BN(5), new BN(101))
  .accounts({ /* ... */ })
  .rpc();

// Slash stake (penalize tenant)
await program.methods
  .slashStake(new BN(5), new BN(101))
  .accounts({ /* ... */ })
  .rpc();
```

## 🔒 **Security Features**

### **Access Control**
- **Tenant actions**: Only staker can create stakes
- **Lessor actions**: Only lessor can slash/resolve stakes
- **Fixed penalty wallet**: Hardcoded, cannot be changed

### **State Validation**
- **Amount checks**: Must be > 0 SOL
- **Active checks**: Stakes must be active for actions
- **Identity checks**: Apartment/tenant IDs must match

### **Re-initialization Protection**
- **`init_if_needed`**: Safe initialization that prevents attacks
- **State checks**: Prevents overwriting existing data
- **Bump validation**: Ensures correct PDA derivation

## 💰 **Economic Model**

### **Staking Flow**
1. **Tenant stakes** → SOL goes to escrow PDA
2. **Lessor resolves** → SOL returns to tenant
3. **Lessor slashes** → SOL goes to penalty wallet

### **Account Rent**
- **Escrow accounts**: ~0.002 SOL per apartment
- **Stake accounts**: ~0.002 SOL per stake
- **Total cost**: ~0.004 SOL per apartment + tenant combo

## 🔧 **Technical Improvements**

### **Before vs After**
| Feature | Old System | New System |
|---------|------------|------------|
| **Initialization** | Manual | Automatic |
| **Scale Limit** | 64 accounts | Unlimited |
| **Setup Steps** | 2 transactions | 1 transaction |
| **State Isolation** | Shared | Per apartment/tenant |
| **Previous Stakes** | Visible | Fresh start |

### **Code Organization**
```rust
// Clean separation of concerns
mod instructions {
    pub fn stake_for_apartment()  // Auto-init + stake
    pub fn slash_stake()          // Penalty action  
    pub fn resolve_stake()        // Return action
    pub fn close_escrow()         // Cleanup action
}

mod state {
    pub struct ApartmentEscrow    // Per-apartment data
    pub struct StakeRecord        // Per-stake data
}

mod events {
    pub struct StakeCreated       // Tracking events
    pub struct StakeResolved      // Success events
    pub struct StakeSlashed       // Penalty events
}
```

## 🚀 **Deployment Status**

### **Contract Details**
- **Program ID**: `Edmq5WTFJL5gtwMmD9HdtJ5N14ivXMP4vprvPxRkFZRJ`
- **Network**: Solana Devnet
- **Status**: ✅ Live and Ready
- **Features**: Auto-init, Map-based, Unlimited scale

### **Frontend Integration**
- ✅ Updated React interface
- ✅ Separate IDL file: `src/lib/escrow-idl.json`
- ✅ Simplified user flow
- ✅ Real-time balance tracking

## 🎉 **Benefits Summary**

### **For Users**
- **One-click staking** - No manual setup
- **Clean slate** - No previous failures visible
- **Unlimited apartments** - Scale without limits
- **Secure transactions** - Smart contract handles everything

### **For Developers**
- **Cleaner code** - Auto-initialization logic
- **Better UX** - Fewer user interactions needed
- **Infinite scale** - No architectural limits
- **Maintainable** - Separate IDL file

---

**The new system transforms complex multi-step escrow management into a simple, one-click staking experience while maintaining security and enabling unlimited scale! 🚀** 