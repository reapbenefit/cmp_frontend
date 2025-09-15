"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SignupData, SignupResponse } from "@/types";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    authenticateWithSSO: (code: string) => Promise<void>;
    logout: () => void;
    error: string | null;
    userId: string | null;
    userEmail: string | null;
    username: string | null;
    getAuthHeaders: () => { [key: string]: string };
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

// Helper function to set cookie
export const setCookie = (name: string, value: string, days: number = 3650) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

// Helper function to get cookie
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

// Helper function to delete cookie
const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Helper function to get URL search parameter
export const getUrlParameter = (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
};

// Helper function to remove URL parameter
export const removeUrlParameter = (paramName: string) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete(paramName);
    window.history.replaceState({}, document.title, url.toString());
};

export function AuthProvider({ children, backendUrl }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    // Check if user is already authenticated on mount
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        const storedUserEmail = localStorage.getItem("userEmail");
        const storedUsername = localStorage.getItem("username");
        const sessionToken = getCookie("sid");

        console.log(storedUserId, storedUserEmail, storedUsername, sessionToken)

        if (storedUserId && sessionToken) {
            setUserId(storedUserId);
            setUserEmail(storedUserEmail);
            setUsername(storedUsername);
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

            // Store user ID if provided by backend
            if (data.id) {
                localStorage.setItem("userId", data.id);
                setUserId(data.id);
            }

            // Set test session ID in cookie for development
            // data.sid = "pkV5fpChSt4sGSgWsWhDxA0txqtMqv";

            // Store the email used for login
            localStorage.setItem("userEmail", email);
            setUserEmail(email);

            // Make an API call to get the username for the user and store it
            const usernameResponse = await fetch(`${backendUrl}/users/${data.sid}/username`, {
                method: "GET"
            });

            if (usernameResponse.ok) {
                const username = await usernameResponse.json();
                if (username) {
                    localStorage.setItem("username", username);
                    setUsername(username);
                }
            }

            // Store the session token (sid) in cookies
            if (data.sid) {
                setCookie("sid", data.sid)
            }

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

            // Store the session token (sid) in cookies if provided
            if (responseData.sid) {
                setCookie("sid", responseData.sid)
            }

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

    const authenticateWithSSO = async (code: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const tokenUrl = `${backendUrl}/login_with_sso`;

            // Construct the payload as a URL-encoded string
            const payload = {
                code: code,
            }

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            const response = await fetch(tokenUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "SSO authentication failed" }));
                throw new Error(errorData.message || "SSO authentication failed");
            }

            const data = await response.json();

            // Store user ID if provided by backend
            if (data.id) {
                localStorage.setItem("userId", data.id);
                setUserId(data.id);
            }

            // Store the email used for login
            localStorage.setItem("userEmail", data.email);
            setUserEmail(data.email);

            localStorage.setItem("username", data.username);
            setUsername(data.username);

            // Store the session token (sid) in cookies
            if (data.sid) {
                setCookie("sid", data.sid);
            }

            setIsAuthenticated(true);
            setError(null);

        } catch (err) {
            setError(err instanceof Error ? err.message : "SSO authentication failed");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("username");
        deleteCookie("sid");
        setUserId(null);
        setUserEmail(null);
        setUsername(null);
        setIsAuthenticated(false);
        setError(null);
    };

    // Helper function to get authentication headers for API requests
    const getAuthHeaders = () => {
        const sessionToken = getCookie("sid");
        const headers: { [key: string]: string } = {
            "Content-Type": "application/json",
        };

        if (sessionToken) {
            headers["Authorization"] = `Bearer ${sessionToken}`;
        }

        return headers;
    };

    const value = {
        isAuthenticated,
        isLoading,
        login,
        signup,
        authenticateWithSSO,
        logout,
        error,
        userId,
        userEmail,
        username,
        getAuthHeaders,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 