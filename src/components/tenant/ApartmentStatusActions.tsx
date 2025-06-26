import { Heart, UserPlus } from 'lucide-react';

interface ApartmentStatusActionsProps {
  apartmentStatus: string | undefined | null;
  isInterested: boolean;
  interestLoading: boolean;
  onInterestToggle: () => void;
  onReferSomeone: () => void;
  onMarkReady: () => void;
  onGoToStake: () => void;
}

export function ApartmentStatusActions({
  apartmentStatus,
  isInterested,
  interestLoading,
  onInterestToggle,
  onReferSomeone,
  onMarkReady,
  onGoToStake
}: ApartmentStatusActionsProps) {
  if (apartmentStatus === null) return null;

  // Available/Pending/Undefined status - show interest and referral buttons
  if (apartmentStatus === 'Available' || apartmentStatus === 'Pending' || apartmentStatus === undefined) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
        <div className="flex gap-6 justify-center">
          <button
            onClick={onInterestToggle}
            disabled={interestLoading}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 transform hover:scale-105 ${
              isInterested
                ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 text-white hover:from-rose-600 hover:via-pink-600 hover:to-red-600 hover:shadow-xl'
                : 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 hover:shadow-xl'
            }`}
          >
            <Heart className={`h-6 w-6 ${isInterested ? 'fill-current' : ''}`} />
            {interestLoading ? 'Loading...' : (isInterested ? 'Remove Interest' : 'Mark Interest')}
          </button>

          <button
            onClick={onReferSomeone}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <UserPlus className="h-6 w-6" />
            Refer Someone
          </button>
        </div>
      </div>
    );
  }

  // Approved status - show mark ready button
  if (apartmentStatus === 'Approved') {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
        <div className="text-center space-y-4">
          <p className="text-gray-600 mb-6">You've been approved! Mark yourself as ready to proceed to staking.</p>
          <button
            onClick={onMarkReady}
            disabled={interestLoading}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
          >
            {interestLoading ? 'Updating...' : 'Mark as Ready'}
          </button>
        </div>
      </div>
    );
  }

  // Ready or Staking status - show go to stake button
  if (apartmentStatus === 'Ready' || apartmentStatus === 'Staking') {
    const message = apartmentStatus === 'Ready' 
      ? "You're ready to stake! Click below to go to the escrow page and complete your stake."
      : "The lessor has initialized an escrow for you! Click below to proceed to staking.";

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
        <div className="text-center space-y-4">
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onGoToStake}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Go to Escrow & Stake
          </button>
        </div>
      </div>
    );
  }

  // Final statuses - just show status
  if (apartmentStatus === 'Confirmed' || apartmentStatus === 'Denied' || apartmentStatus === 'Staked') {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
        <p className="text-lg font-medium text-center">Your apartment status is {apartmentStatus}</p>
      </div>
    );
  }

  return null;
} 