import { useState } from 'react';
import { X, Home, DollarSign, MapPin, Calendar, ImageIcon, Plus } from 'lucide-react';
import { Apartment } from '../../lib/schema';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../contexts/ProfileContext';

interface CreateApartmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (apartment: Apartment) => void;
}

const COMMON_AMENITIES = [
  'WiFi', 'Air Conditioning', 'Heating', 'Parking', 'Laundry', 'Dishwasher',
  'Gym', 'Pool', 'Balcony', 'Pet Friendly', 'Furnished', 'Elevator',
  'Security', 'Storage', 'Garden', 'Fireplace'
];

export function CreateApartmentForm({ isOpen, onClose, onSuccess}: CreateApartmentFormProps) {
  const [formData, setFormData] = useState({
    image: '',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 0,
    rent: 0,
    location: '',
    stake: 0.01,
    reward: 0.1,
    amenities: [] as string[],
    description: '',
    available_from: '',
    available_until: ''
  });

  const { userId } = useProfile();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);









  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);


    if (formData.stake < 0.01 || formData.stake > 1) {
      setError('Stake must be between 0.01 and 1');
      setLoading(false);
      return;
    }

    if (formData.reward < 0 || formData.reward > 1) {
      setError('Reward must be between 0 and 1');
      setLoading(false);
      return;
    }


    try {
      // Create the apartment object with defaults
      const newApartment: Omit<Apartment, 'id'> = {
        ...formData,
        owner: userId,
        interested: 0,
        // Handle empty dates by converting to undefined (which becomes null in DB)
        available_from: formData.available_from || undefined,
        available_until: formData.available_until || undefined,
        // Handle empty description
        description: formData.description || undefined,
        // Add missing required properties
        referral_limit: 0,
        referrers_pubkeys: new Map<string, string>(),
      };


      console.log('newApartment', newApartment);


      // Insert into Supabase
      const { data, error: insertError } = await supabase
        .from('apartments')
        .insert([newApartment])
        .select()
        .single();

      // console.log('insertError', insertError);

      if (insertError) throw insertError;

      // Get current lessor profile to update apartments_for_sale array
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('apartments_for_sale')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // console.log('profileData', profileData);

      // Update lessor's apartments_for_sale array
      const updatedApartments = [...(profileData.apartments_for_sale || []), data.id];
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          apartments_for_sale: updatedApartments
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // console.log('updateError', updateError);

      onSuccess(data);
      onClose();
      
      // Reset form
      setFormData({
        image: '',
        bedrooms: 1,
        bathrooms: 1,
        sqft: 500,
        rent: 1000,
        location: '',
        stake: 500,
        reward: 0.1,
        amenities: [],
        description: '',
        available_from: '',
        available_until: ''
      });

      console.log("Successfully created apartment");
    } catch (err) {
      console.error('Error creating apartment:', err);
      setError('Failed to create apartment listing');
    } finally {
      setLoading(false);
    }
  };











  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Listing</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="h-4 w-4 inline mr-1" />
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/apartment-image.jpg"
              required
            />
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="h-4 w-4 inline mr-1" />
                Bedrooms
              </label>
              <input
                type="float"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) }))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
              <input
                type="float"
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: parseFloat(e.target.value) }))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Square Footage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Square Feet</label>
            <input
              type="float"
              min="1"
              value={formData.sqft}
              onChange={(e) => setFormData(prev => ({ ...prev, sqft: parseInt(e.target.value) }))}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Rent and Stake */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Monthly Rent ($)
              </label>
              <input
                type="float"
                min="0"
                value={formData.rent}
                onChange={(e) => setFormData(prev => ({ ...prev, rent: parseInt(e.target.value) }))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Stake ($)</label>
              <input
                type="float"
                min="0.01"
                value={formData.stake}
                onChange={(e) => setFormData(prev => ({ ...prev, stake: parseInt(e.target.value) }))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reward ($)</label>
              <input
                type="float"
                min="0"
                value={formData.reward}
                onChange={(e) => setFormData(prev => ({ ...prev, reward: parseInt(e.target.value) }))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Downtown Seattle, WA"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your apartment..."
            />
          </div>

          {/* Availability Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Available From
              </label>
              <input
                type="date"
                value={formData.available_from}
                onChange={(e) => setFormData(prev => ({ ...prev, available_from: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Until</label>
              <input
                type="date"
                value={formData.available_until}
                onChange={(e) => setFormData(prev => ({ ...prev, available_until: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_AMENITIES.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 