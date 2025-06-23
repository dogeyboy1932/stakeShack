// import { TenantApartmentCard } from './TenantApartmentCard';
// import { Apartment, ApartmentStatus } from '../../lib/schema';
// import { useRouter } from 'next/navigation';

// interface ApartmentGridProps {
//     apartments: (Apartment & { userStatus: ApartmentStatus })[];
// }

// export function TenantListing({ apartments }: ApartmentGridProps) {
//     const router = useRouter();


//     const handleApartmentClick = (apartmentId: string) => {
//         router.push(`/tenant/apartment/${apartmentId}`);
//     };

//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {apartments.map((apartment) => (
//                 <TenantApartmentCard
//                     key={apartment.id}
//                     apartment={apartment}
//                     onClick={() => handleApartmentClick(apartment.id)}
//                 />
//             ))}
//         </div>
//     );
// } 