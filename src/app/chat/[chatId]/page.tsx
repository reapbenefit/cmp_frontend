"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Send, ArrowLeft, Loader2, Trophy, Star, Brain, Sparkles, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage, ChatSession, StreamingResponse, SkillExtractionResponse } from "@/types";
import { ChatSidebar, SidebarToggle } from "@/components/ChatSidebar";
import InputArea from "@/components/InputArea";

// Chat API function
async function sendChatMessage(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch('http://localhost:8002/chat', {
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

// Skill extraction API function
async function extractSkills(messages: ChatMessage[]): Promise<SkillExtractionResponse> {
    const response = await fetch('http://localhost:8002/extract', {
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

// Message component
const MessageBubble = ({ message, isStreaming }: { message: ChatMessage; isStreaming?: boolean }) => {
    const isUser = message.role === 'user';
    const isAnalysis = message.role === 'analysis';

    if (isAnalysis) {
        return (
            <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 max-w-2xl w-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="h-6 w-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Skills Unlocked!</h3>
                    </div>

                    {message.content && Array.isArray(message.content) && message.content.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium text-gray-600">You have shown these skills through your action!</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {message.content.map((skill, index) => (
                                    <div key={index} className="flex flex-col items-center p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                        <img
                                            src={`/badges/${skill}.png`}
                                            alt={skill}
                                            className="w-16 h-16 mb-2 object-contain"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                        <span className="text-xs font-medium text-gray-600 text-center capitalize">
                                            {skill.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
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
                    {message.content}
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
    }, []);

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
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const apiCallInProgressRef = useRef<boolean>(false);

    // Combined method to send chat message and handle streaming response
    const sendChatAndHandleStream = async (messagesToSend: ChatMessage[], session: ChatSession | null, sessions: ChatSession[]) => {
        if (apiCallInProgressRef.current) {
            return;
        }

        apiCallInProgressRef.current = true;
        setIsLoading(true);

        try {
            const stream = await sendChatMessage(messagesToSend);
            await handleStreamingResponse(stream, session, sessions);
        } catch (error) {
            console.error('Error in chat communication:', error);
            setIsLoading(false);
            setIsStreaming(false);
        } finally {
            apiCallInProgressRef.current = false;
        }
    };

    // Handle skill extraction and create analysis message
    const handleSkillExtraction = async (conversationMessages: ChatMessage[], session: ChatSession | null, sessions: ChatSession[]) => {
        setIsExtractingSkills(true);

        try {
            console.log('Extracting skills from conversation...');
            const skillResponse = await extractSkills(conversationMessages);

            if (skillResponse.skills && skillResponse.skills.length > 0) {
                const analysisMessage: ChatMessage = {
                    role: 'analysis',
                    timestamp: new Date(),
                    content: skillResponse.skills
                };

                const finalMessages = [...conversationMessages, analysisMessage];
                setMessages(finalMessages);

                // Update session and save to localStorage
                if (session) {
                    const updatedSession = {
                        ...session,
                        messages: finalMessages,
                        updatedAt: new Date()
                    };
                    setCurrentSession(updatedSession);

                    const updatedSessions = sessions.map(s =>
                        s.id === chatId ? updatedSession : s
                    );
                    saveSessions(updatedSessions);
                }
            }
        } catch (error) {
            console.error('Error extracting skills:', error);
        } finally {
            setIsExtractingSkills(false);
        }
    };

    // Load chat sessions from localStorage
    useEffect(() => {
        // Prevent duplicate API calls
        if (apiCallInProgressRef.current) {
            return;
        }

        const savedSessions = localStorage.getItem('chatSessions');
        if (!savedSessions) {
            throw new Error('No saved sessions');
        }

        const parsed = JSON.parse(savedSessions);
        console.log(parsed);
        const sessions = parsed.map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }))
        }));
        setChatSessions(sessions);

        // Load current session
        const current = sessions.find((s: ChatSession) => s.id === chatId);
        if (!current) {
            throw new Error('Current session not found');
        }
        console.log(current);
        setCurrentSession(current);
        setMessages(current.messages);

        // Check if conversation is already over (has analysis message)
        const hasAnalysis = current.messages.some((msg: ChatMessage) => msg.role === 'analysis');
        if (hasAnalysis) {
            setIsConversationOver(true);
        }

        // Check if we need to get AI response
        // This handles both new chats and failed responses
        const needsAIResponse = current.messages[current.messages.length - 1].role === 'user' && !hasAnalysis;

        if (needsAIResponse && current.messages.length > 0) {
            // There are user messages but no AI response - trigger API call
            sendChatAndHandleStream(current.messages, current, sessions);
        }
    }, [chatId]);

    // Save sessions to localStorage
    const saveSessions = (sessions: ChatSession[]) => {
        console.log(sessions);
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        setChatSessions(sessions);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle streaming response
    const handleStreamingResponse = async (stream: ReadableStream<Uint8Array>, session: ChatSession | null, sessions: ChatSession[]) => {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let isConversationComplete = false;

        let assistantMessage: ChatMessage = {
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
                                isConversationComplete = true
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

            console.log('here');

            // Final save to ensure AI response is persisted
            setMessages(prev => {
                const finalMessages = [...prev.slice(0, -1), assistantMessage];

                console.log(session);

                if (!session) {
                    throw new Error('Session not found');
                }
                const updatedSession = {
                    ...session,
                    messages: finalMessages,
                    updatedAt: new Date()
                };
                setCurrentSession(updatedSession);

                const updatedSessions = sessions.map(s =>
                    s.id === chatId ? updatedSession : s
                );
                console.log(updatedSessions);
                saveSessions(updatedSessions);

                if (isConversationComplete) {
                    setIsConversationOver(true)

                    // Trigger skill extraction after saving
                    setTimeout(() => {
                        handleSkillExtraction(finalMessages, updatedSession, updatedSessions);
                    }, 500);
                }

                return finalMessages;
            });
        }
    };

    const handleSubmit = async () => {
        if (!input.trim() || apiCallInProgressRef.current || isConversationOver) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");

        // Update session with the new user message
        if (currentSession) {
            const updatedSession = {
                ...currentSession,
                messages: newMessages,
                updatedAt: new Date()
            };
            setCurrentSession(updatedSession);

            console.log(chatSessions);

            const updatedSessions = chatSessions.map(s =>
                s.id === chatId ? updatedSession : s
            );
            saveSessions(updatedSessions);
        }

        // Send the complete chat history (including the new user message) to API
        await sendChatAndHandleStream(newMessages, currentSession, chatSessions);
    };

    const handleInputSubmit = (type: 'text' | 'audio', content: string | Blob) => {
        if (type === 'audio') {
            // Handle audio submission
            console.log('Audio not supported in chat yet:', content);
            alert('Voice messages coming soon! 🎵');
        } else if (typeof content === 'string') {
            // Update input state and trigger submit
            setInput(content);
            // Use setTimeout to ensure state is updated before submit
            setTimeout(() => {
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

                    const updatedSessions = chatSessions.map(s =>
                        s.id === chatId ? updatedSession : s
                    );
                    saveSessions(updatedSessions);
                }

                // Send the complete chat history to API
                sendChatAndHandleStream(newMessages, currentSession, chatSessions);
            }, 0);
        }
        // Reset input
        setInput("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
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

    const handleDeleteLastMessage = () => {
        if (messages.length === 0 || isLoading || isStreaming || apiCallInProgressRef.current) {
            return;
        }

        // Remove the last message
        const updatedMessages = messages.slice(0, -1);
        setMessages(updatedMessages);

        // Check if conversation is still over after deletion
        const hasAnalysis = updatedMessages.some((msg: ChatMessage) => msg.role === 'analysis');
        setIsConversationOver(hasAnalysis);

        // Update session and save to localStorage
        if (currentSession) {
            const updatedSession = {
                ...currentSession,
                messages: updatedMessages,
                updatedAt: new Date()
            };
            setCurrentSession(updatedSession);

            const updatedSessions = chatSessions.map(s =>
                s.id === chatId ? updatedSession : s
            );
            saveSessions(updatedSessions);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <ChatSidebar
                currentChatId={chatId}
                chatSessions={chatSessions}
                onNewChat={handleNewChat}
                onChatSelect={handleChatSelect}
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
            />

            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SidebarToggle isOpen={isSidebarOpen} onToggle={toggleSidebar} />
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">
                                Solve Ninja Chat
                            </h1>
                        </div>
                    </div>

                    {/* Delete Last Message Button */}
                    {/* {messages.length > 0 && !isLoading && !isStreaming && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDeleteLastMessage}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            disabled={apiCallInProgressRef.current}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Last Message
                        </Button>
                    )} */}
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
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {!isConversationOver && (
                    <div className="p-4 max-w-4xl mx-auto w-full px-8 pb-8">
                        <InputArea
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
    );
} 