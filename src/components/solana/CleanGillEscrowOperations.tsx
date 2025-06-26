import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/lib/supabase';
import { Apartment, Profile } from '@/lib/schema';
import { getApartmentById } from '@/lib/database';

// Import operation functions
import {
  initializeApartment,
  stakeForApartment,
  resolveStake,
  slashStake,
  fetchStakeRecords,
  checkEscrowExists
} from './operations/escrowOperations';

// Import page components
import { ConnectWalletPage } from './pages/ConnectWalletPage';
import { LoadingPage } from './pages/LoadingPage';
import { NoAccessPage } from './pages/NoAccessPage';
import { WaitingForInitializationPage } from './pages/WaitingForInitializationPage';
import { EscrowDashboardPage } from './pages/EscrowDashboardPage';

interface CleanGillEscrowOperationsProps {
  apartmentId: string;
}

export const CleanGillEscrowOperations: React.FC<CleanGillEscrowOperationsProps> = ({ apartmentId }) => {
  const wallet = useWallet();
  const { profile } = useProfile();
  
  // State
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [apartmentOwnerProfile, setApartmentOwnerProfile] = useState<Profile | null>(null);
  const [approvedProfile, setApprovedProfile] = useState<Profile | null>(null);
  const [escrowData, setEscrowData] = useState<any>(null);
  const [stakeRecords, setStakeRecords] = useState<any[]>([]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [referrerPubkey, setReferrerPubkey] = useState<string | null>(null);

  // Helper function to check if current profile has access
  const checkAccess = useCallback((): boolean => {
    if (!profile?.id || !wallet.publicKey) return false;
    
    const isOwner = apartment?.owner === profile.id;
    const isApproved = apartment?.approved_profile === profile.id;

    return isOwner || isApproved;
  }, [profile, apartment, wallet.publicKey]);

  // Check if current user is the apartment owner
  const isOwner = profile &&
                  apartmentOwnerProfile &&
                  apartmentOwnerProfile.pubkey === wallet.publicKey?.toString() &&
                  apartment?.owner === profile?.id;

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!apartmentId) return;

    setDataLoading(true);
    try {
      const apartmentData = await getApartmentById(apartmentId);
      
      if (!apartmentData) {
        console.error('Apartment not found');
        setDataLoading(false);
        return;
      }

      setApartment(apartmentData);

      // Handle referrer pubkey
      if (apartmentData?.approved_profile && apartmentData?.referrers_pubkeys) {
        let referrerPubkey: string | undefined;
        
        if (apartmentData.referrers_pubkeys instanceof Map) {
          referrerPubkey = apartmentData.referrers_pubkeys.get(apartmentData.approved_profile);
        } else if (typeof apartmentData.referrers_pubkeys === 'object') {
          referrerPubkey = (apartmentData.referrers_pubkeys as any)[apartmentData.approved_profile];
        }

        setReferrerPubkey(referrerPubkey || null);
      }

      // Fetch apartment owner's profile
      if (apartmentData?.owner) {
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', apartmentData.owner)
          .single();
        
        setApartmentOwnerProfile(ownerProfile);
      }

      // Fetch approved profile if exists
      if (apartmentData?.approved_profile) {
        const { data: approvedProfileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', apartmentData.approved_profile)
          .single();
        
        setApprovedProfile(approvedProfileData);
      }

      // Check if escrow exists
      const escrowExists = await checkEscrowExists(apartmentId);
      setEscrowData(escrowExists ? { exists: true } : null);

      // Fetch stake records for this apartment
      const stakes = await fetchStakeRecords(apartmentId);
      setStakeRecords(stakes);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [apartmentId]);

  // Effects
  useEffect(() => {
    if (apartment && profile && wallet.publicKey) {
      setHasAccess(checkAccess());
    } else {
      setHasAccess(false);
    }
  }, [apartment, profile, wallet.publicKey, checkAccess]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleInitialize = async () => {
    if (!apartmentOwnerProfile?.pubkey) {
      console.log('Missing required data for initialization');
      return;
    }

    setInitializing(true);
    try {
      const signature = await initializeApartment(apartmentId, apartmentOwnerProfile.pubkey, wallet);
      console.log('Initialize tx:', signature);
      await fetchData();
    } catch (error) {
      console.error('Error initializing:', error);
    } finally {
      setInitializing(false);
    }
  };

  const handleStake = async () => {
    if (!profile?.id || !stakeAmount) {
      console.log('Missing profile or stake amount');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(stakeAmount);
      const signature = await stakeForApartment(apartmentId, amount, profile.id, wallet);
      console.log('Stake tx:', signature);
      setStakeAmount('');
      await fetchData();
    } catch (error) {
      console.error('Error staking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (stakeRecord: any) => {
    if (!apartmentOwnerProfile?.pubkey) return;

    setLoading(true);
    try {
      const rewardAmount = apartment?.reward || 0;
      
      console.log('=== HANDLE RESOLVE DEBUG ===');
      console.log('apartmentOwnerProfile:', apartmentOwnerProfile);
      console.log('apartmentOwnerProfile.pubkey:', apartmentOwnerProfile.pubkey);
      console.log('referrerPubkey:', referrerPubkey);
      console.log('rewardAmount:', rewardAmount);
      
      const signature = await resolveStake(
        apartmentId, 
        stakeRecord, 
        apartmentOwnerProfile.pubkey, 
        referrerPubkey, 
        rewardAmount, 
        wallet
      );
      console.log('Resolve tx:', signature);
      await fetchData();
    } catch (error) {
      console.error('Error resolving stake:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlash = async (stakeRecord: any) => {
    if (!apartmentOwnerProfile?.pubkey) return;

    setLoading(true);
    try {
      const signature = await slashStake(apartmentId, stakeRecord, apartmentOwnerProfile.pubkey, wallet);
      console.log('Slash tx:', signature);
      await fetchData();
    } catch (error) {
      console.error('Error slashing stake:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render appropriate page based on state
  if (!wallet.connected) {
    return <ConnectWalletPage />;
  }

  // if (dataLoading) {
  //   return <LoadingPage />;
  // }

  if (hasAccess === false) {
    return (
      <NoAccessPage
        apartment={apartment}
        apartmentOwnerProfile={apartmentOwnerProfile}
        approvedProfile={approvedProfile}
        onRefresh={fetchData}
      />
    );
  }

  if (!escrowData) {
    return (
      <WaitingForInitializationPage
        apartment={apartment}
        apartmentOwnerProfile={apartmentOwnerProfile}
        onRefresh={fetchData}
        onInitialize={handleInitialize}
        isOwner={Boolean(isOwner)}
        initializing={initializing}
      />
    );
  }

  return (
    <EscrowDashboardPage
      apartmentId={apartmentId}
      apartment={apartment}
      apartmentOwnerProfile={apartmentOwnerProfile}
      approvedProfile={approvedProfile}
      profile={profile}
      escrowData={escrowData}
      stakeRecords={stakeRecords}
      stakeAmount={stakeAmount}
      setStakeAmount={setStakeAmount}
      loading={loading}
      isOwner={Boolean(isOwner)}
      referrerPubkey={referrerPubkey}
      onRefresh={fetchData}
      onStake={handleStake}
      onResolve={handleResolve}
      onSlash={handleSlash}
    />
  );
}; 