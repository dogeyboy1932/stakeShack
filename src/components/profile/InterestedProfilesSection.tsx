import { useState, useEffect } from 'react';
import { LoadingState } from '../ui/loading-state';
import { ErrorState } from '../ui/error-state';
import { TabButton } from '../ui/tab-button';
import { Profile, Apartment } from '../../lib/schema';
import { getProfileById, updateApartmentInterestStatus } from '../../lib/database';
import { ProfileApplicationCard } from './InterestedProfileCard';
import { UserCheck, UserX, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface InterestedProfilesSectionProps {
    apartment: Apartment;
}

export function InterestedProfilesSection({ apartment }: InterestedProfilesSectionProps) {
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the tabs
    const [activeTab, setActiveTab] = useState<'interested' | 'ignored'>('interested');
    const [interestedProfiles, setInterestedProfiles] = useState<Profile[]>([]);
    const [ignoredProfiles, setIgnoredProfiles] = useState<Profile[]>([]);
    const [referrers, setReferrers] = useState<[string, string][]>([]);
    const [approvedProfile, setApprovedProfile] = useState<string>();


    useEffect(() => {
        async function loadProfiles() {
            try {
                setLoading(true);
                setError(null);
                
                const interestedProfiles = apartment.interested_profiles || [];
                const ignoredProfiles = apartment.ignored_profiles || [];
                const referrers1 = apartment.referrers_pubkeys || []
                
                const [interestedData, ignoredData] = await Promise.all([
                    Promise.all(interestedProfiles.map(async (profileId) => {
                        const profile = await getProfileById(profileId);
                        return profile;
                    })),
                    Promise.all(ignoredProfiles.map(async (profileId) => {
                        const profile = await getProfileById(profileId);
                        return profile;
                    })),
                ]);

                const filteredInterestedProfiles = interestedData.filter(Boolean) as Profile[];
                const filteredIgnoredProfiles = ignoredData.filter(Boolean) as Profile[];
                
                
                
                const approvedProfileInInterested = filteredInterestedProfiles.find(prof => prof.apartments_interested.get(apartment.id) === 'Approved');
                if (approvedProfileInInterested) {
                    setApprovedProfile(approvedProfileInInterested.id);
                }
                
                setInterestedProfiles(filteredInterestedProfiles);
                setIgnoredProfiles(filteredIgnoredProfiles);

                if (!referrers1) {
                    setReferrers(referrers1);
                }
            } catch (err) {
                console.error('Error loading profiles:', err);
                setError('Failed to load profiles');
            } finally {
                setLoading(false);
            }
        }
        
        loadProfiles();
    }, [apartment.interested_profiles, apartment.ignored_profiles]);



    const profiles = (activeTab === 'interested' ? interestedProfiles : ignoredProfiles);



    const handleChange = async (type: 'approve' | 'cancel' | 'ignore' | 'restore' | 'initialize', profile: Profile) => {
        const statusMap = { 
            approve: 'Approved', 
            cancel: 'Pending', 
            ignore: 'Available',  // FIX: RIGHT NOW I DON'T WANT PEOPLE KNOWING THEY'VE BEEN REJECTED. CUZ IT SUCKS
            restore: 'Available',
            initialize: 'Staking'
        } as const;

        // const messageMap = {
        //     approve: `Invitation sent to ${profile.name}! They have been approved for this apartment.`,
        //     cancel: `Approval cancelled for ${profile.name}. Their status has been reset to pending.`,
        //     ignore: `${profile.name} has been moved to ignored list.`,
        //     restore: `${profile.name} has been restored to interested list.`
        // };

        try {
            const success = await updateApartmentInterestStatus(profile.id, apartment.id, statusMap[type]);
            
            if (success) {
                // Update local state based on action
                if (type === 'approve') setApprovedProfile(profile.id);
                if (type === 'cancel') setApprovedProfile(undefined);
                if (type === 'ignore') {
                    setInterestedProfiles(prev => prev.filter(p => p.id !== profile.id));
                    setIgnoredProfiles(prev => [...prev, profile]);
                }
                if (type === 'restore') {
                    setIgnoredProfiles(prev => prev.filter(p => p.id !== profile.id));
                    setInterestedProfiles(prev => [...prev, profile]);
                }
                if (type === 'initialize') {
                    // Check if the profile was referred by looking in the referrers array
                    const referrerEntry = referrers.find(([profileId, referrerPubkey]) => profileId === profile.id);
                    const referrerPubkey = referrerEntry ? referrerEntry[1] : null;

                    console.log(referrerEntry)
                    
                    // Navigate to escrow page with optional referrer public key
                    const url = `/escrow/${apartment.id}${referrerPubkey ? `?referrer=${referrerPubkey}` : ''}`;
                    router.push(url);
                }

                // console.log(`${type} action completed for:`, profile.name);
                // alert(messageMap[type]);
            } else {
                alert(`Failed to ${type} profile. Please try again.`);
            }
        } catch (error) {
            console.error(`Error ${type}ing profile:`, error);
            alert(`An error occurred while ${type}ing the profile.`);
        }
    };



    if (loading) {
        return <LoadingState message="Loading user profiles..." />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={() => window.location.reload()} />;
    }

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Tenant Applications</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{interestedProfiles.length + ignoredProfiles.length} total applications</span>
                    </div>
                </div>
                
                
                {/* Tab Navigation */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                    <TabButton
                        isActive={activeTab === 'interested'}
                        onClick={() => setActiveTab('interested')}
                        icon={<UserCheck className="h-5 w-5" />}
                        label="Interested"
                        count={interestedProfiles.length}
                        activeColor="blue"
                    />
                    <TabButton
                        isActive={activeTab === 'ignored'}
                        onClick={() => setActiveTab('ignored')}
                        icon={<UserX className="h-5 w-5" />}
                        label="Ignored"
                        count={ignoredProfiles.length}
                        activeColor="red"
                    />
                </div>
            </div>


            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 p-2">
                {profiles.map((profile) => {
                    return (
                        <ProfileApplicationCard 
                            key={profile.id}
                            profile={profile}
                            activeTab={activeTab}
                            approvedProfile={approvedProfile}
                            apartmentId={apartment.id}
                            onAction={handleChange}
                        />
                    );
                })}
            </div>
        </div>
    );
} 