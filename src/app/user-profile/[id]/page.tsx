"use client";

import { useAuth } from '@/lib/auth';
import Portfolio from '@/components/Portfolio';
import { useState, useEffect } from 'react';

export default function PortfolioPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('');
    const { isAuthenticated, username, isLoading, userEmail, logout } = useAuth();

    useEffect(() => {
        params.then(({ id: resolvedId }) => {
            setId(resolvedId);
        });
    }, [params]);

    useEffect(() => {
        if (!isLoading && isAuthenticated && username && id) {
            // If user is logged in and viewing their own profile, show edit mode
            if (username === id) {
                return; // Stay on the page, show edit mode
            } else {
                // If user is logged in but viewing someone else's profile, show view-only mode
                return;
            }
        } else if (!isLoading && !isAuthenticated) {
            // If user is not logged in, show view-only mode
            return;
        }
    }, [isAuthenticated, username, id, isLoading]);

    const handleSignOut = async () => {
        try {
            // Call the logout API
            const response = await fetch(`${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}/api/method/solve_ninja.api.user.logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `token c0cc2217644fb77:6ed939a14e50a07`,
                    'Content-Type': 'application/json',
                    'Cookie': 'Cookie_1=value'
                },
                body: JSON.stringify({
                    username: userEmail || username
                })
            });

            if (!response.ok) {
                console.error('Logout API call failed:', response.status);
            }
        } catch (error) {
            console.error('Error calling logout API:', error);
        } finally {
            // Always call the local logout function to clear local state
            logout();
            // Redirect to home page after logout
            window.location.href = '/';
        }
    };

    if (isLoading || !id) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>;
    }

    // Determine if this is the user's own profile
    const isOwnProfile = isAuthenticated && username === id;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - always visible */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left side - Logo/Image */}
                        <div className="flex items-center">
                            <img 
                                src="/solve-ninja-logo22f1bc.png" 
                                alt="Solve Ninja" 
                                className="h-8 w-auto sm:h-10 cursor-pointer"
                                onClick={() => {
                                    window.location.href = `${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}`;
                                }}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLDivElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                            <div className="hidden ml-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg px-3 py-1">
                                <span className="text-white text-sm font-semibold">Solve Ninja</span>
                            </div>
                        </div>
                        
                        {/* Right side - Navigation items */}
                        <nav className="flex items-center space-x-6">
                            <button
                                onClick={() => {
                                    // Navigate to leaderboard page
                                    window.location.href = `${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}`;
                                }}
                                className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium cursor-pointer"
                            >
                                Leaderboard
                            </button>
                            {/* Show Sign out button if user is authenticated */}
                            {isAuthenticated && (
                                <button
                                    onClick={handleSignOut}
                                    className="text-gray-700 hover:text-red-600 transition-colors text-sm font-medium cursor-pointer"
                                >
                                    Sign out
                                </button>
                            )}
                            {/* Only show Login button if user is not authenticated */}
                            {!isAuthenticated && (
                                <button
                                    onClick={() => {
                                        const portfolioBaseUrl = `${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}/api/method/frappe.integrations.oauth2.authorize?client_id=${process.env.NEXT_PUBLIC_SSO_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}&scope=all`;
                                        if (portfolioBaseUrl && typeof window !== 'undefined') {
                                            window.location.href = portfolioBaseUrl;
                                        }
                                    }}
                                    className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium cursor-pointer"
                                >
                                    Login
                                </button>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
            
            <Portfolio username={id} viewOnly={!isOwnProfile} />
        </div>
    );
}
