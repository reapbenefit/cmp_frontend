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
