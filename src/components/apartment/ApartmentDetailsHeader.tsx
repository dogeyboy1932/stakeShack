import { ArrowLeft } from 'lucide-react';

interface ApartmentDetailsHeaderProps {
    onBack: () => void;
}

export function ApartmentDetailsHeader({ onBack }: ApartmentDetailsHeaderProps) {
    return (
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Apartment Details</h1>
                <p className="text-gray-600">View all interested tenants for this listing</p>
            </div>
        </div>
    );
} 