'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Pencil, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';

import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';

import { ApartmentSummary } from '@/components/apartment/ApartmentFullDetails';
import { InterestedProfilesSection } from '@/components/lessor/InterestedProfilesSection';
import { EditApartmentForm } from '@/components/apartment/EditApartmentForm';

import { getApartmentById, removeApartmentListing } from '@/lib/database';
import { Apartment } from '@/lib/schema';

import { useProfile } from '@/contexts/ProfileContext';



export default function ApartmentDetailsPage() {
    const { userId } = useProfile();

    const params = useParams();
    const router = useRouter();
    const apartmentId = params.id as string;
    
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    

    const loadData = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            
            // Get apartment details
            const apartmentData = await getApartmentById(apartmentId);
            if (!apartmentData) {
                setError('Apartment not found');
                return;
            }

            if (apartmentData.owner !== userId) {
                setError('You are not the owner of this apartment');
                return;
            } else {
                setError(null);
                console.log("You are the owner of this apartment")
            }

            setApartment(apartmentData);
        } catch (err) {
            console.error('Error loading apartment details:', err);
            setError('Failed to load apartment details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
        

    useEffect(() => {
        loadData();
    }, [apartmentId, userId]);


    const handleRefresh = () => {
        loadData(true);
    };



    const handleApartmentUpdated = (updatedApartment: Apartment) => {
        setApartment(updatedApartment);
        setShowEditForm(false);
    };



    const handleRemoveApartment = async () => {
        if (!apartment) return;
        
        const confirmed = window.confirm('Are you sure you want to remove this apartment listing? This action cannot be undone.');
        
        if (!confirmed) return;
        
        setDeleteLoading(true);
        
        try {
            const success = await removeApartmentListing(apartment.id, userId);
            
            if (success) router.push('/lessor');
            // else alert('Failed to remove apartment listing. Please try again.');
        } catch (error) {
            // console.error('Error removing apartment:', error);
            alert('Failed to remove apartment listing. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };



    if (loading) return <LoadingState message="Loading apartment details..." />;


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

    
    // console.log('apartment', apartment)

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100">
                <div className="container mx-auto max-w-7xl py-8 space-y-8">
                    {/* Header Card */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
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
                                    <p className="text-gray-600">Manage your apartment listing and interested tenants</p>
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
                    
                    {/* Main Content Cards */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
                        <ApartmentSummary apartment={apartment} />
                    </div>
                    
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                        <InterestedProfilesSection apartment={apartment} />
                    </div>

                    {/* Action Buttons Card */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowEditForm(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Pencil className="h-5 w-5" />
                                Edit Apartment
                            </button>
                        
                            <button
                                onClick={handleRemoveApartment}
                                disabled={deleteLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="h-5 w-5" />
                                {deleteLoading ? 'Removing...' : 'Remove Listing'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {apartment && (
                <EditApartmentForm
                    isOpen={showEditForm}
                    onClose={() => setShowEditForm(false)}
                    onSuccess={handleApartmentUpdated}
                    apartment={apartment}
                />
            )}
        </>
    );
} 