"use client";

import { useState } from "react";
import Tooltip from "./Tooltip";
import { Action } from "@/types";

interface ActionModalProps {
    action: Action | null;
    onClose: () => void;
}

export default function ActionModal({ action, onClose }: ActionModalProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');

    if (!action) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 pr-8">
                        {action.title}
                    </h2>

                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {action.category}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                {action.type}
                            </span>
                        </div>

                        {action.hours && (
                            <div className="flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                    {action.hours}h
                                </span>
                            </div>
                        )}
                    </div>

                    {action.skills && action.skills.length > 0 && (
                        <div className="mt-3">
                            <span className="font-medium text-gray-700 text-sm">Skills</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {action.skills.map((skill, index) => (
                                    <Tooltip
                                        key={index}
                                        content={skill.summary}
                                        position="top"
                                        width="w-64"
                                    >
                                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all duration-200">
                                            <img
                                                src={`/badges/${skill.name}.png`}
                                                alt={skill.label}
                                                className="w-4 h-4 rounded-full"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                            <span className="text-gray-700 text-xs">{skill.label}</span>
                                        </div>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${activeTab === 'summary'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('raw')}
                            className={`px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${activeTab === 'raw'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Learn more
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto overflow-x-visible">
                    {activeTab === 'summary' ? (
                        <div className="space-y-6">
                            <div>
                                <p className="text-gray-700 leading-relaxed">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Chat History */}
                            <div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700 mb-3">
                                        {action.chat_history && action.chat_history.length > 0
                                            ? action.chat_history[0]?.content || "No initial submission available"
                                            : "No chat history available"
                                        }
                                    </p>
                                </div>
                            </div>

                            <div>
                                <div className="space-y-4">
                                    <div className="border-l-2 border-blue-200 pl-4">
                                        <h4 className="font-medium text-gray-900 mb-2">Conversation history</h4>
                                        <div className="bg-gray-50 p-3 rounded">
                                            {action.chat_history && action.chat_history.length > 0 ? (
                                                <div className="space-y-3">
                                                    {action.chat_history.map((message, index) => (
                                                        <div key={message.id || index} className={`mb-6 p-3 rounded-lg ${message.role === 'user'
                                                            ? 'bg-blue-50  border-blue-200'
                                                            : 'bg-gray-50  border-gray-300'
                                                            }`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className={`text-xs font-medium ${message.role === 'user' ? 'text-blue-700' : 'text-gray-600'
                                                                    }`}>
                                                                    {message.role === 'user' ? 'You' : 'Assistant'}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {new Date(message.created_at).toLocaleDateString()} {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700 text-sm leading-relaxed">{message.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-700 mb-3">
                                                    No conversation history available.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 