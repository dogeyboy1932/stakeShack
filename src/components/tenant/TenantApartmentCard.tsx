import { Apartment } from "../../lib/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { BedDouble, Bath, Square, Users, Anchor, MapPin, Star, Eye, Heart, Check, X } from "lucide-react";
import { markInterestInApartment, unmarkInterestInApartment, removeFromRecommendedList, updateReferrerStatus } from "@/lib/database";
import { useState } from "react";
import { useProfile } from "@/contexts/ProfileContext";

import { useRouter } from 'next/navigation';


interface TenantApartmentCardProps {
  apartment: Apartment;
  referrer?: string;
  apartmentStatus?: string;
}

export function TenantApartmentCard({ apartment, referrer, apartmentStatus }: TenantApartmentCardProps) { 
  const router = useRouter();

  const { userId } = useProfile();
  
  const [numInterested, setNumInterested] = useState(apartment.interested);
  const [isInterested, setIsInterested] = useState(true);
  const [interestLoading, setInterestLoading] = useState(false);
  
  
  const handleInterestToggle = async () => {
    if (!apartment) return;
    
    setInterestLoading(true);
    try {
        const success = isInterested 
            ? await unmarkInterestInApartment(userId, apartment.id)
            : await markInterestInApartment(userId, apartment.id);
            
        if (success) {
            setIsInterested(!isInterested);
            setNumInterested(apartment.interested + (isInterested ? -1 : 1));
        } else {
            alert(`Failed to ${isInterested ? 'remove' : 'mark'} interest. Please try again.`);
        }
    } catch (error) {
        console.error(`Error ${isInterested ? 'removing' : 'marking'} interest:`, error);
        alert(`Failed to ${isInterested ? 'remove' : 'mark'} interest. Please try again.`);
    } finally {
        setInterestLoading(false);
    }
  };

  const handleReferralAccept = async () => {
    if (!apartment || !referrer) return;
    
    setInterestLoading(true);
    try {
        const success = await markInterestInApartment(userId, apartment.id);
        if (success) {
            setIsInterested(true);
            setNumInterested(apartment.interested + 1);
            console.log(`Referral accepted for apartment ${apartment.id} from referrer: ${referrer}`);

            const updateSuccess = await updateReferrerStatus(referrer, userId, 'Accepted', apartment.id);
            if (updateSuccess) {
                console.log('Successfully updated referrer status');
            } else {
                console.warn('Failed to update referrer status');
            }
        } else {
            alert('Failed to accept referral. Please try again.');
        }
    } catch (error) {
        console.error('Error accepting referral:', error);
        alert('Failed to accept referral. Please try again.');
    } finally {
        setInterestLoading(false);
    }
  };

  const handleReferralDecline = async () => {
    if (!apartment || !referrer) return;
    
    setInterestLoading(true);
    try {
        // Remove from recommended list without marking interest
        const removeSuccess = await removeFromRecommendedList(userId, apartment.id);
        if (removeSuccess) {
            console.log(`Referral declined for apartment ${apartment.id} from referrer: ${referrer}`);
            alert('Referral declined and removed from recommendations.');
        } else {
            alert('Failed to remove from recommendations. Please try again.');
        }

    } catch (error) {
        console.error('Error declining referral:', error);
        alert('Failed to decline referral. Please try again.');
    } finally {
        setInterestLoading(false);
    }
  };
  

  const handleApartmentClick = (apartmentId: string) => {
    router.push(`/tenant/apartment/${apartmentId}`);
  };

  console.log('apartmentStatus', apartmentStatus);


  return (
    <Card className="w-full max-w-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 shadow-lg bg-white cursor-pointer">
      <div onClick={() => handleApartmentClick(apartment.id)}>
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
              <span className="text-lg font-bold text-blue-600">{apartment.stake.toLocaleString()} SOL</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-blue-600"/>
                <span className="text-sm font-medium text-gray-700">Reward</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{apartment.reward.toLocaleString()} SOL</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600"/>
                <span className="text-sm font-medium text-gray-700">Interested</span>
              </div>
              <span className="text-lg font-bold text-green-600"> {numInterested} </span>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="px-6 pb-6 pt-0">
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 text-sm">Amenities</h4>
            <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
              <Eye className="h-4 w-4" />
              <span>View Interested</span>
            </div>
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

          <div className="border-t border-gray-200 pt-4 mt-4">
            {referrer && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <span>Referred by:</span>
                <span className="font-medium text-gray-900">{referrer}</span>
              </div>
            )}
            
            {referrer ? (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleReferralAccept}
                  disabled={interestLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 bg-green-500 text-white hover:bg-green-600"
                >
                  <Check className="h-5 w-5" />
                  {interestLoading ? 'Loading...' : 'Yes'}
                </button>
                <button
                  onClick={handleReferralDecline}
                  disabled={interestLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 bg-red-500 text-white hover:bg-red-600"
                >
                  <X className="h-5 w-5" />
                  {interestLoading ? 'Loading...' : 'No'}
                </button>
              </div>
            ) : (
              apartmentStatus === 'Approved' ? (
                <div className="flex items-center justify-center space-x-2 px-3 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/30 font-medium">
                  <Check className="h-4 w-4" />
                  <span>APPROVED TO STAKE</span>
                </div>
              ) : apartmentStatus === 'Ready' ? (
                <div className="flex items-center justify-center space-x-2 px-3 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 border border-orange-400/30 font-medium">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>READY TO STAKE</span>
                </div>
              ) : apartmentStatus === 'Staking' ? (
                <div className="flex items-center justify-center space-x-2 px-3 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 border border-purple-400/30 font-medium">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  <span>ESCROW INITIALIZED</span>
                </div>
              ) : (
              <div className="flex gap-4 justify-center">
                <button
                    onClick={handleInterestToggle}
                    disabled={interestLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        isInterested
                            ? 'bg-rose-500 text-white hover:bg-rose-600'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    }`}
                >
                    <Heart className={`h-5 w-5 ${isInterested ? 'fill-current' : ''}`} />
                    {interestLoading ? 'Loading...' : (isInterested ? 'Remove Interest' : 'Mark Interest')}
                </button>
              </div>
              )
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 