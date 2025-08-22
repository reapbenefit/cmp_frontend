import { ApiSkill } from "@/types";

interface SkillModalProps {
    skill: ApiSkill | null;
    onClose: () => void;
}

const SkillModal = ({ skill, onClose }: SkillModalProps) => {
    if (!skill) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] md:max-h-[80vh] overflow-hidden relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-green-100 to-blue-100 p-4 sm:p-6 md:p-8 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 sm:border-4 border-white mx-auto mb-3 sm:mb-4 overflow-hidden">
                        <img
                            src={`/badges/${skill.name}.png`}
                            alt={skill.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    </div>

                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                        <span>{skill.label}</span>
                        <span className="bg-gray-900 text-white text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                            x{skill.history.length}
                        </span>
                    </h2>

                    {/* <p className="text-gray-700">
                        Demonstrated across {skill.history.length} action{skill.history.length !== 1 ? 's' : ''}
                    </p> */}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Action history</h3>

                    <div className="space-y-3 sm:space-y-4">
                        {skill.history.map((historyItem, index) => (
                            <div key={index} className="flex gap-3 sm:gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center h-5 sm:h-6">
                                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    </div>
                                    {index < skill.history.length - 1 && (
                                        <div className="w-0.5 bg-gray-300 flex-1 mt-1 mb-2"></div>
                                    )}
                                </div>

                                <div className="flex-1 pb-4 sm:pb-6">
                                    <div className="flex items-center gap-2 mb-1 h-5 sm:h-6">
                                        <span className="font-medium text-blue-600 cursor-pointer hover:underline text-sm sm:text-base">{historyItem.action_title}</span>
                                    </div>
                                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                                        {historyItem.summary}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillModal; 