'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { DashboardStats } from '@/components/lessor/DashboardStats';

import { getUserApartmentsByUsername } from '@/lib/database';
import { Apartment } from '@/lib/schema';

import { Building2 } from 'lucide-react';
import { CreateApartmentForm } from '@/components/apartment/CreateApartmentForm';
import { LessorListingsSection } from '@/components/lessor/LessorListings';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';


export default function LessorModePage() {
    const params = useParams();
    const username = params.username as string;     

    const [userApartments, setUserApartments] = useState<Apartment[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleApartmentCreated = (newApartment: Apartment) => {
        setUserApartments(prev => [...prev, newApartment]);
        setShowCreateForm(false);
    };

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);
            
            const apartments = await getUserApartmentsByUsername(username, true);
            setUserApartments(apartments);

            setLoading(false);
        }

        loadData();
    }, []);


    if (loading) return <LoadingState message="Loading your listings..." />;

    if (error || !userApartments) return (
        <ErrorState 
            error={error || 'Unknown error'} 
            onRetry={() => window.location.reload()} 
            buttonName="Reload" 
            showRetry={true}
        />
    );
    
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100">
            <div className="container mx-auto max-w-7xl py-8 space-y-8">
                
                {/* Header Section */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 via-orange-700 to-yellow-700 bg-clip-text text-transparent">
                            Meet @{username}!
                        </h1>
                        <p className="text-gray-700 mt-2 font-medium text-lg">
                            View their listings!
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white rounded-2xl shadow-lg">
                            <Building2 className="h-5 w-5" />
                            <span className="text-base font-bold">
                                {userApartments.length} Active
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Listings Section */}
                <LessorListingsSection userApartments={userApartments} />
                

                {/* Stats Section */}
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