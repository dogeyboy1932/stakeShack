import { MapPin, Anchor, Users, CrownIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Apartment } from '../../lib/schema';

interface ApartmentSummaryProps {
    apartment: Apartment;
}

export function ApartmentSummary({ apartment }: ApartmentSummaryProps) {
    return (
        <div className="bg-white shadow-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image Section */}
                <div className="relative h-64 lg:h-full">
                    <img
                        src={apartment.image}
                        alt={`Image of ${apartment.location}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                {/* Content Section */}
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900">
                            ${apartment.rent.toLocaleString()}
                            <span className="text-lg font-normal text-gray-600">/month</span>
                        </h2>
                        <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            <span className="text-lg">{apartment.location}</span>
                        </div>
                    </div>
                    
                    {/* Property Details */}
                    <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{apartment.bedrooms}</div>
                            <div className="text-sm text-gray-600 font-medium">Bedrooms</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{apartment.bathrooms}</div>
                            <div className="text-sm text-gray-600 font-medium">Bathrooms</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{apartment.sqft}</div>
                            <div className="text-sm text-gray-600 font-medium">Sq Ft</div>
                        </div>
                    </div>
                    
                    {/* Key Information */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Anchor className="h-5 w-5 text-blue-600"/>
                                </div>
                                <span className="font-semibold text-gray-900">Required Stake</span>
                            </div>
                            <span className="text-xl font-bold text-blue-600">{apartment.stake.toLocaleString()} SOL</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2">
                                <Anchor className="h-5 w-5 text-blue-600"/>
                                <span className="text-sm font-medium text-gray-700">Reward</span>
                            </div>
                            <span className="text-lg font-bold text-blue-600">{apartment.reward.toLocaleString()} SOL</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Users className="h-5 w-5 text-emerald-600"/>
                                </div>
                                <span className="font-semibold text-gray-900">Interested Users</span>
                            </div>
                            <span className="text-xl font-bold text-emerald-600">{apartment.interested}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <CrownIcon className="h-5 w-5 text-yellow-600"/>
                                </div>
                                <span className="font-semibold text-gray-900">Owner</span>
                            </div>
                            <span className="text-xl font-bold text-green-600">{apartment.owner}</span>
                        </div>
                    </div>
                    
                    {/* Amenities */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-900">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                            {apartment.amenities.map(amenity => (
                                <Badge 
                                    key={amenity} 
                                    variant="secondary" 
                                    className="px-3 py-1 bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 font-medium"
                                >
                                    {amenity}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 