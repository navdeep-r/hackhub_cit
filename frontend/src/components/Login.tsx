
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Shield, GraduationCap, ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, Hash, Key, LayoutGrid, Eye, EyeOff } from 'lucide-react';
import { loginUser, signupUser, googleAuthMock } from '../services/api';
import { ErrorModal } from './ErrorModal';

interface LoginProps {
    onLogin: (user: User) => void;
}

const DEPARTMENTS = ['CSE', 'CYBERSECURITY', 'AIML', 'AIDS', 'BIOMED', 'MECH', 'EEE', 'ECE', 'IT'];
const YEARS = ['I', 'II', 'III', 'IV'];

// Helper function to get sections based on department
const getSectionsForDepartment = (department: string): string[] => {
    switch (department) {
        case 'CSE':
            return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
        case 'AIDS':
        case 'AIML':
            return ['A', 'B', 'C'];
        case 'CYBERSECURITY':
            return ['A'];
        default: // BIOMED, MECH, EEE, ECE, IT
            return ['A', 'B', 'C', 'D', 'E', 'F'];
    }
};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
    const [activeRole, setActiveRole] = useState<UserRole>(UserRole.STUDENT);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: 'CSE',
        year: 'I',
        section: 'A',
        registerNo: '',
        secretCode: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // If department changes, reset section to 'A' if current section is not available
        if (name === 'department') {
            const availableSections = getSectionsForDepartment(value);
            setFormData(prev => ({
                ...prev,
                department: value,
                section: availableSections.includes(prev.section) ? prev.section : 'A'
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }

        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (mode === 'LOGIN') {
                const user = await loginUser({
                    email: formData.email,
                    password: formData.password
                });
                onLogin(user);
            } else {
                // Signup Logic - email validation now done on backend
                const payload: any = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: activeRole
                };

                // Add student-specific fields only for STUDENT role
                if (activeRole === UserRole.STUDENT) {
                    payload.department = formData.department;
                    payload.year = formData.year;
                    payload.registerNo = formData.registerNo;
                    payload.section = formData.section;
                }

                // Add faculty-specific fields only for FACULTY role
                if (activeRole === UserRole.FACULTY) {
                    payload.secretCode = formData.secretCode;
                }

                const user = await signupUser(payload);
                onLogin(user);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(prev => prev === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
        setError(null);
        setShowErrorModal(false);
        if (mode === 'SIGNUP') {
            setActiveRole(UserRole.STUDENT); // Reset to student when switching to login
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Animated Background - Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                {[...Array(18)].map((_, i) => (
                    <div
                        key={`particle-${i}`}
                        className="absolute rounded-full bg-blue-500 animate-float"
                        style={{
                            width: `${4 + (i % 3) * 3}px`,
                            height: `${4 + (i % 3) * 3}px`,
                            left: `${(i * 5.5) % 100}%`,
                            top: `${(i * 7.3) % 100}%`,
                            animationDelay: `${i * 0.8}s`,
                            animationDuration: `${10 + (i % 5) * 2}s`,
                            opacity: 0.3
                        }}
                    />
                ))}
            </div>

            {/* Animated Background - Geometric Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <div
                    className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-600/10 blur-3xl animate-pulse-slow"
                    style={{ top: '10%', left: '10%' }}
                />
                <div
                    className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/8 to-pink-600/8 blur-2xl animate-rotate-slow"
                    style={{ bottom: '15%', right: '15%' }}
                />
            </div>

            <div className="w-full max-w-md animate-slide-up relative" style={{ zIndex: 10 }}>
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
                        HackHub
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">
                        Gateway to Campus Innovation
                    </p>
                </div>

                <div className="glass-panel p-1 rounded-2xl shadow-2xl relative overflow-hidden border border-slate-800/50 bg-slate-900/40 backdrop-blur-xl">
                    {/* 1. Main Mode Tabs (Login vs Signup) */}
                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/50 rounded-xl mb-6">
                        <button
                            onClick={() => toggleMode()}
                            className={`py-3 px-6 rounded-lg font-bold text-sm transition-all transform ${mode === 'LOGIN'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => toggleMode()}
                            className={`py-3 px-6 rounded-lg font-bold text-sm transition-all transform ${mode === 'SIGNUP'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="px-6 pb-8">
                        {/* 2. Role Toggle - Only for SIGNUP */}
                        {mode === 'SIGNUP' && (
                            <div className="mb-6 flex justify-center animate-slide-up">
                                <div className="relative inline-flex items-center p-1 bg-slate-900/80 rounded-xl border border-slate-700/50">
                                    {/* Sliding Indicator */}
                                    <div
                                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r rounded-lg transition-all duration-300 ease-out ${activeRole === UserRole.STUDENT
                                            ? 'left-1 from-cyan-600 to-blue-600'
                                            : 'left-[calc(50%+2px)] from-indigo-600 to-purple-600'
                                            }`}
                                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                                    />

                                    {/* Student Button */}
                                    <button
                                        type="button"
                                        onClick={() => setActiveRole(UserRole.STUDENT)}
                                        className={`relative px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-300 flex items-center gap-2 ${activeRole === UserRole.STUDENT ? 'text-white' : 'text-slate-400'
                                            }`}
                                    >
                                        <GraduationCap size={14} /> Student
                                    </button>

                                    {/* Faculty Button */}
                                    <button
                                        type="button"
                                        onClick={() => setActiveRole(UserRole.FACULTY)}
                                        className={`relative px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-300 flex items-center gap-2 ${activeRole === UserRole.FACULTY ? 'text-white' : 'text-slate-400'
                                            }`}
                                    >
                                        <Shield size={14} /> Faculty
                                    </button>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'SIGNUP' && (
                                <div className="space-y-1 animate-slide-up">
                                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Full Name</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 text-sm hover:border-slate-700"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1 animate-slide-up" style={{ animationDelay: '50ms' }}>
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 text-sm hover:border-slate-700"
                                        placeholder="you@citchennai.net"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-3 pl-10 pr-10 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 text-sm hover:border-slate-700"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors focus:outline-none"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>

                            {mode === 'SIGNUP' && (
                                <>
                                    {/* Student Fields - only shown for STUDENT role */}
                                    {activeRole === UserRole.STUDENT && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Dept.</label>
                                                    <div className="relative">
                                                        <select
                                                            name="department"
                                                            value={formData.department}
                                                            onChange={handleChange}
                                                            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-3 px-3 text-slate-200 outline-none transition-all duration-200 text-sm appearance-none hover:border-slate-700"
                                                        >
                                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                                        </select>
                                                        <LayoutGrid className="absolute right-3 top-3 text-slate-600 pointer-events-none" size={16} />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Year</label>
                                                    <div className="relative">
                                                        <select
                                                            name="year"
                                                            value={formData.year}
                                                            onChange={handleChange}
                                                            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-3 px-3 text-slate-200 outline-none transition-all duration-200 text-sm appearance-none hover:border-slate-700"
                                                        >
                                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '175ms' }}>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Section</label>
                                                    <div className="relative">
                                                        <select
                                                            name="section"
                                                            value={formData.section}
                                                            onChange={handleChange}
                                                            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-3 px-3 text-slate-200 outline-none transition-all duration-200 text-sm appearance-none hover:border-slate-700"
                                                        >
                                                            {getSectionsForDepartment(formData.department).map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 animate-slide-up" style={{ animationDelay: '200ms' }}>
                                                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide flex justify-between">
                                                        Register No.
                                                        <span className="text-[10px] text-orange-400 flex items-center gap-1 lowercase font-normal"><AlertCircle size={10} /> permanent</span>
                                                    </label>
                                                    <div className="relative group">
                                                        <Hash className="absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                                                        <input
                                                            name="registerNo"
                                                            type="text"
                                                            required
                                                            value={formData.registerNo}
                                                            onChange={handleChange}
                                                            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 text-sm font-mono hover:border-slate-700"
                                                            placeholder="21050XX"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Faculty Secret Code - only shown for FACULTY role */}
                                    {activeRole === UserRole.FACULTY && (
                                        <div className="space-y-1 animate-slide-up" style={{ animationDelay: '150ms' }}>
                                            <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide flex justify-between">
                                                Faculty Secret Code
                                                <span className="text-[10px] text-purple-400 flex items-center gap-1 lowercase font-normal"><AlertCircle size={10} /> authorized only</span>
                                            </label>
                                            <div className="relative group">
                                                <Key className="absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                                                <input
                                                    name="secretCode"
                                                    type="password"
                                                    required={activeRole === UserRole.FACULTY}
                                                    value={formData.secretCode}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 text-sm hover:border-slate-700"
                                                    placeholder="Enter faculty access code"
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-500 ml-1 mt-1">Contact administration if you don't have this code</p>
                                        </div>
                                    )}
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3.5 mt-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${activeRole === UserRole.STUDENT
                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-cyan-900/20 hover:shadow-cyan-500/30'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-900/20 hover:shadow-indigo-500/30'
                                    } disabled:opacity-70 disabled:scale-100 disabled:cursor-wait`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <>
                                        {mode === 'LOGIN' ? 'Sign In to Dashboard' : 'Create Account'} <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Explicit Bottom Toggle Link */}
                        <div className="text-center mt-6 text-sm">
                            <span className="text-slate-500">
                                {mode === 'LOGIN' ? "Don't have an account?" : 'Already have an account?'}
                            </span>
                            {' '}
                            <button
                                onClick={toggleMode}
                                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors underline"
                            >
                                {mode === 'LOGIN' ? 'Sign up' : 'Log in'}
                            </button>
                        </div>

                        {/* Google Sign-In (Simulated) */}
                        <div className="mt-6 pt-6 border-t border-slate-700/50">
                            <button
                                type="button"
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        const user = await googleAuthMock();
                                        onLogin(user);
                                    } catch (err: any) {
                                        setError(err.message);
                                        setShowErrorModal(true);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                className="w-full bg-white hover:bg-slate-100 text-slate-900 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-slate-600 text-xs">
                    <p>Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.</p>
                </div>
            </div>

            {/* Error Modal */}
            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => {
                    setShowErrorModal(false);
                    setError(null);
                }}
                message={error || 'An unknown error occurred'}
            />
        </div>
    );
};
