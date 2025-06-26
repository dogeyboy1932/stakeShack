import { useState } from "react";
import { Save, Edit3, User, Mail, Phone, FileText, Star, Key } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Profile } from "../../lib/schema";
import { updateProfile, checkUsernameAvailable } from "../../lib/database";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "next/navigation";


interface ProfileDetailsProps {
    profile: Profile;
}

export function ProfileDetails({ profile }: ProfileDetailsProps) {
    const { userId } = useProfile();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: profile.name,
        username: profile.username,
        bio: profile.bio,
        email: profile.email,
        phone: profile.phone || '',
        referral_limit: profile.referral_limit,
        pubkey: profile.pubkey
    });

    const handleSave = async () => {
        // Basic validation
        if (!formData.name.trim()) {
            alert('Name is required');
            return;
        }
        if (!formData.username.trim()) {
            alert('Username is required');
            return;
        }
        if (!formData.email.trim()) {
            alert('Email is required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            alert('Please enter a valid email address');
            return;
        }

        setSaving(true);

        try {
            // Check if username is available (if it's being changed)
            if (formData.username.trim() !== profile.username) {
                const isAvailable = await checkUsernameAvailable(formData.username.trim(), profile.id);
                if (!isAvailable) {
                    alert('Username is already taken. Please choose a different username.');
                    setSaving(false);
                    return;
                }
            }

            const success = await updateProfile(profile.id, {
                name: formData.name.trim(),
                username: formData.username.trim(),
                bio: formData.bio.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim() || undefined,
                referral_limit: formData.referral_limit,
                pubkey: formData.pubkey.trim() || undefined
            });

            if (success) {
                setIsEditing(false);
                // Refresh the page to show updated data
                window.location.reload();
            } else {
                alert('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: profile.name,
            username: profile.username,
            bio: profile.bio,
            email: profile.email,
            phone: profile.phone || '',
            referral_limit: profile.referral_limit,
            pubkey: profile.pubkey
        });
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100">
            <div className="container mx-auto max-w-4xl py-8">
            { profile.id === userId && (
                <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-800 to-teal-800 bg-clip-text text-transparent">Your Profile</h1>
                    
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md font-medium"
                        >
                            <Edit3 className="h-4 w-4" />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md font-medium disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Profile Card */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200/50">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                                        <User className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl text-emerald-900">Profile Info</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 space-y-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <User className="h-4 w-4" />
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                            placeholder="Enter your full name"
                                        />
                                    ) : (
                                        <p className="px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900">{profile.name}</p>
                                    )}
                                </div>

                                {/* Username */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Key className="h-4 w-4" />
                                        Username
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                            placeholder="Enter your username"
                                        />
                                    ) : (
                                        <p className="px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900">@{profile.username}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Mail className="h-4 w-4" />
                                        Email Address
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                            placeholder="Enter your email address"
                                        />
                                    ) : (
                                        <p className="px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900">{profile.email}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Phone className="h-4 w-4" />
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                            placeholder="Enter your phone number (optional)"
                                        />
                                    ) : (
                                        <p className="px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900">{profile.phone || 'Not provided'}</p>
                                    )}
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <FileText className="h-4 w-4" />
                                        Bio
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    ) : (
                                        <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 min-h-[100px]">{profile.bio}</p>
                                    )}
                                </div>

                                {/* Referral Limit */}
                                <div className="space-y-2">
                                    {profile.id === userId && (  
                                        <>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <Star className="h-4 w-4" />
                                                Referral Limit
                                            </label>
                                                                                
                                            <p className="px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900">{profile.referral_limit} referrals allowed</p>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>


                    {/* Stats & Activity Sidebar */}
                    <div className="space-y-6">
                        {/* Reputation Card */}
                        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/50 shadow-lg">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                                        <Star className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-yellow-900">Reputation</CardTitle>
                                        <CardDescription className="text-yellow-700">Trust score</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-yellow-800">{profile.reputationScore.toFixed(1)}</div>
                                    <div className="text-sm text-yellow-600">out of 5.0</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Stats */}
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 shadow-lg">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg text-blue-900">Activity</CardTitle>
                                <CardDescription className="text-blue-700">Platform activity</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-blue-700">Interested In</span>
                                    <span className="font-bold text-blue-900">{profile.apartments_interested?.size || 0}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-blue-700"
                                        onClick={() => router.push(`/users/${profile.username}/listings`)}
                                    >
                                        ApartmentListings
                                    </span>
                                    
                                    <span className="font-bold text-blue-900">{profile.apartments_for_sale?.length || 0}</span>
                                </div>

                                

                                { profile.id === userId && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-blue-700">Referrals Made</span>
                                        <span className="font-bold text-blue-900">{profile.referral_statuses?.size || 0}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Account Info */}
                        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/50 shadow-lg">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg text-gray-900">Account</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">User ID</div>
                                    <div className="text-sm font-mono text-gray-800 break-all">{profile.id}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Public Key</div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.pubkey}
                                            onChange={(e) => setFormData({...formData, pubkey: e.target.value})}
                                            className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                            placeholder="Enter your email address"
                                        />
                                    ) : (
                                        <div className="text-sm font-mono text-gray-800 break-all">{profile.pubkey}</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
} 