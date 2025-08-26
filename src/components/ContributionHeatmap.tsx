import { useEffect } from "react";
import { useState } from "react";
import { Action } from "@/types";

interface ContributionHeatmapProps {
    actions: Action[];
}

export default function ContributionHeatmap({ actions = [] }: ContributionHeatmapProps) {
    const [data, setData] = useState<{ date: string; count: number }[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(2025); // Fixed value to avoid hydration mismatch
    const [showingAllActivity, setShowingAllActivity] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const years = [2025, 2024, 2023, 2022, 2021];

    // Process actions data to generate contribution heatmap
    useEffect(() => {
        setIsClient(true);

        // Set the current year only on client side
        setSelectedYear(new Date().getFullYear());

        const processActionsData = () => {
            const contributionData = [];
            const today = new Date();
            const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

            // Create a map of dates to count contributions
            const contributionMap = new Map<string, number>();

            // Count actions by date
            actions.forEach(action => {
                if (action.created_at) {
                    const actionDate = new Date(action.created_at);
                    const dateString = actionDate.toISOString().split('T')[0];
                    contributionMap.set(dateString, (contributionMap.get(dateString) || 0) + 1);
                }
            });

            // Generate data for the last year with actual contributions
            for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
                const dateString = new Date(d).toISOString().split('T')[0];
                const count = contributionMap.get(dateString) || 0;
                contributionData.push({
                    date: dateString,
                    count: count
                });
            }
            return contributionData;
        };

        setData(processActionsData());
    }, [actions]);

    const getContributionColor = (count: number) => {
        if (count === 0) return 'bg-gray-100';
        if (count === 1) return 'bg-green-200';
        if (count === 2) return 'bg-green-300';
        if (count === 3) return 'bg-green-400';
        return 'bg-green-500';
    };

    const totalContributions = data.reduce((sum, day) => sum + day.count, 0);

    // Generate activity data for selected year from actual actions
    const getYearlyActivity = (year: number) => {
        // Filter actions for the selected year
        const yearlyActions = actions.filter(action => {
            if (!action.created_at) return false;
            const actionDate = new Date(action.created_at);
            return actionDate.getFullYear() === year;
        });

        // Group actions by month
        const monthMap = new Map<string, Action[]>();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        
        yearlyActions.forEach(action => {
            const actionDate = new Date(action.created_at);
            const monthName = monthNames[actionDate.getMonth()];
            const monthKey = `${monthName}-${year}`;
            
            if (!monthMap.has(monthKey)) {
                monthMap.set(monthKey, []);
            }
            monthMap.get(monthKey)!.push(action);
        });

        // Convert to activity format and sort by month (newest first)
        const activities = Array.from(monthMap.entries())
            .map(([monthKey, monthActions]) => {
                const [monthName] = monthKey.split('-');
                const monthIndex = monthNames.indexOf(monthName);
                
                const timeline = monthActions
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map(action => {
                        const actionDate = new Date(action.created_at);
                        const dateStr = actionDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                        });
                        
                        return {
                            action: action.title || action.uuid,
                            date: dateStr,
                            description: action.description || `${action.type} action`
                        };
                    });

                return {
                    month: monthName,
                    year: year,
                    totalActions: monthActions.length,
                    timeline: timeline,
                    monthIndex: monthIndex
                };
            })
            .sort((a, b) => b.monthIndex - a.monthIndex); // Sort by month (newest first)

        // Limit display based on showingAllActivity flag
        if (!showingAllActivity && activities.length > 2) {
            return activities.slice(0, 2);
        }
        
        return activities;
    };

    const yearlyActivity = getYearlyActivity(selectedYear);

    const handleShowMoreActivity = () => {
        setShowingAllActivity(true);
    };

    // Show loading state while data is being generated on client
    if (!isClient || data.length === 0) {
        return (
            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Loading actions...
                        </h2>
                    </div>
                    <div className="h-32 bg-gray-50 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Contribution Heatmap with Year Selection */}
            <div className="flex gap-4 items-start">
                {/* Contribution Heatmap Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {totalContributions} actions in the last year
                        </h2>

                    </div>

                    {/* Main heatmap area */}
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full">
                            {/* Month labels */}
                            <div className="flex text-xs text-gray-600 mb-1 min-w-max">
                                {months.map((month, index) => (
                                    <div key={month} className="w-12 text-center" style={{ marginLeft: index === 0 ? '14px' : '0' }}>
                                        {month}
                                    </div>
                                ))}
                            </div>

                            {/* Days and contribution grid */}
                            <div className="flex min-w-max">
                                {/* Day labels */}
                                <div className="flex flex-col text-xs text-gray-600 mr-2">
                                    {days.map((day, index) => (
                                        <div key={day} className="h-2.5 flex items-center mb-0.5">
                                            {index % 2 === 1 ? day : ''}
                                        </div>
                                    ))}
                                </div>

                                {/* Contribution squares */}
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 53 }, (_, weekIndex) => (
                                        <div key={weekIndex} className="flex flex-col gap-0.5">
                                            {Array.from({ length: 7 }, (_, dayIndex) => {
                                                const dataIndex = weekIndex * 7 + dayIndex;
                                                const dayData = data[dataIndex];
                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        className={`w-2.5 h-2.5 rounded-sm ${dayData ? getContributionColor(dayData.count) : 'bg-gray-100'}`}
                                                        title={dayData ? `${dayData.count} actions on ${dayData.date}` : ''}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-2.5 h-2.5 bg-gray-100 rounded-sm"></div>
                                <div className="w-2.5 h-2.5 bg-green-200 rounded-sm"></div>
                                <div className="w-2.5 h-2.5 bg-green-300 rounded-sm"></div>
                                <div className="w-2.5 h-2.5 bg-green-400 rounded-sm"></div>
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                            </div>
                            <span>More</span>
                        </div>
                    </div>
                </div>

                {/* Year Selection - Outside the card */}
                <div className="flex flex-col gap-1">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`text-sm px-3 py-1 rounded cursor-pointer transition-colors ${year === selectedYear
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contribution Activity */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Action activity</h2>

                <div className="space-y-8">
                    {yearlyActivity.map((activity, index) => (
                        <div key={index}>
                            <h3 className="text-gray-900 font-medium mb-4">
                                {activity.month} {activity.year}
                            </h3>

                            <div className="border-l-2 border-gray-200 pl-6 ml-2">
                                <div className="space-y-3">
                                    {activity.timeline.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="flex flex-col items-center mt-1">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                {idx < activity.timeline.length - 1 && (
                                                    <div className="w-0.5 bg-gray-300 h-8 mt-1"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className="text-blue-600 hover:underline text-sm font-medium"
                                                    >
                                                        {item.action}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        on {item.date}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    {!showingAllActivity && yearlyActivity.length >= 2 && (
                        <button
                            onClick={handleShowMoreActivity}
                            className="w-full bg-white hover:bg-gray-50 text-blue-600 text-sm py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                        >
                            Show more activity
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};  