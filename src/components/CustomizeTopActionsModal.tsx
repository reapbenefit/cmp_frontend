import { useState, useEffect } from 'react';
import { Action } from '@/types';

interface CustomizeTopActionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    allActions: Action[];
    currentTopActionIds: string[];
    onSave: (selectedActionIds: string[]) => void;
}

export default function CustomizeTopActionsModal({
    isOpen,
    onClose,
    allActions,
    currentTopActionIds,
    onSave
}: CustomizeTopActionsModalProps) {
    const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedActionIds(currentTopActionIds);
        }
    }, [isOpen, currentTopActionIds]);

    if (!isOpen) return null;

    const handleToggleAction = (actionId: string) => {
        setSelectedActionIds(prev => {
            if (prev.includes(actionId)) {
                return prev.filter(id => id !== actionId);
            } else if (prev.length < 4) {
                return [...prev, actionId];
            }
            return prev;
        });
    };

    const handleSave = () => {
        onSave(selectedActionIds);
        onClose();
    };

    // Sort actions to show currently selected ones at the top
    const sortedActions = [...allActions].sort((a, b) => {
        const aIsSelected = selectedActionIds.includes(a['uuid']);
        const bIsSelected = selectedActionIds.includes(b['uuid']);

        if (aIsSelected && !bIsSelected) return -1;
        if (!aIsSelected && bIsSelected) return 1;
        return 0;
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Customize your top actions</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <p className="text-sm text-gray-600 mb-4">
                        Select up to 4 actions to showcase as your top actions
                    </p>

                    {/* Actions List */}
                    <div className="max-h-96 overflow-y-auto space-y-3">
                        {sortedActions.map((action) => {
                            const isSelected = selectedActionIds.includes(action['uuid']);
                            const isDisabled = !isSelected && selectedActionIds.length >= 4;

                            return (
                                <div
                                    key={action['uuid']}
                                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${isSelected
                                        ? 'border-blue-300 bg-blue-50'
                                        : isDisabled
                                            ? 'border-gray-200 bg-gray-50 opacity-60'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <label className="flex items-start gap-3 cursor-pointer flex-1">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={isDisabled}
                                            onChange={() => handleToggleAction(action['uuid'])}
                                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-gray-900">{action.title}</h3>
                                                {action.verified && (
                                                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Verified
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">{action.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                    {action.category}
                                                </span>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                    {action.type}
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        {selectedActionIds.length === 0 && "Select at least 1 action"}
                        {selectedActionIds.length > 0 && selectedActionIds.length < 4 && `You can select ${4 - selectedActionIds.length} more action${4 - selectedActionIds.length !== 1 ? 's' : ''}`}
                        {selectedActionIds.length === 4 && "Maximum actions selected"}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={selectedActionIds.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 