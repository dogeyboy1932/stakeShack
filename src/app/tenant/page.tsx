'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
// import { TenantListing } from '@/components/tenant/TenantListing';

import { getApartmentById } from '@/lib/database';
import { Apartment, ApartmentStatus } from '@/lib/schema';

import { useProfile } from '@/contexts/ProfileContext';

import { TenantApartmentCard } from '@/components/tenant/TenantApartmentCard';


export default function YourApartmentsPage() {
    const { profile, loading: profileLoading, error: profileError, userId } = useProfile();

    const [interestedApartments, setInterestedApartments] = useState<(Apartment & { userStatus: ApartmentStatus })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    
    useEffect(() => {
        async function loadInterestedApartments() {
            if (!profile) {
                setError('Profile not found. Please create a profile first.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Get all apartments user is interested in with their statuses
                const apartments: (Apartment & { userStatus: ApartmentStatus })[] = [];
                for (const apartmentId of profile.apartmentsInterested) {
                    const apartment = await getApartmentById(apartmentId[0]);
                    
                    if (apartment) {
                        const userStatus = apartmentId[1]
                        apartments.push({ ...apartment, userStatus });
                    }
                }
                
                setInterestedApartments(apartments);
            } catch (err) {
                console.error('Error loading interested apartments:', err);
                setError('Failed to load your interested apartments');
            } finally {
                setLoading(false);
            }
        }
        
        if (!profileLoading && !profileError) {
            loadInterestedApartments();
        }
    }, [profile, profileLoading, profileError, userId]); // Include navigationKey to refresh on page navigation




    if (loading || profileLoading) {
        return <LoadingState message="Loading your interests..." />;
    }


    if (error || profileError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-red-100">
                <div className="container mx-auto max-w-6xl py-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                        <ErrorState 
                            error={error || profileError || 'Unknown error'}
                            onRetry={() => window.location.reload()}
                        />
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-red-100">
            <div className="container mx-auto max-w-7xl py-8 space-y-8">
                {/* Header Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-800 via-rose-700 to-red-700 bg-clip-text text-transparent">
                        Your Interests
                    </h1>
                    <p className="text-gray-700 font-medium mt-2 text-lg">
                        Track your apartment interests and applications.
                    </p>
                </div>
                
                {/* Content Section */}
                {interestedApartments.length === 0 ? (
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-16">
                        <EmptyState
                            icon={<Heart className="h-20 w-20 text-pink-400" />}
                            title="No interested apartments yet"
                            description="Browse the apartments gallery and mark some as interesting to see them here."
                            action={{
                                label: "Browse Apartments",
                                href: "/",
                                onClick: () => {}
                            }}
                        />
                    </div>
                ) : (
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {interestedApartments.map((apartment) => (
                            <TenantApartmentCard
                                key={apartment.id}
                                apartment={apartment}
                                // onClick={() => handleApartmentClick(apartment.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 