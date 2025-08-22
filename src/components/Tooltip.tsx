"use client";

import { ReactNode } from "react";

interface TooltipProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    width?: string;
}

export default function Tooltip({
    content,
    children,
    position = 'top',
    width = 'w-48'
}: TooltipProps) {
    const getPositionClasses = () => {
        switch (position) {
            case 'top':
                return 'bottom-full left-1/2 mb-2 -translate-x-1/2';
            case 'bottom':
                return 'top-full left-1/2 mt-2 -translate-x-1/2';
            case 'left':
                return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
            case 'right':
                return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
            default:
                return 'bottom-full left-1/2 mb-2 -translate-x-1/2';
        }
    };

    const getArrowClasses = () => {
        switch (position) {
            case 'top':
                return 'absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900';
            case 'bottom':
                return 'absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900';
            case 'left':
                return 'absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900';
            case 'right':
                return 'absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900';
            default:
                return 'absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900';
        }
    };

    // Don't render tooltip if content is null
    if (!content) {
        return <>{children}</>;
    }

    return (
        <div className="relative group cursor-pointer">
            {children}

            {/* Tooltip */}
            <div className={`absolute ${getPositionClasses()} hidden group-hover:block z-10`}>
                <div className={`bg-gray-900 text-white text-sm rounded py-2 px-3 leading-relaxed ${width} whitespace-normal`}>
                    {content}
                    <div className={getArrowClasses()}></div>
                </div>
            </div>
        </div>
    );
} 