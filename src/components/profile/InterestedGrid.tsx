import { Check, RotateCcw, UserCheck, UserX, X } from 'lucide-react';
import { ProfileCard } from './ProfileCard';
import { EmptyState } from '../ui/empty-state';
import { ActionButton } from '../ui/action-button';
import { ProfileActions } from './ProfileActions';
import { Profile } from '../../lib/schema';

interface ProfileGridProps {
    profiles: Profile[];
    type: 'interested' | 'ignored';
    approvedProfiles?: Set<string>;
    onChange: (type: 'approve' | 'cancel' | 'ignore' | 'restore', profile: Profile) => void;
    // onApprove?: (profile: Profile) => void;
    // onCancel?: (profile: Profile) => void;
    // onIgnore?: (profile: Profile) => void;
    // onRestore?: (profile: Profile) => void;
}

export function ProfileGrid({ profiles, type, approvedProfiles, onChange}: ProfileGridProps) {
    const emptyStates = {
        interested: {
            icon: <UserCheck className="h-20 w-20 text-blue-300" />,
            title: "No applications yet",
            description: "When users express interest in this apartment, their profiles will appear here for your review."
        },
        ignored: {
            icon: <UserX className="h-20 w-20 text-gray-300" />,
            title: "No ignored applications", 
            description: "Applications you've ignored will appear here. You can restore them anytime."
        }
    };

    if (profiles.length === 0) {
        return <EmptyState {...emptyStates[type]} />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {profiles.map((profile) => {
                const isApproved = approvedProfiles?.has(profile.id) ?? false;
                
                return (
                    <div key={profile.id} className={`group ${type === 'ignored' ? 'opacity-75 hover:opacity-100 transition-opacity' : ''}`}>
                        
                        <div className={`bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg border border-purple-300/30 p-6 transform transition-all duration-300 ${
                            type === 'interested' 
                                ? (isApproved ? 'scale-105 ring-2 ring-emerald-400/60 shadow-emerald-500/30' : 'hover:scale-102 hover:shadow-xl hover:shadow-purple-500/20')
                                : 'grayscale hover:grayscale-0 hover:shadow-xl hover:shadow-purple-500/20'
                        }`}>
                            
                            <div className="flex justify-center mb-6">
                                <ProfileCard profile={profile} />
                            </div>
                            
                            
                            <div className="w-full">
                                {type === 'interested' ? ( 
                                    isApproved ? (
                                        <div className="flex flex-col space-y-3">
                                            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-400/20 text-emerald-200 rounded-lg border border-emerald-300/40 font-medium backdrop-blur-sm">
                                                <Check className="h-5 w-5" />
                                                <span>Approved</span>
                                            </div>
                                            <ActionButton variant="cancel" onClick={() => onChange('cancel', profile)} className="w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                                                <RotateCcw className="h-4 w-4" />
                                                Cancel
                                            </ActionButton>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <ActionButton variant="approve" onClick={() => onChange('approve', profile)} className="px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                                                <Check className="h-4 w-4" />
                                                Approve
                                            </ActionButton>
                                            <ActionButton variant="ignore" onClick={() => onChange('ignore', profile)} className="px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                                                <X className="h-4 w-4" />
                                                Ignore
                                            </ActionButton>
                                        </div>
                                    )
                                ) : (
                                    <ActionButton variant="restore" onClick={() => onChange('restore', profile)} className="w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                                        <RotateCcw className="h-4 w-4" />
                                        Restore
                                    </ActionButton>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
} 