"use client";

import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { ProfileDetails } from "@/components/profile/ProfilePage";
import { useProfile } from "@/contexts/ProfileContext";

export default function ProfilePage() {
    const { profile, loading, error} = useProfile();

    if (loading) {
        return <LoadingState title="Your Profile" message="Loading profile..." />;
    }

    if (error || !profile) {
        return (
            <ErrorState 
                title="Your Profile"
                error={error || 'Profile not found. Please create a profile on the authentication page to get started.'}
                showRetry={false}
            />
        );
    }

    return <ProfileDetails profile={profile} />;
} 