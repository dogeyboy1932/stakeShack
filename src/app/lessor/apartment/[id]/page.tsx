'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { ApartmentDetailsHeader } from '@/components/apartment/ApartmentDetailsHeader';
import { ApartmentSummary } from '@/components/apartment/ApartmentSummary';
import { InterestedProfilesSection } from '@/components/profile/InterestedProfilesSection';
import { ApartmentActionButtons } from '@/components/apartment/ApartmentActionButtons';
import { EditApartmentForm } from '@/components/apartment/EditApartmentForm';

import { getApartmentById, removeApartmentListing } from '@/lib/database';
import { Apartment } from '@/lib/schema';

import { useProfile } from '@/contexts/ProfileContext';
// import { useNavigation } from '@/contexts/NavigationContext';


export default function ApartmentDetailsPage() {
    const { userId } = useProfile();
    // const { navigationKey } = useNavigation();

    const params = useParams();
    const router = useRouter();
    const apartmentId = params.id as string;
    
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    
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
            } catch (err) {
                console.error('Error loading apartment details:', err);
                setError('Failed to load apartment details');
            } finally {
                setLoading(false);
            }
        }
        
        loadData();
    }, [apartmentId, userId]); // Include navigationKey to refresh on page navigation


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
            else alert('Failed to remove apartment listing. Please try again.');

        } catch (error) {
            console.error('Error removing apartment:', error);
            alert('Failed to remove apartment listing. Please try again.');

        } finally {
            setDeleteLoading(false);
        }
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


    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100">
            <div className="container mx-auto max-w-7xl py-8 space-y-8">
                {/* Header Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                    <ApartmentDetailsHeader onBack={() => router.back()} />
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
                    <div className="flex justify-center">
                        <ApartmentActionButtons
                            onEdit={() => setShowEditForm(true)}
                            onRemove={handleRemoveApartment}
                            isRemoving={deleteLoading}
                        />
                    </div>
                </div>

                {/* Edit Apartment Form Modal */}
                {apartment && (
                    <EditApartmentForm
                        isOpen={showEditForm}
                        onClose={() => setShowEditForm(false)}
                        onSuccess={handleApartmentUpdated}
                        apartment={apartment}
                    />
                )}
            </div>
        </div>
    );
} 