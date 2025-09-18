"use client";

import { useState } from "react";
import { Action } from "@/types";

interface ActionModalProps {
    action: Action | null;
    onClose: () => void;
}

export default function ActionModal({ action, onClose }: ActionModalProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'skills'>('summary');

    

    if (!action) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden"
            style={{ margin: 0, padding: 0 }}
        >
            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white rounded-lg w-full max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-3xl lg:max-w-4xl max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] relative overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-blue-50 to-green-50 p-3 sm:p-4 md:p-6 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 mb-2 pr-10 sm:pr-12 break-words leading-tight">
                        {action.title}
                    </h2>

                    <div className="flex flex-wrap gap-2 sm:gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm break-words">
                                {action.category}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs sm:text-sm break-words">
                                {action.type}
                            </span>
                        </div>

                        {Number(action.hours_invested) > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs sm:text-sm">
                                    {action.hours_invested}h
                                </span>
                            </div>
                        )}
                    </div>

                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`px-4 sm:px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${activeTab === 'summary'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('skills')}
                            className={`px-4 sm:px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${activeTab === 'skills'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Skills
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 md:p-6 max-h-80 sm:max-h-96 overflow-y-auto overflow-x-hidden">
                    {activeTab === 'summary' && (
                        <div className="space-y-6">
                            <div>
                                <p className="text-gray-700 leading-relaxed break-words">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'skills' && (
                        <div className="space-y-4">
                            {action.skills && action.skills.length > 0 ? (
                                action.skills.map((skill, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        {/* Skill chip */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <img
                                                src={`/badges/${skill.name}.png`}
                                                alt={skill.label}
                                                className="w-6 h-6 rounded-full"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                            <h2>
                                                {skill.label}
                                            </h2>
                                        </div>
                                        
                                        {/* Microskill details */}
                                        {skill.microskill && (
                                            <div className="ml-4 sm:ml-8 space-y-2">
                                                <div className="space-y-1 sm:space-y-0 sm:flex sm:space-x-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-600 font-medium">
                                                            {skill.microskill.title}
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-500">
                                                            {skill.microskill.level}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm sm:inline flex space-x-2">
                                                        <span className="hidden sm:inline text-gray-400">•</span>
                                                        <span className="text-gray-500">
                                                            {skill.microskill.description}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Skill relevance */}
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                {skill.relevance}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No skills available for this action.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
} 