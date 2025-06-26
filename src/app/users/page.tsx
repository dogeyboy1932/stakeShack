"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ProfileCard } from "../../components/profile/ProfileCard";
import { getProfilesPaginated } from "../../lib/database";
import { Profile } from "../../lib/schema";
import { LoadingState } from "../../components/ui/loading-state";
import { ErrorState } from "../../components/ui/error-state";
import { EmptyState } from "../../components/ui/empty-state";
import { Users } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const { userId } = useProfile();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const router = useRouter();
  
  const observer = useRef<IntersectionObserver | undefined>(undefined);

  
  const loadProfiles = useCallback(async (pageNum: number, reset: boolean = false) => {
    try {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);
    
      // Fetch profiles with pagination
      const result = await getProfilesPaginated(pageNum, 20, userId);
      
      if (reset || pageNum === 0) {
        setProfiles(result.profiles);
      } else {
        setProfiles(prev => [...prev, ...result.profiles]);
      }
      
      setHasMore(result.hasMore);
      setTotal(result.total);
      setPage(pageNum);
    } catch (err) {
      setError("Failed to load profiles");
      console.error("Error loading profiles:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);


  // Last profile card ref for intersection observer
  const lastProfileElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadProfiles(page + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, page, loadProfiles]);



  useEffect(() => {
    loadProfiles(0, true);
  }, [loadProfiles]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="container mx-auto max-w-7xl py-8 space-y-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-700 bg-clip-text text-transparent">
              Community Profiles
            </h1>
            <p className="text-gray-700 font-medium mt-2 text-lg">
              Connect with lessors and tenants in your area.
            </p>
          </div>
          <LoadingState message="Loading profiles..." />
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
              Community Profiles
            </h1>
            <p className="text-gray-700 font-medium mt-2 text-lg">
              Connect with lessors and tenants in your area.
            </p>
          </div>
          <ErrorState 
            error={error}
            onRetry={() => {
              setError(null);
              loadProfiles(0, true);
            }}  
            buttonName="Refresh"
          />
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
            Community Profiles
          </h1>

          <p className="text-gray-700 font-medium mt-2 text-lg">
            Connect with lessors and tenants in your area. {profiles.length}{total > profiles.length ? ` of ${total}` : ''} users{hasMore ? ' (scroll for more)' : ''}.
          </p>
        </div>
        
        {/* Content Section */}
        {profiles.length === 0 ? (
          <EmptyState
            icon={<Users className="h-20 w-20 text-gray-400" />}
            title="No profiles found"
            description="There are no user profiles to display at the moment."
          />
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
            
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            </div> */}
            

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profiles.map((profile, index) => {
                    const isLast = index === profiles.length - 1;
                    return (
                      <div 
                        key={profile.id}
                        ref={isLast ? lastProfileElementRef : null}
                      >
                        <ProfileCard 
                          profile={profile} 
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
                {!hasMore && profiles.length > 0 && (
                  <div className="text-center mt-8">
                    <p className="text-gray-600">You've reached the end! No more apartments to load.</p>
                  </div>
                )}
            </div>  
          </div>
        )}
        </div>
      </div>
  );
}
