"use client";

import { useState, useEffect } from "react";
import Tooltip from "./Tooltip";
import { Action } from "@/types";

interface ActionCardProps {
    action: Action;
    onActionClick: (action: Action) => void;
    variant?: 'compact' | 'expanded';
    viewOnly?: boolean;
}

// Color mapping based on design guidelines
const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
        case 'waste':
        case 'environment':
            return 'from-emerald-400 to-green-500'; // Primary Green gradient
        case 'civic':
        case 'traffic/road':
        case 'social justice':
            return 'from-blue-400 to-blue-500'; // Ocean Blue gradient
        case 'youth':
        case 'education':
            return 'from-orange-400 to-orange-500'; // Sunset Orange gradient
        default:
            return 'from-teal-400 to-teal-500'; // Deep Teal gradient
    }
};

export default function ActionCard({
    action,
    onActionClick,
    variant = 'compact',
    viewOnly = false
}: ActionCardProps) {
    const isExpanded = variant === 'expanded';
    const categoryGradient = getCategoryColor(action.category || 'default');
    const [isMobile, setIsMobile] = useState(false);
    const [activeSkillIndex, setActiveSkillIndex] = useState<number | null>(null);

    // Detect mobile device
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window));
        };
        
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const handleSkillClick = (e: React.MouseEvent, skillIndex: number) => {
        e.stopPropagation();
        if (isMobile) {
            setActiveSkillIndex(activeSkillIndex === skillIndex ? null : skillIndex);
        }
    };

    const handleVerifyNow = () => {
        window.open(`${process.env.NEXT_PUBLIC_FRAPPE_BASE_URL}/request-actions-review/new?events=${action.uuid}`, '_blank');
    };

    return (
        <div
            className={`relative bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer ${isExpanded ? 'p-6' : 'p-5'
                }`}
            onClick={() => onActionClick(action)}
        >
            {/* Colorful top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryGradient}`}></div>

            {/* Main content */}
            <div className={`${isExpanded ? 'mb-4' : 'mb-3'}`}>
                <div className={`${isExpanded ? 'mb-4' : 'mb-3'}`}>
                    <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-bold text-gray-900 transition-colors leading-tight flex-1 ${isExpanded ? 'text-xl' : 'text-lg'
                            }`}>
                            {action.title}
                        </h3>

                        {/* Verification Status */}
                        <div className="ml-3 flex-shrink-0">
                            {action.is_verified ? (
                                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </div>
                            ) : !viewOnly && (
                                <div 
                                    className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleVerifyNow();
                                    }}
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Verify now
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category and Action Type badges */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`bg-blue-100 text-blue-800 px-2 py-1 rounded ${isExpanded ? 'text-sm' : 'text-xs'
                            }`}>
                            {action.category}
                        </span>
                        <span className={`bg-green-100 text-green-800 px-2 py-1 rounded ${isExpanded ? 'text-sm' : 'text-xs'
                            }`}>
                            {action.type}
                        </span>
                        {Number(action.hours_invested) > 0 && (
                            <span className={`bg-orange-100 text-orange-800 px-2 py-1 rounded ${isExpanded ? 'text-sm' : 'text-xs'
                                }`}>
                                {action.hours_invested}h
                            </span>
                        )}
                    </div>
                </div>
               <p
                  className={`text-gray-700 leading-relaxed ${isExpanded ? 'text-base mb-4' : 'text-sm mb-4'}`}
                  dangerouslySetInnerHTML={{ __html: action.description }}
                />



                {/* Skills section */}
                {action.skills && action.skills.length > 0 && (
                    <div className="relative overflow-visible">
                        <div className={`flex items-center mb-2 ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                            <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className="font-medium text-gray-600">Skills Activated</span>
                        </div>

                        <div className={`flex flex-wrap ${isExpanded ? 'gap-2' : 'gap-1.5'}`}>
                            {action.skills.map((skill, index) => (
                                <div key={index} className="relative">
                                    {!isMobile ? (
                                        <Tooltip
                                            content={skill.relevance}
                                            position="bottom"
                                            width="w-64"
                                        >
                                            <div
                                                className={`flex items-center gap-1 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-2 py-1 rounded-lg transition-all duration-200 ${isExpanded ? 'text-sm gap-2 px-3' : 'text-xs'
                                                    }`}
                                                onClick={(e) => handleSkillClick(e, index)}
                                            >
                                                <img
                                                    src={`/badges/${skill.name}.png`}
                                                    alt={skill.label}
                                                    className={`rounded-full ${isExpanded ? 'w-4 h-4' : 'w-3 h-3'}`}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                                <span className="text-gray-700 font-medium">
                                                    {skill.microskill?.title ? `${skill.microskill.level}: ${skill.microskill.title}` : skill.label}
                                                </span>
                                            </div>
                                        </Tooltip>
                                    ) : (
                                        <div>
                                            <div
                                                className={`flex items-center gap-1 bg-gray-50 active:bg-blue-50 border border-gray-200 active:border-blue-200 px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                                                    activeSkillIndex === index ? 'bg-blue-50 border-blue-200' : ''
                                                } ${isExpanded ? 'text-sm gap-2 px-3' : 'text-xs'}`}
                                                onClick={(e) => handleSkillClick(e, index)}
                                            >
                                                <img
                                                    src={`/badges/${skill.name}.png`}
                                                    alt={skill.label}
                                                    className={`rounded-full ${isExpanded ? 'w-4 h-4' : 'w-3 h-3'}`}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                                <span className="text-gray-700 font-medium">
                                                    {skill.microskill?.title ? `${skill.microskill.level}: ${skill.microskill.title}` : skill.label}
                                                </span>
                                                {isMobile && (
                                                    <svg className="w-3 h-3 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                            </div>
                                            {isMobile && activeSkillIndex === index && (
                                                <div className="absolute z-10 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg max-w-xs left-0">
                                                    <p className="text-xs text-gray-700 leading-relaxed">
                                                        {skill.relevance}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 
