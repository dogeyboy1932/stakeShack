'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';

// import { useProfile } from '@/contexts/ProfileContext';
import { Apartment, Profile } from '@/lib/schema';
import { getProfileByUsername, getUserApartmentsByUsername } from '@/lib/database';

import { ProfileDetails } from '@/components/profile/ProfilePage';
import { LessorListingsSection } from '@/components/lessor/LessorListings';
import { ApartmentCard } from '@/components/apartment/ApartmentCard';


export default function ApartmentDetailsPage() {
    

    const params = useParams();
    const router = useRouter();
    const username = params.username as string;

    // const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [userApartments, setUserApartments] = useState<Apartment[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    

    useEffect(() => {
        async function loadData() {
            // const profile = await getProfileByUsername(username);

            // if (!profile) {
            //     setError('Profile not found. Please create a profile first.');
            //     setLoading(false);
            //     return;
            // }

            // setCurrentProfile(profile);

            try {
                setLoading(true);
                
                // Get user's apartments
                const apartments = await getUserApartmentsByUsername(username, true);
                setUserApartments(apartments);
            } catch (err) {
                console.error('Error loading lessor data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        }
        
        loadData();
    }, [username]);

    const handleApartmentClick = (apartmentId: string) => {
        router.push(`/tenant/apartment/${apartmentId}`);
    };



    if (loading) {
        return <LoadingState message="Loading apartment details..." />;
    }

    if (error || !userApartments) {
        return (
            <ErrorState 
                error={error || "The profile you're looking for doesn't exist."}
                onRetry={() => router.back()}
                showRetry={true}
            />
        );
    }


    return (
        <div>
            {/* <LessorListingsSection userApartments={userApartments} /> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userApartments.map((apartment) => {
                return (
                  <div 
                    key={apartment.id}
                  >
                    <ApartmentCard 
                      apartment={apartment} 
                      onClick={() => handleApartmentClick(apartment.id)}
                    />
                  </div>
                );
              })}
            </div>
        </div>
    );
} 