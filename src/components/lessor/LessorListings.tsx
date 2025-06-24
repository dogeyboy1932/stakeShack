import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2 } from 'lucide-react';
import { LessorApartmentCard } from './LessorApartmentCard';
import { CreateApartmentForm } from '../apartment/CreateApartmentForm';
import { EmptyState } from '../ui/empty-state';
import { Apartment } from '../../lib/schema';
import { useProfile } from '../../contexts/ProfileContext';

interface LessorListingsSectionProps {
    userApartments: Apartment[];
}

export function LessorListingsSection({ 
    userApartments,
}: LessorListingsSectionProps) {
    const router = useRouter();

    const [showCreateForm, setShowCreateForm] = useState(false);


    const handleApartmentClick = (apartmentId: string) => {
        router.push(`/lessor/apartment/${apartmentId}`);
    };


    return (
        // <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-lg border border-gray-200/60 p-6 backdrop-blur-sm">
        //     <div className="flex items-center justify-between mb-5">
        //         <h2 className="text-xl font-bold text-gray-800">Your Listings</h2>
        //     </div>


        //     {apartments.length === 0 ? (
        //         <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-8 border border-gray-200/40">
        //             <EmptyState
        //                 icon={<Building2 className="h-14 w-14 text-gray-400" />}
        //                 title="No listings yet"
        //                 description="Start by adding your first apartment listing."
        //                 action={{
        //                     label: "Create Your First Listing",
        //                     onClick: () => setShowCreateForm(true)
        //                 }}

                        
        //             />
        //         </div>
        //     ) : (
        //         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        //             {apartments.map((apartment) => (
        //                 <LessorApartmentCard
        //                     key={apartment.id}
        //                     apartment={apartment}
        //                     onClick={() => handleApartmentClick(apartment.id)}
        //                 />
        //             ))}
        //         </div>
        //     )}
        // </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-lg border border-gray-200/60 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-gray-800">Your Listings</h2>
                </div>


                {userApartments.length === 0 ? (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-8 border border-gray-200/40">
                        <EmptyState
                            icon={<Building2 className="h-14 w-14 text-gray-400" />}
                            title="No listings yet"
                            description="Start by adding your first apartment listing."
                            action={{
                                label: "Create Your First Listing",
                                onClick: () => setShowCreateForm(true)
                            }}

                            
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {userApartments.map((apartment) => (
                            <LessorApartmentCard
                                key={apartment.id}
                                apartment={apartment}
                                onClick={() => handleApartmentClick(apartment.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 