'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';

import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { ReferralModal } from '@/components/ui/referral-modal';
import { ApartmentSummary } from '@/components/apartment/ApartmentFullDetails';
import { ApartmentStatusActions } from '@/components/tenant/ApartmentStatusActions';

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

    const handleReferralSubmit = async (username: string) => {
        if (!apartment || !profile) {
            console.log('Missing apartment or profile data');
            return;
        }

        setReferralLoading(true);
        try {
            const result = await referUserToApartment(profile.id, username, apartment.id);
            
            if (result.success) {
                console.log(result.message);
                setShowReferralModal(false);
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
                buttonName="Go Back"
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


                <ApartmentStatusActions
                    apartmentStatus={apartmentStatus}
                    isInterested={isInterested}
                    interestLoading={interestLoading}
                    onInterestToggle={handleInterestToggle}
                    onReferSomeone={handleReferSomeone}
                    onMarkReady={handleMarkReady}
                    onGoToStake={handleGoToStake}
                />
            </div>



            <ReferralModal
                isOpen={showReferralModal}
                onClose={handleCloseReferralModal}
                onSubmit={handleReferralSubmit}
                isLoading={referralLoading}
            />
        </div>
    );
} 