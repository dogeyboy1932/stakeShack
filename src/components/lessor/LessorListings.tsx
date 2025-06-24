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
        <div className="bg-white rounded-2xl shadow-lg p-2">
            <div className="text-center mb-3">
                <h2 className="text-xl font-bold text-gray-800">Listings</h2>
                <p className="text-sm text-gray-500">{userApartments.length} apartments</p>
            </div>

            {userApartments.length === 0 ? (
                <div className="text-center py-8">
                    <EmptyState
                        icon={<Building2 className="h-14 w-14 text-gray-400" />}
                        title="No listings yet"
                        description="Start by adding your first apartment listing."
                        // action={{
                        //     label: "Create Your First Listing",
                        //     onClick: () => setShowCreateForm(true)
                        // }}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mx-2">
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
    );
} 