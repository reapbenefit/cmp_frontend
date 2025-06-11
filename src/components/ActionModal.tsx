"use client";

import { useState } from "react";
import Tooltip from "./Tooltip";
import { Action, Skill, ActionDetails } from "@/types";

interface ActionModalProps {
    action: Action | null;
    onClose: () => void;
    skills: Skill[];
}

export default function ActionModal({ action, onClose, skills }: ActionModalProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');

    if (!action) return null;

    // Use the action details directly from the passed data
    const actionDetails: ActionDetails = action.details || {
        actionType: "General",
        skillsCovered: [],
        skillExplanations: {},
        summary: {
            overview: action.description,
            impact: `Meaningful impact achieved through ${action.hours} hours of dedicated work`,
            timeline: "Ongoing initiative",
            stakeholders: ["Community Members"],
            outcomes: ["Community engagement", "Positive impact created"]
        },
        rawInputs: {
            originalSubmission: {
                type: "text",
                content: action.description,
                timestamp: "Recent submission"
            },
            reflectiveQuestions: [
                {
                    question: "What motivated you to work on this initiative?",
                    answer: {
                        type: "text",
                        content: "Identified a community need and felt compelled to take action.",
                        timestamp: "Follow-up reflection"
                    }
                }
            ]
        }
    };

    // Collect all images from rawInputs
    const getAllImages = (): string[] => {
        const images: string[] = [];

        // Add images from original submission
        if (actionDetails.rawInputs.originalSubmission.images) {
            images.push(...actionDetails.rawInputs.originalSubmission.images);
        }

        // Add images from reflective questions
        actionDetails.rawInputs.reflectiveQuestions.forEach((item) => {
            if (item.answer.images) {
                images.push(...item.answer.images);
            }
        });

        return images;
    };

    const allImages = getAllImages();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                >
                    ×
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 pr-8">
                        {action.title}
                    </h2>

                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {action.category}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                {actionDetails.actionType}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                {action.hours}h
                            </span>
                        </div>
                    </div>

                    <div className="mt-3">
                        <span className="font-medium text-gray-700 text-sm">Skills</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {actionDetails.skillsCovered.map((skillName: string, index: number) => {
                                const skillData = skills.find(s => s.name === skillName);
                                return skillData ? (
                                    <Tooltip
                                        key={index}
                                        content={actionDetails.skillExplanations[skillName] || ''}
                                        position="top"
                                        width="w-64"
                                    >
                                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all duration-200">
                                            <img
                                                src={skillData.image}
                                                alt={skillData.name}
                                                className="w-4 h-4 rounded-full"
                                            />
                                            <span className="text-gray-700 text-xs">{skillData.name}</span>
                                        </div>
                                    </Tooltip>
                                ) : (
                                    <Tooltip
                                        key={index}
                                        content={actionDetails.skillExplanations[skillName] || ''}
                                        position="top"
                                        width="w-64"
                                    >
                                        <span className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-purple-700 border border-gray-200 hover:border-purple-200 transition-all duration-200">
                                            {skillName}
                                            <svg className="w-3 h-3 text-gray-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${activeTab === 'summary'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('raw')}
                            className={`px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${activeTab === 'raw'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Learn more
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto overflow-x-visible">
                    {activeTab === 'summary' ? (
                        <div className="space-y-6">
                            {/* Image Gallery */}
                            {allImages.length > 0 && (
                                <div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                        {allImages.map((imageUrl, index) => (
                                            <div key={index} className="relative group cursor-pointer">
                                                <img
                                                    src={imageUrl}
                                                    alt={`${action.title} - Image ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-gray-700 leading-relaxed">
                                    Comprehensive plastic waste management initiative that successfully diverted 2.5 tons of plastic waste from landfills through establishing a Materials Recovery Facility serving 3 local communities. The 6-month project involved coordinating with multiple stakeholders including Saahas Waste Management, BBMP, CMC, TMC, and local GPs, while training 45 community members in proper waste segregation practices to create a sustainable recycling system.
                                </p>
                            </div>

                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {actionDetails.summary.outcomes.map((outcome: string, index: number) => (
                                        <div key={index} className="flex items-center gap-2 bg-green-50 p-3 rounded">
                                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                            <span className="text-gray-700 text-sm">{outcome}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-gray-500">{actionDetails.rawInputs.originalSubmission.timestamp}</span>
                                    </div>
                                    <p className="text-gray-700 mb-3">{actionDetails.rawInputs.originalSubmission.content}</p>

                                    {/* Original submission images */}
                                    {actionDetails.rawInputs.originalSubmission.images && actionDetails.rawInputs.originalSubmission.images.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                                            {actionDetails.rawInputs.originalSubmission.images.map((imageUrl: string, index: number) => (
                                                <div key={index} className="relative group cursor-pointer">
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Original submission - Image ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="space-y-4">
                                    {actionDetails.rawInputs.reflectiveQuestions.map((item, index: number) => (
                                        <div key={index} className="border-l-2 border-blue-200 pl-4">
                                            <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                                            <div className="bg-gray-50 p-3 rounded">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs text-gray-500">{item.answer.timestamp}</span>
                                                </div>
                                                {item.answer.type === 'audio' ? (
                                                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded mb-3">
                                                        <button className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                                                            ▶
                                                        </button>
                                                        <div className="flex-1">
                                                            <div className="text-sm text-gray-700 mb-1">{item.answer.content}</div>
                                                            <div className="w-full bg-purple-200 h-1 rounded-full">
                                                                <div className="bg-purple-500 h-1 rounded-full w-0"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-700 mb-3">{item.answer.content}</p>
                                                )}

                                                {/* Answer-specific images */}
                                                {item.answer.images && item.answer.images.length > 0 && (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {item.answer.images.map((imageUrl: string, imgIndex: number) => (
                                                            <div key={imgIndex} className="relative group cursor-pointer">
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={`${item.question} - Image ${imgIndex + 1}`}
                                                                    className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 