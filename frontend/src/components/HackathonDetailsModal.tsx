import React, { useState, useEffect } from 'react';
import { Hackathon, Registration } from '../types';
import { X, Calendar, MapPin, Clock, Users, Globe, Award, FileText, Eye, Tag, TrendingUp, ExternalLink, Sparkles, Timer } from 'lucide-react';
import { getRegistrations } from '../services/api';

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || process.env.SHOW_LOGS == '1';

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
            const relevantRegs = allRegs.filter(r =>
                hackathon?.id && r.hackathonId && String(r.hackathonId) === String(hackathon.id)
            );
            setRegistrations(relevantRegs);
        } catch (error) {
            SHOW_LOGS && console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !hackathon) return null;

    const conversionRate = hackathon.impressions > 0
        ? ((registrations.length / hackathon.impressions) * 100).toFixed(1)
        : '0.0';

    // Calculate days remaining
    const eventDate = new Date(hackathon.date);
    const deadlineDate = new Date(hackathon.registrationDeadline);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-lg animate-fade-in" onClick={onClose}>
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/50 rounded-3xl w-full max-w-[95vw] lg:max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>

                {/* Enhanced Header with Animated Gradient */}
                <div className="relative p-5 sm:p-7 border-b border-slate-700/50 overflow-hidden">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 animate-gradient-x"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="relative flex justify-between items-start">
                        <div className="flex-1 pr-8 sm:pr-12">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight overflow-auto max-h-[20vh] custom-scrollbar bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
                                {hackathon.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <span className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-200 border border-indigo-400/40 font-semibold backdrop-blur-md flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                                    <Globe size={16} className="animate-pulse" />
                                    {hackathon.platform}
                                </span>
                                {hackathon.categories && hackathon.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {hackathon.categories.slice(0, 4).map((cat, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-200 border border-slate-600/50 backdrop-blur-sm hover:bg-slate-700/80 hover:border-indigo-500/50 hover:text-white transition-all cursor-default transform hover:scale-105"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                        {hackathon.categories.length > 4 && (
                                            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-600/50 backdrop-blur-sm">
                                                +{hackathon.categories.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-all p-2.5 hover:bg-slate-800/60 rounded-xl flex-shrink-0 hover:rotate-90 duration-300 backdrop-blur-sm border border-transparent hover:border-slate-600"
                        >
                            <X size={22} className="sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-5 sm:p-7 space-y-5 sm:space-y-7">

                        {/* Enhanced Stats Row with Glassmorphism */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                            <div className="group bg-gradient-to-br from-indigo-500/15 to-indigo-600/5 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 hover:from-indigo-500/20 hover:to-indigo-600/10 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-900/30 cursor-default backdrop-blur-sm">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-3 sm:p-3.5 bg-indigo-500/25 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                                        <Eye size={20} className="text-indigo-300 sm:w-6 sm:h-6 group-hover:animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-300/80 font-bold uppercase tracking-wider mb-1">Impressions</p>
                                        <p className="text-2xl sm:text-3xl font-black text-white">{hackathon.impressions.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 hover:from-cyan-500/20 hover:to-cyan-600/10 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-900/30 cursor-default backdrop-blur-sm">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-3 sm:p-3.5 bg-cyan-500/25 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                                        <Users size={20} className="text-cyan-300 sm:w-6 sm:h-6 group-hover:animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-cyan-300/80 font-bold uppercase tracking-wider mb-1">Registrations</p>
                                        <p className="text-2xl sm:text-3xl font-black text-white">{registrations.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 hover:from-emerald-500/20 hover:to-emerald-600/10 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-900/30 cursor-default backdrop-blur-sm">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-3 sm:p-3.5 bg-emerald-500/25 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                                        <TrendingUp size={20} className="text-emerald-300 sm:w-6 sm:h-6 group-hover:animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-emerald-300/80 font-bold uppercase tracking-wider mb-1">Conversion</p>
                                        <p className="text-2xl sm:text-3xl font-black text-white">{conversionRate}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Section */}
                        {daysUntilDeadline > 0 && (
                            <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <Timer size={20} className="text-orange-400" />
                                    <h4 className="text-sm font-bold text-orange-300 uppercase tracking-wider">Timeline</h4>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 mb-1">Registration Deadline</p>
                                        <p className="text-white font-bold text-sm sm:text-base">
                                            {daysUntilDeadline} days remaining
                                        </p>
                                    </div>
                                    <div className="h-12 w-px bg-gradient-to-b from-transparent via-orange-500/50 to-transparent"></div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 mb-1">Event Date</p>
                                        <p className="text-white font-bold text-sm sm:text-base">
                                            {daysUntilEvent} days away
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Two-Column Layout: Description (Left) + Secondary Details (Right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

                            {/* Left: Enhanced Description */}
                            <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                                <section className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 sm:p-6 backdrop-blur-sm hover:border-slate-600/60 transition-colors">
                                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FileText size={18} className="text-indigo-400" />
                                        <span>Description</span>
                                        <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
                                    </h3>
                                    <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm sm:text-base overflow-auto max-h-[60vh] custom-scrollbar pr-2">
                                        {hackathon.description || 'No description provided.'}
                                    </div>
                                </section>
                            </div>

                            {/* Right: Enhanced Secondary Details */}
                            <div className="lg:col-span-1 space-y-4">
                                <section className="space-y-3">

                                    {/* Event Date Card */}
                                    <div className="group bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 hover:border-indigo-500/50 hover:bg-slate-800/70 transition-all hover:scale-[1.02] backdrop-blur-sm">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                                            <div className="p-2 bg-indigo-500/15 rounded-lg group-hover:bg-indigo-500/25 transition-colors">
                                                <Calendar size={16} className="text-indigo-400" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wide text-indigo-300">Event Date</span>
                                        </div>
                                        <p className="text-white font-bold text-sm sm:text-base">
                                            {new Date(hackathon.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    {/* Deadline Card */}
                                    <div className="group bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all hover:scale-[1.02] backdrop-blur-sm">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                                            <div className="p-2 bg-purple-500/15 rounded-lg group-hover:bg-purple-500/25 transition-colors">
                                                <Clock size={16} className="text-purple-400" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wide text-purple-300">Deadline</span>
                                        </div>
                                        <p className="text-white font-bold text-sm sm:text-base">
                                            {new Date(hackathon.registrationDeadline).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    {/* Location Card */}
                                    <div className="group bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all hover:scale-[1.02] backdrop-blur-sm">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                                            <div className="p-2 bg-cyan-500/15 rounded-lg group-hover:bg-cyan-500/25 transition-colors">
                                                <MapPin size={16} className="text-cyan-400" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wide text-cyan-300">Location</span>
                                        </div>
                                        <p className="text-white font-bold text-sm sm:text-base break-words">{hackathon.location || 'TBD'}</p>
                                    </div>

                                    {/* Prize Pool Card */}
                                    <div className="group bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 hover:border-yellow-500/50 hover:bg-slate-800/70 transition-all hover:scale-[1.02] backdrop-blur-sm">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                                            <div className="p-2 bg-yellow-500/15 rounded-lg group-hover:bg-yellow-500/25 transition-colors">
                                                <Award size={16} className="text-yellow-400" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wide text-yellow-300">Prize Pool</span>
                                        </div>
                                        <p className="text-white font-bold text-sm sm:text-base break-words">{hackathon.prizePool || 'TBD'}</p>
                                    </div>

                                    {/* Registration Link */}
                                    {hackathon.registrationLink && (
                                        <a
                                            href={hackathon.registrationLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-900/50 border border-indigo-500/50"
                                        >
                                            <ExternalLink size={18} className="group-hover:rotate-12 transition-transform" />
                                            <span>Official Registration</span>
                                        </a>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
