import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Trophy, CheckCircle, Bell, ArrowRight, Search, Terminal, Globe, ExternalLink, Clock, Compass, BookOpen, X, FileText, Award, Tag, Code, Rocket, Star, Zap, Heart, Music, Palette, Coffee, Gamepad2, Camera } from 'lucide-react';
import { HackathonDetailsModal } from './HackathonDetailsModal';

// Utility function to truncate text to a specific word count
const truncateTextByWords = (text: string, maxWords: number): string => {
  if (!text || typeof text !== 'string') return 'No description provided.';
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + '...';
};
import { Hackathon, Registration, User } from '../types';
import { getHackathons, registerStudent, getRegistrations, incrementImpression } from '../services/api';
// @ts-ignore
import confetti from 'canvas-confetti';

// Avatar helper functions
const AVATAR_MAP: Record<string, { icon: any, gradient: string }> = {
  'code-indigo': { icon: Code, gradient: 'from-indigo-500 to-purple-600' },
  'rocket-cyan': { icon: Rocket, gradient: 'from-cyan-500 to-blue-600' },
  'star-pink': { icon: Star, gradient: 'from-pink-500 to-rose-600' },
  'zap-yellow': { icon: Zap, gradient: 'from-yellow-500 to-orange-600' },
  'heart-red': { icon: Heart, gradient: 'from-red-500 to-pink-600' },
  'music-purple': { icon: Music, gradient: 'from-purple-500 to-indigo-600' },
  'palette-teal': { icon: Palette, gradient: 'from-teal-500 to-emerald-600' },
  'coffee-amber': { icon: Coffee, gradient: 'from-amber-500 to-orange-600' },
  'gamepad-violet': { icon: Gamepad2, gradient: 'from-violet-500 to-purple-600' },
  'book-emerald': { icon: BookOpen, gradient: 'from-emerald-500 to-teal-600' },
  'camera-sky': { icon: Camera, gradient: 'from-sky-500 to-cyan-600' },
  'trophy-gold': { icon: Trophy, gradient: 'from-yellow-500 to-amber-600' },
};

const getAvatarIcon = (avatarId?: string) => {
  return AVATAR_MAP[avatarId || 'code-indigo']?.icon || Code;
};

const getAvatarGradient = (avatarId?: string) => {
  return AVATAR_MAP[avatarId || 'code-indigo']?.gradient || 'from-indigo-500 to-purple-600';
};

interface StudentDashboardProps {
  user: User;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'my-events'>('explore');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activeHackathon, setActiveHackathon] = useState<Hackathon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
  // Countdown timer effect
  useEffect(() => {
    if (!activeHackathon?.registrationDeadline) return;
    const updateCountdown = () => {
      const now = Date.now();
      const deadline = new Date(activeHackathon.registrationDeadline).getTime();
      const difference = deadline - now;
      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeHackathon]);
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

  // Filter Logic - Only include active (non-expired) hackathons
  const today = Date.now();
  const activeRegistrationIds = registrations
    .filter(r =>
      (r.studentId && user.id && r.studentId === user.id) ||
      (r.email && r.email.length > 0 && user.email && user.email.length > 0 && r.email === user.email) ||
      (r.studentEmail && r.studentEmail.length > 0 && user.email && user.email.length > 0 && r.studentEmail === user.email)
    )
    .map(r => r.hackathonId)
    .filter(id => {
      const hackathon = hackathons.find(h => h.id === id);
      if (!hackathon) return false;
      const eventDate = new Date(hackathon.date).getTime();
      return eventDate >= today; // Only include hackathons that haven't passed yet
    });

  const myRegistrationIds = registrations.filter(r =>
    (r.studentId && user.id && r.studentId === user.id) ||
    (r.email && r.email.length > 0 && user.email && user.email.length > 0 && r.email === user.email) ||
    (r.studentEmail && r.studentEmail.length > 0 && user.email && user.email.length > 0 && r.studentEmail === user.email)
  ).map(r => r.hackathonId);

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
            <div className={`w-20 h-20 bg-gradient-to-br ${getAvatarGradient(user.profilePicture)} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              {React.createElement(getAvatarIcon(user.profilePicture), { size: 36 })}
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
        <div className="flex gap-3 p-1 bg-slate-900/80 rounded-xl w-fit border border-slate-800 mb-8 animate-slide-up-delay-1">
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
            <BookOpen size={16} /> My Events ({activeRegistrationIds.length})
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 animate-slide-up-delay-1">
          {displayedHackathons.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
              <p>No hackathons found in this section.</p>
            </div>
          )}

          {displayedHackathons.map(h => {
            const isRegistered = myRegistrationIds.includes(h.id);
            return (
              <div key={h.id} onClick={() => handleViewDetails(h)} className="glass-panel rounded-2xl relative group glass-card transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/20 flex flex-col md:flex-row h-auto md:h-52 overflow-hidden border border-slate-800/60 cursor-pointer">
                {/* Gradient Header / Side Panel */}
                <div className="w-full md:w-40 bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-slate-900/50 relative p-3 flex flex-col justify-between group-hover:from-cyan-600/30 group-hover:via-blue-600/30 transition-all shrink-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950/30 text-white border border-white/10 backdrop-blur-md">
                      {h.platform}
                    </span>
                    {isNew(h.createdAt) && !isRegistered && (
                      <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <Bell size={9} /> NEW
                      </span>
                    )}
                    {isRegistered && (
                      <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle size={9} /> GOING
                      </span>
                    )}
                  </div>

                  {/* Categories in Side Panel for Desktop */}
                  <div className="hidden md:flex flex-wrap gap-1 mt-auto">
                    {h.categories && h.categories.slice(0, 2).map((cat, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-950/30 text-slate-200 text-[9px] uppercase tracking-wide font-medium rounded-md border border-white/5">
                        {cat}
                      </span>
                    ))}
                    {h.categories && h.categories.length > 2 && (
                      <span className="px-1.5 py-0.5 bg-slate-950/30 text-slate-300 text-[9px] font-medium rounded-md border border-white/5">+{h.categories.length - 2}</span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3 flex-1 flex flex-col relative">
                  <div className="pr-10 mb-2 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 group-hover:text-cyan-300 transition-colors" title={h.title}>{h.title}</h3>
                    <div className="flex-1 flex items-center">
                      <p className="text-slate-400 text-sm leading-tight line-clamp-1" title={h.description}>
                        {h.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-cyan-400 shrink-0" />
                      <span>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{h.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy size={14} className="text-yellow-400 shrink-0" />
                      <span className="truncate">{h.prizePool}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-orange-400 shrink-0" />
                      <span className="truncate">Deadline: {h.registrationDeadline ? new Date(h.registrationDeadline).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex-1"></div>

                  {/* Action Row */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/50">
                    <div className="flex md:hidden flex-wrap gap-1">
                      {h.categories && h.categories.slice(0, 2).map((cat, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-800/50 text-slate-400 text-[9px] uppercase tracking-wide font-medium rounded-md border border-slate-700/50">
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="ml-auto">
                      {isRegistered ? (
                        <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700 flex items-center gap-1.5 cursor-default">
                          <CheckCircle size={14} /> Registered
                        </button>
                      ) : (
                        <button className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-1.5 group-hover:scale-105">
                          View Details <ArrowRight size={14} />
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
      {activeHackathon && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-lg animate-fade-in" onClick={() => setActiveHackathon(null)}>
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl border border-slate-700/50 relative max-h-[92vh] overflow-y-auto custom-scrollbar animate-slide-up" onClick={(e) => e.stopPropagation()}>

            {/* Enhanced Header with Animated Gradient */}
            <div className="relative h-20 sm:h-20 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 overflow-hidden">
              {/* Animated pattern overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              {/* Animated gradient orbs */}
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

              {/* Close button */}
              <button
                onClick={() => setActiveHackathon(null)}
                className="absolute top-4 right-4 p-2.5 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-xl text-white/80 hover:text-white transition-all hover:rotate-90 duration-300 border border-white/10 hover:border-white/30 z-10"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 sm:px-8 relative -mt-8 flex justify-between items-end mb-4">
              <div className="group w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-3 border-slate-900 flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform">
                <Trophy size={24} className="text-cyan-400 group-hover:text-cyan-300 transition-colors sm:w-8 sm:h-8" />
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-8">
              {/* Title and Platform Badge */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight flex-1 bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
                    {activeHackathon.title}
                  </h2>
                  <span className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-indigo-500/50 flex-shrink-0">
                    <Globe size={12} className="inline mr-1.5" />
                    {activeHackathon.platform || 'External'}
                  </span>
                </div>
              </div>
              {/* Countdown Timer - Compact Animated UI */}
              {activeHackathon.registrationDeadline && (
                <div className="mb-4 relative overflow-hidden rounded-xl bg-slate-900/60 border border-orange-400/30 p-4 backdrop-blur-md">

                  {/* Soft floating glow animation */}
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl animate-float" />
                  <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-float delay-300" />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Clock className="text-orange-300 animate-pulse" size={18} />
                      <h3 className="text-xs font-semibold text-orange-200 tracking-wider">
                        Registration Closes In
                      </h3>
                    </div>

                    {/* Timer Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Days", value: countdown.days, color: "orange" },
                        { label: "Hours", value: countdown.hours, color: "red" },
                        { label: "Mins", value: countdown.minutes, color: "pink" },
                        { label: "Secs", value: countdown.seconds, color: "rose" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className={`bg-slate-900/70 rounded-lg p-2 border border-${item.color}-500/30 text-center hover:scale-105 transition-all duration-200`}
                        >
                          <div
                            className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-${item.color}-300 to-${item.color}-500 tabular-nums`}
                          >
                            {String(item.value).padStart(2, "0")}
                          </div>
                          <div
                            className={`text-[10px] font-bold text-${item.color}-300/80 uppercase tracking-wider`}
                          >
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Deadline */}
                    <p className="mt-3 text-[10px] text-orange-200/60 text-center">
                      Deadline:{" "}
                      {new Date(activeHackathon.registrationDeadline).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Two-Column Layout: Description Left, Details Right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Left Column: Description */}
                <div className="lg:col-span-2">
                  <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 sm:p-6 h-full">
                    <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText size={16} />
                      <span>About This Hackathon</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                    </h3>
                    <div className="text-slate-200 leading-relaxed text-sm sm:text-base whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar pr-2">
                      {activeHackathon.description || 'No description provided.'}
                    </div>
                  </div>
                </div>

                {/* Right Column: Event Details */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Date */}
                  <div className="bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                        <Calendar size={14} className="text-cyan-400" />
                      </div>
                      <span className="text-xs text-cyan-300/80 uppercase tracking-wider font-bold">Event Date</span>
                    </div>
                    <p className="font-black text-cyan-300 text-sm">
                      {new Date(activeHackathon.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="bg-gradient-to-br from-slate-500/15 to-slate-600/5 border border-slate-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-slate-500/20 rounded-lg">
                        <MapPin size={14} className="text-slate-400" />
                      </div>
                      <span className="text-xs text-slate-300/80 uppercase tracking-wider font-bold">Location</span>
                    </div>
                    <p className="font-bold text-slate-300 text-sm">{activeHackathon.location}</p>
                  </div>

                  {/* Prize Pool */}
                  <div className="bg-gradient-to-br from-yellow-500/15 to-yellow-600/5 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                        <Award size={14} className="text-yellow-400" />
                      </div>
                      <span className="text-xs text-yellow-300/80 uppercase tracking-wider font-bold">Prize Pool</span>
                    </div>
                    <p className="font-black text-yellow-300 text-sm">{activeHackathon.prizePool || 'TBD'}</p>
                  </div>

                  {/* Deadline */}
                  <div className="bg-gradient-to-br from-orange-500/15 to-orange-600/5 border border-orange-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-orange-500/20 rounded-lg">
                        <Clock size={14} className="text-orange-400" />
                      </div>
                      <span className="text-xs text-orange-300/80 uppercase tracking-wider font-bold">Deadline</span>
                    </div>
                    <p className="font-black text-orange-300 text-sm">
                      {activeHackathon.registrationDeadline ? new Date(activeHackathon.registrationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>

                  {/* Platform */}
                  <div className="bg-gradient-to-br from-indigo-500/15 to-indigo-600/5 border border-indigo-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                        <Globe size={14} className="text-indigo-400" />
                      </div>
                      <span className="text-xs text-indigo-300/80 uppercase tracking-wider font-bold">Platform</span>
                    </div>
                    <p className="font-black text-indigo-300 text-sm">{activeHackathon.platform}</p>
                  </div>
                </div>
              </div>

              {/* Categories Section - Full Width Below */}
              {activeHackathon.categories && activeHackathon.categories.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Tag size={14} className="text-slate-500" />
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeHackathon.categories.map((cat, idx) => (
                      <span
                        key={cat}
                        className="px-3 py-1.5 bg-slate-800/80 text-slate-200 text-xs font-medium rounded-lg border border-slate-700/50 hover:bg-slate-700/80 hover:border-cyan-500/50 hover:text-white transition-all cursor-default transform hover:scale-105"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Remove old info grid - it's now in the right column */}
              <div className="hidden">
              </div>

              {/* Action Buttons with Better Styling */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-800/50">
                <button
                  onClick={() => setActiveHackathon(null)}
                  className="px-6 py-3 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all font-semibold border border-slate-700/50 hover:border-slate-600"
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
                        className="group px-6 py-3 bg-indigo-600/20 text-indigo-300 border-2 border-indigo-600/50 rounded-xl hover:bg-indigo-600/30 hover:border-indigo-500 font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                      >
                        <ExternalLink size={18} className="group-hover:rotate-12 transition-transform" />
                        Official Page
                      </a>
                    )}

                    <button
                      onClick={handleRegister}
                      className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 border border-cyan-500/50"
                    >
                      <CheckCircle size={18} />
                      Confirm Registration
                    </button>
                  </>
                )}

                {myRegistrationIds.includes(activeHackathon.id) && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-emerald-600/20 text-emerald-300 border-2 border-emerald-600/50 rounded-xl font-bold">
                    <CheckCircle size={18} className="animate-pulse" />
                    Already Registered
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
