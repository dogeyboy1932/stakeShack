import * as borsh from '@coral-xyz/borsh';

// Instruction schemas for Borsh serialization
export const InitializeApartmentSchema = borsh.struct([
  borsh.array(borsh.u8(), 32, 'apartment_hash'),
  borsh.str('apartment_id'),
  borsh.publicKey('apartment_owner')
]);

export const StakeForApartmentSchema = borsh.struct([
  borsh.array(borsh.u8(), 32, 'apartment_hash'),
  borsh.u64('amount'),
  borsh.array(borsh.u8(), 32, 'profile_hash'),
  borsh.str('apartment_id'),
  borsh.str('tenant_profile_id')
]);

export const ResolveStakeSchema = borsh.struct([
  borsh.array(borsh.u8(), 32, 'apartmentHash'),
  borsh.array(borsh.u8(), 32, 'profileHash'),
  borsh.str('apartmentId'),
  borsh.str('tenantProfileId'),
  borsh.publicKey('apartmentOwner'),
  borsh.option(borsh.publicKey(), 'referrerPubkey'),
  borsh.u64('rewardAmount'),
]);

export const SlashStakeSchema = borsh.struct([
  borsh.array(borsh.u8(), 32, 'apartmentHash'),
  borsh.array(borsh.u8(), 32, 'profileHash'),
  borsh.str('apartmentId'),
  borsh.str('tenantProfileId'),
  borsh.publicKey('apartmentOwner'),
]);

// Account data schemas for Borsh deserialization
export const StakeRecordSchema = borsh.struct([
  borsh.str('tenant_profile_id'),
  borsh.str('apartment_id'),
  borsh.publicKey('staker'),
  borsh.u64('amount'),
  borsh.bool('is_active'),
  borsh.u8('bump')
]);

export const ApartmentEscrowSchema = borsh.struct([
  borsh.str('apartment_id'),
  borsh.publicKey('lessor'),
  borsh.u64('total_staked'),
  borsh.bool('is_active'),
  borsh.u8('bump')
]); 