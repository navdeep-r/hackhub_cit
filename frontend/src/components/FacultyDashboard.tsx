
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Plus, Trash2, Edit, Sparkles, Users, Eye, TrendingUp, Calendar, MapPin, Link as LinkIcon, Clock, Globe, CheckSquare, Square, LayoutDashboard, BarChart3, PenTool, ArrowLeft, Info } from 'lucide-react';
import { Hackathon, Registration, AnalyticsData } from '../types';
import { getHackathons, saveHackathon, deleteHackathon, getRegistrations, generateHackathonDescription, analyzeEngagementTrends, getAllStudents } from '../services/api';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { HackathonDetailsModal } from './HackathonDetailsModal';
import { RegistrationsModal } from './RegistrationsModal';
import { ErrorModal } from './ErrorModal';

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || process.env.SHOW_LOGS == '1';

// Utility function to truncate text to a specific word count
const truncateTextByWords = (text: string, maxWords: number): string => {
  if (!text || typeof text !== 'string') return 'No description provided.';
  const words = text.trim().split(/\s+/).filter(word => word.length > 0); // Split by any whitespace and trim, filter out empty words
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + '...';
};

const CATEGORY_OPTIONS = ['AI/ML/DS', 'WEB DEV', 'BLOCKCHAIN', 'IOT', 'CYBERSECURITY', 'MOBILE DEV', 'OTHER'];
const PLATFORM_OPTIONS = ['Unstop', 'DoraHacks', 'HackerEarth', 'Devpost', 'Government', 'Others'];

export const FacultyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'analytics'>('list');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [formData, setFormData] = useState<Partial<Hackathon>>({
    title: '',
    description: '',
    date: '',
    registrationDeadline: '',
    registrationLink: '',
    platform: 'Unstop',
    location: '',
    prizePool: '',
    categories: []
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hackathonToDelete, setHackathonToDelete] = useState<string | null>(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);

  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [selectedHackathonForRegs, setSelectedHackathonForRegs] = useState<Hackathon | null>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [formError, setFormError] = useState<string>('');
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const refreshData = async () => {
    try {
      const hData = await getHackathons();
      setHackathons(hData);

      // Try to fetch registrations but don't let it block hackathon display
      try {
        const rData = await getRegistrations();
        setRegistrations(rData);
      } catch (regError) {
        SHOW_LOGS && console.error('Error fetching registrations (continuing anyway):', regError);
        // Set empty array for registrations to prevent undefined errors
        setRegistrations([]);
      }

      // Fetch all students for the registrations modal
      try {
        const students = await getAllStudents();
        setAllStudents(students);
      } catch (err) {
        SHOW_LOGS && console.warn('Failed to fetch students:', err);
      }
    } catch (error) {
      SHOW_LOGS && console.error('Error refreshing data:', error);
    }
  };

  // Create a memoized map of registration counts per hackathon
  const registrationCountMap = useMemo(() => {
    const countMap = new Map<string, number>();

    registrations.forEach(r => {
      const hackathonId = String(r.hackathonId); // Ensure string comparison
      countMap.set(hackathonId, (countMap.get(hackathonId) || 0) + 1);
    });

    return countMap;
  }, [registrations]);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (hackathons.length > 0) {
      // Logic for hackathon updates
    }
  }, [hackathons]);

  const handleSwitchToCreate = (reset = true) => {
    if (reset) {
      setFormData({ platform: 'Unstop', categories: [] });
    }
    setActiveTab('create');
  };

  const handleEdit = (h: Hackathon) => {
    setFormData(h);
    handleSwitchToCreate(false);
  };

  const handleSave = async () => {
    setFormError('');

    // Validate required fields
    if (!formData.title || !formData.date) {
      setFormError('Title and Event Date are required fields.');
      setErrorModalOpen(true);
      return;
    }

    if (!formData.registrationDeadline) {
      setFormError('Registration Deadline is required.');
      setErrorModalOpen(true);
      return;
    }

    if (!formData.registrationLink) {
      setFormError('Registration Link is required.');
      setErrorModalOpen(true);
      return;
    }

    // Validate year is exactly 4 digits
    if (formData.date) {
      const eventYear = new Date(formData.date).getFullYear();
      if (eventYear < 2000 || eventYear > 9999) {
        setFormError('Event date year must be a valid 4-digit year (1000-9999).');
        setErrorModalOpen(true);
        return;
      }
    }

    if (formData.registrationDeadline) {
      const deadlineYear = new Date(formData.registrationDeadline).getFullYear();
      if (deadlineYear < 1000 || deadlineYear > 9999) {
        setFormError('Registration deadline year must be a valid 4-digit year (1000-9999).');
        setErrorModalOpen(true);
        return;
      }
    }

    // Validate that event date is on or after registration deadline
    if (formData.date && formData.registrationDeadline) {
      const eventDate = new Date(formData.date);
      const deadlineDate = new Date(formData.registrationDeadline);

      if (eventDate < deadlineDate) {
        setFormError('Event date must be on or after the registration deadline date.');
        setErrorModalOpen(true);
        return;
      }
    }

    try {
      const newHackathon: Hackathon = {
        id: formData.id || Date.now().toString(),
        title: formData.title,
        description: formData.description || '',
        date: formData.date,
        registrationDeadline: formData.registrationDeadline || '',
        registrationLink: formData.registrationLink || '',
        platform: formData.platform || 'Others',
        location: formData.location || 'TBD',
        prizePool: formData.prizePool || 'TBD',
        createdAt: formData.createdAt || Date.now(),
        impressions: formData.impressions || 0,
        categories: formData.categories || [],
        tags: formData.categories || []
      };

      const savedHackathon = await saveHackathon(newHackathon);
      setActiveTab('list');
      setFormData({ platform: 'Unstop', categories: [] });
      // Add a small delay to ensure database persistence
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshData();
    } catch (error: any) {
      SHOW_LOGS && console.error('Error saving hackathon:', error);
      setFormError('Failed to save hackathon: ' + (error.message || 'Unknown error'));
      setErrorModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setHackathonToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (hackathonToDelete) {
      try {
        await deleteHackathon(hackathonToDelete);
        await refreshData();
        setDeleteModalOpen(false);
        setHackathonToDelete(null);
      } catch (error: any) {
        SHOW_LOGS && console.error('Error deleting hackathon:', error);
        alert('Failed to delete hackathon: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const toggleCategory = (cat: string) => {
    const current = formData.categories || [];
    if (current.includes(cat)) {
      setFormData({ ...formData, categories: current.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, categories: [...current, cat] });
    }
  };

  const toggleSelectAllCategories = () => {
    if (formData.categories?.length === CATEGORY_OPTIONS.length) {
      setFormData({ ...formData, categories: [] });
    } else {
      setFormData({ ...formData, categories: [...CATEGORY_OPTIONS] });
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) return;
    setIsGenerating(true);
    try {
      const desc = await generateHackathonDescription(formData.title, aiPrompt || 'Innovation, Coding, Fun');
      setFormData(prev => ({ ...prev, description: desc }));
    } catch (e) {
      SHOW_LOGS && console.error("AI Error", e);
    }
    setIsGenerating(false);
  };

  const handleAnalyzeTrends = async () => {
    setIsAnalyzing(true);
    const data = prepareAnalytics();
    const jsonStr = JSON.stringify(data.map(d => ({ title: d.hackathonTitle, ratio: d.registrations / (d.impressions || 1) })));
    try {
      const insight = await analyzeEngagementTrends(jsonStr);
      setAiAnalysis(insight);
    } catch (e) {
      SHOW_LOGS && console.error("AI Error", e);
    }
    setIsAnalyzing(false);
  };

  const prepareAnalytics = (): AnalyticsData[] => {
    return hackathons.map(h => ({
      hackathonTitle: h.title.substring(0, 10) + '...',
      impressions: h.impressions,
      registrations: registrations.filter(r => r.hackathonId === h.id).length
    }));
  };

  const prepareTrendData = () => {
    const sorted = [...hackathons].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(h => {
      const regs = registrations.filter(r => r.hackathonId === h.id).length;
      const rate = h.impressions > 0 ? (regs / h.impressions) * 100 : 0;
      return {
        name: h.title,
        shortDate: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: parseFloat(rate.toFixed(1))
      };
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 animate-slide-up">
        <div>
          <h2 className="text-3xl font-bold text-white">Faculty Dashboard</h2>
          <p className="text-slate-400 mt-1">Manage events, create new listings, and analyze trends.</p>
        </div>
      </header>

      {/* 3-Tab Navigation System */}
      <div className="flex p-1 bg-slate-900/80 rounded-xl w-fit border border-slate-800 animate-slide-up-delay-1">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'list'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
            : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <LayoutDashboard size={16} /> Hackathons
        </button>
        <button
          onClick={() => handleSwitchToCreate(true)}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'create'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
            : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <Plus size={16} /> Create New
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'analytics'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
            : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <BarChart3 size={16} /> Analytics
        </button>
      </div>

      {/* 1. Analytics Tab */}
      {activeTab === 'analytics' && (
        <section className="glass-panel p-6 rounded-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-100">
              <TrendingUp size={20} className="text-indigo-400" /> Engagement Analytics
            </h3>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Volume Chart */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
              <h4 className="text-slate-400 text-sm font-medium mb-6 text-center uppercase tracking-wider">Engagement Volume</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareAnalytics()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="hackathonTitle" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                      cursor={{ fill: '#334155', opacity: 0.4 }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="impressions" fill="#6366f1" name="Impressions" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="registrations" fill="#22d3ee" name="Registrations" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Success Rate Chart */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
              <h4 className="text-slate-400 text-sm font-medium mb-6 text-center uppercase tracking-wider">Success Rate Over Time</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prepareTrendData()}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="shortDate" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                      itemStyle={{ color: '#34d399' }}
                      cursor={{ stroke: '#334155' }}
                      formatter={(value: number) => [`${value}%`, 'Conversion Rate']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      name="Success Rate (%)"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRate)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {aiAnalysis && (
            <div className="mt-6 p-4 bg-indigo-950/40 text-indigo-200 rounded-xl text-sm border border-indigo-500/30 flex gap-3 items-start animate-fade-in">
              <Sparkles size={18} className="mt-0.5 flex-shrink-0 text-indigo-400" />
              <p>{aiAnalysis}</p>
            </div>
          )}
        </section>
      )}

      {/* 2. List View Tab */}
      {activeTab === 'list' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hackathons.length === 0 && (
              <div className="col-span-full text-center py-16 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                <p>No hackathons created yet. Switch to the "Create New" tab to get started.</p>
              </div>
            )}
            {hackathons.map(h => (
              <div key={h.id} className="glass-panel rounded-2xl relative group glass-card transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-900/20 flex flex-col md:flex-row h-auto md:h-56 overflow-hidden border border-slate-800/60">
                {/* Gradient Header / Side Panel */}
                <div className="w-full md:w-40 bg-gradient-to-br from-slate-950 via-blue-900/20 to-slate-950 relative p-3 flex flex-col justify-between group-hover:from-slate-900 group-hover:via-blue-800/30 transition-all shrink-0">
                  <div className="absolute top-0 right-0 p-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 md:hidden">
                    {/* Mobile Actions */}
                    <button onClick={(e) => { e.stopPropagation(); setSelectedHackathon(h); setDetailsModalOpen(true); }} className="p-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors shadow-lg">
                      <Info size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(h); }} className="p-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors shadow-lg">
                      <Edit size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(h.id); }} className="p-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shadow-lg">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950/30 text-white border border-white/10 backdrop-blur-md">
                      {h.platform}
                    </span>
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
                  {/* Desktop Actions */}
                  <div className="absolute top-3 right-3 hidden md:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedHackathon(h); setDetailsModalOpen(true); }} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors" title="View Details">
                      <Info size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(h); }} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition-colors" title="Edit Hackathon">
                      <Edit size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(h.id); }} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors" title="Delete Hackathon">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="pr-10 mb-auto flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 group-hover:text-indigo-300 transition-colors" title={h.title}>{h.title}</h3>
                    <div className="flex-1 flex items-center">
                      <p className="text-slate-400 text-sm leading-tight line-clamp-3" title={h.description}>
                        {truncateTextByWords(h.description || 'No description provided.', 20)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-400 mb-auto">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-indigo-400 shrink-0" />
                      <span>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-indigo-400 shrink-0" />
                      <span className="truncate">{h.location}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Clock size={12} className="text-indigo-400 shrink-0" />
                      <span className="truncate">Deadline: {new Date(h.registrationDeadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex gap-3 mt-2 pt-3 border-t border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-500 font-medium">Impressions:</span>
                      <div className="flex items-center gap-1 text-slate-200 font-semibold">
                        <Eye size={12} className="text-indigo-400" /> {h.impressions}
                      </div>
                    </div>
                    <div className="h-3 w-px bg-slate-800 my-auto"></div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-500 font-medium">Registrations:</span>
                      <div className="flex items-center gap-1 text-slate-200 font-semibold">
                        <Users size={12} className="text-cyan-400" /> {registrationCountMap.get(String(h.id)) || 0}
                      </div>
                    </div>
                  </div>

                  {/* View Registrations Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedHackathonForRegs(h); setRegistrationsModalOpen(true); }}
                    className="w-full mt-2 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-1 text-sm shadow-lg shadow-indigo-900/30"
                  >
                    <Users size={12} /> View Registrations
                  </button>


                  {/* Mobile Categories Footer */}
                  <div className="flex md:hidden flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/50">
                    {h.categories && h.categories.slice(0, 3).map((cat, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-wide font-medium rounded-md border border-slate-700/50">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Create/Edit Tab (Separate Section) */}
      {activeTab === 'create' && (
        <div className="animate-fade-in max-w-4xl mx-auto">
          <div className="glass-panel rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">{formData.id ? 'Edit Hackathon' : 'Create New Hackathon'}</h3>
                <p className="text-slate-400 text-sm mt-1">Fill in the details to launch or update an event.</p>
              </div>
              {formData.id && (
                <button
                  onClick={() => setActiveTab('list')}
                  className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft size={16} /> Back to List
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Title <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. HackTheFuture 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Platform</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3.5 text-slate-500" size={16} />
                    <select
                      className="w-full p-3 pl-10 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                      value={formData.platform || 'Others'}
                      onChange={e => setFormData({ ...formData, platform: e.target.value })}
                    >
                      {PLATFORM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Event Date <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 text-slate-500" size={16} />
                    <input
                      type="date"
                      required
                      min="1000-01-01"
                      max="9999-12-31"
                      className="w-full p-3 pl-10 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none [color-scheme:dark]"
                      value={formData.date || ''}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Registration Deadline <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 text-slate-500" size={16} />
                    <input
                      type="date"
                      required
                      min="1000-01-01"
                      max="9999-12-31"
                      className="w-full p-3 pl-10 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none [color-scheme:dark]"
                      value={formData.registrationDeadline || ''}
                      onChange={e => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Description with AI */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 flex justify-between items-center">
                  Description

                </label>

                {/* AI Assistant Panel */}


                <textarea
                  rows={6}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm leading-relaxed resize-none"
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter hackathon details..."
                />
              </div>

              {/* Categories */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-400">Categories</label>
                  <button onClick={toggleSelectAllCategories} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    {formData.categories?.length === CATEGORY_OPTIONS.length ? <CheckSquare size={12} /> : <Square size={12} />} Select All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map(cat => {
                    const isSelected = formData.categories?.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                          }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Row 3: Links and Prizes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Prize Pool</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.prizePool || ''}
                    onChange={e => setFormData({ ...formData, prizePool: e.target.value })}
                    placeholder="e.g. $5,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.location || ''}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Physical location or 'Online'"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Registration Link <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3.5 text-slate-500" size={16} />
                    <input
                      type="url"
                      required
                      className="w-full p-3 pl-10 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.registrationLink || ''}
                      onChange={e => setFormData({ ...formData, registrationLink: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-800">
                <button
                  onClick={() => { setActiveTab('list'); setFormData({ platform: 'Unstop', categories: [] }); }}
                  className="px-6 py-3 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-900/40 transition-all font-bold flex items-center gap-2"
                >
                  {formData.id ? 'Update Hackathon' : 'Create Hackathon'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Hackathon"
        message="Are you sure you want to delete this hackathon? This will remove all associated data and cannot be undone."
        itemName={hackathons.find(h => h.id === hackathonToDelete)?.title}
      />
      <HackathonDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        hackathon={selectedHackathon}
      />
      <RegistrationsModal
        isOpen={registrationsModalOpen}
        onClose={() => setRegistrationsModalOpen(false)}
        hackathon={selectedHackathonForRegs}
        registrations={registrations}
        allStudents={allStudents}
      />
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={formError}
        title="Validation Error"
      />
    </div>
  );
};
