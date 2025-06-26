"use client";

import { useAuth } from "@/lib/auth";
import AuthContainer from "@/components/AuthContainer";

interface AuthWrapperProps {
    children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading state during initial authentication check to avoid hydration mismatch
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show auth forms if not authenticated
    if (!isAuthenticated) {
        return <AuthContainer />;
    }

    // Show main app if authenticated
    return <>{children}</>;
} 