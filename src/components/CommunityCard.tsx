"use client";

import { ExternalLink, Users } from "lucide-react";

interface Community {
    id: string;
    name: string;
    description: string;
    link?: string;
}

interface CommunityCardProps {
    community: Community;
}

export default function CommunityCard({ community }: CommunityCardProps) {
    const handleLinkClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (community.link) {
            window.open(community.link, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                    {community.name}
                </h3>
                {community.link && (
                    <button
                        onClick={handleLinkClick}
                        className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors flex-shrink-0 ml-2"
                        title="Visit community"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                {community.description}
            </p>
        </div>
    );
}

export type { Community }; 