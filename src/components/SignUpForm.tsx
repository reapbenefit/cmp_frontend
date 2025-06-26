"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignupData } from "@/types";

interface SignUpFormProps {
    onSignup: (data: SignupData) => Promise<void>;
    onSwitchToLogin: () => void;
    isLoading?: boolean;
    error?: string;
}

export default function SignUpForm({ onSignup, onSwitchToLogin, isLoading = false, error }: SignUpFormProps) {
    const [formData, setFormData] = useState<SignupData>({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            errors.firstName = "First name is required";
        }

        if (!formData.lastName.trim()) {
            errors.lastName = "Last name is required";
        }

        if (!formData.username.trim()) {
            errors.username = "Username is required";
        } else if (formData.username.length < 3) {
            errors.username = "Username must be at least 3 characters long";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            errors.password = "Password is required";
        } else if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters long";
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSignup(formData);
        } catch (err) {
            // Error is handled by parent component through error prop
        }
    };

    const isFormValid = Object.values(formData).every(value => value.trim() !== "");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
            <div className="max-w-2xl w-full mx-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            Join the Solve Ninja Movement
                        </h1>
                        <p className="text-gray-600">Create your changemaker account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* First Name and Last Name on same line */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your first name"
                                />
                                {validationErrors.firstName && (
                                    <p className="text-red-600 text-sm mt-1">{validationErrors.firstName}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your last name"
                                />
                                {validationErrors.lastName && (
                                    <p className="text-red-600 text-sm mt-1">{validationErrors.lastName}</p>
                                )}
                            </div>
                        </div>

                        {/* Email and Username on same line */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your email"
                                />
                                {validationErrors.email && (
                                    <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${validationErrors.username ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Choose a username"
                                />
                                {validationErrors.username && (
                                    <p className="text-red-600 text-sm mt-1">{validationErrors.username}</p>
                                )}
                            </div>
                        </div>

                        {/* Password and Confirm Password on same line */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${validationErrors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Create a password"
                                />
                                {validationErrors.password && (
                                    <p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Confirm your password"
                                />
                                {validationErrors.confirmPassword && (
                                    <p className="text-red-600 text-sm mt-1">{validationErrors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <button
                                onClick={onSwitchToLogin}
                                className="text-green-600 hover:text-green-700 font-medium cursor-pointer hover:underline"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 