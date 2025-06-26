import { Apartment, Profile } from '@/lib/schema';
import { EmptyState } from '@/components/ui/empty-state';
import { TenantApartmentCard } from './TenantApartmentCard';
import { Heart, Users } from 'lucide-react';

interface ApartmentSectionProps {
  apartments: Apartment[];
  profile: Profile | null;
  type: 'interested' | 'recommended';
}

export function ApartmentSection({ apartments, profile, type }: ApartmentSectionProps) {
  const isEmpty = apartments.length === 0;
  
  const emptyStateConfig = {
    interested: {
      icon: <Heart className="h-20 w-20 text-pink-400" />,
      title: "No interested apartments yet",
      description: "Browse the apartments gallery and mark some as interesting to see them here."
    },
    recommended: {
      icon: <Users className="h-20 w-20 text-orange-400" />,
      title: "No recommendations yet", 
      description: "When people refer apartments to you, they'll appear here for your consideration."
    }
  };

  const config = emptyStateConfig[type];

  if (isEmpty) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-16">
        <EmptyState
          icon={config.icon}
          title={config.title}
          description={config.description}
          action={{
            label: "Browse Apartments",
            href: "/",
            onClick: () => {}
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {apartments.map((apartment) => (
        <TenantApartmentCard
          key={apartment.id}
          apartment={apartment}
          apartmentStatus={profile?.apartments_interested.get(apartment.id)}
        />
      ))}
    </div>
  );
} 