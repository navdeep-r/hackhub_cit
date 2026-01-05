import { ArrowRight, Award, Bell, BookOpen, Calendar, CheckCircle, Clock, Compass, ExternalLink, FileText, Globe, LayoutGrid, MapPin, RefreshCw, Search, Table, Tag, Trophy, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getHackathons, getRegistrations, incrementImpression } from '../services/api';
import { Hackathon, Registration, User } from '../types';
import { isExpired } from '../utils/isExpired';
import { resolveProfilePicture } from '../utils/profilePicture';
import { FilterPanel } from './FilterPanel';

const NODE_ENV = import.meta.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || import.meta.env.SHOW_LOGS == '1';

interface StudentDashboardProps {
  user: User;
  onNotificationsChange?: (hackathons: Hackathon[], handlers: { onDismiss: (id: string) => void, onDismissAll: () => void }) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onNotificationsChange }) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'my-events'>('explore');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activeHackathon, setActiveHackathon] = useState<Hackathon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [viewedHackathons, setViewedHackathons] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  // View Mode State
  const [viewMode, setViewMode] = useState<'card' | 'excel'>('card');

  // Filter states
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');

  const avatar = resolveProfilePicture({
    profilePicturePreset: user.profilePicturePreset,
    googleProfileImage: user.googleProfileImage,
  });

  // Load viewed hackathons and dismissed notifications from localStorage on mount
  useEffect(() => {
    const viewed = localStorage.getItem('viewedHackathons');
    if (viewed) {
      setViewedHackathons(new Set(JSON.parse(viewed)));
    }

    const dismissed = localStorage.getItem('dismissedNotifications');
    if (dismissed) {
      setDismissedNotifications(new Set(JSON.parse(dismissed)));
    }
  }, []);
  useEffect(() => {
    const loadData = async () => {
      try {
        const h = await getHackathons();
        const r = await getRegistrations();
        setHackathons(h);
        setRegistrations(r);
      } catch (error) {
        SHOW_LOGS && console.error("Failed to load dashboard data", error);
      }
    };
    loadData();

    // Poll for registration updates every 5 seconds to catch changes from Chrome extension
    const pollInterval = setInterval(async () => {
      try {
        const r = await getRegistrations();
        setRegistrations(r);
      } catch (error) {
        SHOW_LOGS && console.error("Failed to poll registrations", error);
      }
    }, 5000); // 5 seconds

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const h = await getHackathons();
      const r = await getRegistrations();
      setHackathons(h);
      setRegistrations(r);
    } catch (error) {
      SHOW_LOGS && console.error("Failed to refresh data", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Keep animation for at least 500ms
    }
  };

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

    // Mark hackathon as viewed and save to localStorage
    if (!viewedHackathons.has(h.id)) {
      const newViewed = new Set(viewedHackathons);
      newViewed.add(h.id);
      setViewedHackathons(newViewed);
      localStorage.setItem('viewedHackathons', JSON.stringify(Array.from(newViewed)));
      SHOW_LOGS && console.log('✅ Marked hackathon as viewed:', h.id, 'Total viewed:', newViewed.size);
    }
  };

  // Debug function to clear viewed hackathons (for testing)


  const isNew = (timestamp: number) => {
    const isNewHack = (Date.now() - timestamp) < (7 * 24 * 60 * 60 * 1000);
    SHOW_LOGS && console.log('Checking if new:', timestamp, 'Result:', isNewHack, 'Days old:', Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000)));
    return isNewHack;
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

  // Apply filters: platform, deadline, and search
  const applyFilters = (hackathonList: Hackathon[]) => {
    let filtered = hackathonList;

    // Platform filter
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(h => selectedPlatforms.includes(h.platform));
    }

    // Deadline filter
    if (deadlineFilter !== 'all') {
      const now = Date.now();
      const weekFromNow = now + (7 * 24 * 60 * 60 * 1000);
      const monthFromNow = now + (30 * 24 * 60 * 60 * 1000);

      // For 'latest', don't filter by deadline - just sort by createdAt
      if (deadlineFilter !== 'latest') {
        filtered = filtered.filter(h => {
          if (!h.registrationDeadline) return false;
          const deadline = new Date(h.registrationDeadline).getTime();

          if (deadlineFilter === 'week') {
            return deadline >= now && deadline <= weekFromNow;
          } else if (deadlineFilter === 'month') {
            return deadline >= now && deadline <= monthFromNow;
          } else if (deadlineFilter === 'upcoming') {
            return deadline > monthFromNow;
          }
          return true;
        });
      }
    }

    // Search filter
    filtered = filtered.filter(h =>
      h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.categories && h.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (h.tags && h.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    // Primary Sort: Active First, Expired Last
    filtered.sort((a, b) => {
      const expiredA = isExpired(a) ? 1 : 0;
      const expiredB = isExpired(b) ? 1 : 0;
      if (expiredA !== expiredB) return expiredA - expiredB;

      // Secondary Sort
      if (deadlineFilter === 'latest') {
        return b.createdAt - a.createdAt; // Most recent first
      } else {
        // Sort by deadline
        // For Active: Soonest deadline first (ascending)
        // For Expired: Most recently expired first (descending)
        const deadlineA = a.registrationDeadline ? new Date(a.registrationDeadline).getTime() : Infinity;
        const deadlineB = b.registrationDeadline ? new Date(b.registrationDeadline).getTime() : Infinity;

        if (expiredA === 1) {
          // Both expired -> Descending (Recent expiry first)
          return deadlineB - deadlineA;
        }
        // Both active -> Ascending (Soonest deadline first)
        return deadlineA - deadlineB;
      }
    });

    return filtered;
  };

  const displayedHackathons = applyFilters(
    activeTab === 'explore' ? unregisteredHackathons : registeredHackathons
  );


  // Handler functions for filters
  const handleClearFilters = () => {
    setSelectedPlatforms([]);
    setDeadlineFilter('all');
  };

  // Notification handlers with localStorage persistence
  const handleDismissNotification = (hackathonId: string) => {
    setDismissedNotifications(prev => {
      const updated = new Set([...prev, hackathonId]);
      localStorage.setItem('dismissedNotifications', JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  const handleDismissAllNotifications = () => {
    const allNotificationIds = approachingDeadlineHacks.map(h => h.id);
    const updated = new Set([...dismissedNotifications, ...allNotificationIds]);
    localStorage.setItem('dismissedNotifications', JSON.stringify(Array.from(updated)));
    setDismissedNotifications(updated);
  };

  // Filter registered hackathons with approaching deadlines (≤2 days)
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
  const approachingDeadlineHacks = registeredHackathons.filter(h => {
    if (!h.registrationDeadline) return false;
    const now = Date.now();
    const deadlineTime = new Date(h.registrationDeadline).getTime();
    const timeDiff = deadlineTime - now;
    return timeDiff > 0 && timeDiff <= TWO_DAYS_MS && !dismissedNotifications.has(h.id);
  });

  // Notify parent component about notifications
  useEffect(() => {
    if (onNotificationsChange) {
      onNotificationsChange(approachingDeadlineHacks, {
        onDismiss: handleDismissNotification,
        onDismissAll: handleDismissAllNotifications
      });
    }
  }, [approachingDeadlineHacks.length, onNotificationsChange]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
      {/* Sidebar Profile & Filters - Made sticky with independent scroll */}
      <div className="lg:col-span-3">
        <div className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
          {/* Profile Card */}
          <div className="glass-panel p-6 rounded-2xl animate-slide-up">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
                {avatar.type === 'google' ? (
                  <img
                    src={avatar.src}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${avatar.gradient}`}
                  >
                    <avatar.icon size={36} className="text-white" />
                  </div>
                )}
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

          {/* Filter Panel */}
          <FilterPanel
            selectedPlatforms={selectedPlatforms}
            onPlatformChange={setSelectedPlatforms}
            deadlineFilter={deadlineFilter}
            onDeadlineChange={setDeadlineFilter}
            onClearAll={handleClearFilters}
            totalCount={(activeTab === 'explore' ? unregisteredHackathons : registeredHackathons).length}
            filteredCount={displayedHackathons.length}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
          <div>
            <h2 className="text-3xl font-bold text-white">Hackathon Hub</h2>
            <p className="text-slate-400 mt-1">Discover and compete in upcoming challenges</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial group">
              <Search className="absolute left-3 top-3 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 outline-none w-full sm:w-64 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {/* View Toggle Group */}
            <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'card'
                  ? 'bg-slate-800 text-cyan-400 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
                title="Card View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('excel')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'excel'
                  ? 'bg-slate-800 text-cyan-400 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
                title="Excel View"
              >
                <Table size={18} />
              </button>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
              title="Refresh data"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            {/* Uncomment below button for testing NEW badge functionality */}
            {/* <button
              onClick={clearViewedHackathons}
              className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-all flex items-center gap-2"
              title="Clear viewed hackathons (debug)"
            >
              Clear Viewed
            </button> */}
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


        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 gap-4 animate-slide-up-delay-1">
            {displayedHackathons.length === 0 && (
              <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                <p>No hackathons found in this section.</p>
              </div>
            )}

            {displayedHackathons.map((h, index) => {
              const isRegistered = myRegistrationIds.includes(h.id);
              const expired = isExpired(h);

              // Check for separator
              const prevH = displayedHackathons[index - 1];
              const isFirstExpired = expired && (!prevH || !isExpired(prevH));

              return (
                <React.Fragment key={h.id}>
                  {isFirstExpired && (
                    <div className="col-span-full py-6 flex items-center gap-4 animate-slide-up text-slate-500">
                      <div className="h-px bg-slate-800 flex-1"></div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">Past Events</span>
                      <div className="h-px bg-slate-800 flex-1"></div>
                    </div>
                  )}

                  <div
                    onClick={() => handleViewDetails(h)}
                    className={`glass-panel rounded-2xl relative group glass-card transition-all flex flex-col md:flex-row h-auto md:h-52 overflow-hidden border cursor-pointer
                      ${expired
                        ? 'border-red-900/20 bg-slate-900/50 hover:bg-slate-900/80 hover:border-red-900/40 grayscale-[0.2]'
                        : 'border-slate-800/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/20'
                      }`}
                  >
                    {/* Expired Overlay */}
                    {expired && (
                      <div className="absolute inset-0 bg-red-950/5 pointer-events-none z-10 mix-blend-overlay"></div>
                    )}

                    {/* Gradient Header / Side Panel */}
                    <div className={`w-full md:w-40 relative p-3 flex flex-col justify-between transition-all shrink-0
                      ${expired
                        ? 'bg-slate-900'
                        : 'bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-slate-900/50 group-hover:from-cyan-600/30 group-hover:via-blue-600/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border backdrop-blur-md
                          ${expired ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-950/30 text-white border-white/10'}`}>
                          {h.platform}
                        </span>
                        {isNew(h.createdAt) && !isRegistered && !viewedHackathons.has(h.id) && !expired && (
                          <span className="new-badge relative flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full text-white border-2 border-yellow-400/70 backdrop-blur-sm overflow-hidden group/badge">
                            {/* Animated gradient background */}
                            <span className="absolute inset-0 bg-gradient-to-r from-yellow-500/80 via-amber-400/80 to-yellow-500/80 opacity-90"></span>

                            {/* Shimmer overlay */}
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500"></span>

                            {/* Content */}
                            <Bell size={10} className="relative z-10 drop-shadow-sm animate-pulse" />
                            <span className="relative z-10 tracking-wider drop-shadow-sm">NEW</span>

                            {/* Sparkle effect */}
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-200 rounded-full opacity-70 blur-[1px] animate-ping"></span>
                          </span>
                        )}
                        {isRegistered && (
                          <span className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border
                            ${expired ? 'bg-slate-800 text-emerald-500/70 border-emerald-900/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                            <CheckCircle size={9} /> {expired ? 'ATTENDED' : 'GOING'}
                          </span>
                        )}
                        {expired && !isRegistered && (
                          <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-900/30">
                            <Clock size={9} /> ENDED
                          </span>
                        )}
                      </div>

                      {/* Categories in Side Panel for Desktop */}
                      <div className="hidden md:flex flex-wrap gap-1 mt-auto">
                        {h.categories && h.categories.slice(0, 2).map((cat, i) => (
                          <span key={i} className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wide font-medium rounded-md border
                            ${expired ? 'bg-slate-900/50 text-slate-500 border-slate-700/50' : 'bg-slate-950/30 text-slate-200 border-white/5'}`}>
                            {cat}
                          </span>
                        ))}
                        {h.categories && h.categories.length > 2 && (
                          <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded-md border
                            ${expired ? 'bg-slate-900/50 text-slate-500 border-slate-700/50' : 'bg-slate-950/30 text-slate-300 border-white/5'}`}>
                            +{h.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 flex-1 flex flex-col relative z-20">
                      <div className="pr-10 mb-2 flex-1 flex flex-col">
                        <h3 className={`font-bold text-lg mb-1 line-clamp-1 transition-colors ${expired ? 'text-slate-300' : 'text-white group-hover:text-cyan-300'}`} title={h.title}>{h.title}</h3>
                        <div className="flex-1 flex items-center">
                          <p className={`text-sm leading-tight line-clamp-1 ${expired ? 'text-slate-500' : 'text-slate-400'}`} title={h.description}>
                            {h.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>

                      <div className={`grid grid-cols-2 gap-2 text-xs mb-2 ${expired ? 'text-slate-500' : 'text-slate-400'}`}>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className={`${expired ? 'text-slate-600' : 'text-cyan-400'} shrink-0`} />
                          <span>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className={`${expired ? 'text-slate-600' : 'text-cyan-400'} shrink-0`} />
                          <span className="truncate">{h.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy size={14} className={`${expired ? 'text-slate-600' : 'text-yellow-400'} shrink-0`} />
                          <span className="truncate">{h.prizePool}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className={`${expired ? 'text-slate-600' : 'text-orange-400'} shrink-0`} />
                          <span className="truncate">Deadline: {h.registrationDeadline ? new Date(h.registrationDeadline).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex-1"></div>

                      {/* Action Row */}
                      <div className={`flex justify-between items-center mt-4 pt-3 border-t ${expired ? 'border-slate-800/30' : 'border-slate-800/50'}`}>
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
                            <button className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 
                              ${expired
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
                                : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-900/20 group-hover:scale-105'
                              }`}>
                              {expired ? 'View Details' : 'View Details'} {!expired && <ArrowRight size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          /* Excel (Table) View */
          <div className="overflow-hidden rounded-2xl glass-panel border border-slate-800/60 animate-slide-up-delay-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Hackathon</th>
                    <th className="px-6 py-4">End Date</th>
                    <th className="px-6 py-4">Days Left</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {displayedHackathons.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No hackathons found in this section.
                      </td>
                    </tr>
                  ) : (
                    displayedHackathons.map((h, index) => {
                      const isRegistered = myRegistrationIds.includes(h.id);

                      // Check for separator
                      const expired = isExpired(h);
                      const prevH = displayedHackathons[index - 1];
                      const isFirstExpired = expired && (!prevH || !isExpired(prevH));

                      // Calculate days left
                      let daysLeft: number | null = null;
                      let daysLeftColor = 'text-slate-400';

                      if (h.registrationDeadline) {
                        const now = Date.now();
                        const deadline = new Date(h.registrationDeadline).getTime();
                        const diff = deadline - now;

                        if (diff > 0) {
                          daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

                          if (daysLeft <= 3) daysLeftColor = 'text-red-400 font-bold';
                          else if (daysLeft <= 7) daysLeftColor = 'text-orange-400 font-bold';
                          else daysLeftColor = 'text-emerald-400 font-bold';
                        }
                      }

                      return (
                        <React.Fragment key={h.id}>
                          {isFirstExpired && (
                            <tr className="bg-slate-950/30">
                              <td colSpan={4} className="px-6 py-3 border-y border-red-900/20">
                                <div className="flex items-center gap-3">
                                  <div className="h-px bg-red-900/20 flex-1"></div>
                                  <span className="text-[10px] bg-red-950/40 text-red-400/60 px-2 py-0.5 rounded border border-red-900/20 uppercase font-bold tracking-wider">
                                    Past Events
                                  </span>
                                  <div className="h-px bg-red-900/20 flex-1"></div>
                                </div>
                              </td>
                            </tr>
                          )}
                          <tr className={`transition-colors group
                            ${expired
                              ? 'bg-red-950/5 hover:bg-slate-900/80 hover:border-l-2 hover:border-l-red-500/20'
                              : 'hover:bg-slate-800/30'
                            }`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg border shrink-0
                                  ${expired
                                    ? 'bg-slate-900 border-slate-800 opacity-60'
                                    : 'bg-slate-900 border-slate-700/50'}`}>
                                  <Globe size={16} className={`${expired ? 'text-slate-500' : 'text-cyan-400'}`} />
                                </div>
                                <div className={expired ? 'opacity-70' : ''}>
                                  <h4
                                    className={`font-medium cursor-pointer transition-colors
                                      ${expired ? 'text-slate-400 hover:text-slate-200' : 'text-white hover:text-cyan-400'}`}
                                    onClick={() => handleViewDetails(h)}
                                  >
                                    {h.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-xs px-1.5 py-0.5 rounded border
                                      ${expired
                                        ? 'text-slate-600 bg-slate-900 border-slate-800'
                                        : 'text-slate-500 bg-slate-900/50 border-slate-800'}`}>
                                      {h.platform}
                                    </span>
                                    {isRegistered && (
                                      <span className={`text-[10px] flex items-center gap-0.5
                                        ${expired ? 'text-emerald-500/60' : 'text-emerald-400'}`}>
                                        <CheckCircle size={10} /> Registered
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`flex flex-col ${expired ? 'opacity-60' : ''}`}>
                                <span className="text-slate-300">
                                  {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className={`text-xs ${expired ? 'text-slate-600' : 'text-slate-500'}`}>
                                  {h.registrationDeadline
                                    ? `Reg. closes ${new Date(h.registrationDeadline).toLocaleDateString()}`
                                    : 'No set deadline'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {daysLeft !== null ? (
                                <div className={`flex items-center gap-2 ${daysLeftColor}`}>
                                  <Clock size={14} />
                                  <span>{daysLeft} Day{daysLeft !== 1 ? 's' : ''}</span>
                                </div>
                              ) : (
                                <span className="text-slate-600 flex items-center gap-2 font-medium">
                                  <X size={14} /> Expired
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleViewDetails(h)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
                                  ${expired
                                    ? 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-600'
                                  }`}
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

                {/* Official Page button - always show if link exists */}
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

                {/* Registration button - only show for unregistered hackathons */}
                {!myRegistrationIds.includes(activeHackathon.id) && activeHackathon.registrationLink && (
                  <a
                    href={activeHackathon.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 border border-cyan-500/50"
                  >
                    <CheckCircle size={18} />
                    {isExpired(activeHackathon) ? "Confirm Participation" : "Confirm Registration"}
                  </a>
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
