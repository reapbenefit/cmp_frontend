"use client";

import { useState, useEffect } from "react";
import { MapPin, CheckCircle, Share2, Copy, Check, Star } from "lucide-react";
import ActionCard from "@/components/ActionCard";
import SkillModal from "@/components/SkillModal";
import ActionModal from "@/components/ActionModal";
// import CommunityCard, { Community } from "@/components/CommunityCard";
// import AddCommunityModal from "@/components/AddCommunityModal";
import CustomizeTopActionsModal from "@/components/CustomizeTopActionsModal";
import AuthWrapper from "@/components/AuthWrapper";
import { useAuth } from "@/lib/auth";
import { Action, UserProfile, ApiSkill } from "@/types";
import ContributionHeatmap from "@/components/ContributionHeatmap";
import { ExpertReview } from "@/types";
import ExpertReviewCard from "@/components/ExpertReviewCard";


export default function Portfolio({ username, viewOnly }: { username: string, viewOnly: boolean }) {
    // Always call useAuth hook but ignore its values in viewOnly mode
    const authHook = useAuth();
    const { isLoading: authLoading, userEmail } = viewOnly ? { isLoading: false, userEmail: null } : authHook;
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [expertReviews, setExpertReviews] = useState<ExpertReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<ApiSkill | null>(null);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'actions'>('overview');
    // const [userCommunities, setUserCommunities] = useState<Community[]>([]);
    // const [isAddCommunityModalOpen, setIsAddCommunityModalOpen] = useState(false);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [topActionIds, setTopActionIds] = useState<string[]>([]);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

    // Edit states - remove unused inline editing states
    const [updateLoading, setUpdateLoading] = useState(false);

    // Edit profile states
    const [editBio, setEditBio] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editState, setEditState] = useState('');

    // Set client flag to avoid hydration issues
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            // Don't fetch if auth is still loading (only check auth in non-viewOnly mode) or no username
            if ((!viewOnly && authLoading) || !username) {
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/portfolio/${username}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const userData: UserProfile = await response.json();
                setUserProfile(userData);
                setExpertReviews(userData.expert_reviews || []);

                // Set pinned actions - if none are pinned, use top 4
                if (userData.actions) {
                    const pinnedActions = userData.actions.filter(action => action.is_pinned);
                    if (pinnedActions.length > 0) {
                        setTopActionIds(pinnedActions.map(action => action['uuid']));
                    } else {
                        // Use top 4 actions if none are pinned
                        const top4Actions = userData.actions.slice(0, 4);
                        setTopActionIds(top4Actions.map(action => action['uuid']));
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load profile');
                console.error('Error fetching user profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [username, authLoading, viewOnly]);

    // Get current top actions based on selected IDs
    const currentTopActions = (userProfile?.actions || []).filter(action => topActionIds.includes(action['uuid']));

    // All actions from API
    const allActions = userProfile?.actions || [];

    // const handleAddCommunity = (newCommunity: Community) => {
    //     // Add the new community at the top of the list
    //     setUserCommunities(prev => [newCommunity, ...prev]);
    // };

    const handleSaveTopActions = (selectedActionIds: string[]) => {
        setTopActionIds(selectedActionIds);
    };

    const handleShareProfile = () => {
        setIsShareModalOpen(true);
    };

    const handleCopyLink = async () => {
        const profileLink = `${window.location.origin}/user-profile/${userProfile?.username}`;
        try {
            await navigator.clipboard.writeText(profileLink);
            setCopied(true);

            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopied(false);
            }, 2000);

        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    // Update functions
    const handleSaveProfile = async () => {
        if (!userProfile) return;

        setUpdateLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bio: editBio || null,
                    location_city: editCity || null,
                    location_state: editState || null,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setUserProfile(prev => prev ? {
                ...prev,
                bio: editBio || null,
                location_city: editCity || null,
                location_state: editState || null,
            } : null);
            setIsEditingProfile(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            // You could add error handling UI here
        } finally {
            setUpdateLoading(false);
        }
    };

    // Helper function to format location
    const formatLocation = (city: string | null, state: string | null, country: string | null) => {
        const parts = [city, state, country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'No location set';
    };

    const handleEditProfile = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}/edit-profile/${userEmail}/edit`;
    };

    const handleRequestExpertReview = () => {
        window.open(`${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}/request-expert-recommendations/new?user=${userEmail}`, '_blank');
    };

    const cancelEditProfile = () => {
        setIsEditingProfile(false);
        setEditBio('');
        setEditCity('');
        setEditState('');
    };

    // Expert review navigation functions
    const handlePreviousReview = () => {
        setCurrentReviewIndex(prev => 
            prev === 0 ? expertReviews.length - 1 : prev - 1
        );
    };

    const handleNextReview = () => {
        setCurrentReviewIndex(prev => 
            prev === expertReviews.length - 1 ? 0 : prev + 1
        );
    };

    // Show loading state while auth is loading (only in non-viewOnly mode) or profile is loading
    if ((!viewOnly && authLoading) || loading) {
        const loadingContent = (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
        return viewOnly ? loadingContent : <AuthWrapper>{loadingContent}</AuthWrapper>;
    }

    // Show error if no username after auth loading is complete (only check auth in non-viewOnly mode)
    if (!viewOnly && !authLoading && !username) {
        const errorContent = (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Error</h3>
                    <p className="text-gray-600 mb-4">Unable to load user information. Please log in again.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
        return <AuthWrapper>{errorContent}</AuthWrapper>;
    }

    // Show error state for API fetch errors
    if (error) {
        const apiErrorContent = (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load profile</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
        return viewOnly ? apiErrorContent : <AuthWrapper>{apiErrorContent}</AuthWrapper>;
    }

    // Don't render if no user profile
    if (!userProfile) {
        return null;
    }

    const fullName = `${userProfile.first_name} ${userProfile.last_name}`;

    const content = (
        <div className="min-h-screen bg-gray-50">

                <div className="sm:max-w-7xl mx-auto p-4 md:p-6">
                    {/* Back to Home Button */}
                    {!viewOnly && (
                        <div className="mb-4 md:mb-6">
                            <button
                                onClick={() => window.location.href = '/'}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                                <span className="text-sm font-medium">Back to home</span>
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-20">
                        {/* Left sidebar - Profile */}
                        <div className="w-full lg:w-72 lg:flex-shrink-0">
                            <div className="lg:sticky lg:top-8">
                                {/* Avatar and Name Section */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 text-center sm:text-left">
                                    {/* Avatar Image */}
                                    {userProfile.image ? (
                                        <img 
                                            src={userProfile.image} 
                                            alt={`${userProfile.first_name} ${userProfile.last_name}`}
                                            className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLDivElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-20 h-20 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 ${userProfile.image ? 'hidden' : ''}`}>
                                        <span className="text-white text-2xl sm:text-xl font-bold">
                                            {userProfile.first_name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Name and Username */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                            <h1 className="text-2xl sm:text-xl font-bold text-gray-900 truncate">{fullName}</h1>
                                            {userProfile.is_verified && (
                                                <CheckCircle className="w-5 h-5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xl sm:text-lg text-gray-600 font-light truncate">{userProfile.username}</p>
                                    </div>
                                </div>

                                {/* Bio */}
                                {!isEditingProfile && (
                                    <div className="mb-4 text-center sm:text-left">
                                       {userProfile.bio && (
                                        <p
                                          className="text-gray-700 leading-relaxed"
                                          dangerouslySetInnerHTML={{ __html: userProfile.bio }}
                                        />
                                      )}
                                    </div>
                                )}

                                {/* Location */}
                                {!isEditingProfile && (
                                    <div className="mb-4">
                                        {(userProfile.location_city || userProfile.location_state) && (
                                            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                <span>{formatLocation(userProfile.location_city, userProfile.location_state, userProfile.location_country)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {!viewOnly && (
                                  <div className="mb-4">
                                    <button
                                      onClick={() => window.location.href = "/"}
                                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer w-full justify-center"
                                    >
                                      Add action
                                    </button>
                                  </div>
                                )}
                                {/* Inline Edit Form */}
                                {isEditingProfile && (
                                    <div className="mb-4 space-y-3 p-4 bg-gray-50 rounded-lg border">
                                        {/* Bio Edit */}
                                        <div>
                                            <textarea
                                                value={editBio}
                                                onChange={(e) => setEditBio(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:border-gray-400 text-sm leading-relaxed text-gray-700"
                                                rows={3}
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>

                                        {/* Location Edit */}
                                        <div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={editCity}
                                                    onChange={(e) => setEditCity(e.target.value)}
                                                    placeholder="City"
                                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400 text-sm text-gray-600"
                                                />
                                                <input
                                                    type="text"
                                                    value={editState}
                                                    onChange={(e) => setEditState(e.target.value)}
                                                    placeholder="State"
                                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400 text-sm text-gray-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Cancel and Save Buttons */}
                                        <div className="flex flex-col sm:flex-row justify-end gap-2">
                                            <button
                                                onClick={cancelEditProfile}
                                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer order-2 sm:order-1"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={updateLoading}
                                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-50 order-1 sm:order-2"
                                            >
                                                {updateLoading ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Save
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Edit Profile Button */}
                                {!isEditingProfile && !viewOnly && (
                                    <div className="mb-4">
                                        <button
                                            onClick={handleEditProfile}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium cursor-pointer w-full justify-center"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit profile
                                        </button>
                                    </div>
                                )}

                                {/* Request Expert Review Button */}
                                {!viewOnly && (
                                    <div className="mb-4">
                                        <button
                                            onClick={handleRequestExpertReview}
                                            className="flex items-center gap-2 px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors text-sm font-medium cursor-pointer w-full justify-center"
                                        >
                                            <Star className="w-4 h-4" />
                                            Request expert review
                                        </button>
                                    </div>
                                )}

                                {/* Share Profile Button */}
                                {!viewOnly && (
                                    <div className="mb-4">
                                        <button
                                            onClick={handleShareProfile}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer w-full justify-center"
                                    >
                                        <Share2 className="w-4 h-4" />
                                            Share profile
                                        </button>
                                    </div>
                                )}

                                {/* Horizontal separator */}
                                <div className="border-t border-gray-200 my-6"></div>

                                {/* Skills */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Skills</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                                        {userProfile?.skills && userProfile.skills.length > 0 ? (
                                            userProfile.skills.sort((a, b) => b.history.length - a.history.length).map((skill) => (
                                                <div
                                                    key={skill.id}
                                                    className="relative group cursor-pointer flex flex-col items-start sm:items-center"
                                                    onClick={() => setSelectedSkill(skill)}
                                                >
                                                    <div className="relative mb-2">
                                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                                                            <img
                                                                src={`/badges/${skill.name}.png`}
                                                                alt={skill.label}
                                                                className="w-full h-full object-cover"
                                                                title={skill.label}
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                        {skill.history.length > 1 && (
                                                            <div className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-semibold">
                                                                x{skill.history.length}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-700 text-left sm:text-center leading-tight px-1">
                                                        {skill.label}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-3 text-center py-6">
                                                <div className="text-gray-400 mb-3">
                                                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    Your skills will appear here once you start recording your actions as a Solve Ninja
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right content */}
                        <div className="flex-1 min-w-0">
                            {/* Navigation Tabs */}
                            <div className="border-b border-gray-200 mb-6 lg:mb-8">
                                <nav className="flex gap-4 sm:gap-8 overflow-x-auto">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`pb-3 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors whitespace-nowrap ${activeTab === 'overview'
                                            ? 'border-orange-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                            </svg>
                                            <span>Overview</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('actions')}
                                        className={`pb-3 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors whitespace-nowrap ${activeTab === 'actions'
                                            ? 'border-orange-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                            <span>Actions</span>
                                            <span className="bg-gray-200 text-gray-900 text-xs px-2 py-0.5 rounded-full">
                                                {allActions.length}
                                            </span>
                                        </div>
                                    </button>

                                    {/* <button
                                        onClick={() => setActiveTab('communities')}
                                        className={`pb-3 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors ${activeTab === 'communities'
                                            ? 'border-orange-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                            </svg>
                                            Communities
                                            <span className="bg-gray-200 text-gray-900 text-xs px-2 py-0.5 rounded-full">
                                                {userCommunities.length}
                                            </span>
                                        </div>
                                    </button> */}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'overview' ? (
                                <>
                                    {/* Actionable Personality Summary */}
                                    {userProfile?.highlight && (
                                        <div className="mb-8 bg-gradient-to-br from-blue-50 via-green-50 to-orange-50 rounded-xl p-6 border border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                  <p
                                                    className="text-gray-700 leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: userProfile.highlight }}
                                                  />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pinned Actions */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-gray-900">Top actions</h2>
                                            {currentTopActions.length > 0 && !viewOnly && (
                                                <button
                                                    onClick={() => setIsCustomizeModalOpen(true)}
                                                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                                                >
                                                    Customize your top actions
                                                </button>
                                            )}
                                        </div>

                                        {currentTopActions.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentTopActions.map(action => (
                                                    <ActionCard
                                                        key={action['uuid']}
                                                        action={action}
                                                        onActionClick={(a) => setSelectedAction(a)}
                                                        variant="compact"
                                                        viewOnly={viewOnly}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 px-4">
                                                <div className="text-gray-400 mb-4">
                                                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to make an impact?</h3>
                                                <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-4">
                                                    Start your journey as a Solve Ninja by recording your first action. Your top actions will be showcased here to inspire others!
                                                </p>
                                                <button
                                                    onClick={() => window.location.href = '/'}
                                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer font-medium text-sm sm:text-base"
                                                >
                                                    Record your first action
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expert Reviews */}
                                    {expertReviews.length > 0 && (
                                        <div className="mb-8">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Expert reviews</h2>

                                            <div className="relative">
                                                <div className="w-full max-w-4xl mx-auto">
                                                    <ExpertReviewCard
                                                        review={expertReviews[currentReviewIndex]}
                                                        variant="default"
                                                    />
                                                </div>

                                                {expertReviews.length > 1 && (
                                                    <div className="flex items-center justify-center gap-4 mt-6">
                                                        <button
                                                            onClick={handlePreviousReview}
                                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                            Previous
                                                        </button>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">
                                                                {currentReviewIndex + 1} of {expertReviews.length}
                                                            </span>
                                                        </div>

                                                        <button
                                                            onClick={handleNextReview}
                                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                                        >
                                                            Next
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Expert Reviews Placeholder - only show if no reviews and not view-only */}
                                    {expertReviews.length === 0 && !viewOnly && (
                                        <div className="mb-8">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Expert reviews</h2>
                                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                                <div className="text-gray-400 mb-4">
                                                    <Star className="w-12 h-12 mx-auto" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No expert reviews yet</h3>
                                                <p className="text-gray-600 mb-4">
                                                    Expert reviews will appear here once you request them for your actions.
                                                </p>
                                                <button
                                                    onClick={handleRequestExpertReview}
                                                    className="px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors cursor-pointer"
                                                >
                                                    Request expert review
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contribution Graph */}
                                    <ContributionHeatmap actions={userProfile?.actions || []} />
                                </>
                            ) : activeTab === 'actions' ? (
                                /* Actions Tab Content */
                                <div className="space-y-6">
                                    {allActions.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {allActions.map(action => (
                                                <ActionCard
                                                    key={action['uuid']}
                                                    action={action}
                                                    onActionClick={(a) => setSelectedAction(a)}
                                                    variant="compact"
                                                    viewOnly={viewOnly}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 sm:py-16 px-4">
                                            <div className="text-gray-400 mb-6">
                                                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Your action portfolio awaits!</h3>
                                            <p className="text-gray-600 max-w-lg mx-auto leading-relaxed mb-6">
                                                Every great changemaker starts with a single action. Record your actions to build your portfolio and inspire your community. Whether it is organizing a cleanup drive, advocating for local policy, or leading an environmental project - your actions matter!
                                            </p>
                                            <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span>Discover local issues</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span>Investigate solutions</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                    <span>Solve problems</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    <span>Share your impact</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                                {/* Communities Tab Content */}
                                {/* <div className="space-y-6">
                                    {userCommunities.length > 0 && (
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => setIsAddCommunityModalOpen(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Community
                                            </button>
                                        </div>
                                    )}

                                    {userCommunities.length > 0 ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {userCommunities.map(community => (
                                                <CommunityCard
                                                    key={community.id}
                                                    community={community}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-gray-400 mb-4">
                                                <Users className="w-12 h-12 mx-auto" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No communities yet</h3>
                                            <p className="text-gray-600 mb-4">Start building your network by joining communities that align with your interests.</p>
                                            <button
                                                onClick={() => setIsAddCommunityModalOpen(true)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Your First Community
                                            </button>
                                        </div>
                                    )}
                                </div> */}
                        </div>
                    </div>
                </div>

            {/* Share Profile Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Share Profile</h2>
                            <button
                                onClick={() => setIsShareModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                            <input
                                type="text"
                                value={isClient ? `${window.location.origin}/user-profile/${userProfile.username}` : ''}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${copied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Skill Modal */}
            <SkillModal
                skill={selectedSkill}
                onClose={() => setSelectedSkill(null)}
            />

            {/* Action Modal */}
            {selectedAction && (
                <ActionModal
                    action={selectedAction}
                    onClose={() => setSelectedAction(null)}
                />
            )}

            {/* Add Community Modal */}
            {/* <AddCommunityModal
                isOpen={isAddCommunityModalOpen}
                onClose={() => setIsAddCommunityModalOpen(false)}
                onAdd={handleAddCommunity}
                username={username}
            /> */}

            {/* Customize Top Actions Modal */}
            <CustomizeTopActionsModal
                isOpen={isCustomizeModalOpen}
                onClose={() => setIsCustomizeModalOpen(false)}
                allActions={allActions}
                currentTopActionIds={topActionIds}
                onSave={handleSaveTopActions}
            />
        </div>
    );

    // Conditionally wrap with AuthWrapper based on viewOnly mode
    return viewOnly ? content : <AuthWrapper>{content}</AuthWrapper>;
}
