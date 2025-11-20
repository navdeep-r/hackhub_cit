import React, { useState, useEffect } from 'react';
import { Hackathon, Registration } from '../types';
import { X, Calendar, MapPin, Clock, Users, Globe, Award, FileText } from 'lucide-react';
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
            // Filter for this hackathon
            const relevantRegs = allRegs.filter(r => r.hackathonId === hackathon?.id);
            setRegistrations(relevantRegs);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !hackathon) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{hackathon.title}</h2>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{hackathon.platform}</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Details */}
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FileText size={16} /> Description
                                </h3>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                                    {hackathon.description || 'No description provided.'}
                                </p>
                            </section>

                            <section className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Calendar size={16} /> <span className="text-xs font-medium uppercase">Event Date</span>
                                    </div>
                                    <p className="text-white font-medium">{new Date(hackathon.date).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Clock size={16} /> <span className="text-xs font-medium uppercase">Deadline</span>
                                    </div>
                                    <p className="text-white font-medium">{new Date(hackathon.registrationDeadline).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <MapPin size={16} /> <span className="text-xs font-medium uppercase">Location</span>
                                    </div>
                                    <p className="text-white font-medium">{hackathon.location}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Award size={16} /> <span className="text-xs font-medium uppercase">Prize Pool</span>
                                    </div>
                                    <p className="text-white font-medium">{hackathon.prizePool}</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Globe size={16} /> Registration Link
                                </h3>
                                <a
                                    href={hackathon.registrationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-400 hover:text-indigo-300 hover:underline truncate block"
                                >
                                    {hackathon.registrationLink || 'No link provided'}
                                </a>
                            </section>
                        </div>

                        {/* Right: Registrations */}
                        <div className="lg:col-span-1 border-l border-slate-800 lg:pl-8">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Users size={16} /> Registered Students ({registrations.length})
                            </h3>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <p className="text-slate-500 text-sm italic">Loading registrations...</p>
                                ) : registrations.length === 0 ? (
                                    <p className="text-slate-500 text-sm italic">No students registered yet.</p>
                                ) : (
                                    registrations.map((reg) => (
                                        <div key={reg.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs">
                                                    {reg.studentId ? reg.studentId.substring(0, 2).toUpperCase() : 'ST'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200 truncate w-32">Student ID: {reg.studentId}</p>
                                                    <p className="text-xs text-slate-500">{new Date(reg.timestamp).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex justify-between items-center">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${reg.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' :
                                                        reg.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-yellow-500/10 text-yellow-400'
                                                    }`}>
                                                    {reg.status || 'PENDING'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
