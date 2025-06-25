'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile } from '../lib/schema';
import { getProfileById } from '../lib/database';

// FIX: User's actual public key
let USER_ID = 
  "23fa2cc1-63d7-45e0-b206-2d9ccd5b2a70"
  // "2d023631-fb21-424f-95a7-a7a5a294c87e";
  // "4f385960-1e8f-4955-b9d7-422ddb346d6d";
  // "bb35b548-54d0-407c-bf61-dfdad68a850e"




interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  userId: string;

  setID: (num: number) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await getProfileById(USER_ID);
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, []);


  const setID = async (num: number) => {   // FOR DEMO PURPOSES
    if (num === 1) {
      USER_ID = "23fa2cc1-63d7-45e0-b206-2d9ccd5b2a70";
    } else if (num === 2) {
      USER_ID = "658c72de-0bc4-41ee-a050-88d4646a7c3b";
    } else if (num === 3) {
      USER_ID = "72f1e3e4-f439-42b6-ad6b-1f10545c06ff";
    } else if (num === 4) {
      USER_ID = "89ecdadf-3c67-4d92-a887-5ebaedfcb44e";
    }


    fetchProfile();
  }
  


  const value: ProfileContextType = {
    profile,
    loading,
    error,
    refreshProfile,
    userId: USER_ID,
    setID
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 