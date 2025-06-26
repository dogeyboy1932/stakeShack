'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, UserPlus, RefreshCw } from 'lucide-react';

import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { ApartmentDetailsHeader } from '@/components/apartment/ApartmentDetailsHeader';
import { ApartmentSummary } from '@/components/apartment/ApartmentFullDetails';

import { 
    getApartmentById, 
    markInterestInApartment, 
    unmarkInterestInApartment, 
    checkUserInterestInApartment,
    updateApartmentInterestStatus,
    referUserToApartment
} from '@/lib/database';
import { Apartment } from '@/lib/schema';

import { useProfile } from '@/contexts/ProfileContext';



export default function ApartmentDetailsPage() {
    const { userId, profile } = useProfile();
    
    const router = useRouter();
    const params = useParams();
    const apartmentId = params.id as string;
    
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [isInterested, setIsInterested] = useState(true);
    const [interestLoading, setInterestLoading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Referral state
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [referralUsername, setReferralUsername] = useState('');
    const [referralLoading, setReferralLoading] = useState(false);

    // Refresh state
    const [refreshing, setRefreshing] = useState(false);

    
    async function loadData(isRefresh = false) {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            
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
            setRefreshing(false);
        }
    }
    
    useEffect(() => {
        
        
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
                console.log(`Failed to ${isInterested ? 'remove' : 'mark'} interest. Please try again.`);
            }
        } catch (error) {
            console.error(`Error ${isInterested ? 'removing' : 'marking'} interest:`, error);
            console.log(`Failed to ${isInterested ? 'remove' : 'mark'} interest. Please try again.`);
        } finally {
            setInterestLoading(false);
        }
    };


    // ============================== REFERRAL ==============================


    const handleReferSomeone = () => {
        setShowReferralModal(true);
    };

    const handleReferralSubmit = async () => {
        if (!referralUsername.trim() || !apartment || !profile) {
            console.log('Please enter a username');
            return;
        }

        setReferralLoading(true);
        try {
            const result = await referUserToApartment(profile.id, referralUsername.trim(), apartment.id);
            
            if (result.success) {
                console.log(result.message);
                setShowReferralModal(false);
                setReferralUsername('');
            } else {
                console.log(result.message);
            }
        } catch (error) {
            console.error('Error referring user:', error);
            console.log('An error occurred while referring the user');
        } finally {
            setReferralLoading(false);
        }
    };

    const handleCloseReferralModal = () => {
        setShowReferralModal(false);
        setReferralUsername('');
    };

    // =============================

    const handleMarkReady = async () => {
        if (!apartment || !profile) return;
        
        setInterestLoading(true);
        try {
            const success = await updateApartmentInterestStatus(profile.id, apartment.id, 'Ready');
            
            if (success) {
                // Update local profile state
                if (profile.apartments_interested) {
                    profile.apartments_interested.set(apartment.id, 'Ready');
                }
                // console.log('Status updated to Ready! You can now proceed to stake.');
            } else {
                // console.log('Failed to update status. Please try again.');
            }
        } catch (error) {
            console.error('Error updating status to Ready:', error);
            // console.log('Failed to update status. Please try again.');
        } finally {
            setInterestLoading(false);
        }
    };

    const handleGoToStake = () => {
        if (!apartment) {
            console.log("APARTMENT NOT FOUND WTFFFF!")
            return
        }
        router.push(`/escrow/${apartment.id}`);
    };

    const handleRefresh = () => {
        loadData(true);
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


    const apartmentStatus = profile?.apartments_interested.get(apartmentId);
    // console.log(apartmentStatus)
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100">
            <div className="container mx-auto max-w-7xl py-8 space-y-8">
                
                {/* Header Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                    {/* <ApartmentDetailsHeader onBack={() => router.back()} /> */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Apartment Details</h1>
                                <p className="text-gray-600">View all interested tenants for this listing</p>
                            </div>
                        </div>
                        
                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>
            
                {/* Main Content Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
                    <ApartmentSummary apartment={apartment} />
                </div>


                {(apartmentStatus !== null) && (
                    <>
                        {/* Action Buttons Card */}
                        {(apartmentStatus === 'Available' || apartmentStatus === 'Pending' || apartmentStatus === undefined) && (
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
                                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <UserPlus className="h-6 w-6" />
                                        Refer Someone
                                    </button>
                                </div>
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

                        
                        { apartmentStatus === 'Staking' && (
                            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                                <div className="text-center space-y-4">
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
                    </>
                )}
            </div>

            {/* Referral Modal */}
            {showReferralModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-2xl font-bold mb-4">Refer Someone</h3>
                        <p className="text-gray-600 mb-6">
                            Enter the username of the person you'd like to refer to this apartment.
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={referralUsername}
                                    onChange={(e) => setReferralUsername(e.target.value)}
                                    placeholder="Enter username..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && handleReferralSubmit()}
                                />
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleCloseReferralModal}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReferralSubmit}
                                    disabled={referralLoading || !referralUsername.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {referralLoading ? 'Referring...' : 'Refer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 