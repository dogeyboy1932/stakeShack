'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
// import { LessorListingsSection } from '@/components/lessor/LessorListings';
import { DashboardStats } from '@/components/lessor/DashboardStats';

import { EmptyState } from '@/components/ui/empty-state';

import { getUserApartments, seedDatabase } from '@/lib/database';
import { Apartment } from '@/lib/schema';

import { useProfile } from '@/contexts/ProfileContext';
import { Building2, Plus } from 'lucide-react';
import { CreateApartmentForm } from '@/components/apartment/CreateApartmentForm';
import { LessorApartmentCard } from '@/components/lessor/LessorApartmentCard';
import { LessorListingsSection } from '@/components/lessor/LessorListings';


export default function LessorModePage() {
    const params = useParams();
    const username = params.username as string;     

    const [userApartments, setUserApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const [showCreateForm, setShowCreateForm] = useState(false);


    const handleApartmentClick = (apartmentId: string) => {
        router.push(`/tenant/apartment/${apartmentId}`);
    };

    
    
    const handleApartmentCreated = (newApartment: Apartment) => {
        setUserApartments(prev => [...prev, newApartment]);
        setShowCreateForm(false);
    };

    useEffect(() => {
        async function loadData() {
            const apartments = await getUserApartments(username, true);
            setUserApartments(apartments);
        }
        loadData();
    }, [username]);
    
    
    // useEffect(() => {
    //     async function loadData() {
    //         if (!profile) {
    //             setError('Profile not found. Please create a profile first.');
    //             setLoading(false);
    //             return;
    //         }

    //         try {
    //             setLoading(true);
                
    //             // Seed database if needed
    //             await seedDatabase();
                
    //             // Get user's apartments
    //             const apartments = await getUserApartments(userId, true);
    //             setUserApartments(apartments);
    //         } catch (err) {
    //             console.error('Error loading lessor data:', err);
    //             setError('Failed to load data');
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
        
    //     if (!profileLoading && !profileError) {
    //         loadData();
    //     }
    // }, [profile, profileLoading, profileError, userId]); // Include navigationKey to refresh on page navigation


    // if (loading || profileLoading) {
    //     return <LoadingState message="Loading your listings..." />;
    // }


    // if (error || profileError) {
    //     return (
    //         <ErrorState 
    //             error={error || profileError || 'Unknown error'}
    //             onRetry={() => window.location.reload()}
    //         />
    //     );
    // }
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100">
            <div className="container mx-auto max-w-7xl py-8 space-y-8">
                {/* Header Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                    <div className="flex items-center justify-between">
                        {/* <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 via-orange-700 to-yellow-700 bg-clip-text text-transparent">
                                Lessor Dashboard
                            </h1>
                            <p className="text-gray-700 mt-2 font-medium text-lg">
                                Welcome back, @{profile?.username}! Manage your listings efficiently.
                            </p>
                        </div> */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white rounded-2xl shadow-lg">
                                <Building2 className="h-5 w-5" />
                                <span className="text-base font-bold">
                                    {userApartments.length} Active
                                </span>
                            </div>
                            {/* <button 
                                onClick={() => setShowCreateForm(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            >
                                <Plus className="h-4 w-4" />
                                Add Listing
                            </button> */}
                        </div>
                    </div>
                </div>
                
                {/* Listings Section */}
                <LessorListingsSection userApartments={userApartments} />
                

                Stats Section
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
                    <DashboardStats apartments={userApartments} />
                </div>
            </div>

            {/* Create Apartment Form Modal */}
            <CreateApartmentForm
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSuccess={handleApartmentCreated}
            />
        </div>
    );
} 