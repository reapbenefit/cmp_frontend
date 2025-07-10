"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import SignUpForm from "@/components/SignUpForm";
import { SignupData } from "@/types";

export default function AuthContainer() {
    // Persist auth mode in localStorage so the UI stays on the same form even if the component remounts
    const [isSignUp, setIsSignUp] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("authMode") === "signup";
        }
        return false;
    });
    const { login, signup, isLoading, error } = useAuth();

    const handleSwitchToSignup = () => {
        setIsSignUp(true);
        if (typeof window !== "undefined") {
            localStorage.setItem("authMode", "signup");
        }
    };

    const handleSwitchToLogin = () => {
        setIsSignUp(false);
        if (typeof window !== "undefined") {
            localStorage.setItem("authMode", "login");
        }
    };

    // Custom signup handler that doesn't change form state on error
    const handleSignup = async (data: SignupData) => {
        try {
            await signup(data);
            // Only on success, the auth context will set isAuthenticated to true
            // and AuthWrapper will handle the navigation
        } catch {
            // Stay on signup form when there's an error
            // Error is already handled by the auth context
        }
    };

    if (isSignUp) {
        return (
            <SignUpForm
                onSignup={handleSignup}
                onSwitchToLogin={handleSwitchToLogin}
                isLoading={isLoading}
                error={error || undefined}
            />
        );
    }

    return (
        <LoginForm
            onLogin={login}
            isLoading={isLoading}
            error={error || undefined}
        />
    );
} 