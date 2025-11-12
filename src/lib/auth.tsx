"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    authenticateWithSSO: (code: string) => Promise<void>;
    logout: () => void;
    error: string | null;
    userId: string | null;
    userEmail: string | null;
    username: string | null;
    getAuthHeaders: () => { [key: string]: string };
    redirectToLogin: () => void;
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
export const getCookie = (name: string): string | null => {
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

    // Check if user is already authenticated on mount using get_logged_user endpoint
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Call get_logged_user endpoint to check if user is authenticated
                const loggedUserResponse = await fetch(`${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}/api/method/frappe.auth.get_logged_user`, {
                    method: "GET",
                    credentials: 'include', // Include cookies in the request
                });

                if (loggedUserResponse.ok) {
                    const loggedUserData = await loggedUserResponse.json();
                    
                    if (loggedUserData && loggedUserData.message) {
                            try {
                                // Call API to get user profile
                                const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}/api/method/solve_ninja.api.profile.get_user_profile`, {
                                    method: "GET",
                                    credentials: 'include',
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                });

                                if (profileResponse.ok) {
                                    const userProfile = await profileResponse.json();
                                    
                                    if (userProfile && userProfile.message) {
                                        const profile = userProfile.message;
                                        
                                        // Store user data in localStorage
                                        if (profile.current_user.username) {
                                            localStorage.setItem("username", profile.current_user.username);
                                            setUsername(profile.current_user.username);
                                        }
                                        if (profile.current_user.email) {
                                            localStorage.setItem("userEmail", profile.current_user.email);
                                            setUserEmail(profile.current_user.email);
                                        }

                                        // Call second API to get/create user by email
                                        const userResponse = await fetch(`${backendUrl}/get_or_create_user_by_email`, {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({
                                                first_name: profile.current_user.first_name || "",
                                                last_name: profile.current_user.last_name || "",
                                                username: profile.current_user.username || "",
                                                email: profile.current_user.email || "",
                                            }),
                                        });

                                        if (userResponse.ok) {
                                            const userData = await userResponse.json();
                                            if (userData) {
                                                localStorage.setItem("userId", userData);
                                                setUserId(userData);
                                            }
                                        }
                                    }
                                }
                            } catch (profileError) {
                                console.error("Error fetching user profile:", profileError);
                            }
  
                        
                        setIsAuthenticated(true);
                    } else {
                        setIsAuthenticated(false);
                    }
                } else {
                    // User is not logged in
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Error checking logged user:", error);
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, [backendUrl]);

    // Redirect to external login page
    const redirectToLogin = () => {
        const currentUrl = window.location.href;
        const loginUrl = `/login?redirect-to=${encodeURIComponent(currentUrl)}`;
        window.location.href = loginUrl;
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

            // Store the session token (sid) in cookies
            if (data.sid) {
                setCookie("sid", data.sid);
                
                // Now fetch user profile using the new API approach
                try {
                    // Call API to get user profile
                    const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}/api/method/solve_ninja.api.profile.get_user_profile`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${data.sid}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (profileResponse.ok) {
                        const userProfile = await profileResponse.json();
                        
                        if (userProfile && userProfile.message) {
                            const profile = userProfile.message;
                            
                            // Store user data in localStorage
                            if (profile.username) {
                                localStorage.setItem("username", profile.username);
                                setUsername(profile.username);
                            }
                            if (profile.email) {
                                localStorage.setItem("userEmail", profile.email);
                                setUserEmail(profile.email);
                            }

                            // Call second API to get/create user by email
                            const userResponse = await fetch(`${backendUrl}/get_or_create_user_by_email`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    first_name: profile.first_name || "",
                                    last_name: profile.last_name || "",
                                    username: profile.username || "",
                                    email: profile.email || "",
                                }),
                            });

                            if (userResponse.ok) {
                                const userData = await userResponse.json();
                                if (userData.id) {
                                    localStorage.setItem("userId", userData.id);
                                    setUserId(userData.id);
                                }
                            }
                        }
                    }
                } catch (profileError) {
                    console.error("Error fetching user profile after SSO:", profileError);
                    // Fallback to old data if available
                    if (data.id) {
                        localStorage.setItem("userId", data.id);
                        setUserId(data.id);
                    }
                    if (data.email) {
                        localStorage.setItem("userEmail", data.email);
                        setUserEmail(data.email);
                    }
                    if (data.username) {
                        localStorage.setItem("username", data.username);
                        setUsername(data.username);
                    }
                }
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
        authenticateWithSSO,
        logout,
        error,
        userId,
        userEmail,
        username,
        getAuthHeaders,
        redirectToLogin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 