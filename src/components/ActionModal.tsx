"use client";

import { useState } from "react";
import Tooltip from "./Tooltip";

interface Skill {
    name: string;
    image: string;
    count: number;
    description: string;
}

interface PinnedAction {
    id: string;
    title: string;
    description: string;
    category: string;
    isPublic: boolean;
}

interface ActionModalProps {
    action: PinnedAction | null;
    onClose: () => void;
    skills: Skill[];
}

export default function ActionModal({ action, onClose, skills }: ActionModalProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');

    if (!action) return null;

    // Mock detailed action data
    const actionDetails = {
        category: "Waste",
        actionType: "Hands-on",
        skillsCovered: ["Problem Solving", "Community Collaboration", "Hands-On", "Data Orientation"],
        skillExplanations: {
            "Problem Solving": "Identified complex waste segregation challenges and systematically developed a Materials Recovery Facility solution to address multiple stakeholder needs.",
            "Community Collaboration": "Successfully coordinated with BBMP, CMC, TMC, local GPs, and 45+ community members to establish sustainable waste management practices.",
            "Hands-On": "Physically set up the Materials Recovery Facility infrastructure and directly trained community members in waste segregation techniques.",
            "Data Orientation": "Tracked and measured 2.5 tons of diverted plastic waste, monitored facility efficiency, and documented community engagement metrics."
        },
        summary: {
            overview: "Comprehensive plastic waste management initiative aimed at diverting waste from landfills into sustainable recycling and repurposing channels.",
            impact: "Successfully diverted 2.5 tons of plastic waste from landfills, established Materials Recovery Facility serving 3 local communities, and trained 45 community members in waste segregation practices.",
            timeline: "6-month project spanning January to June 2025",
            stakeholders: ["Saahas Waste Management", "BBMP", "CMC", "TMC", "Local GPs"],
            outcomes: [
                "Materials Recovery Facility operational",
                "Community waste segregation program established",
                "2.5 tons plastic waste diverted",
                "45 community members trained"
            ]
        },
        rawInputs: {
            originalSubmission: {
                type: "text",
                content: "Started collaboration with Saahas Waste Management to tackle the growing plastic waste problem in our locality. We're setting up a comprehensive system to divert plastics from landfills into proper recycling channels.",
                timestamp: "January 15, 2025 at 9:30 AM"
            },
            reflectiveQuestions: [
                {
                    question: "What specific problem were you trying to solve?",
                    answer: {
                        type: "text",
                        content: "The massive accumulation of plastic waste in local landfills and the lack of proper segregation systems in residential areas.",
                        timestamp: "January 16, 2025 at 2:15 PM"
                    }
                },
                {
                    question: "Who did you collaborate with and why?",
                    answer: {
                        type: "audio",
                        content: "Audio response about collaboration with Saahas Waste Management and local authorities",
                        duration: "2:34",
                        timestamp: "January 18, 2025 at 11:45 AM"
                    }
                },
                {
                    question: "What was the most challenging aspect of this initiative?",
                    answer: {
                        type: "text",
                        content: "Coordinating with multiple stakeholders (BBMP, CMC, TMC, GP) and ensuring consistent community participation in the segregation process.",
                        timestamp: "February 5, 2025 at 4:20 PM"
                    }
                },
                {
                    question: "How did you measure the impact of your work?",
                    answer: {
                        type: "audio",
                        content: "Audio response about tracking waste diversion metrics and community engagement",
                        duration: "3:12",
                        timestamp: "March 10, 2025 at 10:30 AM"
                    }
                }
            ]
        }
    };

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
                                {actionDetails.category}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                {actionDetails.actionType}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3">
                        <span className="font-medium text-gray-700 text-sm">Skills</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {actionDetails.skillsCovered.map((skillName, index) => {
                                const skillData = skills.find(s => s.name === skillName);
                                return skillData ? (
                                    <Tooltip
                                        key={index}
                                        content={(actionDetails.skillExplanations as Record<string, string>)[skillName] || ''}
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
                                        content={(actionDetails.skillExplanations as Record<string, string>)[skillName] || ''}
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
                            Learn More
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto overflow-x-visible">
                    {activeTab === 'summary' ? (
                        <div className="space-y-6">
                            <div>
                                <p className="text-gray-700 leading-relaxed">
                                    Comprehensive plastic waste management initiative that successfully diverted 2.5 tons of plastic waste from landfills through establishing a Materials Recovery Facility serving 3 local communities. The 6-month project involved coordinating with multiple stakeholders including Saahas Waste Management, BBMP, CMC, TMC, and local GPs, while training 45 community members in proper waste segregation practices to create a sustainable recycling system.
                                </p>
                            </div>

                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {actionDetails.summary.outcomes.map((outcome, index) => (
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
                                    <p className="text-gray-700">{actionDetails.rawInputs.originalSubmission.content}</p>
                                </div>
                            </div>

                            <div>
                                <div className="space-y-4">
                                    {actionDetails.rawInputs.reflectiveQuestions.map((item, index) => (
                                        <div key={index} className="border-l-2 border-blue-200 pl-4">
                                            <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                                            <div className="bg-gray-50 p-3 rounded">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs text-gray-500">{item.answer.timestamp}</span>
                                                </div>
                                                {item.answer.type === 'audio' ? (
                                                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded">
                                                        <button className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
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
                                                    <p className="text-gray-700">{item.answer.content}</p>
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