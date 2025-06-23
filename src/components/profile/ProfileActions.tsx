import { Check, X, RotateCcw } from 'lucide-react';
import { ActionButton } from '../ui/action-button';
import { Profile } from '../../lib/schema';

interface ProfileActionsProps {
    profile: Profile;
    isApproved: boolean;
    onApprove: () => void;
    onCancel: () => void;
    onIgnore: () => void;
}

export function ProfileActions({ profile, isApproved, onApprove, onCancel, onIgnore }: ProfileActionsProps) {
    if (isApproved) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Approved</span>
                </div>
                <ActionButton variant="cancel" onClick={onCancel} className="w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Cancel Approval
                </ActionButton>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            <ActionButton variant="approve" onClick={onApprove} className="px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md">
                <Check className="h-4 w-4" />
                Approve
            </ActionButton>
            <ActionButton variant="ignore" onClick={onIgnore} className="px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md">
                <X className="h-4 w-4" />
                Ignore
            </ActionButton>
        </div>
    );
} 