import { Quote } from "lucide-react";
import { ExpertReview } from "@/types";

interface ExpertReviewCardProps {
    review: ExpertReview;
    variant?: 'default' | 'compact';
}

export default function ExpertReviewCard({ review, variant = 'default' }: ExpertReviewCardProps) {
    const {
        comment,
        review_title,
        designation,
        organisation,
        reviewer_name,
    } = review;

    if (variant === 'compact') {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Comment */}
                <blockquote className="text-gray-600 text-sm leading-relaxed mb-3">
                    &ldquo;{comment}&rdquo;
                </blockquote>

                {/* Reviewer info */}
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{reviewer_name}</div>
                    <div className="text-xs text-gray-500 truncate">{designation} at {organisation}</div>
                </div>
            </div>
        );
    }

    // Default variant - used for all expert reviews now
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            {/* Quote icon */}
            <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 mt-0.5">
                    <Quote className="w-4 h-4 text-gray-400" />
                </div>

                {/* Comment */}
                <blockquote className="text-gray-600 leading-relaxed text-sm flex-1">
                    {comment}
                </blockquote>
            </div>

            {/* Reviewer info */}
            <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">{reviewer_name}</div>
                <div className="text-xs text-gray-600">{designation}</div>
                <div className="text-xs text-gray-500">{organisation}</div>
            </div>
        </div>
    );
} 