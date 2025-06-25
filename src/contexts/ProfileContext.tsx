'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile } from '../lib/schema';
import { getProfileById } from '../lib/database';

// FIX: User's actual public key
let USER_ID = 
  "a3a01302-3f92-4412-9844-40a0a2ba1273"
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
      USER_ID = "1d677b19-554a-4a7e-9b95-d27072368afd";
    } else if (num === 2) {
      USER_ID = "20a94dd8-8509-4b3e-ba12-80c4edda9331";
    } else if (num === 3) {
      USER_ID = "5571cd07-36f1-48cd-955d-4f0c01262631";
    } else if (num === 4) {
      USER_ID = "a3a01302-3f92-4412-9844-40a0a2ba1273";
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