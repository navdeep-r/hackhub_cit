import React, { useState, useEffect, useMemo } from 'react';
import { X, Download, Users, ChevronLeft, ChevronRight, Filter, LayoutGrid, List, Building2, GraduationCap } from 'lucide-react';
import { Hackathon, Registration, User } from '../types';

interface RegistrationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    hackathon: Hackathon | null;
    registrations: Registration[];
    allStudents: User[];
}

const ITEMS_PER_PAGE = 20;

// Department-specific section ranges
const getSectionsForDepartment = (department: string) => {
    if (!department) return ['All', 'A', 'B', 'C', 'D', 'E', 'F'];

    const dept = department.toLowerCase();
    if (dept.includes('cse')) {
        return ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
    } else if (dept.includes('aids') || dept.includes('aiml')) {
        return ['All', 'A', 'B', 'C'];
    } else if (dept.includes('cyber')) {
        return ['All', '1'];
    } else {
        return ['All', 'A', 'B', 'C', 'D', 'E', 'F'];
    }
};

export const RegistrationsModal: React.FC<RegistrationsModalProps> = ({
    isOpen,
    onClose,
    hackathon,
    registrations,
    allStudents
}) => {
    const [filter, setFilter] = useState<'all' | 'registered' | 'unregistered'>('registered');
    const [sectionFilter, setSectionFilter] = useState<string>('All');
    const [departmentFilter, setDepartmentFilter] = useState<string>('All');
    const [viewMode, setViewMode] = useState<'table' | 'grouped'>('grouped');
    const [currentPage, setCurrentPage] = useState(1);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, sectionFilter, departmentFilter]);

    // Get unique departments
    const departments = useMemo(() => {
        const depts = new Set<string>();
        allStudents.forEach(s => {
            if (s.department && s.department !== 'All') depts.add(s.department);
        });
        return ['All', ...Array.from(depts).sort()];
    }, [allStudents]);

    // Get sections based on selected department
    const sections = useMemo(() => {
        return getSectionsForDepartment(departmentFilter === 'All' ? '' : departmentFilter);
    }, [departmentFilter]);


    // Get registered student IDs and emails for this hackathon
    const registeredIds = useMemo(() => {
        const ids = new Set<string>();
        const emails = new Set<string>();
        if (!hackathon) return { ids, emails };

        registrations.forEach(reg => {
            // Strict check: Ensure both IDs exist and match exactly
            if (hackathon.id && reg.hackathonId && String(reg.hackathonId) === String(hackathon.id)) {
                if (reg.studentId) ids.add(reg.studentId);
                // Only add emails if they're non-empty strings
                if (reg.email && reg.email.length > 0) emails.add(reg.email);
                if (reg.studentEmail && reg.studentEmail.length > 0) emails.add(reg.studentEmail);
            }
        });

        return { ids, emails };
    }, [registrations, hackathon]);

    // Filter students based on registration status and section
    const filteredStudents = useMemo(() => {
        let students = allStudents;

        // Filter by registration status
        if (filter === 'registered') {
            students = students.filter(s =>
                registeredIds.ids.has(s.id) || registeredIds.emails.has(s.email)
            );
        } else if (filter === 'unregistered') {
            students = students.filter(s =>
                !registeredIds.ids.has(s.id) && !registeredIds.emails.has(s.email)
            );
        }

        // Filter by section
        if (sectionFilter !== 'All') {
            students = students.filter(s => s.section === sectionFilter);
        }

        // Filter by department
        if (departmentFilter !== 'All') {
            students = students.filter(s => s.department === departmentFilter);
        }

        return students;
    }, [allStudents, filter, sectionFilter, departmentFilter, registeredIds]);

    // Group by department and section
    const groupedRegistrations = useMemo(() => {
        const grouped: Record<string, Record<string, User[]>> = {};

        filteredStudents.forEach(student => {
            const dept = student.department || 'Unknown';
            const section = student.section || 'Unknown';

            if (!grouped[dept]) grouped[dept] = {};
            if (!grouped[dept][section]) grouped[dept][section] = [];

            grouped[dept][section].push(student);
        });

        return grouped;
    }, [filteredStudents]);

    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredStudents, currentPage]);

    // CSV Export
    const handleExportCSV = () => {
        if (!hackathon) return;

        const headers = ['Name', 'Email', 'Register No', 'Department', 'Year', 'Section', 'Status'];
        const rows = filteredStudents.map(student => {
            const isRegistered = registeredIds.ids.has(student.id) || registeredIds.emails.has(student.email);
            return [
                student.name,
                student.email,
                student.registerNo || '',
                student.department || '',
                student.year || '',
                student.section || '',
                isRegistered ? 'Registered' : 'Not Registered'
            ];
        });

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${hackathon.title.replace(/\s+/g, '_')}_registrations.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isOpen || !hackathon) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700 flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Registration Management</h2>
                        <p className="text-slate-400 text-sm">{hackathon.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-slate-800 space-y-4">
                    {/* Statistics Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/30">
                            <p className="text-xs text-slate-400 mb-1">Total Registrations</p>
                            <p className="text-2xl font-bold text-white">{filter === 'registered' ? filteredStudents.length : registeredIds.ids.size + registeredIds.emails.size}</p>
                        </div>
                        <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/30">
                            <p className="text-xs text-slate-400 mb-1">Departments</p>
                            <p className="text-2xl font-bold text-white">{Object.keys(groupedRegistrations).length}</p>
                        </div>
                        <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/30">
                            <p className="text-xs text-slate-400 mb-1">Sections</p>
                            <p className="text-2xl font-bold text-white">
                                {Object.values(groupedRegistrations).reduce((acc, dept) => acc + Object.keys(dept).length, 0)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-400">Filter:</span>
                        </div>

                        {/* Registration Status Filter */}
                        <div className="flex gap-2">
                            {(['all', 'registered', 'unregistered'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {f === 'all' ? 'All Students' : f === 'registered' ? 'Registered' : 'Unregistered'}
                                </button>
                            ))}
                        </div>

                        {/* Department Filter */}
                        <div className="flex gap-2">
                            <span className="text-sm font-medium text-slate-400 my-auto">Dept:</span>
                            <select
                                value={departmentFilter}
                                onChange={(e) => {
                                    setDepartmentFilter(e.target.value);
                                    setSectionFilter('All'); // Reset section filter when department changes
                                }}
                                className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-200 border-none outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-700 transition-colors"
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept} className="bg-slate-900">{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* Section Filter */}
                        <div className="flex gap-2">
                            <span className="text-sm font-medium text-slate-400 my-auto">Section:</span>
                            {sections.slice(0, 6).map(section => (
                                <button
                                    key={section}
                                    onClick={() => setSectionFilter(section)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${sectionFilter === section
                                        ? 'bg-cyan-600 text-white shadow-md'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {section}
                                </button>
                            ))}
                            {sections.length > 6 && (
                                <select
                                    value={sectionFilter}
                                    onChange={(e) => setSectionFilter(e.target.value)}
                                    className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-200 border-none outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer hover:bg-slate-700 transition-colors"
                                >
                                    {sections.map(section => (
                                        <option key={section} value={section} className="bg-slate-900">{section}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="ml-auto flex gap-2">
                            {/* View Mode Toggle */}
                            <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grouped')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${viewMode === 'grouped'
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <LayoutGrid size={14} /> Grouped
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${viewMode === 'table'
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <List size={14} /> Table
                                </button>
                            </div>
                            <button
                                onClick={handleExportCSV}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-colors flex items-center gap-2 text-sm"
                            >
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Student Count */}
                <div className="px-6 py-3 bg-slate-800/50 flex items-center gap-2 text-sm">
                    <Users size={16} className="text-cyan-400" />
                    <span className="text-slate-300">
                        Showing {paginatedStudents.length} of {filteredStudents.length} students
                        {filter === 'registered' && ` (${filteredStudents.length} registered)`}
                        {filter === 'unregistered' && ` (${filteredStudents.length} not registered)`}
                    </span>
                </div>

                {/* Student List */}
                <div className="flex-1 overflow-auto p-6">
                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No students found with the selected filters.</p>
                        </div>
                    ) : viewMode === 'grouped' ? (
                        /* Grouped View */
                        <div className="space-y-6">
                            {Object.entries(groupedRegistrations).sort(([a], [b]) => a.localeCompare(b)).map(([department, sections]) => (
                                <div key={department} className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
                                    <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Building2 size={18} className="text-indigo-400" />
                                            {department}
                                            <span className="text-sm font-normal text-slate-400 ml-2">
                                                ({Object.values(sections).reduce((acc, students) => acc + students.length, 0)} students)
                                            </span>
                                        </h3>
                                    </div>

                                    <div className="p-4 space-y-4">
                                        {Object.entries(sections).sort(([a], [b]) => a.localeCompare(b)).map(([section, students]) => (
                                            <div key={section} className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
                                                <div className="bg-slate-800/30 px-3 py-2 border-b border-slate-700/50">
                                                    <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                                        <GraduationCap size={14} className="text-cyan-400" />
                                                        Section {section}
                                                        <span className="text-xs font-normal text-slate-500">({students.length} students)</span>
                                                    </h4>
                                                </div>

                                                <div className="divide-y divide-slate-700/30">
                                                    {students.map((student) => {
                                                        const isRegistered = registeredIds.ids.has(student.id) || registeredIds.emails.has(student.email);
                                                        return (
                                                            <div key={student.id} className="px-3 py-2.5 hover:bg-slate-800/30 transition-colors">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-white text-sm">{student.name}</p>
                                                                        <div className="flex gap-3 mt-1 text-xs text-slate-400">
                                                                            <span className="font-mono">{student.registerNo}</span>
                                                                            <span>•</span>
                                                                            <span>{student.email}</span>
                                                                            <span>•</span>
                                                                            <span>Year {student.year}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isRegistered
                                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                                            : 'bg-slate-700/50 text-slate-500 border border-slate-700'
                                                                            }`}>
                                                                            {isRegistered ? 'Registered' : 'Not Registered'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Table View */
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-slate-900 z-10">
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Register No</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Dept</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Year</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Section</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedStudents.map((student, index) => {
                                        const isRegistered = registeredIds.ids.has(student.id) || registeredIds.emails.has(student.email);
                                        const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                                        return (
                                            <tr key={student.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3 px-4 text-sm text-slate-500">{globalIndex}</td>
                                                <td className="py-3 px-4 text-sm text-white font-medium">{student.name}</td>
                                                <td className="py-3 px-4 text-sm text-slate-400">{student.email}</td>
                                                <td className="py-3 px-4 text-sm text-slate-400 font-mono">{student.registerNo || '-'}</td>
                                                <td className="py-3 px-4 text-sm text-slate-400">{student.department || '-'}</td>
                                                <td className="py-3 px-4 text-sm text-slate-400">{student.year || '-'}</td>
                                                <td className="py-3 px-4 text-sm text-slate-400">{student.section || '-'}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isRegistered
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-slate-700/50 text-slate-500 border border-slate-700'
                                                        }`}>
                                                        {isRegistered ? 'Registered' : 'Not Registered'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};