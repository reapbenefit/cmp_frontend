import { Quote } from "lucide-react";

export interface ExpertReview {
    id: string;
    comment: string;
    reviewerName: string;
    designation: string;
    company: string;
    reviewerAvatar?: string;
    date?: string;
}

interface ExpertReviewCardProps {
    review: ExpertReview;
    variant?: 'default' | 'compact';
}

export default function ExpertReviewCard({ review, variant = 'default' }: ExpertReviewCardProps) {
    const {
        comment,
        reviewerName,
        designation,
        company,
        reviewerAvatar,
        date
    } = review;

    if (variant === 'compact') {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Comment */}
                <blockquote className="text-gray-600 text-sm leading-relaxed mb-3">
                    &ldquo;{comment}&rdquo;
                </blockquote>

                {/* Reviewer info */}
                <div className="flex items-center gap-2">
                    {reviewerAvatar ? (
                        <img
                            src={reviewerAvatar}
                            alt={reviewerName}
                            className="w-8 h-8 rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-xs">
                                {reviewerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{reviewerName}</div>
                        <div className="text-xs text-gray-500 truncate">{designation} at {company}</div>
                        {date && (
                            <div className="text-xs text-gray-400">
                                {date}
                            </div>
                        )}
                    </div>
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
                    &ldquo;{comment}&rdquo;
                </blockquote>
            </div>

            {/* Reviewer info */}
            <div className="flex items-start gap-3">
                {reviewerAvatar ? (
                    <img
                        src={reviewerAvatar}
                        alt={reviewerName}
                        className="w-10 h-10 rounded-full"
                    />
                ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                            {reviewerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                    </div>
                )}

                <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{reviewerName}</div>
                    <div className="text-xs text-gray-600">{designation}</div>
                    <div className="text-xs text-gray-500">{company}</div>
                    {date && (
                        <div className="text-xs text-gray-400 mt-1">
                            {date}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 