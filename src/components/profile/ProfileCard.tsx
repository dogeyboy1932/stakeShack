import { useState } from "react";
import { Profile } from "../../lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Mail, Star, User, Anchor, Check, X, RotateCcw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSummary } from '@/contexts/SummaryContext';


interface ProfileCardProps {
  profile: Profile;
  onClick?: () => void;
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const router = useRouter();
  const { openSummary } = useSummary();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={`w-full max-w-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-200/40 border border-emerald-200 bg-white backdrop-blur-sm hover:scale-105`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 border-b border-emerald-400 cursor-pointer"
        onClick={() => {
          router.push(`/users/${profile.username}`);
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/30">
              <User className="h-6 w-6 text-white" />
            </div>

            <div>
              <CardTitle className="text-lg font-bold text-white drop-shadow-sm">{profile.name}</CardTitle>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-indigo-400 text-indigo-400" />
                <span className="text-sm font-medium text-emerald-100">{profile.reputationScore}</span>
              </div>
            </div>

          </div>

          {/* AI Summary Button */}
          <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openSummary('profile', profile);
              }}
              className="group relative p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm border border-white/30 transition-all duration-200 hover:scale-110"
              title="AI Profile Analysis"
            >
              <Sparkles className="h-4 w-4 text-yellow-300 group-hover:text-yellow-200 transition-colors" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
        <div>
          <h4 className="text-sm font-semibold text-emerald-700 mb-2">Bio</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <Mail className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-gray-700">{profile.email}</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <Anchor className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-mono text-gray-600 truncate">
              {profile.pubkey}
            </span>
          </div>
        </div>
        
        {/* {profile.apartments_interested.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Interested in Apartments</h4>
            <div className="flex flex-wrap gap-1">
              {profile.apartments_interested.map(apartmentId => (
                <Badge key={apartmentId} variant="outline" className="text-xs">
                  #{apartmentId.slice(0, 8)}
                </Badge>
              ))}
            </div>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
} 