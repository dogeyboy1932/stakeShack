import { PublicKey } from '@solana/web3.js';
import { address, Address } from '@solana/addresses';
import { hashString } from './crypto';

const PROGRAM_ID = new PublicKey('Edmq5WTFJL5gtwMmD9HdtJ5N14ivXMP4vprvPxRkFZRJ');

export const getApartmentEscrowPDA = (apartmentId: string): Address => {
  const apartmentHash = hashString(apartmentId);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), apartmentHash],
    PROGRAM_ID
  );
  return address(pda.toBase58() as Address);
};

export const getStakeRecordPDA = (apartmentId: string, profileId: string): Address => {
  const apartmentHash = hashString(apartmentId);
  const profileHash = hashString(profileId);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('stake'), apartmentHash, profileHash],
    PROGRAM_ID
  );
  return address(pda.toBase58() as Address);
}; 