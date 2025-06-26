"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SignupData, SignupResponse, SignupError } from "@/types";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => void;
    error: string | null;
    userId: string | null;
    userEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
    backendUrl?: string;
}

export function AuthProvider({ children, backendUrl }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Check if user is already authenticated on mount
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        const storedUserEmail = localStorage.getItem("userEmail");
        if (storedUserId && storedUserEmail) {
            setUserId(storedUserId);
            setUserEmail(storedUserEmail);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${backendUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Login failed" }));
                throw new Error(errorData.message || "Invalid credentials");
            }

            const data = await response.json();

            // Store user ID and email if provided by backend
            if (data.id) {
                localStorage.setItem("userId", data.id);
                setUserId(data.id);
            }

            // Store the email used for login
            localStorage.setItem("userEmail", email);
            setUserEmail(email);

            setIsAuthenticated(true);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (data: SignupData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${backendUrl}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    first_name: data.firstName,
                    last_name: data.lastName,
                    username: data.username,
                    email: data.email,
                    password: data.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Signup failed" }));

                // Check for 'detail' field first (backend uses this), then 'message' as fallback
                const errorMessage = errorData.detail || errorData.message || "Signup failed";
                setError(errorMessage);
                throw new Error(errorMessage);
            }

            const responseData: SignupResponse = await response.json();

            // Store user information after successful signup
            if (responseData.id) {
                localStorage.setItem("userId", responseData.id);
                setUserId(responseData.id);
            }

            localStorage.setItem("userEmail", data.email);
            setUserEmail(data.email);

            setIsAuthenticated(true);
            setError(null);
        } catch (err) {
            // Don't change authentication state on signup error
            // Error is already set above for backend errors
            if (!error) {
                setError(err instanceof Error ? err.message : "Signup failed");
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        setUserId(null);
        setUserEmail(null);
        setIsAuthenticated(false);
        setError(null);
    };

    const value = {
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        error,
        userId,
        userEmail,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 