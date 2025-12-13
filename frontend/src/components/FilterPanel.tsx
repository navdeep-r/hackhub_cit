import React, { useState } from 'react';
import { Filter, X, Calendar, Globe, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterPanelProps {
    selectedPlatforms: string[];
    onPlatformChange: (platforms: string[]) => void;
    deadlineFilter: string;
    onDeadlineChange: (filter: string) => void;
    onClearAll: () => void;
    totalCount: number;
    filteredCount: number;
}

const PLATFORMS = [
    { id: 'Unstop', label: 'Unstop', color: 'from-blue-500 to-blue-600' },
    { id: 'Devfolio', label: 'Devfolio', color: 'from-purple-500 to-purple-600' },
    { id: 'DoraHacks', label: 'DoraHacks', color: 'from-green-500 to-green-600' },
    { id: 'Devpost', label: 'Devpost', color: 'from-cyan-500 to-cyan-600' },
];

const DEADLINE_OPTIONS = [
    { id: 'all', label: 'All Deadlines' },
    { id: 'latest', label: 'Latest' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'upcoming', label: 'Upcoming (30+ days)' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
    selectedPlatforms,
    onPlatformChange,
    deadlineFilter,
    onDeadlineChange,
    onClearAll,
    totalCount,
    filteredCount,
}) => {
    const [platformsExpanded, setPlatformsExpanded] = useState(true);
    const [deadlineExpanded, setDeadlineExpanded] = useState(true);

    const handlePlatformToggle = (platformId: string) => {
        if (selectedPlatforms.includes(platformId)) {
            onPlatformChange(selectedPlatforms.filter(p => p !== platformId));
        } else {
            onPlatformChange([...selectedPlatforms, platformId]);
        }
    };

    const activeFiltersCount = selectedPlatforms.length + (deadlineFilter !== 'all' ? 1 : 0);

    return (
        <div className="glass-panel p-5 rounded-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Filter size={16} className="text-cyan-400" />
                    </div>
                    <h3 className="font-bold text-white">Filters</h3>
                    {activeFiltersCount > 0 && (
                        <span className="px-2 py-0.5 bg-cyan-600 text-white text-xs font-bold rounded-full animate-scale-in">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>
                {activeFiltersCount > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
                    >
                        <X size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                        Clear
                    </button>
                )}
            </div>

            {/* Results Count */}
            <div className="mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Showing</span>
                    <span className="text-sm font-bold text-cyan-400">
                        {filteredCount} <span className="text-slate-500">/ {totalCount}</span>
                    </span>
                </div>
            </div>

            {/* Platform Filters */}
            <div className="mb-4 pb-4 border-b border-slate-800">
                <button
                    onClick={() => setPlatformsExpanded(!platformsExpanded)}
                    className="w-full flex items-center justify-between mb-3 group"
                >
                    <div className="flex items-center gap-2">
                        <Globe size={14} className="text-cyan-400" />
                        <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                            Platform
                        </span>
                    </div>
                    {platformsExpanded ? (
                        <ChevronUp size={16} className="text-slate-400 group-hover:text-white transition-all" />
                    ) : (
                        <ChevronDown size={16} className="text-slate-400 group-hover:text-white transition-all" />
                    )}
                </button>

                <div
                    className={`space-y-2 overflow-hidden transition-all duration-300 ${platformsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    {PLATFORMS.map((platform, index) => {
                        const isSelected = selectedPlatforms.includes(platform.id);
                        return (
                            <label
                                key={platform.id}
                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/50 cursor-pointer group transition-all duration-200 hover:scale-[1.02]"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handlePlatformToggle(platform.id)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                                            ? `bg-gradient-to-br ${platform.color} border-transparent scale-100`
                                            : 'border-slate-600 bg-slate-900/50 group-hover:border-slate-500'
                                            }`}
                                    >
                                        {isSelected && (
                                            <svg
                                                className="w-3 h-3 text-white animate-scale-in"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2.5"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span
                                    className={`text-sm font-medium transition-colors ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                                        }`}
                                >
                                    {platform.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Deadline Filters */}
            <div>
                <button
                    onClick={() => setDeadlineExpanded(!deadlineExpanded)}
                    className="w-full flex items-center justify-between mb-3 group"
                >
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-orange-400" />
                        <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                            Deadline
                        </span>
                    </div>
                    {deadlineExpanded ? (
                        <ChevronUp size={16} className="text-slate-400 group-hover:text-white transition-all" />
                    ) : (
                        <ChevronDown size={16} className="text-slate-400 group-hover:text-white transition-all" />
                    )}
                </button>

                <div
                    className={`space-y-2 overflow-hidden transition-all duration-300 ${deadlineExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    {DEADLINE_OPTIONS.map((option, index) => {
                        const isSelected = deadlineFilter === option.id;
                        return (
                            <label
                                key={option.id}
                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/50 cursor-pointer group transition-all duration-200 hover:scale-[1.02]"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="relative">
                                    <input
                                        type="radio"
                                        name="deadline"
                                        checked={isSelected}
                                        onChange={() => onDeadlineChange(option.id)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-transparent scale-100'
                                            : 'border-slate-600 bg-slate-900/50 group-hover:border-slate-500'
                                            }`}
                                    >
                                        {isSelected && (
                                            <div className="w-2 h-2 bg-white rounded-full animate-scale-in" />
                                        )}
                                    </div>
                                </div>
                                <span
                                    className={`text-sm font-medium transition-colors ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                                        }`}
                                >
                                    {option.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
