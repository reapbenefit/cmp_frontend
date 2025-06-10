"use client";

import { useState, useEffect } from "react";
import { MapPin, Users, CheckCircle, ExternalLink, Calendar } from "lucide-react";
import ActionCard from "@/components/ActionCard";
import SkillModal from "@/components/SkillModal";
import ActionModal from "@/components/ActionModal";

// Types
interface PinnedAction {
    id: string;
    title: string;
    description: string;
    category: string;
    isPublic: boolean;
}

// Dummy data matching the user's profile
const profile = {
    username: "kuppendra",
    fullName: "Kuppendra",
    bio: "B.com tourism graduate, part of SNLA Co-hort 2023. Working on Construction & other labours economical development through easy access of welfare fund.",
    location: "Bengaluru, Karnataka",
    // followers: 469,
    // following: 2,
    isVerified: true,
    avatar: "/api/placeholder/260/260",
};

// Skills data using actual badge images
const skills = [
    {
        name: "Problem Solving",
        image: "/badges/problem_solving.png",
        count: 2,
        description: "Ability to identify complex issues and develop systematic solutions",
        actions: [
            {
                id: "1",
                title: "plastic-waste-management",
                date: "2025-02-03",
                explanation: "Identified and addressed the complex issue of plastic waste management through systematic sorting and facility setup"
            },
            {
                id: "3",
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
                id: "2",
                title: "youth-rights-workshop",
                date: "2024-02-14",
                explanation: "Analyzed youth rights issues and policy gaps in Karnataka state governance"
            },
            {
                id: "1",
                title: "plastic-waste-management",
                date: "2025-02-03",
                explanation: "Critically evaluated waste management systems and identified improvement opportunities"
            },
            {
                id: "4",
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
                id: "2",
                title: "youth-rights-workshop",
                date: "2024-02-14",
                explanation: "Presented findings to workshop participants and engaged in advocacy discussions"
            },
            {
                id: "4",
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
                id: "1",
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
                id: "2",
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
                id: "1",
                title: "plastic-waste-management",
                date: "2025-02-03",
                explanation: "Worked with multiple stakeholders including BBMP, CMC, TMC and GP to implement waste collection"
            },
            {
                id: "3",
                title: "tree-plantation-drive",
                date: "2024-01-15",
                explanation: "Mobilized 25+ volunteers and coordinated with local authorities for plantation permissions"
            }
        ]
    },
    {
        name: "Hands-On",
        image: "/badges/hands_on.png",
        count: 4,
        description: "Direct, practical involvement in implementing solutions",
        actions: [
            {
                id: "3",
                title: "tree-plantation-drive",
                date: "2024-01-15",
                explanation: "Physically planted 50+ saplings and set up watering systems for maintenance"
            },
            {
                id: "1",
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
                id: "4",
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
                id: "3",
                title: "tree-plantation-drive",
                date: "2024-01-15",
                explanation: "Understood community needs for green spaces and involved residents in selecting plantation sites"
            }
        ]
    }
];

const pinnedActions: PinnedAction[] = [
    {
        id: "1",
        title: "plastic-waste-management",
        description: "Working with Saahas Waste Management on diverting plastics from landfills into repurpose & recycling. Materials Recovery Facility implementation.",
        category: "Environment",
        isPublic: true,
    },
    {
        id: "2",
        title: "youth-rights-workshop",
        description: "4 days residential workshop in Mangalore 2022. Learnings about youth rights, demanding formalization of youth commission in Karnataka.",
        category: "Social Justice",
        isPublic: true,
    },
    {
        id: "3",
        title: "labor-welfare-awareness",
        description: "Creating awareness about government schemes and Labour Identity Cards. Providing free labour cards to workers who weren't aware of benefits.",
        category: "Social Impact",
        isPublic: true,
    },
    {
        id: "4",
        title: "tree-plantation-drive",
        description: "Community tree plantation focusing on native species. Coordinated with local authorities and mobilized 25+ volunteers.",
        category: "Environment",
        isPublic: true,
    }
];

const ContributionHeatmap = ({ setSelectedAction }: { setSelectedAction: (action: PinnedAction) => void }) => {
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
    const [selectedAction, setSelectedAction] = useState<PinnedAction | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'actions'>('overview');

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex gap-6">
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

                            {/* Skills */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {skills.map((skill) => (
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
                                            {pinnedActions.length}
                                        </span>
                                    </div>
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'overview' ? (
                            <>
                                {/* Pinned Actions */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">Top Actions</h2>
                                        <button className="text-sm text-blue-600 hover:underline cursor-pointer">
                                            Customize your top actions
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {pinnedActions.map(action => (
                                            <ActionCard
                                                key={action.id}
                                                action={action}
                                                onActionClick={(a) => setSelectedAction(a)}
                                                skills={skills}
                                                variant="compact"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Contribution Graph */}
                                <ContributionHeatmap setSelectedAction={setSelectedAction} />
                            </>
                        ) : (
                            /* Actions Tab Content */
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">All Actions</h2>
                                    <div className="text-sm text-gray-500">
                                        {pinnedActions.length} actions
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {pinnedActions.map(action => (
                                        <ActionCard
                                            key={action.id}
                                            action={action}
                                            onActionClick={(a) => setSelectedAction(a)}
                                            skills={skills}
                                            variant="compact"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
        </div>
    );
}
