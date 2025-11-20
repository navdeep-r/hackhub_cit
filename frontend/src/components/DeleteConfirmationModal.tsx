import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl transform transition-all animate-scale-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-0 flex justify-between items-start">
                    <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-slate-400 mb-4">
                        {message}
                    </p>
                    {itemName && (
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-slate-300 text-sm font-medium mb-4 break-all">
                            "{itemName}"
                        </div>
                    )}
                    <div className="p-3 bg-red-900/20 rounded-lg border border-red-900/30 text-red-200 text-xs flex gap-2 items-center">
                        <AlertTriangle size={14} className="flex-shrink-0" />
                        This action cannot be undone.
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-slate-300 font-medium hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all flex items-center gap-2"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
