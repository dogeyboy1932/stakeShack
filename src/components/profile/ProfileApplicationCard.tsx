import { Profile } from "../../lib/schema";
import { ProfileCard } from './ProfileCard';
import { ActionButton } from '../ui/action-button';
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileApplicationCardProps {
  profile: Profile;
  activeTab: 'interested' | 'ignored';
  approvedProfile?: string;
  apartmentId: string;
  onAction: (type: 'approve' | 'cancel' | 'ignore' | 'restore' | 'initialize', profile: Profile) => void;
}

export function ProfileApplicationCard({ 
  profile, 
  activeTab, 
  approvedProfile, 
  apartmentId,
  onAction 
}: ProfileApplicationCardProps) {
  
  const router = useRouter();

  const isApproved = approvedProfile === profile.id;
  
  // Check if tenant has marked themselves as ready for this specific apartment
  const isReady = profile.apartmentsInterested?.get(apartmentId) === 'Ready';


  return (
    <div className={`group ${activeTab === 'ignored' ? 'opacity-75 hover:opacity-100 transition-opacity' : ''} max-w-100`}>
      <div className={`bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg border border-purple-300/30 p-6 transform transition-all duration-300 ${
        activeTab === 'interested' 
          ? (isApproved ? 'ring-2 ring-emerald-400/60 shadow-emerald-500/30' : 'hover:scale-102 hover:shadow-xl hover:shadow-purple-500/20')
          : 'grayscale hover:grayscale-0 hover:shadow-xl hover:shadow-purple-500/20'
      }`}>
        
        <div className="flex justify-center mb-6">
          <ProfileCard 
            profile={profile} 
            onClick={() => {
              router.push(`/users/${profile.username}`);
            }}
          />
        </div>
        
        <div className="w-full">
          {activeTab === 'interested' ? ( 
            isReady ? (
              <div className="flex gap-3">
                <div className="w-1/4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                  <Check className="h-4 w-4" />
                  <span>Ready</span>
                </div>
 
                <button 
                  onClick={() => onAction('initialize', profile)} 
                  className=
                    "w-3/4 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-300 shadow-lg transform text-white bg-gradient-to-r from-stone-400 via-zinc-400 to-gray-600"
                >
                  <ArrowRight className="h-4 w-4" />
                  Initialize Escrow
                </button>
              </div>

            ) : isApproved ? (
              <div className="flex gap-3">
                <div className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-md shadow-emerald-500/25 border border-emerald-500/20 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all">
                  <Check className="h-4 w-4" />
                  <span>Approved</span>
                </div>
                <ActionButton variant="cancel" onClick={() => onAction('cancel', profile)} className="flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                  <RotateCcw className="h-4 w-4" />
                  Cancel
                </ActionButton>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <ActionButton disabled={!!approvedProfile} variant="approve" onClick={() => onAction('approve', profile)} className="px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                  <Check className="h-4 w-4" />
                  Approve
                </ActionButton>
                <ActionButton variant="ignore" onClick={() => onAction('ignore', profile)} className="px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                  <X className="h-4 w-4" />
                  Ignore
                </ActionButton>
              </div>
            )
          ) : (
            <ActionButton variant="restore" onClick={() => onAction('restore', profile)} className="w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium">
              <RotateCcw className="h-4 w-4" />
              Restore
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
} 