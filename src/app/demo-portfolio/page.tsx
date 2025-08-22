"use client";

import { useState, useEffect } from "react";
import { MapPin, Users, CheckCircle, Plus, X, Share2, Copy, Check } from "lucide-react";
import CommunityCard, { Community } from "@/components/CommunityCard";
import CustomizeTopActionsModal from "@/components/CustomizeTopActionsModal";
import ExpertReviewCard, { ExpertReview } from "@/components/ExpertReviewCard";
import Tooltip from "@/components/Tooltip";


interface ActionDetails {
    actionType: string;
    skillsCovered: string[];
    skillExplanations: Record<string, string>;
    summary: {
        overview: string;
        impact: string;
        timeline: string;
        stakeholders: string[];
        outcomes: string[];
    };
    rawInputs: {
        originalSubmission: {
            type: string;
            content: string;
            timestamp: string;
            images?: string[];
        };
        reflectiveQuestions: Array<{
            question: string;
            answer: {
                type: string;
                content: string;
                timestamp: string;
                duration?: string;
                images?: string[];
            };
        }>;
    };
}


interface Action {
    uuid: string;
    title: string;
    description: string;
    category: string;
    type: string;
    is_verified: boolean;
    is_pinned: boolean;
    status?: string | null;
    created_at: string;
    isPublic?: boolean;
    hours?: number;
    verified?: boolean;
    details?: ActionDetails;
}

interface Skill {
    name: string;
    image: string;
    count: number;
    description: string;
    actions: Array<{
        uuid: string;
        title: string;
        date: string;
        explanation: string;
    }>;
}


interface ActionCardProps {
    action: Action;
    onActionClick: (action: Action) => void;
    skills: Skill[];
    variant?: 'compact' | 'expanded'; // compact for overview, expanded for actions tab
    actionDetails?: {
        category: string;
        actionType: string;
        skillsCovered: string[];
        skillExplanations: Record<string, string>;
    };
}

// Color mapping based on design guidelines
const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
        case 'waste':
            return 'from-emerald-400 to-green-500'; // Primary Green gradient
        case 'civic':
            return 'from-blue-400 to-blue-500'; // Ocean Blue gradient
        case 'youth':
            return 'from-orange-400 to-orange-500'; // Sunset Orange gradient
        default:
            return 'from-teal-400 to-teal-500'; // Deep Teal gradient
    }
};

function ActionCard({
    action,
    onActionClick,
    skills,
    variant = 'compact',
    actionDetails = {
        category: "Waste",
        actionType: "Hands-on",
        skillsCovered: ["Problem Solving", "Community Collaboration", "Hands on", "Data Orientation"],
        skillExplanations: {
            "Problem Solving": "Identified complex waste segregation challenges and systematically developed a Materials Recovery Facility solution to address multiple stakeholder needs.",
            "Community Collaboration": "Successfully coordinated with BBMP, CMC, TMC, local GPs, and 45+ community members to establish sustainable waste management practices.",
            "Hands on": "Physically set up the Materials Recovery Facility infrastructure and directly trained community members in waste segregation techniques.",
            "Data Orientation": "Tracked and measured 2.5 tons of diverted plastic waste, monitored facility efficiency, and documented community engagement metrics."
        }
    }
}: ActionCardProps) {
    const isExpanded = variant === 'expanded';
    const categoryGradient = getCategoryColor(actionDetails.category);

    const handleSkillClick = (e: React.MouseEvent) => {
        e.stopPropagation();
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
                            {action.verified ? (
                                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Verify now
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category, Action Type, and Hours badges */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`bg-blue-100 text-blue-800 px-2 py-1 rounded ${isExpanded ? 'text-sm' : 'text-xs'
                            }`}>
                            {actionDetails.category}
                        </span>
                        <span className={`bg-green-100 text-green-800 px-2 py-1 rounded ${isExpanded ? 'text-sm' : 'text-xs'
                            }`}>
                            {actionDetails.actionType}
                        </span>
                        <span className={`bg-orange-100 text-orange-800 px-2 py-1 rounded ${isExpanded ? 'text-sm' : 'text-xs'
                            }`}>
                            {action.hours}h
                        </span>
                    </div>
                </div>

                <p className={`text-gray-700 leading-relaxed ${isExpanded ? 'text-base mb-4' : 'text-sm mb-4'
                    }`}>
                    {action.description}
                </p>

                {/* Skills section with overflow containment */}
                <div className="relative overflow-visible">
                    <div className={`flex items-center mb-2 ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                        <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="font-medium text-gray-600">Skills Activated</span>
                    </div>

                    <div className={`flex flex-wrap ${isExpanded ? 'gap-2' : 'gap-1.5'}`}>
                        {actionDetails.skillsCovered.map((skillName, index) => {
                            const skillData = skills.find(s => s.name === skillName);
                            return skillData ? (
                                <Tooltip
                                    key={index}
                                    content={actionDetails.skillExplanations[skillName]}
                                    position="bottom"
                                    width="w-64"
                                >
                                    <div
                                        className={`flex items-center gap-1 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-2 py-1 rounded-lg transition-all duration-200 ${isExpanded ? 'text-sm gap-2 px-3' : 'text-xs'
                                            }`}
                                        onClick={handleSkillClick}
                                    >
                                        <img
                                            src={skillData.image}
                                            alt={skillData.name}
                                            className={`rounded-full ${isExpanded ? 'w-4 h-4' : 'w-3 h-3'}`}
                                        />
                                        <span className="text-gray-700 font-medium">{skillData.name}</span>
                                    </div>
                                </Tooltip>
                            ) : (
                                <Tooltip
                                    key={index}
                                    content={actionDetails.skillExplanations[skillName]}
                                    position="bottom"
                                    width="w-64"
                                >
                                    <span
                                        className={`inline-flex items-center bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-purple-700 border border-gray-200 hover:border-purple-200 px-2 py-1 rounded-lg font-medium transition-all duration-200 ${isExpanded ? 'text-sm px-3' : 'text-xs'
                                            }`}
                                        onClick={handleSkillClick}
                                    >
                                        {skillName}
                                    </span>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}


interface SkillAction {
    uuid: string;
    date: string;
    title: string;
    explanation: string;
}

interface Skill {
    name: string;
    image: string;
    count: number;
    description: string;
    actions: SkillAction[];
}

interface SkillModalProps {
    skill: Skill | null;
    onClose: () => void;
}

const SkillModal = ({ skill, onClose }: SkillModalProps) => {
    if (!skill) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                >
                    ×
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-green-100 to-blue-100 p-8 text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-white mx-auto mb-4 overflow-hidden">
                        <img
                            src={skill.image}
                            alt={skill.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                        <span>{skill.name}</span>
                        <span className="bg-gray-900 text-white text-sm px-3 py-1 rounded-full">
                            x{skill.count}
                        </span>
                    </h2>

                    <p className="text-gray-700">
                        {skill.description}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">History</h3>

                    <div className="space-y-4">
                        {skill.actions.map((action, index) => (
                            <div key={action.uuid} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center h-6">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    </div>
                                    {index < skill.actions.length - 1 && (
                                        <div className="w-0.5 bg-gray-300 flex-1 mt-1 mb-2"></div>
                                    )}
                                </div>

                                <div className="flex-1 pb-6">
                                    <div className="flex items-center gap-2 mb-1 h-6">
                                        <span className="font-medium text-blue-600 cursor-pointer hover:underline">{action.title}</span>
                                        <span className="text-sm text-gray-500">
                                            • {new Date(action.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {action.explanation}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


interface ActionModalProps {
    action: Action | null;
    onClose: () => void;
    skills: Skill[];
}

function ActionModal({ action, onClose, skills }: ActionModalProps) {
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

interface AddCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (community: Omit<Community, 'id'>) => void;
}

function AddCommunityModal({ isOpen, onClose, onAdd }: AddCommunityModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        link: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.description.trim()) {
            return;
        }

        setIsSubmitting(true);

        // Create new community object
        const newCommunity: Omit<Community, 'id'> = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            ...(formData.link.trim() && { link: formData.link.trim() })
        };

        // Call the onAdd callback
        onAdd(newCommunity);

        // Reset form and close modal
        setFormData({ name: '', description: '', link: '' });
        setIsSubmitting(false);
        onClose();
    };

    const handleClose = () => {
        setFormData({ name: '', description: '', link: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Community</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Community Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter community name"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Describe what this community is about"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                            Website/Link (Optional)
                        </label>
                        <input
                            type="url"
                            id="link"
                            value={formData.link}
                            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Community
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Auto-scroll animation styles
const scrollAnimation = `
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  
  .animate-scroll {
    animation: scroll 20s linear infinite;
  }
  
  .animate-scroll:hover {
    animation-play-state: paused;
  }
`;

// Dummy data matching the user's profile
const profile = {
    username: "kuppendra",
    fullName: "Kuppendra",
    bio: "B.com tourism graduate, part of SNLA Co-hort 2023. Working on Construction & other labours economical development through easy access of welfare fund.",
    location: "Bengaluru, Karnataka",
    // followers: 469,
    // following: 2,
    isVerified: true,
    avatar: "/demo-profile.jpeg",
};

// Skills data using actual badge images
const skills: Skill[] = [
    {
        name: "Problem Solving",
        image: "/badges/problem_solving.png",
        count: 2,
        description: "Ability to identify complex issues and develop systematic solutions",
        actions: [
            {
                uuid: "1",
                title: "plastic-waste-management",
                date: "2025-02-03",
                explanation: "Identified and addressed the complex issue of plastic waste management through systematic sorting and facility setup"
            },
            {
                uuid: "3",
                title: "tree-plantation-drive",
                date: "2024-01-15",
                explanation: "Solved logistical challenges of coordinating volunteers and securing plantation permissions"
            }
        ]
    },
    {
        name: "Critical Thinking",
        image: "/badges/critical_thinking.png",
        count: 3,
        description: "Analytical approach to understanding social and environmental issues",
        actions: [
            {
                uuid: "2",
                title: "youth-rights-workshop",
                date: "2024-02-14",
                explanation: "Analyzed youth rights issues and policy gaps in Karnataka state governance"
            },
            {
                uuid: "1",
                title: "plastic-waste-management",
                date: "2025-02-03",
                explanation: "Critically evaluated waste management systems and identified improvement opportunities"
            },
            {
                uuid: "4",
                title: "labor-welfare-awareness",
                date: "2024-03-20",
                explanation: "Analyzed gaps in government welfare scheme awareness among laborers"
            }
        ]
    },
    {
        name: "Communication",
        image: "/badges/communication.png",
        count: 7,
        description: "Effective verbal and written communication with diverse stakeholders",
        actions: [
            {
                uuid: "2",
                title: "youth-rights-workshop",
                date: "2024-02-14",
                explanation: "Presented findings to workshop participants and engaged in advocacy discussions"
            },
            {
                uuid: "4",
                title: "labor-welfare-awareness",
                date: "2024-03-20",
                explanation: "Effectively communicated complex government schemes to laborers in simple terms"
            }
        ]
    },
    {
        name: "Data Orientation",
        image: "/badges/data_orientation.png",
        count: 1,
        description: "Using data and evidence to drive decision-making and measure impact",
        actions: [
            {
                uuid: "1",
                title: "plastic-waste-management",
                date: "2025-02-03",
                explanation: "Analyzed waste segregation patterns and tracked materials through different recovery facilities"
            }
        ]
    },
    {
        name: "Citizenship",
        image: "/badges/citizenship.png",
        count: 1,
        description: "Active participation in democratic processes and civic engagement",
        actions: [
            {
                uuid: "2",
                title: "youth-rights-workshop",
                date: "2024-02-14",
                explanation: "Actively participated in democratic processes by demanding youth commission formalization"
            }
        ]
    },
    {
        name: "Community Collaboration",
        image: "/badges/community_collaboration.png",
        count: 8,
        description: "Exceptional ability to bring diverse groups together for common causes",
        actions: [
            {
                uuid: "1",
                title: "plastic-waste-management",
                date: "2025-02-03",
                explanation: "Worked with multiple stakeholders including BBMP, CMC, TMC and GP to implement waste collection"
            },
            {
                uuid: "3",
                title: "tree-plantation-drive",
                date: "2024-01-15",
                explanation: "Mobilized 25+ volunteers and coordinated with local authorities for plantation permissions"
            }
        ]
    },
    {
        name: "Hands on",
        image: "/badges/hands_on.png",
        count: 4,
        description: "Direct, practical involvement in implementing solutions",
        actions: [
            {
                uuid: "3",
                title: "tree-plantation-drive",
                date: "2024-01-15",
                explanation: "Physically planted 50+ saplings and set up watering systems for maintenance"
            },
            {
                uuid: "1",
                title: "plastic-waste-management",
                date: "2025-02-03",
                explanation: "Hands-on involvement in setting up Materials Recovery Facility and waste sorting processes"
            }
        ]
    },
    {
        name: "Grit",
        image: "/badges/grit.png",
        count: 1,
        description: "Persistence and passion for long-term goals despite obstacles",
        actions: [
            {
                uuid: "4",
                title: "labor-welfare-awareness",
                date: "2024-03-20",
                explanation: "Persisted in creating awareness despite initial resistance and bureaucratic challenges"
            }
        ]
    },
    {
        name: "Applied Empathy",
        image: "/badges/empathy.png",
        count: 1,
        description: "Understanding and addressing the needs and perspectives of others",
        actions: [
            {
                uuid: "3",
                title: "tree-plantation-drive",
                date: "2024-01-15",
                explanation: "Understood community needs for green spaces and involved residents in selecting plantation sites"
            }
        ]
    }
];

const pinnedActions: Action[] = [
    {
        uuid: "1",
        title: "plastic-waste-management",
        description: "Working with Saahas Waste Management on diverting plastics from landfills into repurpose & recycling. Materials Recovery Facility implementation.",
        category: "Environment",
        type: "hands-on",
        is_verified: true,
        is_pinned: true,
        status: null,
        created_at: "2024-01-15T10:30:00Z",
        isPublic: true,
        hours: 4,
        verified: true,
        details: {
            actionType: "Hands-on",
            skillsCovered: ["Problem Solving", "Community Collaboration", "Hands on", "Data Orientation"],
            skillExplanations: {
                "Problem Solving": "Identified complex waste segregation challenges and systematically developed a Materials Recovery Facility solution to address multiple stakeholder needs.",
                "Community Collaboration": "Successfully coordinated with BBMP, CMC, TMC, local GPs, and 45+ community members to establish sustainable waste management practices.",
                "Hands on": "Physically set up the Materials Recovery Facility infrastructure and directly trained community members in waste segregation techniques.",
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
                    timestamp: "January 15, 2025 at 9:30 AM",
                    images: [
                        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center",
                        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop&crop=center"
                    ]
                },
                reflectiveQuestions: [
                    {
                        question: "What specific problem were you trying to solve?",
                        answer: {
                            type: "text",
                            content: "The massive accumulation of plastic waste in local landfills and the lack of proper segregation systems in residential areas. Our community generates about 15 tons of mixed waste daily, with 30% being plastic that could be recycled.",
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
                            content: "Coordinating with multiple stakeholders (BBMP, CMC, TMC, GP) and ensuring consistent community participation in the segregation process. It took 3 months to establish a regular collection routine.",
                            timestamp: "February 5, 2025 at 4:20 PM",
                            images: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop&crop=center"]
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
                    },
                    {
                        question: "What unexpected challenges did you face?",
                        answer: {
                            type: "text",
                            content: "Initially, many residents were skeptical about the program's sustainability. We had to demonstrate the economic benefits - showing how segregated plastic could generate Rs. 2000/month for the community through proper selling channels.",
                            timestamp: "April 2, 2025 at 1:45 PM"
                        }
                    }
                ]
            }
        }
    },
    {
        uuid: "2",
        title: "youth-rights-workshop",
        description: "4 days residential workshop in Mangalore 2022. Learnings about youth rights, demanding formalization of youth commission in Karnataka.",
        category: "Social Justice",
        type: "advocacy",
        is_verified: true,
        is_pinned: true,
        status: null,
        created_at: "2024-02-14T09:00:00Z",
        isPublic: true,
        hours: 10,
        verified: true,
        details: {
            actionType: "Learning & Advocacy",
            skillsCovered: ["Critical Thinking", "Communication", "Citizenship"],
            skillExplanations: {
                "Critical Thinking": "Analyzed youth policy frameworks and identified gaps in Karnataka's governance structure for youth representation.",
                "Communication": "Effectively presented findings to workshop participants and engaged in advocacy discussions with policymakers.",
                "Citizenship": "Actively participated in democratic processes by demanding youth commission formalization and policy development."
            },
            summary: {
                overview: "Intensive 4-day residential workshop focused on understanding youth rights and advocating for the formalization of youth commission in Karnataka state governance.",
                impact: "Gained comprehensive understanding of youth policy framework, connected with 25+ youth advocates statewide, and contributed to policy recommendations for youth commission establishment.",
                timeline: "4-day workshop in February 2024",
                stakeholders: ["Youth Rights Collective", "Karnataka State Government", "Fellow Youth Advocates"],
                outcomes: [
                    "Policy recommendations drafted",
                    "Statewide network established",
                    "Advocacy skills developed",
                    "Youth commission proposal submitted"
                ]
            },
            rawInputs: {
                originalSubmission: {
                    type: "text",
                    content: "Participated in an intensive residential workshop in Mangalore focused on youth rights and governance. This was a transformative experience that opened my eyes to the gaps in youth representation in policy-making.",
                    timestamp: "February 14, 2024 at 6:30 PM",
                    images: [
                        "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=400&h=300&fit=crop&crop=center",
                        "https://images.unsplash.com/photo-1560439514-4e9645039924?w=400&h=300&fit=crop&crop=center"
                    ]
                },
                reflectiveQuestions: [
                    {
                        question: "What were the key learnings from this workshop?",
                        answer: {
                            type: "text",
                            content: "Learned about the legal framework for youth participation in governance, the importance of institutional representation, and how other states have successfully implemented youth commissions. Karnataka is one of the few states without a formal youth commission.",
                            timestamp: "February 16, 2024 at 10:20 AM"
                        }
                    },
                    {
                        question: "How did this experience change your perspective on civic engagement?",
                        answer: {
                            type: "audio",
                            content: "Audio reflection on how the workshop shifted my understanding of systemic change",
                            duration: "4:15",
                            timestamp: "February 18, 2024 at 3:45 PM"
                        }
                    },
                    {
                        question: "What actions did you take after the workshop?",
                        answer: {
                            type: "text",
                            content: "Started organizing monthly youth forums in my district, drafted policy recommendations with fellow participants, and initiated conversations with local MLAs about youth commission formalization.",
                            timestamp: "March 5, 2024 at 7:30 PM",
                            images: ["https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop&crop=center"]
                        }
                    },
                    {
                        question: "What challenges do young people face in accessing governance?",
                        answer: {
                            type: "text",
                            content: "Lack of formal representation, age barriers in many positions, limited understanding of policy processes, and absence of structured mentorship programs. The workshop highlighted how youth voices are often tokenistic rather than substantive.",
                            timestamp: "March 12, 2024 at 2:15 PM"
                        }
                    }
                ]
            }
        }
    },
    {
        uuid: "3",
        title: "labor-welfare-awareness",
        description: "Creating awareness about government schemes and Labour Identity Cards. Providing free labour cards to workers who weren't aware of benefits.",
        category: "Social Impact",
        type: "awareness-campaign",
        is_verified: false,
        is_pinned: true,
        status: null,
        created_at: "2024-03-20T14:15:00Z",
        isPublic: true,
        hours: 8,
        verified: false,
        details: {
            actionType: "Community Outreach",
            skillsCovered: ["Applied Empathy", "Communication", "Grit"],
            skillExplanations: {
                "Applied Empathy": "Understood the daily struggles and needs of construction workers, meeting them where they are and addressing their specific concerns.",
                "Communication": "Effectively communicated complex government schemes to workers in simple terms, bridging the gap between policy and people.",
                "Grit": "Persisted in creating awareness despite initial resistance and bureaucratic challenges, maintaining effort over 8 months."
            },
            summary: {
                overview: "Community outreach initiative focused on creating awareness about government welfare schemes and facilitating access to Labour Identity Cards for construction workers.",
                impact: "Helped 150+ construction workers understand and access government benefits, facilitated 80+ Labour Identity Card applications, and established ongoing support network.",
                timeline: "8-month campaign from March to October 2024",
                stakeholders: ["Construction Workers Union", "Labour Department", "Local Contractors", "Worker Families"],
                outcomes: [
                    "150+ workers educated about rights",
                    "80+ Labour ID cards facilitated",
                    "Support network established",
                    "Monthly awareness sessions ongoing"
                ]
            },
            rawInputs: {
                originalSubmission: {
                    type: "text",
                    content: "Started working with construction workers in my area who weren't aware of the government welfare schemes available to them. Many have been working for years without proper documentation or access to benefits.",
                    timestamp: "March 20, 2024 at 4:15 PM"
                },
                reflectiveQuestions: [
                    {
                        question: "What motivated you to work on this issue?",
                        answer: {
                            type: "text",
                            content: "Seeing daily wage workers struggling without social security during the COVID lockdowns. Many didn't know about schemes like Building and Other Construction Workers Welfare Board benefits that they were entitled to.",
                            timestamp: "March 22, 2024 at 11:30 AM",
                            images: [
                                "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center",
                                "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop&crop=center"
                            ]
                        }
                    },
                    {
                        question: "What were the main barriers workers faced?",
                        answer: {
                            type: "audio",
                            content: "Audio response about documentation challenges and bureaucratic barriers",
                            duration: "3:45",
                            timestamp: "April 2, 2024 at 2:20 PM"
                        }
                    },
                    {
                        question: "How did you build trust with the workers?",
                        answer: {
                            type: "text",
                            content: "Spent time at construction sites during lunch breaks, spoke in local languages, and most importantly - helped the first few workers successfully get their cards. Word of mouth was powerful in building credibility.",
                            timestamp: "April 15, 2024 at 5:45 PM"
                        }
                    },
                    {
                        question: "What systemic changes do you think are needed?",
                        answer: {
                            type: "text",
                            content: "Simplified application processes, mobile registration units at construction sites, and making contractors responsible for ensuring worker registration. The current system places the burden entirely on workers.",
                            timestamp: "June 8, 2024 at 9:20 AM",
                            images: ["https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=300&fit=crop&crop=center"]
                        }
                    }
                ]
            }
        }
    },
    {
        uuid: "4",
        title: "tree-plantation-drive",
        description: "Community tree plantation focusing on native species. Coordinated with local authorities and mobilized 25+ volunteers.",
        category: "Environment",
        type: "hands-on",
        is_verified: false,
        is_pinned: true,
        status: null,
        created_at: "2024-01-15T08:00:00Z",
        isPublic: true,
        hours: 2,
        verified: false,
        details: {
            actionType: "Environmental Action",
            skillsCovered: ["Community Collaboration", "Hands on", "Applied Empathy"],
            skillExplanations: {
                "Community Collaboration": "Successfully mobilized 25+ volunteers and coordinated with multiple stakeholders including residents, forest department, and schools.",
                "Hands on": "Physically planted 150+ native trees and set up maintenance systems, directly involved in all implementation aspects.",
                "Applied Empathy": "Understood community needs for green spaces and involved residents in selecting plantation sites and species."
            },
            summary: {
                overview: "Community-driven tree plantation initiative focusing on native species to improve local green cover and air quality.",
                impact: "Planted 150+ native trees, engaged 25+ volunteers, and established maintenance system ensuring 85% survival rate after 6 months.",
                timeline: "3-month project from January to March 2024",
                stakeholders: ["Residents Association", "Forest Department", "Local Schools", "Environmental NGOs"],
                outcomes: [
                    "150+ native trees planted",
                    "85% survival rate achieved",
                    "Community maintenance network",
                    "Monthly monitoring system"
                ]
            },
            rawInputs: {
                originalSubmission: {
                    type: "text",
                    content: "Organized a community tree plantation drive after noticing the declining green cover in our locality. Focused on native species that would thrive in our climate and provide maximum environmental benefit.",
                    timestamp: "January 15, 2024 at 8:45 AM",
                    images: ["https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400&h=300&fit=crop&crop=center"]
                },
                reflectiveQuestions: [
                    {
                        question: "Why did you choose to focus on native species?",
                        answer: {
                            type: "text",
                            content: "Native species require less water, are better adapted to local climate, and support local biodiversity. After researching, we selected species like Neem, Banyan, and Gulmohar that are native to Karnataka.",
                            timestamp: "January 18, 2024 at 2:30 PM"
                        }
                    },
                    {
                        question: "How did you ensure community participation?",
                        answer: {
                            type: "audio",
                            content: "Audio response about community engagement strategies and volunteer mobilization",
                            duration: "2:50",
                            timestamp: "January 25, 2024 at 4:15 PM"
                        }
                    },
                    {
                        question: "What was your biggest challenge in this project?",
                        answer: {
                            type: "text",
                            content: "Securing long-term maintenance commitment. Planting is easy, but ensuring the saplings survive requires consistent care for at least 2 years. We created a buddy system where each volunteer adopts specific trees.",
                            timestamp: "February 10, 2024 at 11:20 AM",
                            images: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&crop=center"]
                        }
                    },
                    {
                        question: "How do you measure the success of this initiative?",
                        answer: {
                            type: "text",
                            content: "We track survival rates monthly, measure growth using simple tools, and document the increase in bird species in the area. After 6 months, we've maintained an 85% survival rate which is well above the typical 40-50%.",
                            timestamp: "April 5, 2024 at 3:45 PM"
                        }
                    }
                ]
            }
        }
    }
];

// All available actions (including the current pinned ones plus additional ones)
const allActions: Action[] = [
    ...pinnedActions,
    {
        uuid: "5",
        title: "water-conservation-campaign",
        description: "Implemented rainwater harvesting systems in 15 residential buildings. Educated residents about water conservation techniques and monitored usage patterns.",
        category: "Environment",
        type: "hands-on",
        is_verified: true,
        is_pinned: false,
        status: null,
        created_at: "2024-05-10T11:00:00Z",
        isPublic: true,
        hours: 12,
        verified: true,
    },
    {
        uuid: "6",
        title: "digital-literacy-program",
        description: "Taught basic digital skills to 50+ senior citizens in the community. Covered smartphone usage, online banking safety, and digital government services.",
        category: "Education",
        type: "awareness-campaign",
        is_verified: true,
        is_pinned: false,
        status: null,
        created_at: "2024-06-15T14:30:00Z",
        isPublic: true,
        hours: 6,
        verified: true,
    },
    {
        uuid: "7",
        title: "street-vendor-support",
        description: "Organized legal aid workshops for street vendors. Helped 30+ vendors obtain proper licenses and understand their rights under new policies.",
        category: "Social Justice",
        type: "advocacy",
        is_verified: false,
        is_pinned: false,
        status: null,
        created_at: "2024-07-20T16:00:00Z",
        isPublic: true,
        hours: 8,
        verified: false,
    },
    {
        uuid: "8",
        title: "air-quality-monitoring",
        description: "Set up community-based air quality monitoring stations. Collected data for 6 months and presented findings to local authorities for policy changes.",
        category: "Environment",
        type: "data-collection",
        is_verified: false,
        is_pinned: false,
        status: null,
        created_at: "2024-08-01T12:00:00Z",
        isPublic: true,
        hours: 15,
        verified: true,
    },
    {
        uuid: "9",
        title: "youth-mental-health-awareness",
        description: "Conducted mental health awareness sessions in 3 schools. Trained peer counselors and established support groups for adolescent mental health.",
        category: "Health",
        type: "awareness-campaign",
        is_verified: false,
        is_pinned: false,
        status: null,
        created_at: "2024-09-05T10:00:00Z",
        isPublic: true,
        hours: 10,
        verified: false,
    },
    {
        uuid: "10",
        title: "local-food-security-initiative",
        description: "Started community kitchen gardens and food distribution network. Collaborated with local farmers to ensure fresh produce access in underserved areas.",
        category: "Social Impact",
        type: "hands-on",
        is_verified: true,
        is_pinned: false,
        status: null,
        created_at: "2024-10-12T13:30:00Z",
        isPublic: true,
        hours: 20,
        verified: true,
    },
    {
        uuid: "11",
        title: "cycling-infrastructure-advocacy",
        description: "Advocated for better cycling infrastructure in the city. Organized community rides and presented proposals to city planning committee.",
        category: "Urban Planning",
        type: "advocacy",
        is_verified: false,
        is_pinned: false,
        status: null,
        created_at: "2024-11-20T15:45:00Z",
        isPublic: true,
        hours: 7,
        verified: false,
    },
    {
        uuid: "12",
        title: "elderly-care-network",
        description: "Created a volunteer network to support elderly residents. Organized regular health check-ups, social activities, and emergency support systems.",
        category: "Social Impact",
        type: "community-service",
        is_verified: true,
        is_pinned: false,
        status: null,
        created_at: "2024-12-01T09:15:00Z",
        isPublic: true,
        hours: 14,
        verified: true,
    }
];

const communities: Community[] = [
    {
        id: "1",
        name: "SNLA Co-hort 2023",
        description: "Strategic Network of Leaders Academy cohort focused on developing young leaders in social impact and governance.",

    },
    {
        id: "2",
        name: "Saahas Waste Management",
        description: "Organization working on sustainable waste management solutions and circular economy initiatives across Karnataka.",
        link: "https://saahaszerowaste.com",
    },
    {
        id: "3",
        name: "Karnataka Youth Commission",
        description: "Advocacy group working towards formalization of youth commission in Karnataka state governance.",
    },
    {
        id: "4",
        name: "Construction Workers Welfare Network",
        description: "Network focused on improving access to government welfare schemes and economic development for construction workers.",
    },
    {
        id: "5",
        name: "Bengaluru Environmental Action Group",
        description: "Community-driven environmental conservation group focusing on tree plantation, waste management, and sustainable living practices.",
        link: "https://bengaluruenvironmental.org",
    }
];

const expertReviews: ExpertReview[] = [
    {
        id: "1",
        comment: "Kuppendra's approach to waste management is exemplary. His ability to coordinate with multiple stakeholders and create sustainable systems shows remarkable leadership for someone so young. The Materials Recovery Facility he helped establish is now a model for other communities.",
        reviewerName: "Dr. Ramesh Kumar",
        designation: "Environmental Policy Advisor",
        company: "Karnataka State Pollution Control Board",
        reviewerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=center",
        date: "March 2025"
    },
    {
        id: "2",
        comment: "Working with Kuppendra on the youth rights workshop was inspiring. He brings a unique perspective that bridges grassroots action with policy understanding. His questions during sessions showed deep critical thinking about systemic issues.",
        reviewerName: "Priya Sharma",
        designation: "Youth Rights Advocate",
        company: "Karnataka Youth Collective",
        reviewerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=center",
        date: "February 2024"
    },
    {
        id: "3",
        comment: "Kuppendra's dedication to construction workers' welfare is commendable. He spent months understanding the bureaucratic challenges and created simple solutions. His empathy-driven approach makes complex government schemes accessible to those who need them most.",
        reviewerName: "Suresh Naik",
        designation: "Labour Union Leader",
        company: "Karnataka Construction Workers Federation",
        date: "October 2024"
    },
    {
        id: "4",
        comment: "As a mentor in the SNLA program, I've watched Kuppendra grow from an enthusiastic participant to a strategic changemaker. His ability to see connections between environmental and social issues sets him apart. He thinks systemically.",
        reviewerName: "Anjali Reddy",
        designation: "Program Director",
        company: "Strategic Network of Leaders Academy",
        reviewerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=center",
        date: "December 2023"
    },
    {
        id: "5",
        comment: "Kuppendra's hands-on approach to tree plantation went beyond just planting saplings. He created a maintenance system that ensures long-term success. His 85% survival rate speaks to his commitment to follow-through and community engagement.",
        reviewerName: "Dr. Venkatesh Rao",
        designation: "Urban Forestry Specialist",
        company: "Bengaluru Forest Department",
        date: "June 2024"
    },
    {
        id: "6",
        comment: "What impressed me most about Kuppendra is his data-driven mindset. He doesn't just implement solutions; he measures impact, tracks progress, and adapts strategies. This combination of passion and analytical thinking is rare.",
        reviewerName: "Meera Patel",
        designation: "Impact Measurement Consultant",
        company: "Social Impact Partners",
        reviewerAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=center",
        date: "January 2025"
    }
];

const ContributionHeatmap = ({ setSelectedAction }: { setSelectedAction: (action: Action) => void }) => {
    const [data, setData] = useState<{ date: string; count: number }[]>([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showingAllActivity, setShowingAllActivity] = useState(false);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const years = [2025, 2024, 2023, 2022, 2021];

    // Generate contribution data only on client side to avoid hydration issues
    useEffect(() => {
        const generateData = () => {
            const contributionData = [];
            const today = new Date();
            const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

            for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
                const contributions = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
                contributionData.push({
                    date: new Date(d).toISOString().split('T')[0],
                    count: contributions
                });
            }
            return contributionData;
        };

        setData(generateData());
    }, []);

    const getContributionColor = (count: number) => {
        if (count === 0) return 'bg-gray-100';
        if (count === 1) return 'bg-green-200';
        if (count === 2) return 'bg-green-300';
        if (count === 3) return 'bg-green-400';
        return 'bg-green-500';
    };

    const totalContributions = data.reduce((sum, day) => sum + day.count, 0);

    // Generate activity data for selected year
    const getYearlyActivity = (year: number) => {
        const baseActivities = [
            {
                month: 'June',
                year: year,
                totalActions: 3,
                timeline: [
                    {
                        action: 'plastic-waste-management',
                        date: 'Jun 15',
                        description: 'Started working with Saahas Waste Management on plastic waste diversion project'
                    },
                    {
                        action: 'community-outreach-session',
                        date: 'Jun 22',
                        description: 'Conducted awareness session about waste segregation in local community'
                    },
                    {
                        action: 'materials-recovery-setup',
                        date: 'Jun 28',
                        description: 'Set up Materials Recovery Facility for processing collected plastics'
                    }
                ]
            },
            {
                month: 'May',
                year: year,
                totalActions: 5,
                timeline: [
                    {
                        action: 'tree-plantation-planning',
                        date: 'May 5',
                        description: 'Coordinated with local authorities for tree plantation permissions'
                    },
                    {
                        action: 'volunteer-mobilization',
                        date: 'May 12',
                        description: 'Mobilized 25+ volunteers for upcoming plantation drive'
                    },
                    {
                        action: 'tree-plantation-drive',
                        date: 'May 18',
                        description: 'Successfully planted 50+ native species saplings'
                    },
                    {
                        action: 'labor-welfare-research',
                        date: 'May 24',
                        description: 'Researched government welfare schemes for construction workers'
                    },
                    {
                        action: 'youth-rights-workshop',
                        date: 'May 30',
                        description: 'Attended 4-day residential workshop on youth rights in Mangalore'
                    }
                ]
            }
        ];

        // Add more months if showing all activity
        const additionalActivities = [
            {
                month: 'April',
                year: year,
                totalActions: 2,
                timeline: [
                    {
                        action: 'waste-audit-initiative',
                        date: 'Apr 8',
                        description: 'Conducted comprehensive waste audit in local residential areas'
                    },
                    {
                        action: 'skill-development-workshop',
                        date: 'Apr 20',
                        description: 'Organized skill development workshop for construction workers'
                    }
                ]
            },
            {
                month: 'March',
                year: year,
                totalActions: 4,
                timeline: [
                    {
                        action: 'water-conservation-drive',
                        date: 'Mar 3',
                        description: 'Initiated water conservation awareness campaign in schools'
                    },
                    {
                        action: 'community-garden-setup',
                        date: 'Mar 12',
                        description: 'Set up community garden with organic farming techniques'
                    },
                    {
                        action: 'environmental-education',
                        date: 'Mar 18',
                        description: 'Conducted environmental education sessions for local youth'
                    },
                    {
                        action: 'clean-energy-advocacy',
                        date: 'Mar 25',
                        description: 'Advocated for solar energy adoption in residential complexes'
                    }
                ]
            }
        ];

        return showingAllActivity ? [...baseActivities, ...additionalActivities] : baseActivities;
    };

    const yearlyActivity = getYearlyActivity(selectedYear);

    const handleShowMoreActivity = () => {
        setShowingAllActivity(true);
    };

    // Show loading state while data is being generated
    if (data.length === 0) {
        return (
            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Loading actions...
                        </h2>
                    </div>
                    <div className="h-32 bg-gray-50 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Contribution Heatmap with Year Selection */}
            <div className="flex gap-4 items-start">
                {/* Contribution Heatmap Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {totalContributions} actions in the last year
                        </h2>

                    </div>

                    {/* Main heatmap area */}
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full">
                            {/* Month labels */}
                            <div className="flex text-xs text-gray-600 mb-1 min-w-max">
                                {months.map((month, index) => (
                                    <div key={month} className="w-12 text-center" style={{ marginLeft: index === 0 ? '14px' : '0' }}>
                                        {month}
                                    </div>
                                ))}
                            </div>

                            {/* Days and contribution grid */}
                            <div className="flex min-w-max">
                                {/* Day labels */}
                                <div className="flex flex-col text-xs text-gray-600 mr-2">
                                    {days.map((day, index) => (
                                        <div key={day} className="h-2.5 flex items-center mb-0.5">
                                            {index % 2 === 1 ? day : ''}
                                        </div>
                                    ))}
                                </div>

                                {/* Contribution squares */}
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 53 }, (_, weekIndex) => (
                                        <div key={weekIndex} className="flex flex-col gap-0.5">
                                            {Array.from({ length: 7 }, (_, dayIndex) => {
                                                const dataIndex = weekIndex * 7 + dayIndex;
                                                const dayData = data[dataIndex];
                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        className={`w-2.5 h-2.5 rounded-sm ${dayData ? getContributionColor(dayData.count) : 'bg-gray-100'}`}
                                                        title={dayData ? `${dayData.count} actions on ${dayData.date}` : ''}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-2.5 h-2.5 bg-gray-100 rounded-sm"></div>
                                <div className="w-2.5 h-2.5 bg-green-200 rounded-sm"></div>
                                <div className="w-2.5 h-2.5 bg-green-300 rounded-sm"></div>
                                <div className="w-2.5 h-2.5 bg-green-400 rounded-sm"></div>
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                            </div>
                            <span>More</span>
                        </div>
                    </div>
                </div>

                {/* Year Selection - Outside the card */}
                <div className="flex flex-col gap-1">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`text-sm px-3 py-1 rounded cursor-pointer transition-colors ${year === selectedYear
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contribution Activity */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Action activity</h2>

                <div className="space-y-8">
                    {yearlyActivity.map((activity, index) => (
                        <div key={index}>
                            <h3 className="text-gray-900 font-medium mb-4">
                                {activity.month} {activity.year}
                            </h3>

                            <div className="border-l-2 border-gray-200 pl-6 ml-2">
                                <div className="space-y-3">
                                    {activity.timeline.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="flex flex-col items-center mt-1">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                {idx < activity.timeline.length - 1 && (
                                                    <div className="w-0.5 bg-gray-300 h-8 mt-1"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className="text-blue-600 hover:underline cursor-pointer text-sm font-medium"
                                                        onClick={() => {
                                                            // Find matching action or create a dummy one
                                                            const matchingAction = pinnedActions.find(a => a.title === item.action);
                                                            if (matchingAction) {
                                                                setSelectedAction(matchingAction);
                                                            }
                                                        }}
                                                    >
                                                        {item.action}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        on {item.date}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    {!showingAllActivity && (
                        <button
                            onClick={handleShowMoreActivity}
                            className="w-full bg-white hover:bg-gray-50 text-blue-600 text-sm py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                        >
                            Show more activity
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Portfolio() {
    const [selectedSkill, setSelectedSkill] = useState<typeof skills[0] | null>(null);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'communities'>('overview');
    const [userCommunities, setUserCommunities] = useState<Community[]>(communities);
    const [isAddCommunityModalOpen, setIsAddCommunityModalOpen] = useState(false);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [topActionIds, setTopActionIds] = useState<string[]>(pinnedActions.map(action => action.uuid));
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Get current top actions based on selected IDs
    const currentTopActions = allActions.filter(action => topActionIds.includes(action.uuid));

    const handleAddCommunity = (newCommunityData: Omit<Community, 'id'>) => {
        const newCommunity: Community = {
            ...newCommunityData,
            id: String(userCommunities.length + 1),
        };
        setUserCommunities(prev => [...prev, newCommunity]);
    };

    const handleSaveTopActions = (selectedActionIds: string[]) => {
        setTopActionIds(selectedActionIds);
    };

    const handleShareProfile = () => {
        setIsShareModalOpen(true);
    };

    const handleCopyLink = async () => {
        const profileLink = `${window.location.origin}/portfolio/${profile.username}`;
        try {
            await navigator.clipboard.writeText(profileLink);
            setCopied(true);

            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopied(false);
            }, 2000);

        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Inject animation styles */}
            <style dangerouslySetInnerHTML={{ __html: scrollAnimation }} />

            <div className="max-w-7xl mx-auto p-6">
                <div className="flex gap-20">
                    {/* Left sidebar - Profile */}
                    <div className="w-72 flex-shrink-0">
                        <div className="sticky top-8">
                            {/* Avatar */}
                            <div className="mb-6">
                                <img
                                    src={profile.avatar}
                                    alt={profile.fullName}
                                    className="w-48 h-48 rounded-full border border-gray-200"
                                />
                            </div>

                            {/* Name and verification */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
                                    {profile.isVerified && (
                                        <CheckCircle className="w-5 h-5 text-blue-500" />
                                    )}
                                </div>
                                <p className="text-xl text-gray-600 font-light">{profile.username}</p>
                            </div>

                            {/* Bio */}
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                {profile.bio}
                            </p>

                            {/* Followers/Following */}
                            {/* <div className="flex items-center gap-4 mb-2 text-sm">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-gray-600" />
                                    <span className="font-semibold text-gray-900">{profile.followers}</span>
                                    <span className="text-gray-600">followers</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-gray-900">{profile.following}</span>
                                    <span className="text-gray-600">following</span>
                                </div>
                            </div> */}

                            {/* Location */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                <MapPin className="w-4 h-4" />
                                <span>{profile.location}</span>
                            </div>

                            {/* Share Profile Button */}
                            <div className="mb-4">
                                <button
                                    onClick={handleShareProfile}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer w-full justify-center"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share Profile
                                </button>
                            </div>

                            {/* Skills */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[...skills].sort((a, b) => b.count - a.count).map((skill) => (
                                        <div
                                            key={skill.name}
                                            className="relative group cursor-pointer flex flex-col items-center"
                                            onClick={() => setSelectedSkill(skill)}
                                        >
                                            <div className="relative mb-2">
                                                <div className="w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                                                    <img
                                                        src={skill.image}
                                                        alt={skill.name}
                                                        className="w-full h-full object-cover"
                                                        title={skill.name}
                                                    />
                                                </div>
                                                {skill.count > 1 && (
                                                    <div className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                                                        x{skill.count}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-700 text-center leading-tight">
                                                {skill.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right content */}
                    <div className="flex-1 min-w-0">
                        {/* Navigation Tabs */}
                        <div className="border-b border-gray-200 mb-8">
                            <nav className="flex gap-8">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`pb-3 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors ${activeTab === 'overview'
                                        ? 'border-orange-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                        </svg>
                                        Overview
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab('actions')}
                                    className={`pb-3 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors ${activeTab === 'actions'
                                        ? 'border-orange-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        Actions
                                        <span className="bg-gray-200 text-gray-900 text-xs px-2 py-0.5 rounded-full">
                                            {allActions.length}
                                        </span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab('communities')}
                                    className={`pb-3 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors ${activeTab === 'communities'
                                        ? 'border-orange-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                        </svg>
                                        Communities
                                        <span className="bg-gray-200 text-gray-900 text-xs px-2 py-0.5 rounded-full">
                                            {userCommunities.length}
                                        </span>
                                    </div>
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'overview' ? (
                            <>
                                {/* Actionable Personality Summary */}
                                <div className="mb-8 bg-gradient-to-br from-blue-50 via-green-50 to-orange-50 rounded-xl p-6 border border-gray-100">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-gray-900 mb-3">Action-Driven Systems Builder</h2>
                                            <p className="text-gray-700 mb-4 leading-relaxed">
                                                <span className="font-semibold">Through {allActions.length} civic actions totaling {allActions.reduce((sum, action) => sum + (action.hours || 0), 0)} hours</span>, Kuppendra has proven himself as a strategic changemaker who tackles complex community challenges. His standout strength is <span className="font-semibold">Community Collaboration</span> (demonstrated in 8 actions), showing he excels at uniting diverse stakeholders for lasting impact.
                                            </p>
                                            {/* <div className="flex flex-wrap gap-2 mb-4">
                                                <div className="flex items-center gap-2 bg-white border border-green-200 px-3 py-1.5 rounded-lg">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-700">Systems Thinking: Environment → Social Impact</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white border border-blue-200 px-3 py-1.5 rounded-lg">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-700">Hands on: 4 practical projects</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white border border-orange-200 px-3 py-1.5 rounded-lg">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-700">Cross-sector Bridge: Government ↔ Community</span>
                                                </div>
                                            </div> */}

                                        </div>
                                    </div>
                                </div>

                                {/* Pinned Actions */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">Top Actions</h2>
                                        <button
                                            onClick={() => setIsCustomizeModalOpen(true)}
                                            className="text-sm text-blue-600 hover:underline cursor-pointer"
                                        >
                                            Customize your top actions
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {currentTopActions.map(action => (
                                            <ActionCard
                                                key={action.uuid}
                                                action={action}
                                                onActionClick={(a) => setSelectedAction(a)}
                                                skills={skills}
                                                variant="compact"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Expert Reviews */}
                                <div className="mb-8">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Expert Reviews</h2>

                                    <div className="relative overflow-hidden">
                                        {/* Auto-scrolling container */}
                                        <div className="flex gap-6 animate-scroll">
                                            {/* First set of reviews */}
                                            {expertReviews.map(review => (
                                                <div key={review.id} className="flex-shrink-0 w-80">
                                                    <ExpertReviewCard
                                                        review={review}
                                                        variant="default"
                                                    />
                                                </div>
                                            ))}
                                            {/* Duplicate set for seamless scrolling */}
                                            {expertReviews.map(review => (
                                                <div key={`${review.id}-duplicate`} className="flex-shrink-0 w-80">
                                                    <ExpertReviewCard
                                                        review={review}
                                                        variant="default"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Gradient overlays for fade effect */}
                                        <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10"></div>
                                        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"></div>
                                    </div>
                                </div>

                                {/* Contribution Graph */}
                                <ContributionHeatmap setSelectedAction={setSelectedAction} />
                            </>
                        ) : activeTab === 'actions' ? (
                            /* Actions Tab Content */
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {allActions.map(action => (
                                        <ActionCard
                                            key={action.uuid}
                                            action={action}
                                            onActionClick={(a) => setSelectedAction(a)}
                                            skills={skills}
                                            variant="compact"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Communities Tab Content */
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setIsAddCommunityModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Community
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {userCommunities.map(community => (
                                        <CommunityCard
                                            key={community.id}
                                            community={community}
                                        />
                                    ))}
                                </div>

                                {userCommunities.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 mb-4">
                                            <Users className="w-12 h-12 mx-auto" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No communities yet</h3>
                                        <p className="text-gray-600 mb-4">Start building your network by joining communities that align with your interests.</p>
                                        <button
                                            onClick={() => setIsAddCommunityModalOpen(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Your First Community
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Share Profile Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Share Profile</h2>
                            <button
                                onClick={() => setIsShareModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="text"
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${profile.username}`}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors flex items-center gap-2 ${copied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Skill Modal */}
            <SkillModal
                skill={selectedSkill}
                onClose={() => setSelectedSkill(null)}
            />

            {/* Action Modal */}
            {selectedAction && (
                <ActionModal
                    action={selectedAction}
                    onClose={() => setSelectedAction(null)}
                    skills={skills}
                />
            )}

            {/* Add Community Modal */}
            <AddCommunityModal
                isOpen={isAddCommunityModalOpen}
                onClose={() => setIsAddCommunityModalOpen(false)}
                onAdd={handleAddCommunity}
            />

            {/* Customize Top Actions Modal */}
            <CustomizeTopActionsModal
                isOpen={isCustomizeModalOpen}
                onClose={() => setIsCustomizeModalOpen(false)}
                allActions={allActions}
                currentTopActionIds={topActionIds}
                onSave={handleSaveTopActions}
            />
        </div>
    );
}
