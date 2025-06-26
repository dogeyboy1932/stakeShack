import { Apartment, ApartmentStatus } from "../../lib/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { BedDouble, Bath, Square, Users, Anchor, MapPin, Star, Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import { markInterestInApartment, unmarkInterestInApartment } from "@/lib/database";
import { useProfile } from "@/contexts/ProfileContext";
import { useSummary } from "@/contexts/SummaryContext";

interface ApartmentCardProps {
  apartment: Apartment;
  onClick: () => void;
}

// const statusVariantMap: Record<ApartmentStatus, "default" | "secondary" | "destructive" | "outline"> = {
//     Available: "default",
//     Pending: "secondary",
//     Staked: "outline",
//     Confirmed: "destructive",
//     Approved: "default",
//     Denied: "destructive"
// }

// const statusColorMap: Record<ApartmentStatus, string> = {
//     Available: "bg-green-500",
//     Pending: "bg-yellow-500",
//     Staked: "bg-blue-500",
//     Confirmed: "bg-purple-500",
//     Approved: "bg-green-500",
//     Denied: "bg-red-500"
// }


export function ApartmentCard({ apartment, onClick }: ApartmentCardProps) {
  const { userId } = useProfile();
  const { openSummary } = useSummary();
  const [numInterested, setNumInterested] = useState(apartment.interested);
  const [isInterested, setIsInterested] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);



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


  
  return (
    <Card 
      className="w-full max-w-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 shadow-lg bg-white cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* AI Summary Button - appears on hover */}
      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openSummary('apartment', apartment);
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-white text-indigo-600 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
          title="AI Summary"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      )}
      
      <div onClick={onClick}>
        <CardHeader className="p-0">
          <div className="relative h-56 w-full overflow-hidden">
            <img
              src={apartment.image}
              alt={`Image of ${apartment.location}`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* <Badge 
              variant={statusVariantMap[status]} 
              className={`absolute top-3 right-3 ${statusColorMap[status]} text-white border-0 font-semibold px-3 py-1 shadow-lg`}
            >
              {status}
            </Badge> */}

            <div className="absolute bottom-3 left-3 text-white">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.8</span>
              </div>
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
              <span className="text-lg font-bold text-green-600">{numInterested}</span>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="px-6 pb-6 pt-0">
        <div className="w-full space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">Amenities</h4>
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
          </div>

        </div>
      </CardFooter>
    </Card>
  );
} 