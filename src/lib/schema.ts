import { PublicKey } from "@solana/web3.js";

export type ApartmentStatus = "Available" | "Pending" | "Approved" | "Denied" | "Staked" | "Confirmed";
export type ReferralStatus = "Accepted" | "Cancelled" | "Staked" | "Rewarded";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type VerificationStatus = "unverified" | "pending" | "verified";

export interface Apartment {
  id: string;
  owner: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  rent: number;
  location: string;
  stake: number;
  interested: number;
  amenities: string[];
  description?: string;
  available_from?: string;
  available_until?: string;
  interested_profiles?: [string, string | null][]; // [profile_id, referrer_id?]
  ignored_profiles?: [string, string | null][]; // [profile_id, referrer_id?]
  referral_limit: number;
  referral_statuses: [string, ReferralStatus][];
}

export interface Profile {
  id: string;
  username: string;
  name: string;
  bio: string;
  pubkey: string;
  reputationScore: number;
  email: string;
  apartmentsInterested: Map<string, ApartmentStatus>; // apartment_id -> status
  apartmentsForSale: string[];
  phone?: string;
  referral_limit: number;
  referral_statuses: [string, string][];
}

export interface Booking {
  id: string;
  apartment_id: string;
  tenant_pubkey: string;
  lessor_pubkey: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  stake_amount: number;
  created_at: string;
  updated_at: string;
} 