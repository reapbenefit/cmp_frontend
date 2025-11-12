"use client";

import { useAuth, getUrlParameter, removeUrlParameter } from "@/lib/auth";
import { useState, useEffect } from "react";
// import AuthContainer from "./AuthContainer";

interface AuthWrapperProps {
    children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
    const { isAuthenticated, isLoading, authenticateWithSSO, redirectToLogin } = useAuth();
    const [ssoLoading, setSsoLoading] = useState(false);

    // Handle SSO flow when component mounts
    useEffect(() => {
        const handleSSO = async () => {
            // Only process SSO if user is not already authenticated and not currently loading
            console.log(isAuthenticated, isLoading)
            if (isAuthenticated || isLoading) return;

            console.log(isAuthenticated, isLoading)

            const ssoCode = getUrlParameter("code");
            if (ssoCode) {
                setSsoLoading(true);

                try {
                    await authenticateWithSSO(ssoCode);
                    // Clean up URL after successful authentication
                    removeUrlParameter("code");
                } catch (err) {
                    console.error("SSO authentication failed", err);
                    // Clean up URL even on failure to prevent retry loops
                    removeUrlParameter("code");
                } finally {
                    setSsoLoading(false);
                }
            }
        };

        handleSSO();
    }, [isAuthenticated, isLoading, authenticateWithSSO]);

    // Show loading state during initial authentication check or SSO flow
    if (isLoading || ssoLoading) {
        const loadingMessage = ssoLoading ? "Signing you in..." : "Loading...";
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{loadingMessage}</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        const ssoCode = getUrlParameter("code");

        if (!ssoCode) {
            // Redirect to external login page
            redirectToLogin();
            return null; // Return null while redirect is happening
        }
    }

    // Show main app if authenticated
    return <>{children}</>;
} 