
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Trophy, CheckCircle, Bell, ArrowRight, Search, Terminal, Globe, ExternalLink, Clock, Compass, BookOpen } from 'lucide-react';
import { Hackathon, Registration, User } from '../types';
import { getHackathons, registerStudent, getRegistrations, incrementImpression } from '../services/api';
// @ts-ignore
import confetti from 'canvas-confetti';

interface StudentDashboardProps {
  user: User;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'my-events'>('explore');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activeHackathon, setActiveHackathon] = useState<Hackathon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const h = await getHackathons();
        const r = await getRegistrations();
        setHackathons(h);
        setRegistrations(r);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };
    loadData();
  }, []);

  const handleViewDetails = async (h: Hackathon) => {
    await incrementImpression(h.id);
    setActiveHackathon(h);
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleRegister = async () => {
    if (activeHackathon && user) {
      if (registrations.some(r => r.hackathonId === activeHackathon.id && r.studentId === user.id)) {
        return;
      }

      const newRegistration: Registration = {
        hackathonId: activeHackathon.id,
        studentId: user.id,
        studentName: user.name,
        email: user.email, // Match backend schema
        studentEmail: user.email, // Keep for frontend consistency if needed
        registeredAt: Date.now()
      };

      try {
        await registerStudent(newRegistration);
        setRegistrations(prev => [...prev, newRegistration]);

        triggerConfetti();

        // If external link exists, don't close modal immediately, let user click link
        if (!activeHackathon.registrationLink) {
          setActiveHackathon(null);
        }
      } catch (error: any) {
        console.error('Registration failed:', error);
        alert('Failed to register: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const isNew = (timestamp: number) => {
    return (Date.now() - timestamp) < (7 * 24 * 60 * 60 * 1000);
  };

  // Filter Logic
  const myRegistrationIds = registrations.filter(r => r.studentId === user.id || r.email === user.email || r.studentEmail === user.email).map(r => r.hackathonId);

  const registeredHackathons = hackathons.filter(h => myRegistrationIds.includes(h.id));

  // Unregistered hacks, sorted by Newest First (descending createdAt)
  const unregisteredHackathons = hackathons
    .filter(h => !myRegistrationIds.includes(h.id))
    .sort((a, b) => b.createdAt - a.createdAt);

  // Apply search based on active tab
  const displayedHackathons = (activeTab === 'explore' ? unregisteredHackathons : registeredHackathons).filter(h =>
    h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.categories && h.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    (h.tags && h.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
      {/* Sidebar Profile */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-panel p-6 rounded-2xl sticky top-24 animate-slide-up">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-900/20">
              <Terminal size={36} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-700 rounded-full p-1.5">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-xl text-white">{user.name}</h3>
            <p className="text-sm text-slate-400 font-medium">Year {user.year} Student</p>
            <p className="text-xs text-slate-500 font-mono mt-1">{user.department}</p>
            <p className="text-xs text-slate-600 font-mono mt-0.5">ID: {user.registerNo}</p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? user.skills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 text-xs rounded-md">
                    {skill}
                  </span>
                )) : (
                  <span className="text-xs text-slate-600 italic">No skills added yet</span>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 text-sm">Registered Events</span>
                <span className="font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-900 px-2.5 py-0.5 rounded-md">{myRegistrationIds.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
          <div>
            <h2 className="text-3xl font-bold text-white">Hackathon Hub</h2>
            <p className="text-slate-400 mt-1">Discover and compete in upcoming challenges</p>
          </div>
          <div className="relative w-full sm:w-auto group">
            <Search className="absolute left-3 top-3 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 outline-none w-full sm:w-64 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-slate-900/80 rounded-xl w-fit border border-slate-800 mb-8 animate-slide-up-delay-1">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'explore'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Compass size={16} /> Explore New
          </button>
          <button
            onClick={() => setActiveTab('my-events')}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'my-events'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <BookOpen size={16} /> My Events ({myRegistrationIds.length})
          </button>
        </div>

        <div className="space-y-4 animate-slide-up-delay-1">
          {displayedHackathons.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
              <p>No hackathons found in this section.</p>
            </div>
          )}

          {displayedHackathons.map(h => {
            const isRegistered = myRegistrationIds.includes(h.id);
            return (
              <div key={h.id} onClick={() => handleViewDetails(h)} className="glass-panel rounded-2xl relative group glass-card transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/20 flex flex-col md:flex-row h-auto md:h-64 overflow-hidden border border-slate-800/60 cursor-pointer">
                {/* Gradient Header / Side Panel */}
                <div className="w-full md:w-56 bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-slate-900/50 relative p-6 flex flex-col justify-between group-hover:from-cyan-600/30 group-hover:via-blue-600/30 transition-all shrink-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-950/30 text-white border border-white/10 backdrop-blur-md">
                      {h.platform}
                    </span>
                    {isNew(h.createdAt) && !isRegistered && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <Bell size={10} /> NEW
                      </span>
                    )}
                    {isRegistered && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle size={10} /> GOING
                      </span>
                    )}
                  </div>

                  {/* Categories in Side Panel for Desktop */}
                  <div className="hidden md:flex flex-wrap gap-2 mt-auto">
                    {h.categories && h.categories.slice(0, 2).map((cat, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-950/30 text-slate-200 text-[10px] uppercase tracking-wide font-medium rounded-md border border-white/5">
                        {cat}
                      </span>
                    ))}
                    {h.categories && h.categories.length > 2 && (
                      <span className="px-2 py-1 bg-slate-950/30 text-slate-300 text-[10px] font-medium rounded-md border border-white/5">+{h.categories.length - 2}</span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col relative">
                  <div className="pr-12">
                    <h3 className="font-bold text-2xl text-white mb-2 line-clamp-1 group-hover:text-cyan-300 transition-colors">{h.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">{h.description || 'No description provided.'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-auto">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-cyan-400 shrink-0" />
                      <span>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{h.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Trophy size={16} className="text-yellow-400 shrink-0" />
                      <span className="truncate">{h.prizePool}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-orange-400 shrink-0" />
                      <span className="truncate">Deadline: {h.registrationDeadline ? new Date(h.registrationDeadline).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/50">
                    <div className="flex md:hidden flex-wrap gap-2">
                      {h.categories && h.categories.slice(0, 2).map((cat, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-wide font-medium rounded-md border border-slate-700/50">
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="ml-auto">
                      {isRegistered ? (
                        <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-sm font-medium border border-slate-700 flex items-center gap-2 cursor-default">
                          <CheckCircle size={16} /> Registered
                        </button>
                      ) : (
                        <button className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-500 shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2 group-hover:scale-105">
                          View Details <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registration/Details Modal */}
      {activeHackathon && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-700 relative max-h-[90vh] overflow-y-auto">

            {/* Header Image/Gradient */}
            <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
              <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="px-8 relative -mt-12 flex justify-between items-end">
              <div className="w-24 h-24 bg-slate-900 rounded-2xl border-4 border-slate-900 flex items-center justify-center text-cyan-400 shadow-xl">
                <Trophy size={40} />
              </div>
              <div className="mb-1">
                <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                  {activeHackathon.platform || 'External'}
                </span>
              </div>
            </div>

            <div className="p-8 pt-4">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-white mb-2">{activeHackathon.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-medium"><Calendar size={16} /> {activeHackathon.date}</span>
                  <span className="flex items-center gap-1.5 text-slate-400"><MapPin size={16} /> {activeHackathon.location}</span>
                </div>
              </div>

              <div className="prose prose-invert prose-sm text-slate-300 mb-8 leading-relaxed">
                <p className="whitespace-pre-wrap">{activeHackathon.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Prize Pool</span>
                  <p className="font-semibold text-yellow-400 mt-1">{activeHackathon.prizePool}</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Deadline</span>
                  <p className="font-semibold text-orange-400 mt-1">{activeHackathon.registrationDeadline || 'N/A'}</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Platform</span>
                  <p className="font-semibold text-indigo-400 mt-1 truncate">{activeHackathon.platform}</p>
                </div>
              </div>

              {activeHackathon.categories && activeHackathon.categories.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeHackathon.categories.map(cat => (
                      <span key={cat} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setActiveHackathon(null)}
                  className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors font-medium"
                >
                  Close
                </button>

                {!myRegistrationIds.includes(activeHackathon.id) && (
                  <>
                    {activeHackathon.registrationLink && (
                      <a
                        href={activeHackathon.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-indigo-600/20 text-indigo-300 border border-indigo-600/50 rounded-xl hover:bg-indigo-600/30 font-medium flex items-center gap-2 transition-all"
                      >
                        <ExternalLink size={18} /> Official Page
                      </a>
                    )}

                    <button
                      onClick={handleRegister}
                      className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 font-bold transition-all hover:scale-[1.02]"
                    >
                      Confirm Registration
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
