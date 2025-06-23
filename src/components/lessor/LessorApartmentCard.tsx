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
import { BedDouble, Bath, Square, Users, Anchor, MapPin, Star, Eye } from "lucide-react";

interface LessorApartmentCardProps {
  apartment: Apartment;
  onClick: () => void;
}

export function LessorApartmentCard({ apartment, onClick }: LessorApartmentCardProps) {
  return (
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
          
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
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
        </div>
      </CardFooter>
    </Card>
  );
} 