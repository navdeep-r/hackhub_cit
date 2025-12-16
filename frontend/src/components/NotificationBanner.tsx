import React from 'react';
import { Bell, X, AlertCircle, Clock } from 'lucide-react';
import { Hackathon } from '../types';

interface NotificationBannerProps {
    hackathons: Hackathon[];
    onDismiss: (hackathonId: string) => void;
    onDismissAll: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
    hackathons,
    onDismiss,
    onDismissAll
}) => {
    if (hackathons.length === 0) return null;

    const formatTimeRemaining = (deadline: string) => {
        const now = Date.now();
        const deadlineTime = new Date(deadline).getTime();
        const diff = deadlineTime - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;

        if (days > 0) {
            return `${days}d ${remainingHours}h remaining`;
        } else if (hours > 0) {
            return `${hours}h remaining`;
        } else {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes}m remaining`;
        }
    };

    return (
        <div className="notification-banner-container fixed top-20 left-0 right-0 z-40 px-4 animate-slideDown">
            <div className="max-w-7xl mx-auto">
                <div className="glass-notification backdrop-blur-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-900/20 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-amber-500/20">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Bell className="text-amber-400 animate-pulseGlow" size={20} />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                    <AlertCircle size={16} className="text-amber-400" />
                                    Upcoming Deadlines
                                </h3>
                                <p className="text-xs text-amber-200/80">
                                    {hackathons.length} {hackathons.length === 1 ? 'hackathon' : 'hackathons'} closing soon
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onDismissAll}
                            className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 hover:border-amber-400 text-amber-200 hover:text-amber-100 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105"
                        >
                            <X size={14} />
                            Clear All
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-48 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {hackathons.map((hack, index) => (
                            <div
                                key={hack.id}
                                className="notification-item group relative flex items-center justify-between gap-4 p-4 bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700/50 hover:border-amber-500/50 rounded-xl transition-all duration-300 hover:scale-[1.02] animate-fadeIn"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>

                                <div className="flex-1 relative z-10">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <Clock className="text-amber-400 animate-pulse" size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-sm mb-1 truncate" title={hack.title}>
                                                {hack.title}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className="text-amber-300 font-semibold flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 rounded-md border border-amber-500/30">
                                                    <Clock size={12} />
                                                    {formatTimeRemaining(hack.registrationDeadline)}
                                                </span>
                                                <span className="text-slate-400">
                                                    Deadline: {new Date(hack.registrationDeadline).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onDismiss(hack.id)}
                                    className="relative z-10 p-2 hover:bg-slate-800/80 rounded-lg text-slate-400 hover:text-amber-300 transition-all duration-200 hover:rotate-90 flex-shrink-0"
                                    title="Dismiss this notification"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
