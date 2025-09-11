"use client";

import { useAuth } from '@/lib/auth';
import Portfolio from '@/components/Portfolio';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortfolioPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('');
    const { isAuthenticated, username, isLoading } = useAuth();
    const router = useRouter();

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
            {/* Sign-in banner for non-logged-in users */}
            {!isAuthenticated && (
                <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                
                                <div className="ml-3">
                                    <p className="text-sm text-blue-100">
                                        Sign in to submit your actions and start your changemaking journey
                                    </p>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <button
                                    onClick={() => {
                                        const portfolioBaseUrl = `${process.env.NEXT_PUBLIC_PORTFOLIO_BASE_URL}/api/method/frappe.integrations.oauth2.authorize?client_id=${process.env.NEXT_PUBLIC_SSO_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}&scope=all`;
                                        if (portfolioBaseUrl && typeof window !== 'undefined') {
                                            window.location.href = portfolioBaseUrl;
                                        }
                                    }}
                                    className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <Portfolio username={id} viewOnly={!isOwnProfile} />
        </div>
    );
}
