import { Bell, Clock, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Hackathon } from '../types';

interface NotificationButtonProps {
    hackathons: Hackathon[];
    onDismiss: (hackathonId: string) => void;
    onDismissAll: () => void;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({
    hackathons,
    onDismiss,
    onDismissAll
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const notificationCount = hackathons.length;
    const hasNotifications = notificationCount > 0;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const formatTimeRemaining = (deadline: string) => {
        const now = Date.now();
        const deadlineTime = new Date(deadline).getTime();
        const diff = deadlineTime - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;

        if (days > 0) {
            return `${days}d ${remainingHours}h`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes}m`;
        }
    };

    const handleDismissAndClose = (hackathonId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        onDismiss(hackathonId);

        // Close dropdown if no more notifications
        if (hackathons.length === 1) {
            setIsOpen(false);
        }
    };

    const handleClearAll = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDismissAll();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-lg transition-all duration-300 ${hasNotifications
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 notification-btn-glow'
                    : 'text-slate-400 bg-slate-900/50 border border-slate-800 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                title={hasNotifications ? `${notificationCount} approaching deadline${notificationCount > 1 ? 's' : ''}` : 'No notifications'}
            >
                <Bell size={20} className={hasNotifications ? 'animate-notificationPulse' : ''} />

                {/* Notification Badge */}
                {hasNotifications && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-orange-600 rounded-full border-2 border-slate-950 animate-notificationBounce shadow-lg shadow-red-500/50">
                        {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 animate-dropdownSlide z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-gradient-to-r from-slate-800/40 to-slate-900/40">
                        <div>
                            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                <Bell size={16} className="text-amber-400" />
                                Approaching Deadlines
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {notificationCount} {notificationCount === 1 ? 'hackathon' : 'hackathons'} closing soon
                            </p>
                        </div>

                        {hasNotifications && (
                            <button
                                onClick={handleClearAll}
                                className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-amber-500/40 text-slate-400 hover:text-amber-300 rounded-lg text-xs font-medium transition-all duration-200"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {!hasNotifications ? (
                            <div className="px-5 py-8 text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800/50 flex items-center justify-center">
                                    <Bell size={20} className="text-slate-600" />
                                </div>
                                <p className="text-slate-500 text-sm font-medium">No upcoming deadlines</p>
                                <p className="text-slate-600 text-xs mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="p-3 space-y-2">
                                {hackathons.map((hack, index) => (
                                    <div
                                        key={hack.id}
                                        className="group relative flex items-start gap-3 p-3.5 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/30 hover:border-amber-500/30 rounded-xl transition-all duration-300 animate-fadeIn"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>

                                        <div className="relative mt-0.5">
                                            <Clock className="text-amber-400" size={16} />
                                        </div>

                                        <div className="flex-1 min-w-0 relative">
                                            <h4 className="font-semibold text-white text-sm mb-1.5 line-clamp-2 leading-tight" title={hack.title}>
                                                {hack.title}
                                            </h4>

                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30 font-semibold">
                                                    <Clock size={11} />
                                                    {formatTimeRemaining(hack.registrationDeadline)}
                                                </span>
                                                <span className="text-slate-400">
                                                    {new Date(hack.registrationDeadline).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => handleDismissAndClose(hack.id, e)}
                                            className="relative p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-slate-300 transition-all duration-200 flex-shrink-0"
                                            title="Dismiss"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
