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
    role: 'user' | 'assistant';
    content: string;
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
