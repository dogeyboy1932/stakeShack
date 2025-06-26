'use client';

import { useEffect, useState } from 'react';
import { Heart, UserCheck, UserX, Users } from 'lucide-react';

import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
// import { TenantListing } from '@/components/tenant/TenantListing';

import { getApartmentById } from '@/lib/database';
import { Apartment, ApartmentStatus, ReferralStatus } from '@/lib/schema';

import { useProfile } from '@/contexts/ProfileContext';

import { TenantApartmentCard } from '@/components/tenant/TenantApartmentCard';
import { TabButton } from '@/components/ui/tab-button';


export default function YourApartmentsPage() {
    const { profile, loading: profileLoading, error: profileError, userId } = useProfile();

    const [interestedApartments, setInterestedApartments] = useState<(Apartment & { userStatus: ApartmentStatus })[]>([]);
    const [recommendedApartments, setRecommendedApartments] = useState<(Apartment & { referrer: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'default' | 'recommended'>('default');
    
    
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
                for (const [apartmentId, userStatus] of profile.apartments_interested) {
                    const apartment = await getApartmentById(apartmentId);
                    
                    if (apartment) {
                        apartments.push({ ...apartment, userStatus });
                    }
                }

                setInterestedApartments(apartments);



                const apartments2: (Apartment & { referrer: string })[] = [];
                for (const [apartmentId, referStatus] of profile.apartments_recommended) {
                    const apartment = await getApartmentById(apartmentId);
                    
                    if (apartment) {
                        apartments2.push({ ...apartment, referrer: referStatus });
                    }
                }
                
                setRecommendedApartments(apartments2);
                
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

    // console.log('profile', profile?.apartments_interested);


    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-red-100">
            <div className="container mx-auto max-w-7xl py-8 space-y-8">
                {/* Header Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-800 via-rose-700 to-red-700 bg-clip-text text-transparent">
                        Your Apartments
                    </h1>
                    <p className="text-gray-700 font-medium mt-2 text-lg">
                        Track your apartment interests and applications.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200/50">    
                    <div className="flex gap-2">
                        <TabButton
                            isActive={activeTab === 'default'}
                            onClick={() => setActiveTab('default')}
                            icon={<UserCheck className="h-5 w-5" />}
                            label="Your Picks"
                            activeColor="blue"
                        />
                        <TabButton
                            isActive={activeTab === 'recommended'}
                            onClick={() => setActiveTab('recommended')}
                            icon={<UserX className="h-5 w-5" />}
                            label="Recommended"
                            activeColor="green"
                        />
                    </div>
                </div>
                
                {/* Content Section */}
                {activeTab === 'default' ? (
                    interestedApartments.length === 0 ? (
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
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {interestedApartments.map((apartment) => {
                                // console.log('apartmentStatus', profile?.apartments_interested.get(apartment.id));
                                return (
                                    <TenantApartmentCard
                                        key={apartment.id}
                                        apartment={apartment}
                                        apartmentStatus={profile?.apartments_interested.get(apartment.id)}
                                    />
                            )
                            })}
                        </div>
                    )
                ) : (
                    recommendedApartments.length === 0 ? (
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-16">
                            <EmptyState
                                icon={<Users className="h-20 w-20 text-orange-400" />}
                                title="No recommendations yet"
                                description="When people refer apartments to you, they'll appear here for your consideration."
                                action={{
                                    label: "Browse Apartments",
                                    href: "/",
                                    onClick: () => {}
                                }}
                            />
                        </div>
                    ) : (
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {recommendedApartments.map((apartment) => (
                                <TenantApartmentCard
                                    key={apartment.id}
                                    apartment={apartment}
                                    referrer={apartment.referrer}
                                    apartmentStatus={profile?.apartments_interested.get(apartment.id)}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
} 