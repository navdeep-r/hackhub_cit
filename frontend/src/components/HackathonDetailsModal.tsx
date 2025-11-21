import React, { useState, useEffect } from 'react';
import { Hackathon, Registration } from '../types';
import { X, Calendar, MapPin, Clock, Users, Globe, Award, FileText, Eye, Tag, TrendingUp, ExternalLink } from 'lucide-react';
import { getRegistrations } from '../services/api';

interface HackathonDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    hackathon: Hackathon | null;
}

export const HackathonDetailsModal: React.FC<HackathonDetailsModalProps> = ({ isOpen, onClose, hackathon }) => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && hackathon) {
            fetchRegistrations();
        }
    }, [isOpen, hackathon]);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const allRegs = await getRegistrations();
            const relevantRegs = allRegs.filter(r => r.hackathonId === hackathon?.id);
            setRegistrations(relevantRegs);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !hackathon) return null;

    const conversionRate = hackathon.impressions > 0
        ? ((registrations.length / hackathon.impressions) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl sm:rounded-3xl w-full max-w-[95vw] lg:max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {/* Enhanced Header with Gradient */}
                <div className="relative p-4 sm:p-6 border-b border-slate-700/50 bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-slate-900/30">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10"></div>
                    <div className="relative flex justify-between items-start">
                        <div className="flex-1 pr-8 sm:pr-12">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight">{hackathon.title}</h2>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <span className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-medium backdrop-blur-sm flex items-center gap-1.5">
                                    <Globe size={14} />
                                    {hackathon.platform}
                                </span>
                                {hackathon.categories && hackathon.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {hackathon.categories.slice(0, 4).map((cat, idx) => (
                                            <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-slate-800/60 text-slate-300 border border-slate-700/50 backdrop-blur-sm">
                                                {cat}
                                            </span>
                                        ))}
                                        {hackathon.categories.length > 4 && (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800/60 text-slate-300 border border-slate-700/50">
                                                +{hackathon.categories.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-all p-2 hover:bg-slate-800/50 rounded-lg flex-shrink-0"
                        >
                            <X size={20} className="sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 sm:p-2.5 bg-indigo-500/20 rounded-lg">
                                        <Eye size={18} className="text-indigo-400 sm:w-5 sm:h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Impressions</p>
                                        <p className="text-xl sm:text-2xl font-bold text-white">{hackathon.impressions.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 sm:p-2.5 bg-cyan-500/20 rounded-lg">
                                        <Users size={18} className="text-cyan-400 sm:w-5 sm:h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Registrations</p>
                                        <p className="text-xl sm:text-2xl font-bold text-white">{registrations.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 sm:p-2.5 bg-green-500/20 rounded-lg">
                                        <TrendingUp size={18} className="text-green-400 sm:w-5 sm:h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Conversion Rate</p>
                                        <p className="text-xl sm:text-2xl font-bold text-white">{conversionRate}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Two-Column Layout: Description (Left) + Secondary Details (Right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Left: Description (Major Section) */}
                            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                {/* Description */}
                                <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 sm:p-5">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <FileText size={16} className="text-indigo-400" /> Description
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                                        {hackathon.description || 'No description provided.'}
                                    </p>
                                </section>
                            </div>

                            {/* Right: Secondary Details */}
                            <div className="lg:col-span-1 space-y-3 sm:space-y-4">
                                {/* Event Details */}
                                <section className="space-y-3">
                                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 sm:p-4 hover:border-slate-600/50 transition-colors">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                                            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                                                <Calendar size={14} className="text-indigo-400" />
                                            </div>
                                            <span className="text-xs font-semibold uppercase tracking-wide">Event Date</span>
                                        </div>
                                        <p className="text-white font-semibold text-sm sm:text-base">
                                            {new Date(hackathon.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 sm:p-4 hover:border-slate-600/50 transition-colors">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                                            <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                                <Clock size={14} className="text-purple-400" />
                                            </div>
                                            <span className="text-xs font-semibold uppercase tracking-wide">Deadline</span>
                                        </div>
                                        <p className="text-white font-semibold text-sm sm:text-base">
                                            {new Date(hackathon.registrationDeadline).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 sm:p-4 hover:border-slate-600/50 transition-colors">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                                            <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                                                <MapPin size={14} className="text-cyan-400" />
                                            </div>
                                            <span className="text-xs font-semibold uppercase tracking-wide">Location</span>
                                        </div>
                                        <p className="text-white font-semibold text-sm sm:text-base break-words">{hackathon.location || 'TBD'}</p>
                                    </div>
                                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 sm:p-4 hover:border-slate-600/50 transition-colors">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                                            <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                                                <Award size={14} className="text-yellow-400" />
                                            </div>
                                            <span className="text-xs font-semibold uppercase tracking-wide">Prize Pool</span>
                                        </div>
                                        <p className="text-white font-semibold text-sm sm:text-base break-words">{hackathon.prizePool || 'TBD'}</p>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
