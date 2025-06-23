import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { LoadingState } from '../ui/loading-state';
import { ErrorState } from '../ui/error-state';
import { TabButton } from '../ui/tab-button';
import { ProfileGrid } from './ProfileGrid';
import { Profile, Apartment } from '../../lib/schema';
import { getProfileById, ignoreProfileForApartment, restoreProfileForApartment } from '../../lib/database';

interface InterestedProfilesSectionProps {
    apartment: Apartment;
}



export function InterestedProfilesSection({ apartment }: InterestedProfilesSectionProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the tabs
    const [activeTab, setActiveTab] = useState<'interested' | 'ignored'>('interested');
    const [interestedProfiles, setInterestedProfiles] = useState<Profile[]>([]);
    const [ignoredProfiles, setIgnoredProfiles] = useState<Profile[]>([]);
    const [approvedProfiles, setApprovedProfiles] = useState<Set<string>>(new Set());


    useEffect(() => {
        async function loadProfiles() {
            try {
                setLoading(true);
                setError(null);
                
                const interestedProfiles = apartment.interested_profiles || [];
                const ignoredProfiles = apartment.ignored_profiles || [];
                
                const [interestedData, ignoredData] = await Promise.all([
                    Promise.all(interestedProfiles.map(async (prof) => {
                        const profile = await getProfileById(prof[0]);
                        return profile;
                    })),
                    Promise.all(ignoredProfiles.map(async (prof) => {
                        const profile = await getProfileById(prof[0]);
                        return profile;
                    }))
                ]);
                
                setInterestedProfiles(interestedData.filter(Boolean) as Profile[]);
                setIgnoredProfiles(ignoredData.filter(Boolean) as Profile[]);
            } catch (err) {
                console.error('Error loading profiles:', err);
                setError('Failed to load profiles');
            } finally {
                setLoading(false);
            }
        }
        
        loadProfiles();
    }, [apartment.interested_profiles, apartment.ignored_profiles]);


    const handleChange = (type: 'approve' | 'cancel' | 'ignore' | 'restore', profile: Profile) => {
        console.log('handleChange', type, profile)
        switch (type) {
            case 'approve':
                handleProfileApprove(profile);
                break;
            case 'cancel':
                handleProfileCancel(profile);
                break;
            case 'ignore':
                handleProfileIgnore(profile);
                break;  
            case 'restore':
                handleProfileRestore(profile);
                break;
        }
    };


    const handleProfileApprove = async (profile: Profile) => { //FIX: Implement approval logic
        setApprovedProfiles(prev => new Set([...prev, profile.id]));
        console.log('Approved:', profile.name);
    };


    const handleProfileCancel = async (profile: Profile) => { //FIX: Implement cancel logic
        setApprovedProfiles(prev => {
            const newSet = new Set(prev);
            newSet.delete(profile.id);
            return newSet;
        });
        console.log('Cancelled approval for:', profile.name);
    };



    const handleProfileIgnore = async (profile: Profile) => {
        const success = await ignoreProfileForApartment(apartment.id, profile.id);
        if (success) {
            setInterestedProfiles(prev => prev.filter(p => p.id !== profile.id));
            setIgnoredProfiles(prev => [...prev, profile]);
        }
    };

    const handleProfileRestore = async (profile: Profile) => {
        const success = await restoreProfileForApartment(apartment.id, profile.id);
        if (success) {
            setIgnoredProfiles(prev => prev.filter(p => p.id !== profile.id));
            setInterestedProfiles(prev => [...prev, profile]);
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
            <div className="p-6">
                <div className="space-y-6">
                    <ProfileGrid
                        profiles={activeTab === 'interested' ? interestedProfiles : ignoredProfiles}
                        type={activeTab}
                        approvedProfiles={approvedProfiles}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
} 