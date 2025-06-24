'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, UserPlus } from 'lucide-react';

import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { ApartmentDetailsHeader } from '@/components/apartment/ApartmentDetailsHeader';
import { ApartmentSummary } from '@/components/apartment/ApartmentFullDetails';

import { 
    getApartmentById, 
    markInterestInApartment, 
    unmarkInterestInApartment, 
    checkUserInterestInApartment,
    updateApartmentInterestStatus 
} from '@/lib/database';
import { Apartment } from '@/lib/schema';

import { useProfile } from '@/contexts/ProfileContext';



export default function ApartmentDetailsPage() {
    const { userId, profile } = useProfile();
    
    const params = useParams();
    const router = useRouter();
    const apartmentId = params.id as string;
    
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [isInterested, setIsInterested] = useState(true);
    const [interestLoading, setInterestLoading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    
    
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                
                // Get apartment details
                const apartmentData = await getApartmentById(apartmentId);
                if (!apartmentData) {
                    setError('Apartment not found');
                    return;
                }
                setApartment(apartmentData);

                // Check if user has marked interest
                const userInterest = await checkUserInterestInApartment(userId, apartmentId);
                console.log('apartmentId', apartmentId);
                console.log('userId', userId);
                console.log('userInterest', userInterest);
                setIsInterested(userInterest);
            } catch (err) {
                console.error('Error loading apartment details:', err);
                setError('Failed to load apartment details');
            } finally {
                setLoading(false);
            }
        }
        
        loadData();
    }, [apartmentId, userId]); // Include navigationKey to refresh on page navigation



    const handleInterestToggle = async () => {
        if (!apartment) return;
        
        setInterestLoading(true);
        try {
            console.log('isInterested', isInterested);
            const success = isInterested 
                ? await unmarkInterestInApartment(userId, apartment.id)
                : await markInterestInApartment(userId, apartment.id);
                
            if (success) {
                setIsInterested(!isInterested);
                setApartment(prev => prev ? { 
                    ...prev, 
                    interested: prev.interested + (isInterested ? -1 : 1) 
                } : null);
            } else {
                alert(`Failed to ${isInterested ? 'remove' : 'mark'} interest. Please try again.`);
            }
        } catch (error) {
            console.error(`Error ${isInterested ? 'removing' : 'marking'} interest:`, error);
            alert(`Failed to ${isInterested ? 'remove' : 'mark'} interest. Please try again.`);
        } finally {
            setInterestLoading(false);
        }
    };


    const handleReferSomeone = () => {
        // FIX: IMPLEMENT REFERRAL FEATURE
        alert('Refer Someone feature coming soon!');
    };

    const handleMarkReady = async () => {
        if (!apartment || !profile) return;
        
        setInterestLoading(true);
        try {
            const success = await updateApartmentInterestStatus(profile.id, apartment.id, 'Ready');
            
            if (success) {
                // Update local profile state
                if (profile.apartmentsInterested) {
                    profile.apartmentsInterested.set(apartment.id, 'Ready');
                }
                alert('Status updated to Ready! You can now proceed to stake.');
            } else {
                alert('Failed to update status. Please try again.');
            }
        } catch (error) {
            console.error('Error updating status to Ready:', error);
            alert('Failed to update status. Please try again.');
        } finally {
            setInterestLoading(false);
        }
    };

    const handleGoToStake = () => {
        router.push('/escrow');
    };


    if (loading) {
        return <LoadingState message="Loading apartment details..." />;
    }

    if (error || !apartment) {
        return (
            <ErrorState 
                error={error || "The apartment you're looking for doesn't exist."}
                onRetry={() => router.back()}
                showRetry={true}
            />
        );
    }


    const apartmentStatus = profile?.apartmentsInterested.get(apartmentId);
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100">
            <div className="container mx-auto max-w-7xl py-8 space-y-8">
                {/* Header Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                    <ApartmentDetailsHeader onBack={() => router.back()} />
                </div>
            
                {/* Main Content Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
                    <ApartmentSummary apartment={apartment} />
                </div>


                {/* Action Buttons Card */}
                {(apartmentStatus === 'Available' || apartmentStatus === 'Pending') && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                        <div className="flex gap-6 justify-center">
                            <button
                                onClick={handleInterestToggle}
                                disabled={interestLoading}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 transform hover:scale-105 ${
                                    isInterested
                                        ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 text-white hover:from-rose-600 hover:via-pink-600 hover:to-red-600 hover:shadow-xl'
                                        : 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 hover:shadow-xl'
                                }`}
                            >
                                <Heart className={`h-6 w-6 ${isInterested ? 'fill-current' : ''}`} />
                                {interestLoading ? 'Loading...' : (isInterested ? 'Remove Interest' : 'Mark Interest')}
                            </button>

                            <button
                                onClick={handleReferSomeone}
                                disabled
                                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-400 via-gray-400 to-slate-500 text-white rounded-2xl cursor-not-allowed opacity-50 shadow-lg font-semibold"
                                title="Refer Someone - Coming Soon"
                            >
                                <UserPlus className="h-6 w-6" />
                                Refer Someone
                            </button>
                        </div>
                    </div>
                )}


                { apartmentStatus === 'Staking' && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md shadow-purple-500/25 border border-purple-400/30 font-medium mx-auto w-fit">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                                <span>ESCROW INITIALIZED</span>
                            </div>
                            <p className="text-gray-600 mb-6">The lessor has initialized an escrow for you! Click below to proceed to staking.</p>
                            <button
                                onClick={handleGoToStake}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Go to Escrow & Stake
                            </button>
                        </div>
                    </div>
                )}

                { (apartmentStatus === 'Confirmed' || apartmentStatus === 'Denied' || apartmentStatus === 'Staked') && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                        <p className="text-lg font-medium">Your apartment status is {apartmentStatus}</p>
                    </div>
                )}

                
                { apartmentStatus === 'Approved' && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                        <div className="text-center space-y-4">
                            <p className="text-gray-600 mb-6">You've been approved! Mark yourself as ready to proceed to staking.</p>
                            <button
                                onClick={handleMarkReady}
                                disabled={interestLoading}
                                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                            >
                                {interestLoading ? 'Updating...' : 'Mark as Ready'}
                            </button>
                        </div>
                    </div>
                )}

                { apartmentStatus === 'Ready' && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                        <div className="text-center space-y-4">
                            <p className="text-gray-600 mb-6">You're ready to stake! Click below to go to the escrow page and complete your stake.</p>
                            <button
                                onClick={handleGoToStake}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Go to Escrow & Stake
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 