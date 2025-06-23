"use client";

import { useEffect, useState } from "react";
import { ApartmentCard } from "../components/apartment/ApartmentCard";
import { getApartments, seedDatabase } from "../lib/database";
import { Apartment, ApartmentStatus } from "../lib/schema";
import { useProfile } from "../contexts/ProfileContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { profile } = useProfile();
  const [apartments, setApartments] = useState<(Apartment)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);


  const handleApartmentClick = (apartmentId: string) => {
    // console.log('clicked', apartmentId);
    router.push(`/tenant/apartment/${apartmentId}`);
  };


  async function fetchData() {
    try {
      setLoading(true);
      
      // Seed the database with initial data if needed
      await seedDatabase();
    
      // Fetch apartments with user-specific statuses from Supabase
      const apartmentData = await getApartments(profile?.apartmentsInterested.keys());
      
      setApartments(apartmentData); 
    } catch (err) {
      setError("Failed to load apartments");
      console.error("Error loading apartments:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [profile, refreshKey]); // Trigger on every profile change or manual refresh

  // Force refresh data when navigating to this page
  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1);
    };

    // Listen for when user returns to this tab/page
    window.addEventListener('focus', handleFocus);
    
    // Also refresh when component mounts (page visit)
    setRefreshKey(prev => prev + 1);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // Empty dependency array - only run on mount/unmount


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="container mx-auto max-w-7xl py-8 space-y-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-700 bg-clip-text text-transparent">
              Apartments Gallery
            </h1>
            <p className="text-gray-700 font-medium mt-2 text-lg">
              Browse and find your next home.
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-indigo-600 mx-auto"></div>
              <p className="mt-6 text-gray-700 font-semibold text-xl">Loading apartments...</p>
            </div>
          </div>
        </div>
      </div>
    )}

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="container mx-auto max-w-7xl py-8 space-y-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-700 bg-clip-text text-transparent">
              Apartments Gallery
            </h1>
            <p className="text-gray-700 font-medium mt-2 text-lg">
              Browse and find your next home.
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-16">
            <div className="text-center">
              <p className="text-red-600 font-bold text-2xl mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg font-semibold text-lg transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="container mx-auto max-w-7xl py-8 space-y-8">
        {/* Header Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-700 bg-clip-text text-transparent">
            Apartments Gallery
          </h1>
          <p className="text-gray-700 font-medium mt-2 text-lg">
            Browse and find your next home. {apartments.length} apartments available.
          </p>
        </div>
        
        {/* Content Section */}
        {apartments.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-16">
            <div className="text-center">
              <p className="text-gray-700 font-medium text-lg">No apartments available at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {apartments.map((apartment) => 
                {
                  return(
                  
                    <ApartmentCard 
                      key={apartment.id} 
                      apartment={apartment} 
                      onClick={() => handleApartmentClick(apartment.id)}
                    />
                  )
                })
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
