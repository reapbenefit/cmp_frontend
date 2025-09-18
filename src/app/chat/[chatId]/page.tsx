"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Trophy, Star } from "lucide-react";
import { ChatMessage, ChatSession, StreamingResponse, SkillExtractionResponse, UpdateActionMetadataResponse, SkillMessage } from "@/types";
import ChatSidebar, { SidebarToggle } from "@/components/ChatSidebar";
import InputArea, { InputAreaHandle } from "@/components/InputArea";
import AuthWrapper from "@/components/AuthWrapper";

// Chat API function
async function sendChatMessage(message: string, chatId: string): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/basic_action_chat_stream`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            last_user_message: message,
            action_uuid: chatId
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
        throw new Error('No response body');
    }

    return response.body;
}

// Detail Chat API function for follow-up questions
async function sendDetailChatMessage(content: string, chatId: string): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/detail_action_chat_stream`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            last_user_message: content,
            action_uuid: chatId
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
        throw new Error('No response body');
    }

    return response.body;
}

// Skill extraction API function
async function extractActionMetadata(messages: ChatMessage[], chatId: string): Promise<SkillExtractionResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/extract_action_metadata?action_uuid=${encodeURIComponent(chatId)}`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// Send chat message to backend API function
async function sendChatMessageToBackend(chatId: string, messages: ChatMessage[]): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat_messages/${chatId}`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages.map(message => ({
            role: message.role,
            content: typeof message.content === 'object' ? JSON.stringify(message.content) : message.content,
            response_type: "text"
        })))
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

// Send time invested to backend API function
async function sendTimeInvested(chatId: string, timeValue: number, timeUnit: 'hours' | 'minutes'): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/actions/${chatId}/hours_invested`, {
        method: 'PUT',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            time_invested_value: timeValue,
            time_invested_unit: timeUnit
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}


// Update action metadata API function for detail chat
async function updateActionMetadata(messages: ChatMessage[], chatId: string): Promise<UpdateActionMetadataResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/update_action_metadata?action_uuid=${encodeURIComponent(chatId)}`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// Chat history API function
async function fetchChatHistory(chatId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat_history/${chatId}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const historyData = await response.json();

    // Transform API response to ChatMessage format
    return historyData.map((item: { role: string; content: string; created_at: string }) => ({
        role: item.role as 'user' | 'assistant' | 'analysis',
        content: ['analysis', 'assistant'].includes(item.role) ? JSON.parse(item.content) : item.content,
        timestamp: new Date(item.created_at)
    }));
}

// Message component
const MessageBubble = ({ message, isStreaming, username }: { message: ChatMessage; isStreaming?: boolean; username?: string | null }) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';
    const isAnalysis = message.role === 'analysis';

    if (isAnalysis) {
        // Handle case where no skills changed but we still want to show portfolio update
        if (typeof message.content === 'object' && 'has_changed' in message.content && !message.content.has_changed) {
            return (
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 md:p-6 max-w-2xl w-full">
                        <div className="flex items-center gap-2 mb-2 md:mb-4">
                            <Trophy className="h-6 w-6 text-green-600" />
                            <h3 className="text-base md:text-lg font-semibold text-gray-800">Portfolio Updated</h3>
                        </div>
                        <div className="flex flex-col space-y-2 md:space-y-3">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-orange-500" />
                                <span className="text-xs md:text-sm font-medium text-gray-600">Your portfolio has been updated. Go check it out!</span>
                            </div>
                            {username && (
                                <div>
                                    <a
                                        href={`/user-profile/${username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                                    >
                                        Open your portfolio
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 md:p-6 max-w-2xl w-full">
                    <div className="flex items-center gap-2 mb-2 md:mb-4">
                        <Trophy className="h-6 w-6 text-green-600" />
                        <h3 className="text-base md:text-lg font-semibold text-gray-800">
                            {typeof message.content === 'object' && 'has_changed' in message.content && message.content.has_changed ? 'Skills updated' : 'Skills unlocked'}
                        </h3>
                    </div>

                    {message.content && typeof message.content === 'object' && 'skills' in message.content && Array.isArray(message.content.skills) && message.content.skills.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-orange-500" />
                                <span className="text-xs md:text-sm font-medium text-gray-600">You have shown these skills through your action!</span>
                            </div>
                            <div className="space-y-2 md:space-y-3">
                                {message.content.skills.map((skill: SkillMessage, index: number) => (
                                    <div key={index} className="flex items-start gap-2 md:gap-4 p-2 md:p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                        <img
                                            src={`/badges/${skill.name}.png`}
                                            alt={skill.name}
                                            className="w-8 h-8 md:w-12 md:h-12 object-contain flex-shrink-0 mt-0.5"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs md:text-sm text-gray-700 leading-1">
                                                <span className="font-bold">{skill.label}:</span> <span className="text-xs md:text-sm">{skill.response}</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs md:text-sm font-medium text-gray-600 leading-1">
                                {typeof message.content === 'object' && 'has_changed' in message.content && message.content.has_changed
                                    ? 'The action details have been updated on your portfolio. Go check it out!'
                                    : 'Your portfolio has been updated with your new action and skills. Go check it out!'
                                }
                            </span>
                            {username && (
                                <div>
                                    <a
                                        href={`/user-profile/${username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                                    >
                                        Open your portfolio
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${isUser
                    ? 'bg-green-600 text-white'
                    : 'bg-transparent text-gray-800'
                    }`}
            >
                <div className="text-sm whitespace-pre-wrap">
                    {isAssistant && typeof message.content === 'object' && 'response' in message.content ? message.content.response : ''}
                    {isUser && typeof message.content === 'string' ? message.content : ''}
                    {isStreaming && (
                        <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse" />
                    )}
                </div>
            </div>
        </div>
    );
};

// Action Metadata Extraction Loading Component
const ActionMetadataExtractionLoader = () => {
    const [currentMessage, setCurrentMessage] = useState(0);
    const messages = [
        "Analyzing your ninja moves",
        "Identifying your superpowers",
        "Mapping your impact skills",
        "Discovering your strengths"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage(prev => (prev + 1) % messages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="flex justify-center mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-sm">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">{messages[currentMessage]}</span>
            </div>
        </div>
    );
};

// Action Update Loading Component
const ActionMetadataUpdateLoader = () => {
    const [currentMessage, setCurrentMessage] = useState(0);
    const messages = [
        "Updating your action details",
        "Enhancing your portfolio",
        "Processing your insights",
        "Finalizing your impact story"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage(prev => (prev + 1) % messages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="flex justify-center mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-sm">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">{messages[currentMessage]}</span>
            </div>
        </div>
    );
};

export default function ChatPage() {
    const router = useRouter();
    const params = useParams();
    const chatId = params.chatId as string;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isConversationOver, setIsConversationOver] = useState(false);
    const [isExtractingActionMetadata, setIsExtractingActionMetadata] = useState(false);
    const [isUpdatingActionMetadata, setIsUpdatingActionMetadata] = useState(false);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [isDetailChatMode, setIsDetailChatMode] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    // Time investment states
    const [isAskingTimeInvestment, setIsAskingTimeInvestment] = useState(false);
    const [timeInvestedValue, setTimeInvestedValue] = useState<string>("");
    const [timeInvestedUnit, setTimeInvestedUnit] = useState<'hours' | 'minutes'>('hours');
    const [isSendingTimeInvestment, setIsSendingTimeInvestment] = useState(false);

    // Initialize sidebar state based on screen size - closed on mobile, open on desktop
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768; // 768px is md breakpoint in Tailwind
        }
        return false; // Default to closed during SSR
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const apiCallInProgressRef = useRef<boolean>(false);
    const analysisSentRef = useRef<boolean>(false);
    const inputAreaRef = useRef<InputAreaHandle>(null);

    // Read username from localStorage
    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        setUsername(storedUsername);
    }, []);

    // Function to handle time investment submission
    const handleTimeInvestmentSubmit = useCallback(async () => {
        if (!timeInvestedValue || isNaN(parseFloat(timeInvestedValue)) || parseFloat(timeInvestedValue) <= 0) {
            alert('Please enter a valid time value');
            return;
        }

        setIsSendingTimeInvestment(true);

        try {
            // Send time investment to backend
            await sendTimeInvested(chatId, parseFloat(timeInvestedValue), timeInvestedUnit);

            // Create user message for the time investment answer
            const timeAnswerMessage: ChatMessage = {
                role: 'user',
                content: `${timeInvestedValue} ${timeInvestedUnit}`,
                timestamp: new Date()
            };

            // Create AI response acknowledging the time investment and asking about reflective questions
            const continueMessage: ChatMessage = {
                role: 'assistant',
                content: {
                    response: "Thank you for sharing that! Would you like me to ask you some more questions about this action to help enhance your portfolio even further? I can help you reflect on the impact, challenges, and learnings from your experience.",
                },
                timestamp: new Date()
            };

            // Add both messages to the conversation
            const newMessages = [...messages, timeAnswerMessage, continueMessage];
            setMessages(newMessages);

            // Update session
            if (currentSession) {
                const updatedSession = {
                    ...currentSession,
                    messages: newMessages,
                    updatedAt: new Date()
                };
                setCurrentSession(updatedSession);

                // Send both messages to backend
                try {
                    await sendChatMessageToBackend(chatId, [timeAnswerMessage, continueMessage]);
                    console.log('Time investment messages sent to backend successfully');
                } catch (error) {
                    console.error('Error sending time investment messages to backend:', error);
                }
            }

            // Reset time investment state and show regular input again
            setIsAskingTimeInvestment(false);
            setTimeInvestedValue("");
            setTimeInvestedUnit('hours');
            setIsDetailChatMode(true);

        } catch (error) {
            console.error('Error sending time investment:', error);
            alert('Failed to save time investment. Please try again.');
        } finally {
            setIsSendingTimeInvestment(false);
        }
    }, [timeInvestedValue, timeInvestedUnit, chatId, messages, currentSession]);

    // Shared function for handling action metadata extraction
    const handleExtractActionMetadata = useCallback(async (conversationMessages: ChatMessage[], updatedSession: ChatSession) => {
        if (isExtractingActionMetadata) return;
        setIsExtractingActionMetadata(true);

        try {
            console.log('Extracting skills from conversation...');
            const actionMetadata = await extractActionMetadata(conversationMessages, chatId);

            if (actionMetadata.skills && actionMetadata.skills.length > 0) {
                const analysisMessage: ChatMessage = {
                    role: 'analysis',
                    timestamp: new Date(),
                    content: {
                        skills: actionMetadata.skills
                    }
                };

                const analysisMessages = [...conversationMessages, analysisMessage];
                setMessages(analysisMessages);

                // Update session with analysis
                const finalSessionUpdate = {
                    ...updatedSession,
                    messages: analysisMessages,
                    updatedAt: new Date()
                };
                setCurrentSession(finalSessionUpdate);

                // Send analysis message to backend for persistence
                if (!analysisSentRef.current) {
                    analysisSentRef.current = true;
                    try {
                        await sendChatMessageToBackend(chatId, [analysisMessage]);
                        console.log('Analysis message sent to backend successfully');
                    } catch (error) {
                        console.error('Error sending analysis message to backend:', error);
                        analysisSentRef.current = false;
                    }
                }

                // Create/update action with extracted data
                try {
                    setIsConversationOver(false);

                    // Create a new AI message asking for time investment
                    const timeInvestmentMessage: ChatMessage = {
                        role: 'assistant',
                        content: {
                            response: "Great! To complete your action documentation, could you tell me how much time you invested in this action?",
                        },
                        timestamp: new Date()
                    };

                    // Add the message to the conversation
                    setMessages(prev => [...prev, timeInvestmentMessage]);

                    // Update session with the new message
                    const messagesWithTimeQuestion = [...analysisMessages, timeInvestmentMessage];
                    const sessionWithTimeQuestion = {
                        ...finalSessionUpdate,
                        messages: messagesWithTimeQuestion,
                        updatedAt: new Date()
                    };
                    setCurrentSession(sessionWithTimeQuestion);

                    // Send the time investment message to backend
                    try {
                        await sendChatMessageToBackend(chatId, [timeInvestmentMessage]);
                        console.log('Time investment message sent to backend successfully');
                    } catch (error) {
                        console.error('Error sending time investment message to backend:', error);
                    }

                    // Set state to show time investment input
                    setIsAskingTimeInvestment(true);

                } catch (error) {
                    console.error('Error creating/updating action:', error);
                }
            }
        } catch (error) {
            console.error('Error extracting skills:', error);
        } finally {
            setIsExtractingActionMetadata(false);
        }
    }, [chatId, isExtractingActionMetadata]);

    // Shared function for handling action metadata updates
    const handleActionMetadataUpdate = useCallback(async (conversationMessages: ChatMessage[], updatedSession: ChatSession) => {
        setIsUpdatingActionMetadata(true);

        try {
            console.log('Updating action metadata...');
            const actionMetadata = await updateActionMetadata(conversationMessages, chatId);

            if (actionMetadata.has_changed && actionMetadata.skills && actionMetadata.skills.length > 0) {
                // Skills have changed - show new analysis message
                const analysisMessage: ChatMessage = {
                    role: 'analysis',
                    timestamp: new Date(),
                    content: {
                        has_changed: true,
                        skills: actionMetadata.skills
                    }
                };

                const analysisMessages = [...conversationMessages, analysisMessage];
                setMessages(analysisMessages);

                // Update session with analysis
                const finalSessionUpdate = {
                    ...updatedSession,
                    messages: analysisMessages,
                    updatedAt: new Date()
                };
                setCurrentSession(finalSessionUpdate);

                // Send analysis message to backend for persistence
                try {
                    await sendChatMessageToBackend(chatId, [analysisMessage]);
                    console.log('Updated analysis message sent to backend successfully');
                } catch (error) {
                    console.error('Error sending updated analysis message to backend:', error);
                }
            } else {
                // No skills changed - show simple update message
                const updateMessage: ChatMessage = {
                    role: 'analysis',
                    content: JSON.stringify({
                        has_changed: false
                    }),
                    timestamp: new Date()
                };

                // Send the update message to backend
                try {
                    await sendChatMessageToBackend(chatId, [updateMessage]);
                    console.log('Update message sent to backend successfully');
                } catch (error) {
                    console.error('Error sending update message to backend:', error);
                }
            }

            // Mark conversation as over in both cases
            setIsConversationOver(true);
        } catch (error) {
            console.error('Error updating action metadata:', error);
            setIsConversationOver(true);
        } finally {
            setIsUpdatingActionMetadata(false);
        }
    }, [chatId]);

    // Handle streaming response
    const handleStreamingResponse = useCallback(async (stream: ReadableStream<Uint8Array>, session: ChatSession | null, sessions: ChatSession[], userMessageContent: string, isFromDetailChat: boolean = false) => {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let isConversationComplete = false;

        const userMessage: ChatMessage = {
            role: 'user',
            content: userMessageContent,
            timestamp: new Date()
        };

        const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: '',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsStreaming(true);

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data: StreamingResponse = JSON.parse(line);
                            assistantMessage.content = {
                                response: data.response,
                                is_done: data.is_done || false
                            };

                            setMessages(prev => {
                                const newMessages = [...prev];
                                newMessages[newMessages.length - 1] = { ...assistantMessage };
                                return newMessages;
                            });

                            if (!isConversationComplete && data.is_done) {
                                isConversationComplete = true;
                            }
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                }
            }
        } finally {
            setIsStreaming(false);
            setIsLoading(false);

            // Focus the input area after AI response is complete
            setTimeout(() => {
                inputAreaRef.current?.focus();
            }, 100);

            // Send messages to backend
            if (userMessage) {
                // Subsequent exchange - send both user message and AI response
                sendChatMessageToBackend(chatId, [userMessage, assistantMessage]).catch(error => {
                    console.error('Error sending messages to backend:', error);
                });
            }

            // Final message update
            let conversationMessages: ChatMessage[] = [];
            setMessages(prev => {
                const finalMessages = [...prev.slice(0, -1), assistantMessage];
                conversationMessages = finalMessages; // Store for use in skill extraction
                return finalMessages;
            });

            // Update session
            if (!session) {
                throw new Error('Session not found');
            }
            const updatedSession = {
                ...session,
                messages: conversationMessages,
                updatedAt: new Date()
            };
            setCurrentSession(updatedSession);

            // Handle conversation completion
            if (isConversationComplete) {
                setIsConversationOver(true)
                if (isFromDetailChat) {
                    // Handle detail chat completion with action metadata update
                    setTimeout(async () => {
                        await handleActionMetadataUpdate(conversationMessages, updatedSession);
                    }, 500);
                    return;
                }

                // If this is from basic chat, proceed with skill extraction
                setIsConversationOver(true);

                // Trigger action metadata extraction after saving
                setTimeout(async () => {
                    await handleExtractActionMetadata(conversationMessages, updatedSession);
                }, 500);
            }
        }
    }, [chatId, handleExtractActionMetadata, handleActionMetadataUpdate]);

    // Combined method to send chat message and handle streaming response
    const sendChatAndHandleStream = useCallback(async (content: string, chatId: string, session: ChatSession | null, isDetailChatMode: boolean) => {
        if (apiCallInProgressRef.current) {
            return;
        }

        apiCallInProgressRef.current = true;
        setIsLoading(true);

        try {
            // Use appropriate API based on chat mode
            const stream = isDetailChatMode
                ? await sendDetailChatMessage(content, chatId)
                : await sendChatMessage(content, chatId);
            await handleStreamingResponse(stream, session, [], content, isDetailChatMode);
        } catch (error) {
            console.error('Error in chat communication:', error);
            setIsLoading(false);
            setIsStreaming(false);
        } finally {
            apiCallInProgressRef.current = false;
        }
    }, [handleStreamingResponse, isDetailChatMode]);

    // Load chat history from API
    useEffect(() => {
        // Prevent duplicate API calls
        if (apiCallInProgressRef.current) {
            return;
        }

        const loadChatHistory = async () => {
            try {
                // Reset analysis sent flag for new chat
                analysisSentRef.current = false;

                // Fetch chat history from API
                const chatHistory = await fetchChatHistory(chatId);

                // Create a basic session structure
                const currentChatSession: ChatSession = {
                    id: chatId,
                    title: `Chat ${chatId}`,
                    messages: chatHistory,
                    createdAt: chatHistory.length > 0 ? chatHistory[0].timestamp : new Date(),
                    updatedAt: chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].timestamp : new Date()
                };

                setCurrentSession(currentChatSession);
                setMessages(chatHistory);

                // Check if conversation is already over (has analysis message)
                const hasAnalysis = chatHistory.some((msg: ChatMessage) => msg.role === 'analysis');
                const latestAnalysisMessage = [...chatHistory].reverse().find((msg: ChatMessage) => msg.role === 'analysis');
                const latestAnalysisMessageContent = latestAnalysisMessage?.content;

                // Check if last message was a completed assistant message
                const lastMessage = chatHistory[chatHistory.length - 1];
                const isLastMessageCompletedAssistant = lastMessage &&
                    lastMessage.role === 'assistant' &&
                    typeof lastMessage.content === 'object' &&
                    'is_done' in lastMessage.content &&
                    lastMessage.content.is_done;

                if (hasAnalysis) {
                    if (latestAnalysisMessageContent && typeof latestAnalysisMessageContent === 'object' && 'has_changed' in latestAnalysisMessageContent) {
                        setIsConversationOver(true);
                        return;
                    } else {
                        // Check if the last message was asking about time investment
                        const lastAssistantMessage = [...chatHistory].reverse().find(msg => msg.role === 'assistant');
                        const isTimeInvestmentQuestion = lastAssistantMessage &&
                            typeof lastAssistantMessage.content === 'object' &&
                            'response' in lastAssistantMessage.content &&
                            typeof lastAssistantMessage.content.response === 'string' &&
                            lastAssistantMessage.content.response.includes('Great! To complete your action documentation, could you tell me how much time you invested in this action?');

                        if (isTimeInvestmentQuestion) {
                            // We're waiting for time investment answer
                            setIsAskingTimeInvestment(true);
                        } else {
                            // We're in detail chat mode
                            setIsDetailChatMode(true);
                        }
                    }
                }

                if (isLastMessageCompletedAssistant) {
                    if (!hasAnalysis) {
                        // Last message was completed assistant message but no analysis exists
                        // Trigger skill extraction
                        setTimeout(async () => {
                            await handleExtractActionMetadata(chatHistory, currentChatSession);
                        }, 500);
                    } else {
                        // We're in detail chat mode and last assistant message was completed
                        // Trigger action metadata update
                        setTimeout(async () => {
                            await handleActionMetadataUpdate(chatHistory, currentChatSession);
                        }, 500);
                    }
                }

                // Check if we need to get AI response
                // const needsAIResponse = chatHistory.length > 0 &&
                //     chatHistory[chatHistory.length - 1].role === 'user';

                // if (needsAIResponse) {
                //     // There are user messages but no AI response - trigger API call
                //     setTimeout(() => {
                //         sendChatAndHandleStream(chatHistory[chatHistory.length - 1].content, chatId, currentChatSession, hasAnalysis);
                //     }, 100);
                // }
            } catch (error) {
                console.error('Error loading chat history:', error);
                // Fallback to empty chat if API fails
                const emptyChatSession: ChatSession = {
                    id: chatId,
                    title: `Chat ${chatId}`,
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                setCurrentSession(emptyChatSession);
                setMessages([]);
            }
        };

        loadChatHistory();
    }, [chatId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleInputSubmit = (type: 'text' | 'audio', content: string | Blob) => {
        if (type === 'audio') {
            // Handle audio submission
            console.log('Audio not supported in chat yet:', content);
            alert('Voice messages coming soon! 🎵');
        } else if (typeof content === 'string') {
            // Create user message
            const userMessage: ChatMessage = {
                role: 'user',
                content: content,
                timestamp: new Date()
            };

            const newMessages = [...messages, userMessage];
            setMessages(newMessages);

            // Update session with the new user message
            if (currentSession) {
                const updatedSession = {
                    ...currentSession,
                    messages: newMessages,
                    updatedAt: new Date()
                };
                setCurrentSession(updatedSession);

                // Send the complete chat history to AI
                sendChatAndHandleStream(content, chatId, updatedSession, isDetailChatMode);
            }
        }
        // Reset input
        setInput("");
    };

    const handleNewChat = () => {
        router.push('/');
    };

    const handleChatSelect = (selectedChatId: string) => {
        if (selectedChatId !== chatId) {
            router.push(`/chat/${selectedChatId}`);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <AuthWrapper>
            <div className="relative flex h-screen bg-gray-50">
                {/* Mobile backdrop overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                        onClick={closeSidebar}
                    />
                )}

                <ChatSidebar
                    currentChatId={chatId}
                    onNewChat={handleNewChat}
                    onChatSelect={handleChatSelect}
                    isOpen={isSidebarOpen}
                    onClose={closeSidebar}
                />

                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="p-4 flex items-center gap-3">
                        <SidebarToggle isOpen={isSidebarOpen} onToggle={toggleSidebar} />
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">
                                Solve Ninja Chat
                            </h1>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full px-4 md:px-8">
                        {messages.map((message, index) => (
                            <MessageBubble
                                key={index}
                                message={message}
                                isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
                                username={username}
                            />
                        ))}

                        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        )}

                        {/* Action Metadata Extraction Loading Animation */}
                        {isExtractingActionMetadata && <ActionMetadataExtractionLoader />}
                        {/* Action Update Loading Animation */}
                        {isUpdatingActionMetadata && <ActionMetadataUpdateLoader />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Time Investment Input */}
                    {isAskingTimeInvestment && !isConversationOver && (
                        <div className="p-4 max-w-4xl mx-auto w-full px-4 md:px-8 pb-8">
                            <div className="flex flex-col space-y-4">
                                <div className="flex flex-col max-[450px]:gap-3">
                                    {/* Input row */}
                                    <div className="flex gap-2 items-center">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0.1"
                                                placeholder="Enter time value"
                                                value={timeInvestedValue}
                                                onChange={(e) => setTimeInvestedValue(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                                                disabled={isSendingTimeInvestment}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleTimeInvestmentSubmit();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex-shrink-0 relative">
                                            <select
                                                value={timeInvestedUnit}
                                                onChange={(e) => setTimeInvestedUnit(e.target.value as 'hours' | 'minutes')}
                                                className="px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg cursor-pointer appearance-none bg-white"
                                                disabled={isSendingTimeInvestment}
                                            >
                                                <option value="hours">Hours</option>
                                                <option value="minutes">Minutes</option>
                                            </select>
                                            {/* Custom dropdown arrow */}
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* Submit button - stays in same row for screens >= 450px */}
                                        <div className="flex-shrink-0 min-[450px]:block max-[450px]:hidden">
                                            <button
                                                onClick={handleTimeInvestmentSubmit}
                                                disabled={isSendingTimeInvestment || !timeInvestedValue}
                                                className="px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {isSendingTimeInvestment ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>Saving...</span>
                                                    </div>
                                                ) : (
                                                    'Submit'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {/* Submit button for small screens - full width on next line for screens < 450px */}
                                    <div className="min-[450px]:hidden max-[450px]:block">
                                        <button
                                            onClick={handleTimeInvestmentSubmit}
                                            disabled={isSendingTimeInvestment || !timeInvestedValue}
                                            className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {isSendingTimeInvestment ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Saving...</span>
                                                </div>
                                            ) : (
                                                'Submit'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Regular Input */}
                    {!isConversationOver && !isAskingTimeInvestment && (
                        <div className="p-4 max-w-4xl mx-auto w-full px-4 md:px-8 pb-8">
                            <InputArea
                                ref={inputAreaRef}
                                placeholder="Continue the conversation"
                                value={input}
                                onChange={setInput}
                                onSubmit={handleInputSubmit}
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AuthWrapper>
    );
} 