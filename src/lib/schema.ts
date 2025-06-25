import { PublicKey } from "@solana/web3.js";

export type ApartmentStatus = "Available" | "Pending" | "Approved" | "Ready" | "Staking" | "Staked" | "Denied"  |  "Confirmed";
export type ListingStatus = "Available" | "Pending" | "Staked" | "Confirmed" // FIX: Listing on Lessor Apt Card;
export type ReferralStatus = "Accepted" | "Cancelled" | "Staked" | "Rewarded" | "Referred";
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
  reward: number;
  interested: number;
  amenities: string[];
  description?: string;
  available_from?: string;
  available_until?: string;
  interested_profiles?: string[]; // profile_id
  ignored_profiles?: string[]; // profile_id
  referrers_pubkeys?: Map<string, string>; // [profile_id, referrer_pubkey]
  approved_profile?: string;
  referral_limit: number;
}

export interface Profile {
  id: string;
  username: string;
  name: string;
  bio: string;
  pubkey: string;
  reputationScore: number;
  email: string;
  apartments_interested: Map<string, ApartmentStatus>; // apartment_id -> status
  apartments_recommended: Map<string, string>; // apartment_id -> [status, referrer_id]
  apartments_for_sale: string[];
  phone?: string;
  referral_limit: number;
  referral_statuses: Map<string, ReferralStatus>; // username -> status
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