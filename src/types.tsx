import { Community } from "@/components/CommunityCard";

export interface ActionDetails {
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

export interface Action {
    id: string;
    title: string;
    description: string;
    category: string;
    isPublic: boolean;
    hours: number;
    verified?: boolean;
    details?: ActionDetails;
}

export interface Skill {
    name: string;
    image: string;
    count: number;
    description: string;
    actions: Array<{
        id: string;
        title: string;
        date: string;
        explanation: string;
    }>;
}

// Chat-related types
export interface ChatMessage {
    role: 'user' | 'assistant' | 'analysis';
    content: string | Array<{ id: string; name: string; relevance: string, response: string }>;
    timestamp: Date;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

export interface StreamingResponse {
    response: string;
    is_done: boolean | null;
}

export interface SkillExtractionResponse {
    skills: Array<{ id: string; name: string; relevance: string; response: string }>;
}

// Authentication types
export interface SignupData {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface SignupResponse {
    id: string;
    email: string;
    username: string;
    message: string;
}

export interface SignupError {
    message: string;
    field?: string;
}



// User data interface matching backend response
export interface UserProfile {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    id: number;
    is_verified: boolean;
    bio: string | null;
    location_state: string | null;
    location_city: string | null;
    location_country: string | null;
    communities: Community[];
}
