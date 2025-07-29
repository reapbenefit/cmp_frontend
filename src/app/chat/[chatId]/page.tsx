"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Trophy, Star } from "lucide-react";
import { ChatMessage, ChatSession, StreamingResponse, SkillExtractionResponse, UpdateActionMetadataResponse, SkillMessage } from "@/types";
import ChatSidebar, { SidebarToggle } from "@/components/ChatSidebar";
import InputArea, { InputAreaHandle } from "@/components/InputArea";
import AuthWrapper from "@/components/AuthWrapper";

// Chat API function
async function sendChatMessage(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/basic_action_chat`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages.map(msg => ({
            content: msg.content,
            role: msg.role
        })))
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
async function sendDetailChatMessage(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
    // Find the index of the first analysis message
    const analysisIndex = messages.findIndex(m => m.role === 'analysis');

    // Process messages to add mode information
    const processedMessages = messages.map((msg, index) => {
        if (index < analysisIndex) {
            return {
                content: msg.content,
                role: msg.role,
                mode: "basic"
            }
        }
        return msg;
    }).filter(msg => msg.role !== 'analysis');

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/detail_action_chat`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedMessages)
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
        body: JSON.stringify(messages.map((msg: ChatMessage) => ({
            content: msg.content,
            role: msg.role
        })))
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


// Update action metadata API function for detail chat
async function updateActionMetadata(messages: ChatMessage[], chatId: string): Promise<UpdateActionMetadataResponse> {
    // Filter out analysis messages from the chat history
    const filteredMessages = messages.filter(msg => msg.role !== 'analysis');

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/update_action_metadata?action_uuid=${encodeURIComponent(chatId)}`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredMessages.map((msg: ChatMessage) => ({
            content: msg.content,
            role: msg.role
        })))
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
        content: item.role === 'analysis' ? JSON.parse(item.content) : item.content,
        timestamp: new Date(item.created_at)
    }));
}

// Message component
const MessageBubble = ({ message, isStreaming }: { message: ChatMessage; isStreaming?: boolean }) => {
    const isUser = message.role === 'user';
    const isAnalysis = message.role === 'analysis';

    if (isAnalysis) {
        if (typeof message.content === 'object' && 'has_changed' in message.content && !message.content.has_changed) {
            return null;
        }

        return (
            <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 max-w-2xl w-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="h-6 w-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-800">
                            {typeof message.content === 'object' && 'has_changed' in message.content && message.content.has_changed ? 'Skills Updated' : 'Skills Unlocked'}
                        </h3>
                    </div>

                    {message.content && typeof message.content === 'object' && 'skills' in message.content && Array.isArray(message.content.skills) && message.content.skills.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium text-gray-600">You have shown these skills through your action!</span>
                            </div>
                            <div className="space-y-3">
                                {message.content.skills.map((skill: SkillMessage, index: number) => (
                                    <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                        <img
                                            src={`/badges/${skill.name}.png`}
                                            alt={skill.name}
                                            className="w-12 h-12 object-contain flex-shrink-0"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm text-gray-700">
                                                <span className="font-bold">{skill.label}:</span> {skill.response}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                                {typeof message.content === 'object' && 'has_changed' in message.content && message.content.has_changed
                                    ? 'The action details have been updated on your portfolio. Go check it out!'
                                    : 'Your portfolio has been updated with your new action. Go check it out!'
                                }
                            </span>
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
                    {typeof message.content === 'string' ? message.content : ''}
                    {isStreaming && (
                        <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse" />
                    )}
                </div>
            </div>
        </div>
    );
};

// Skill Extraction Loading Component
const SkillExtractionLoader = () => {
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
const ActionUpdateLoader = () => {
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
    const [isExtractingSkills, setIsExtractingSkills] = useState(false);
    const [isUpdatingAction, setIsUpdatingAction] = useState(false);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [isDetailChatMode, setIsDetailChatMode] = useState(false);

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

    // Handle streaming response
    const handleStreamingResponse = useCallback(async (stream: ReadableStream<Uint8Array>, session: ChatSession | null, sessions: ChatSession[], messageCount: number, userMessage?: ChatMessage, isFromDetailChat: boolean = false) => {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let isConversationComplete = false;

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
                            assistantMessage.content = data.response;

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
            // For first exchange (messageCount <= 1), send only AI response
            // For subsequent exchanges, send both user message and AI response together
            const isFirstExchange = messageCount <= 1;

            if (isFirstExchange) {
                // First exchange - send only AI response
                sendChatMessageToBackend(chatId, [assistantMessage]).catch(error => {
                    console.error('Error sending AI message to backend:', error);
                });
            } else if (userMessage) {
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
                        try {
                            setIsUpdatingAction(true);
                            console.log('Updating action metadata from detail chat...');
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

                                // const messagesWithUpdate = [...conversationMessages, updateMessage];
                                // setMessages(messagesWithUpdate);

                                // // Update session with the update message
                                // const sessionWithUpdate = {
                                //     ...updatedSession,
                                //     messages: messagesWithUpdate,
                                //     updatedAt: new Date()
                                // };
                                // setCurrentSession(sessionWithUpdate);

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
                            setIsUpdatingAction(false);
                        }
                    }, 500);
                    return;
                }

                // If this is from basic chat, proceed with skill extraction
                setIsConversationOver(true);

                // Trigger skill extraction after saving - will use the latest function reference
                setTimeout(async () => {
                    if (isExtractingSkills) return; // Prevent multiple extractions
                    setIsExtractingSkills(true);

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

                            // Send analysis message to backend for persistence (only once)
                            if (!analysisSentRef.current) {
                                analysisSentRef.current = true;
                                try {
                                    await sendChatMessageToBackend(chatId, [analysisMessage]);
                                    console.log('Analysis message sent to backend successfully');
                                } catch (error) {
                                    console.error('Error sending analysis message to backend:', error);
                                    // Reset flag on error so it can be retried
                                    analysisSentRef.current = false;
                                }
                            }

                            // Create/update action with extracted data
                            try {
                                setIsConversationOver(false);
                                setIsDetailChatMode(true);

                                // Create a new AI message asking if they want to continue
                                const continueMessage: ChatMessage = {
                                    role: 'assistant',
                                    content: "Great! I've updated your portfolio with this action and the skills you've demonstrated. Would you like me to ask you some more questions about this action to help enhance your portfolio even further? I can help you reflect on the impact, challenges, and learnings from your experience.",
                                    timestamp: new Date()
                                };

                                // Add the message to the conversation
                                setMessages(prev => [...prev, continueMessage]);

                                // Update session with the new message
                                const messagesWithContinue = [...analysisMessages, continueMessage];
                                const sessionWithContinue = {
                                    ...finalSessionUpdate,
                                    messages: messagesWithContinue,
                                    updatedAt: new Date()
                                };
                                setCurrentSession(sessionWithContinue);

                                // Send the continue message to backend
                                try {
                                    await sendChatMessageToBackend(chatId, [continueMessage]);
                                    console.log('Continue message sent to backend successfully');
                                } catch (error) {
                                    console.error('Error sending continue message to backend:', error);
                                }

                            } catch (error) {
                                console.error('Error creating/updating action:', error);
                            }
                        }
                    } catch (error) {
                        console.error('Error extracting skills:', error);
                    } finally {
                        setIsExtractingSkills(false);
                    }
                }, 500);
            }
        }
    }, [chatId]);

    // Combined method to send chat message and handle streaming response
    const sendChatAndHandleStream = useCallback(async (messagesToSend: ChatMessage[], session: ChatSession | null, isDetailChatMode: boolean) => {
        if (apiCallInProgressRef.current) {
            return;
        }

        apiCallInProgressRef.current = true;
        setIsLoading(true);

        try {
            // Use appropriate API based on chat mode
            const stream = isDetailChatMode
                ? await sendDetailChatMessage(messagesToSend)
                : await sendChatMessage(messagesToSend);
            const lastUserMessage = messagesToSend[messagesToSend.length - 1];
            const userMessage = lastUserMessage?.role === 'user' ? lastUserMessage : undefined;
            await handleStreamingResponse(stream, session, [], messagesToSend.length, userMessage, isDetailChatMode);
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

                if (hasAnalysis) {
                    if (latestAnalysisMessageContent && typeof latestAnalysisMessageContent === 'object' && 'has_changed' in latestAnalysisMessageContent) {
                        setIsConversationOver(true);
                        return;
                    } else {
                        setIsDetailChatMode(true);
                    }
                }

                // Check if we need to get AI response
                const needsAIResponse = chatHistory.length > 0 &&
                    chatHistory[chatHistory.length - 1].role === 'user';

                if (needsAIResponse) {
                    // There are user messages but no AI response - trigger API call
                    setTimeout(() => {
                        sendChatAndHandleStream(chatHistory, currentChatSession, hasAnalysis);
                    }, 100);
                }
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
    }, [chatId]); // Remove sendChatAndHandleStream from dependencies to prevent re-runs

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
                sendChatAndHandleStream(newMessages, updatedSession, isDetailChatMode);
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
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full px-8">
                        {messages.map((message, index) => (
                            <MessageBubble
                                key={index}
                                message={message}
                                isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
                            />
                        ))}

                        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        )}

                        {/* Skill Extraction Loading Animation */}
                        {isExtractingSkills && <SkillExtractionLoader />}
                        {/* Action Update Loading Animation */}
                        {isUpdatingAction && <ActionUpdateLoader />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    {!isConversationOver && (
                        <div className="p-4 max-w-4xl mx-auto w-full px-8 pb-8">
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