import { useState } from "react";
import { Profile } from "../../lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Mail, Star, User, Anchor, Check, X, RotateCcw } from "lucide-react";


interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  

  return (
    <Card className={`w-full max-w-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-white/20 bg-white/90 backdrop-blur-sm`}>
      <CardHeader className="bg-gradient-to-r from-orange-100 via-amber-50 to-yellow-100 border-b border-orange-200/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-orange-900">{profile.name}</CardTitle>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-sm font-medium text-orange-700">{profile.reputationScore}</span>
              </div>
            </div>
          </div>
          {/* {approvalStatus && (
            <Badge 
              className={`${
                approvalStatus === 'ready' ? 'bg-green-100 text-green-700 border-green-200' :
                approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                'bg-red-100 text-red-700 border-red-200'
              } font-semibold`}
            >
              {approvalStatus}
            </Badge>
          )} */}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4 bg-gradient-to-b from-amber-50 via-orange-50 to-red-50">
        <div>
          <h4 className="text-sm font-semibold text-orange-900 mb-2">Bio</h4>
          <p className="text-sm text-orange-800 leading-relaxed">{profile.bio}</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-white/70 rounded-lg border border-orange-200/50 backdrop-blur-sm">
            <Mail className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">{profile.email}</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white/70 rounded-lg border border-orange-200/50 backdrop-blur-sm">
            <Anchor className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-mono text-orange-700 truncate">
              {profile.pubkey}
            </span>
          </div>
        </div>
        
        {/* {profile.apartmentsInterested.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Interested in Apartments</h4>
            <div className="flex flex-wrap gap-1">
              {profile.apartmentsInterested.map(apartmentId => (
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