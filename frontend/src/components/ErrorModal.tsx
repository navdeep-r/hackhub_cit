import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
    useEffect(() => {
        if (!isOpen) return;

        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        // Handle ESC key
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-red-500/50 rounded-2xl shadow-2xl max-w-md w-full animate-slide-down overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700/50 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 animate-progress" />
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                            <AlertCircle className="text-red-400" size={24} />
                        </div>

                        <div className="flex-1 pt-1">
                            <h3 className="text-lg font-bold text-white mb-2">Authentication Failed</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
                        </div>

                        <button
                            onClick={onClose}
                            className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
