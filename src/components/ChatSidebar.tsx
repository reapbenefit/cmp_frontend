"use client";

import { Plus, X, PanelLeft, User, LogOut, FileUser } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/types";
import { useAuth } from "@/lib/auth";

interface ChatSidebarProps {
    currentChatId?: string;
    chatSessions: ChatSession[];
    onNewChat: () => void;
    onChatSelect: (chatId: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const ChatSidebar = ({
    currentChatId,
    chatSessions,
    onNewChat,
    onChatSelect,
    isOpen,
    onClose
}: ChatSidebarProps) => {
    const { userEmail, logout } = useAuth();
    const router = useRouter();

    const handlePortfolioClick = () => {
        router.push("/portfolio");
    };

    if (!isOpen) return null;

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col shadow-lg">
            <div className="p-4 border-b border-gray-200">
                <div className="flex gap-2 items-center">
                    <Button
                        onClick={onNewChat}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white cursor-pointer flex items-center justify-center relative"
                    >
                        <Plus className="h-4 w-4 absolute left-4" />
                        <span className="flex-1 text-center">New action</span>
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer hover:bg-gray-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {chatSessions.length > 0 ? (
                    <>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Actions</h3>
                        <div className="space-y-2">
                            {chatSessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => onChatSelect(session.id)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${session.id === currentChatId
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    <div className="text-sm font-medium truncate">{session.title}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {session.createdAt.toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center px-2">
                        <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            All your action logs will be shown here
                        </p>
                    </div>
                )}
            </div>

            {/* Profile Section */}
            <div className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {userEmail}
                        </p>
                        <p className="text-xs text-gray-500">Solve Ninja</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {/* Portfolio Button */}
                    <button
                        onClick={handlePortfolioClick}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                        <FileUser className="w-4 h-4" />
                        <span className="text-sm font-medium">View Portfolio</span>
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign out</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sidebar toggle button component
interface SidebarToggleProps {
    isOpen: boolean;
    onToggle: () => void;
}

export const SidebarToggle = ({ isOpen, onToggle }: SidebarToggleProps) => {
    if (isOpen) return null;

    return (
        <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="cursor-pointer hover:bg-gray-100"
        >
            <PanelLeft className="h-12 w-12" />
        </Button>
    );
}; 