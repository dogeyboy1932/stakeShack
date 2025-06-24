import { Apartment, Profile } from "../../lib/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { BedDouble, Bath, Square, Users, Anchor, MapPin, Star, Eye, UserCheck, UserX, Check, RotateCcw, X } from "lucide-react";
import { useState, useEffect } from 'react';
import { getProfileById, updateApartmentInterestStatus } from '../../lib/database';
import { ProfileApplicationCard } from '../profile/ProfileApplicationCard';
import { TabButton } from '../ui/tab-button';
import { LoadingState } from '../ui/loading-state';
import { ErrorState } from '../ui/error-state';
import { useRouter } from 'next/navigation';

interface LessorApartmentCardProps {
  apartment: Apartment;
  onClick: () => void;
}

export function LessorApartmentCard({ apartment, onClick }: LessorApartmentCardProps) {
  const router = useRouter();
  
  // State for interested profiles modal
  const [showInterestedModal, setShowInterestedModal] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  // const [activeTab, setActiveTab] = useState<'interested' | 'ignored'>('interested');
  // const [interestedProfiles, setInterestedProfiles] = useState<Profile[]>([]);
  // const [ignoredProfiles, setIgnoredProfiles] = useState<Profile[]>([]);
  // const [approvedProfile, setApprovedProfile] = useState<string>();

  // Load profiles when modal opens
  useEffect(() => {
    if (!showInterestedModal) return;
    
    async function loadProfiles() {
      try {
        // setLoading(true);
        // setError(null);
        
        const interestedProfiles = apartment.interested_profiles || [];
        const ignoredProfiles = apartment.ignored_profiles || [];
        
        const [interestedData, ignoredData] = await Promise.all([
          Promise.all(interestedProfiles.map(async (prof) => {
            const profile = await getProfileById(prof[0]);
            return profile;
          })),
          Promise.all(ignoredProfiles.map(async (prof) => {
            const profile = await getProfileById(prof[0]);
            return profile;
          }))
        ]);
        
        // setInterestedProfiles(interestedData.filter(Boolean) as Profile[]);
        // setIgnoredProfiles(ignoredData.filter(Boolean) as Profile[]);
      } catch (err) {
        console.error('Error loading profiles:', err);
        // setError('Failed to load profiles');
      } finally {
        // setLoading(false);
      }
    }
    
    loadProfiles();
  }, [showInterestedModal, apartment.interested_profiles, apartment.ignored_profiles]);

  // const handleChange = async (type: 'approve' | 'cancel' | 'ignore' | 'restore', profile: Profile) => {
  //   const statusMap = { approve: 'Approved', cancel: 'Pending', ignore: 'Denied', restore: 'Available' } as const;

  //   const messageMap = {
  //     approve: `Invitation sent to ${profile.name}! They have been approved for this apartment.`,
  //     cancel: `Approval cancelled for ${profile.name}. Their status has been reset to pending.`,
  //     ignore: `${profile.name} has been moved to ignored list.`,
  //     restore: `${profile.name} has been restored to interested list.`
  //   };

  //   try {
  //     const success = await updateApartmentInterestStatus(profile.id, apartment.id, statusMap[type]);
      
  //     if (success) {
  //       // Update local state based on action
  //       if (type === 'approve') setApprovedProfile(profile.id);
  //       if (type === 'cancel') setApprovedProfile(undefined);
  //       if (type === 'ignore') {
  //         setInterestedProfiles(prev => prev.filter(p => p.id !== profile.id));
  //         setIgnoredProfiles(prev => [...prev, profile]);
  //       }
  //       if (type === 'restore') {
  //         setIgnoredProfiles(prev => prev.filter(p => p.id !== profile.id));
  //         setInterestedProfiles(prev => [...prev, profile]);
  //       }

  //       console.log(`${type} action completed for:`, profile.name);
  //       alert(messageMap[type]);
  //     } else {
  //       alert(`Failed to ${type} profile. Please try again.`);
  //     }
  //   } catch (error) {
  //     console.error(`Error ${type}ing profile:`, error);
  //     alert(`An error occurred while ${type}ing the profile.`);
  //   }
  // };

  const handleViewInterested = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowInterestedModal(true);
  };

  return (
    <>
      <Card 
        className="w-full max-w-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 shadow-lg bg-white cursor-pointer"
        onClick={onClick}
      >
        <CardHeader className="p-0">
          <div className="relative h-56 w-full overflow-hidden">
            <img
              src={apartment.image}
              alt={`Image of ${apartment.location}`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.8</span>
              </div>
            </div>
            <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded-lg text-xs font-medium">
              Your Listing
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              ${apartment.rent.toLocaleString()}<span className="text-lg font-normal text-gray-500">/mo</span>
            </CardTitle>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <CardDescription className="text-base">{apartment.location}</CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-100">
            <div className="flex flex-col items-center text-center">
              <BedDouble className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-sm font-semibold text-gray-900">{apartment.bedrooms}</span>
              <span className="text-xs text-gray-500">Beds</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Bath className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-sm font-semibold text-gray-900">{apartment.bathrooms}</span>
              <span className="text-xs text-gray-500">Baths</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Square className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-sm font-semibold text-gray-900">{apartment.sqft}</span>
              <span className="text-xs text-gray-500">sqft</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-blue-600"/>
                <span className="text-sm font-medium text-gray-700">Required Stake</span>
              </div>
              <span className="text-lg font-bold text-blue-600">${apartment.stake.toLocaleString()}</span>
            </div>
            
            <div 
              className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 cursor-pointer hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-colors"
              onClick={handleViewInterested}
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600"/>
                <span className="text-sm font-medium text-gray-700">Interested</span>
              </div>
              <span className="text-lg font-bold text-green-600">{apartment.interested}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0">
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm">Amenities</h4>
              <button
                onClick={handleViewInterested}
                className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View Interested</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {apartment.amenities.slice(0, 4).map(amenity => (
                <Badge 
                  key={amenity} 
                  variant="secondary" 
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs px-2 py-1"
                >
                  {amenity}
                </Badge>
              ))}
              {apartment.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{apartment.amenities.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>


    </>
  );
} 





// Interested Profiles Modal
// {showInterestedModal && (
//   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//     <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
//       {/* Modal Header */}
//       <div className="bg-white border-b border-gray-100 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-2xl font-bold text-gray-900">Tenant Applications</h2>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2 text-sm text-gray-500">
//               <Users className="h-4 w-4" />
//               <span>{interestedProfiles.length + ignoredProfiles.length} total applications</span>
//             </div>
//             <button
//               onClick={() => setShowInterestedModal(false)}
//               className="text-gray-400 hover:text-gray-600 p-2"
//             >
//               <X className="h-6 w-6" />
//             </button>
//           </div>
//         </div>
        
//         {/* Tab Navigation */}
//         <div className="flex bg-gray-100 rounded-xl p-1">
//           <TabButton
//             isActive={activeTab === 'interested'}
//             onClick={() => setActiveTab('interested')}
//             icon={<UserCheck className="h-5 w-5" />}
//             label="Interested"
//             count={interestedProfiles.length}
//             activeColor="blue"
//           />
//           <TabButton
//             isActive={activeTab === 'ignored'}
//             onClick={() => setActiveTab('ignored')}
//             icon={<UserX className="h-5 w-5" />}
//             label="Ignored"
//             count={ignoredProfiles.length}
//             activeColor="red"
//           />
//         </div>
//       </div>

//       {/* Modal Content */}
//       <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
//         {loading ? (
//           <div className="p-8">
//             <LoadingState message="Loading user profiles..." />
//           </div>
//         ) : error ? (
//           <div className="p-8">
//             <ErrorState error={error} onRetry={() => window.location.reload()} />
//           </div>
//         ) : (
//                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 p-6">
//              {(activeTab === 'interested' ? interestedProfiles : ignoredProfiles).map((profile) => {
//                const isApproved = (approvedProfile === profile.id);
               
//                return (
//                  <ProfileApplicationCard
//                    key={profile.id}
//                    profile={profile}
//                    activeTab={activeTab}
//                    isApproved={isApproved}
//                    approvedProfile={approvedProfile}
//                    onAction={handleChange}
//                  />
//                );
//              })}
//            </div>
//         )}
//       </div>
//     </div>
//   </div>
// )}