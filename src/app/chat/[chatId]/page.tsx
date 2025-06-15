"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage, ChatSession, StreamingResponse } from "@/types";
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

// Message component
const MessageBubble = ({ message, isStreaming }: { message: ChatMessage; isStreaming?: boolean }) => {
    const isUser = message.role === 'user';

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

export default function ChatPage() {
    const router = useRouter();
    const params = useParams();
    const chatId = params.chatId as string;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
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

        // Check if we need to get AI response
        // This handles both new chats and failed responses
        const needsAIResponse = current.messages[current.messages.length - 1].role === 'user';

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

                            if (data.is_done === false) {
                                // Save the completed response during streaming
                                setMessages(prev => {
                                    const finalMessages = [...prev.slice(0, -1), assistantMessage];

                                    console.log(finalMessages);
                                    console.log(session);

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

                                    return finalMessages;
                                });
                                break;
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
                    console.log(updatedSessions);
                    saveSessions(updatedSessions);
                }

                return finalMessages;
            });
        }
    };

    const handleSubmit = async () => {
        if (!input.trim() || apiCallInProgressRef.current) return;

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

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 max-w-4xl mx-auto w-full px-8 pb-8">
                    <InputArea
                        placeholder="Continue the conversation"
                        value={input}
                        onChange={setInput}
                        onSubmit={handleInputSubmit}
                        disabled={isLoading}
                    />
                </div>
            </div>
        </div>
    );
} 