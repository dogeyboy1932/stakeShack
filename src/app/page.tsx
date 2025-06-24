"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ApartmentCard } from "../components/apartment/ApartmentCard";
import { getApartmentsPaginated, seedDatabase } from "../lib/database";
import { Apartment, ApartmentStatus } from "../lib/schema";
import { useProfile } from "../contexts/ProfileContext";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { profile } = useProfile();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const observer = useRef<IntersectionObserver | undefined>(undefined);

  const handleApartmentClick = (apartmentId: string) => {
    router.push(`/tenant/apartment/${apartmentId}`);
  };

  const loadApartments = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (!profile) return;
    
    try {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);
      
      // Seed the database with initial data if needed (only on first load)
      // if (pageNum === 0) await seedDatabase();
    
             // Fetch apartments with pagination
       const result = await getApartmentsPaginated(
         pageNum, 
         20, 
         profile
       );
      
      if (reset || pageNum === 0) {
        setApartments(result.apartments);
      } else {
        setApartments(prev => [...prev, ...result.apartments]);
      }
      
      setHasMore(result.hasMore);
      setTotal(result.total);
      setPage(pageNum);
    } catch (err) {
      setError("Failed to load apartments");
      console.error("Error loading apartments:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [profile]);

  // Last apartment card ref for intersection observer
  const lastApartmentElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadApartments(page + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, page, loadApartments]);

  
  
  useEffect(() => {
    loadApartments(0, true);
  }, [profile, refreshKey, loadApartments]);

  
  
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
  }, []);

  
  
  
  
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
    );
  }

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
                onClick={() => {
                  setError(null);
                  loadApartments(0, true);
                }}
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
            Browse and find your next home. {apartments.length}{total > apartments.length ? ` of ${total}` : ''} apartments{hasMore ? ' (scroll for more)' : ''}.
          </p>
        </div>
        
        {/* Content Section */}
        {apartments.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
            <div className="text-center">
              <p className="text-gray-700 font-medium text-lg">No apartments available at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {apartments.map((apartment, index) => {
                const isLast = index === apartments.length - 1;
                return (
                  <div 
                    key={apartment.id}
                    ref={isLast ? lastApartmentElementRef : null}
                  >
                    <ApartmentCard 
                      apartment={apartment} 
                      onClick={() => handleApartmentClick(apartment.id)}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="text-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading more apartments...</p>
              </div>
            )}
            
            {/* End of results indicator */}
            {!hasMore && apartments.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-gray-600">You've reached the end! No more apartments to load.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



        {/* Navigation Card */}
        {/* <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/tenant" className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all font-semibold">
              🏠 Tenant Portal
            </Link>
            <Link href="/lessor" className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all font-semibold">
              🏢 Lessor Portal
            </Link>
            <Link href="/escrow" className="bg-yellow-400/90 text-purple-900 px-6 py-3 rounded-xl hover:bg-yellow-300 transition-all font-bold shadow-lg">
              🚀 Solana Escrow (NEW!)
            </Link>
          </div>
        </div> */}
