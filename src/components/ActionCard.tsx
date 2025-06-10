"use client";

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

interface ActionCardProps {
    action: PinnedAction;
    onActionClick: (action: PinnedAction) => void;
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

export default function ActionCard({
    action,
    onActionClick,
    skills,
    variant = 'compact',
    actionDetails = {
        category: "Waste",
        actionType: "Hands-on",
        skillsCovered: ["Problem Solving", "Community Collaboration", "Hands-On", "Data Orientation"],
        skillExplanations: {
            "Problem Solving": "Identified complex waste segregation challenges and systematically developed a Materials Recovery Facility solution to address multiple stakeholder needs.",
            "Community Collaboration": "Successfully coordinated with BBMP, CMC, TMC, local GPs, and 45+ community members to establish sustainable waste management practices.",
            "Hands-On": "Physically set up the Materials Recovery Facility infrastructure and directly trained community members in waste segregation techniques.",
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
                    <h3 className={`font-bold text-gray-900 transition-colors leading-tight ${isExpanded ? 'text-xl mb-2' : 'text-lg mb-2'
                        }`}>
                        {action.title}
                    </h3>

                    {/* Category and Action Type badges - simple colors */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`bg-blue-100 text-blue-800 px-2 py-1 rounded ${isExpanded ? 'text-sm' : 'text-xs'
                            }`}>
                            {actionDetails.category}
                        </span>
                        <span className={`bg-green-100 text-green-800 px-2 py-1 rounded ${isExpanded ? 'text-sm' : 'text-xs'
                            }`}>
                            {actionDetails.actionType}
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
                        <span className="font-medium text-gray-600">Skills Developed</span>
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