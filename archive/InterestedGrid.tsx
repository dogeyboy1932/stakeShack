import { Check, RotateCcw, UserCheck, UserX, X } from 'lucide-react';
import { ProfileCard } from '../src/components/profile/ProfileCard';
import { EmptyState } from '../src/components/ui/empty-state';
import { ActionButton } from '../src/components/ui/action-button';
import { ProfileActions } from '../src/components/profile/ProfileActions';
import { Profile } from '../src/lib/schema';



interface ProfileGridProps {
    profiles: Profile[];
    type: 'interested' | 'ignored';
    approvedProfile?: string;
    onChange: (type: 'approve' | 'cancel' | 'ignore' | 'restore', profile: Profile) => void;
    // onApprove?: (profile: Profile) => void;
    // onCancel?: (profile: Profile) => void;
    // onIgnore?: (profile: Profile) => void;
    // onRestore?: (profile: Profile) => void;
}

export function ProfileGrid({ profiles, type, approvedProfile, onChange}: ProfileGridProps) {

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
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
        </div>
    );
} 