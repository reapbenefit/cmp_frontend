interface SkillAction {
    id: string;
    date: string;
    title: string;
    explanation: string;
}

interface Skill {
    name: string;
    image: string;
    count: number;
    description: string;
    actions: SkillAction[];
}

interface SkillModalProps {
    skill: Skill | null;
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
                            src={skill.image}
                            alt={skill.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                        <span>{skill.name}</span>
                        <span className="bg-gray-900 text-white text-sm px-3 py-1 rounded-full">
                            x{skill.count}
                        </span>
                    </h2>

                    <p className="text-gray-700">
                        {skill.description}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">History</h3>

                    <div className="space-y-4">
                        {skill.actions.map((action, index) => (
                            <div key={action.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center h-6">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    </div>
                                    {index < skill.actions.length - 1 && (
                                        <div className="w-0.5 bg-gray-300 flex-1 mt-1 mb-2"></div>
                                    )}
                                </div>

                                <div className="flex-1 pb-6">
                                    <div className="flex items-center gap-2 mb-1 h-6">
                                        <span className="font-medium text-blue-600 cursor-pointer hover:underline">{action.title}</span>
                                        <span className="text-sm text-gray-500">
                                            • {new Date(action.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {action.explanation}
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