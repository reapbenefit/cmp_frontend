"use client";

import { useState, useEffect } from "react";
import { MapPin, Users, CheckCircle, Plus, Share2, Copy, Check } from "lucide-react";
import ActionCard from "@/components/ActionCard";
import SkillModal from "@/components/SkillModal";
import ActionModal from "@/components/ActionModal";
import CommunityCard, { Community } from "@/components/CommunityCard";
import AddCommunityModal from "@/components/AddCommunityModal";
import CustomizeTopActionsModal from "@/components/CustomizeTopActionsModal";
import ExpertReviewCard, { ExpertReview } from "@/components/ExpertReviewCard";
import { Action, Skill } from "@/types";

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
    avatar: "/api/placeholder/260/260",
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
        name: "Digital + Data Citizenship",
        image: "/badges/data_digital_citizenship.png",
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

const pinnedActions: Action[] = [
    {
        id: "1",
        title: "plastic-waste-management",
        description: "Working with Saahas Waste Management on diverting plastics from landfills into repurpose & recycling. Materials Recovery Facility implementation.",
        category: "Environment",
        isPublic: true,
        hours: 4,
        verified: true,
        details: {
            actionType: "Hands-on",
            skillsCovered: ["Problem Solving", "Community Collaboration", "Hands-On", "Digital + Data Citizenship"],
            skillExplanations: {
                "Problem Solving": "Identified complex waste segregation challenges and systematically developed a Materials Recovery Facility solution to address multiple stakeholder needs.",
                "Community Collaboration": "Successfully coordinated with BBMP, CMC, TMC, local GPs, and 45+ community members to establish sustainable waste management practices.",
                "Hands-On": "Physically set up the Materials Recovery Facility infrastructure and directly trained community members in waste segregation techniques.",
                "Digital + Data Citizenship": "Tracked and measured 2.5 tons of diverted plastic waste, monitored facility efficiency, and documented community engagement metrics."
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
        id: "2",
        title: "youth-rights-workshop",
        description: "4 days residential workshop in Mangalore 2022. Learnings about youth rights, demanding formalization of youth commission in Karnataka.",
        category: "Social Justice",
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
        id: "3",
        title: "labor-welfare-awareness",
        description: "Creating awareness about government schemes and Labour Identity Cards. Providing free labour cards to workers who weren't aware of benefits.",
        category: "Social Impact",
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
        id: "4",
        title: "tree-plantation-drive",
        description: "Community tree plantation focusing on native species. Coordinated with local authorities and mobilized 25+ volunteers.",
        category: "Environment",
        isPublic: true,
        hours: 2,
        verified: false,
        details: {
            actionType: "Environmental Action",
            skillsCovered: ["Community Collaboration", "Hands-On", "Applied Empathy"],
            skillExplanations: {
                "Community Collaboration": "Successfully mobilized 25+ volunteers and coordinated with multiple stakeholders including residents, forest department, and schools.",
                "Hands-On": "Physically planted 150+ native trees and set up maintenance systems, directly involved in all implementation aspects.",
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
        id: "5",
        title: "water-conservation-campaign",
        description: "Implemented rainwater harvesting systems in 15 residential buildings. Educated residents about water conservation techniques and monitored usage patterns.",
        category: "Environment",
        isPublic: true,
        hours: 12,
        verified: true,
    },
    {
        id: "6",
        title: "digital-literacy-program",
        description: "Taught basic digital skills to 50+ senior citizens in the community. Covered smartphone usage, online banking safety, and digital government services.",
        category: "Education",
        isPublic: true,
        hours: 6,
        verified: true,
    },
    {
        id: "7",
        title: "street-vendor-support",
        description: "Organized legal aid workshops for street vendors. Helped 30+ vendors obtain proper licenses and understand their rights under new policies.",
        category: "Social Justice",
        isPublic: true,
        hours: 8,
        verified: false,
    },
    {
        id: "8",
        title: "air-quality-monitoring",
        description: "Set up community-based air quality monitoring stations. Collected data for 6 months and presented findings to local authorities for policy changes.",
        category: "Environment",
        isPublic: true,
        hours: 15,
        verified: true,
    },
    {
        id: "9",
        title: "youth-mental-health-awareness",
        description: "Conducted mental health awareness sessions in 3 schools. Trained peer counselors and established support groups for adolescent mental health.",
        category: "Health",
        isPublic: true,
        hours: 10,
        verified: false,
    },
    {
        id: "10",
        title: "local-food-security-initiative",
        description: "Started community kitchen gardens and food distribution network. Collaborated with local farmers to ensure fresh produce access in underserved areas.",
        category: "Social Impact",
        isPublic: true,
        hours: 20,
        verified: true,
    },
    {
        id: "11",
        title: "cycling-infrastructure-advocacy",
        description: "Advocated for better cycling infrastructure in the city. Organized community rides and presented proposals to city planning committee.",
        category: "Urban Planning",
        isPublic: true,
        hours: 7,
        verified: false,
    },
    {
        id: "12",
        title: "elderly-care-network",
        description: "Created a volunteer network to support elderly residents. Organized regular health check-ups, social activities, and emergency support systems.",
        category: "Social Impact",
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
    const [topActionIds, setTopActionIds] = useState<string[]>(pinnedActions.map(action => action.id));
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Get current top actions based on selected IDs
    const currentTopActions = allActions.filter(action => topActionIds.includes(action.id));

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
                                                <span className="font-semibold">Through {allActions.length} civic actions totaling {allActions.reduce((sum, action) => sum + action.hours, 0)} hours</span>, Kuppendra has proven himself as a strategic changemaker who tackles complex community challenges. His standout strength is <span className="font-semibold">Community Collaboration</span> (demonstrated in 8 actions), showing he excels at uniting diverse stakeholders for lasting impact.
                                            </p>
                                            {/* <div className="flex flex-wrap gap-2 mb-4">
                                                <div className="flex items-center gap-2 bg-white border border-green-200 px-3 py-1.5 rounded-lg">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-700">Systems Thinking: Environment → Social Impact</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white border border-blue-200 px-3 py-1.5 rounded-lg">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-700">Hands-On: 4 practical projects</span>
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
                                                key={action.id}
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
                                            key={action.id}
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
