import { ApiSkill, ApiSkillHistory } from "@/types";

interface SkillModalProps {
    skill: ApiSkill | null;
    onClose: () => void;
}

const SkillModal = ({ skill, onClose }: SkillModalProps) => {
    if (!skill) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                >
                    ×
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-green-100 to-blue-100 p-8 text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-white mx-auto mb-4 overflow-hidden">
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

                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                        <span>{skill.label}</span>
                        <span className="bg-gray-900 text-white text-sm px-3 py-1 rounded-full">
                            x{skill.history.length}
                        </span>
                    </h2>

                    {/* <p className="text-gray-700">
                        Demonstrated across {skill.history.length} action{skill.history.length !== 1 ? 's' : ''}
                    </p> */}
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Action history</h3>

                    <div className="space-y-4">
                        {skill.history.map((historyItem, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center h-6">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    </div>
                                    {index < skill.history.length - 1 && (
                                        <div className="w-0.5 bg-gray-300 flex-1 mt-1 mb-2"></div>
                                    )}
                                </div>

                                <div className="flex-1 pb-6">
                                    <div className="flex items-center gap-2 mb-1 h-6">
                                        <span className="font-medium text-blue-600 cursor-pointer hover:underline">{historyItem.action_title}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">
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