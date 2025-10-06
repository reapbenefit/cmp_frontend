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
    }, []);

    // Update heatmap data when selectedYear or actions change
    useEffect(() => {
        if (!isClient) return;

        const processActionsData = (year: number) => {
            // Create a map of dates to count contributions
            const contributionMap = new Map<string, number>();

            // Count actions by date for the selected year
            actions.forEach(action => {
                if (action.created_at) {
                    const actionDate = new Date(action.created_at);
                    // Only include actions from the selected year
                    if (actionDate.getFullYear() === year) {
                        const dateString = actionDate.toISOString().split('T')[0];
                        contributionMap.set(dateString, (contributionMap.get(dateString) || 0) + 1);
                    }
                }
            });

            // Generate 53 weeks (371 days) of data for the selected year
            // Start from the first Sunday of the year or the Sunday before Jan 1st
            const yearStart = new Date(year, 0, 1); // Jan 1st of selected year
            const startOfWeek = new Date(yearStart);
            startOfWeek.setDate(yearStart.getDate() - yearStart.getDay()); // Go back to Sunday

            const contributionData = [];
            
            // Generate exactly 53 weeks of data (371 days)
            for (let i = 0; i < 371; i++) {
                const currentDate = new Date(startOfWeek);
                currentDate.setDate(startOfWeek.getDate() + i);
                
                const dateString = currentDate.toISOString().split('T')[0];
                const count = contributionMap.get(dateString) || 0;
                
                contributionData.push({
                    date: dateString,
                    count: count,
                    actualDate: new Date(currentDate)
                });
            }
            
            return contributionData;
        };

        setData(processActionsData(selectedYear));
        // Reset the "show more activity" state when year changes
        setShowingAllActivity(false);
    }, [actions, selectedYear, isClient]);

    const getContributionColor = (count: number) => {
        if (count === 0) return 'bg-gray-100';
        if (count === 1) return 'bg-green-200';
        if (count === 2) return 'bg-green-300';
        if (count === 3) return 'bg-green-400';
        return 'bg-green-500';
    };

    const totalContributions = data.reduce((sum, day) => sum + day.count, 0);

    // Get the display title based on selected year
    const getHeatmapTitle = () => {
        return `${totalContributions} actions in ${selectedYear}`;
    };

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
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Contribution Heatmap Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex-1 overflow-x-hidden max-w-full w-full">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                            {getHeatmapTitle()}
                        </h2>
                    </div>

                    {/* Main heatmap area */}
                    <div className="overflow-x-auto w-full max-w-full overflow-y-hidden">
                        <div className="inline-block min-w-max sm:w-full">
                            {/* Month labels - Desktop (keep existing behavior) */}
                            <div className="hidden sm:flex text-xs text-gray-600 mb-1 min-w-max items-start">
                                {/* Left spacer to align with day labels below */}
                                <div className="flex-none w-6 sm:w-8 mr-1 sm:mr-2" />
                                <div className="flex gap-1 sm:gap-0 sm:w-full sm:justify-between">
                                    {Array.from({ length: 53 }, (_, weekIndex) => {
                                        // Even distribution across the grid columns: Jan at 2nd column (1), Dec at 2nd last (51)
                                        const monthPositions: number[] = Array.from({ length: 12 }, (_, i) => {
                                            const start = 1; // second column
                                            const end = 51;   // second last column
                                            const step = (end - start) / 11; // 12 labels -> 11 intervals
                                            return Math.round(start + i * step);
                                        });
                                        const monthIndex = monthPositions.indexOf(weekIndex);
                                        
                                        return (
                                            <div 
                                                key={weekIndex} 
                                                className="w-3 sm:w-2.5 text-center text-xs flex items-start justify-center"
                                            >
                                                {monthIndex !== -1 && (
                                                    <>
                                                        <span className="hidden sm:inline">{months[monthIndex]}</span>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Month labels - Mobile (12 evenly spaced labels like desktop) */}
                            <div className="flex sm:hidden text-xs text-gray-600 mb-1 min-w-max items-start">
                                {/* Left spacer to align with day labels below */}
                                <div className="flex-none w-6 mr-1" />
                                <div className="flex gap-1 sm:gap-0.5">
                                    {Array.from({ length: 53 }, (_, weekIndex) => {
                                        // Twelve labels across the grid: Jan at 1, Dec at 51
                                        const start = 1;
                                        const end = 51;
                                        const step = (end - start) / 11;
                                        const monthPositions: number[] = Array.from({ length: 12 }, (_, i) => Math.round(start + i * step));
                                        const idx = monthPositions.indexOf(weekIndex);
                                        
                                        return (
                                            <div 
                                                key={weekIndex}
                                                className="w-3 text-center text-xs flex items-start justify-center"
                                            >
                                                {idx !== -1 && <span>{months[idx]}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Days and contribution grid */}
                            <div className="flex min-w-max">
                                {/* Day labels */}
                                <div className="flex-none w-6 sm:w-8 flex flex-col text-xs text-gray-600 mr-1 sm:mr-2">
                                    {days.map((day, index) => (
                                        <div key={day} className="h-3 sm:h-2.5 flex items-center mb-0.5">
                                            {index % 2 === 1 && (
                                                <>
                                                    <span className="sm:hidden">{day.slice(0, 1)}</span>
                                                    <span className="hidden sm:inline">{day}</span>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Contribution squares */}
                                <div className="flex gap-1 sm:gap-0 sm:w-full sm:justify-between">
                                    {Array.from({ length: 53 }, (_, weekIndex) => (
                                        <div key={weekIndex} className="flex flex-col gap-1 sm:gap-0.5 items-center w-3 sm:w-2.5">
                                            {Array.from({ length: 7 }, (_, dayIndex) => {
                                                const dataIndex = weekIndex * 7 + dayIndex;
                                                const dayData = data[dataIndex];
                                                
                                                // Always calculate the date for this grid position first
                                                const yearStart = new Date(selectedYear, 0, 1);
                                                const startOfWeek = new Date(yearStart);
                                                startOfWeek.setDate(yearStart.getDate() - yearStart.getDay());
                                                const currentDate = new Date(startOfWeek);
                                                currentDate.setDate(startOfWeek.getDate() + dataIndex);
                                                
                                                const formattedDate = currentDate.toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                });
                                                
                                                // Format the tooltip based on action count
                                                const actionCount = dayData?.count || 0;
                                                const actionText = actionCount === 1 ? 'action' : 'actions';
                                                const tooltipText = actionCount === 0 
                                                    ? `No actions on ${formattedDate}`
                                                    : `${actionCount} ${actionText} on ${formattedDate}`;
                                                
                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        className={`w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-sm ${dayData ? getContributionColor(dayData.count) : 'bg-gray-100'}`}
                                                        title={tooltipText}
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
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-100 rounded-sm"></div>
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-200 rounded-sm"></div>
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-300 rounded-sm"></div>
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-sm"></div>
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-sm"></div>
                            </div>
                            <span>More</span>
                        </div>
                    </div>
                </div>

                {/* Year Selection - Outside the card on desktop, horizontal on mobile */}
                <div className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`text-sm px-2 sm:px-3 py-1 rounded cursor-pointer transition-colors whitespace-nowrap ${year === selectedYear
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
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Action activity</h2>

                <div className="space-y-6 sm:space-y-8">
                    {yearlyActivity.map((activity, index) => (
                        <div key={index}>
                            <h3 className="text-gray-900 font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                                {activity.month} {activity.year}
                            </h3>

                            <div className="border-l-2 border-gray-200 pl-4 sm:pl-6 ml-1 sm:ml-2">
                                <div className="space-y-2 sm:space-y-3">
                                    {activity.timeline.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2 sm:gap-3">
                                            <div className="flex flex-col items-center mt-1">
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                {idx < activity.timeline.length - 1 && (
                                                    <div className="w-0.5 bg-gray-300 h-6 sm:h-8 mt-1"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                                    <span
                                                        className="text-black-600"
                                                    >
                                                        {item.action}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        on {item.date}
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-600">
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

                <div className="mt-6 sm:mt-8">
                    {!showingAllActivity && yearlyActivity.length >= 2 && (
                        <button
                            onClick={handleShowMoreActivity}
                            className="w-full bg-white hover:bg-gray-50 text-blue-600 text-sm py-2.5 sm:py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                        >
                            Show more activity
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};  