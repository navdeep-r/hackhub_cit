
import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import { Shield, GraduationCap, ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, Hash, Key, LayoutGrid, Eye, EyeOff } from 'lucide-react';
import { loginUser, signupUser, googleLogin, googleSignup } from '../services/api';
import { ErrorModal } from './ErrorModal';

declare global {
    interface Window {
        google?: any;
    }
}

interface LoginProps {
    onLogin: (user: User) => void;
}

const DEPARTMENTS = ['CSE'];
const YEARS = ['I', 'II', 'III', 'IV'];

// Helper function to get sections based on department
const getSectionsForDepartment = (department: string): string[] => {
    switch (department) {
        case 'CSE':
            return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
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

    const googleInitialized = React.useRef(false);

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

    const handleGoogleLogin = () => {
        if (isLoading) return;

        if (!window.google) {
            setError("Google SDK not loaded");
            setShowErrorModal(true);
            return;
        }

        window.google.accounts.id.prompt();
    };

    const handleGoogleSignup = async () => {
        if (isLoading) return;

        if (!window.google) {
            setError("Google SDK not loaded");
            setShowErrorModal(true);
            return;
        }

        window.google.accounts.id.prompt();
    };

    const handleGoogleCredential = async (credential: string) => {
        try {
            setIsLoading(true);

            if (mode === 'LOGIN') {
                const res = await googleLogin({ idToken: credential });

                if (!res.success) {
                    setError(res.error || "Google login failed");
                    setShowErrorModal(true);
                    return;
                }

                onLogin(res.user);
                return;
            }

            // ============= SIGNUP WITH GOOGLE ==============
            if (mode === 'SIGNUP') {

                // Ensure required fields present
                if (!formData.password || !formData.name) {
                    setError("Fill required signup fields first");
                    setShowErrorModal(true);
                    return;
                }

                const payload: any = {
                    idToken: credential,
                    password: formData.password,
                    role: activeRole,
                };

                if (activeRole === UserRole.STUDENT) {
                    payload.department = formData.department;
                    payload.year = formData.year;
                    payload.section = formData.section;
                    payload.registerNo = formData.registerNo;
                }

                if (activeRole === UserRole.FACULTY) {
                    payload.secretCode = formData.secretCode;
                }

                const res = await googleSignup(payload);

                if (!res.success) {
                    setError(res.error || "Google signup failed");
                    setShowErrorModal(true);
                    return;
                }

                onLogin(res.user);
            }

        } catch (err: any) {
            setError(err.message);
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (mode === 'SIGNUP') return;
            const data = await loginUser({
                email: formData.email,
                password: formData.password
            });

            localStorage.setItem("auth_token", data.token);
            onLogin(data.user);
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
        setFormData({ ...formData, email: "" })
        setShowErrorModal(false);
        if (mode === 'SIGNUP') {
            setActiveRole(UserRole.STUDENT); // Reset to student when switching to login
        }
    };

    useEffect(() => {
        if (!window.google) return;
        if (googleInitialized.current) return;

        window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: (response: any) => {
                handleGoogleCredential(response.credential);
            },
        });

        googleInitialized.current = true;
    }, [mode]);

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Twinkling Stars Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                {[...Array(50)].map((_, i) => (
                    <div
                        key={`star-${i}`}
                        className="absolute rounded-full bg-white"
                        style={{
                            width: `${1 + (i % 3)}px`,
                            height: `${1 + (i % 3)}px`,
                            left: `${(i * 13.7) % 100}%`,
                            top: `${(i * 17.3) % 100}%`,
                            animation: `twinkle ${2 + (i % 4)}s ease-in-out infinite`,
                            animationDelay: `${(i * 0.1) % 3}s`,
                            opacity: 0.6
                        }}
                    />
                ))}
            </div>

            {/* Shooting Comets */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
                {[...Array(3)].map((_, i) => (
                    <div
                        key={`comet-${i}`}
                        className="absolute"
                        style={{
                            left: `${20 + i * 30}%`,
                            top: `${-10 + i * 5}%`,
                            animation: `shootingStar ${8 + i * 2}s linear infinite`,
                            animationDelay: `${i * 3}s`,
                        }}
                    >
                        <div className="relative">
                            {/* Comet Head */}
                            <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
                            {/* Comet Tail */}
                            <div
                                className="absolute top-0 left-0 w-32 h-[2px] origin-left -rotate-45"
                                style={{
                                    background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(147,197,253,0.4) 50%, transparent 100%)',
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Orbital Rings */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center" style={{ zIndex: 0 }}>
                {[...Array(3)].map((_, i) => (
                    <div
                        key={`orbit-${i}`}
                        className="absolute border border-blue-500/10 rounded-full"
                        style={{
                            width: `${400 + i * 150}px`,
                            height: `${400 + i * 150}px`,
                            animation: `rotate ${20 + i * 10}s linear infinite ${i % 2 === 0 ? 'normal' : 'reverse'}`,
                        }}
                    >
                        <div
                            className="absolute w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                            style={{
                                top: '50%',
                                left: '0',
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Floating Particles with Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                {[...Array(15)].map((_, i) => (
                    <div
                        key={`particle-${i}`}
                        className="absolute rounded-full"
                        style={{
                            width: `${4 + (i % 3) * 4}px`,
                            height: `${4 + (i % 3) * 4}px`,
                            left: `${(i * 7.5) % 100}%`,
                            top: `${(i * 11.3) % 100}%`,
                            background: i % 3 === 0 ? 'rgba(34, 211, 238, 0.4)' : i % 3 === 1 ? 'rgba(147, 51, 234, 0.4)' : 'rgba(59, 130, 246, 0.4)',
                            boxShadow: i % 3 === 0 ? '0 0 20px rgba(34, 211, 238, 0.4)' : i % 3 === 1 ? '0 0 20px rgba(147, 51, 234, 0.4)' : '0 0 20px rgba(59, 130, 246, 0.4)',
                            animation: `float ${10 + (i % 5) * 2}s ease-in-out infinite`,
                            animationDelay: `${i * 0.8}s`,
                        }}
                    />
                ))}
            </div>

            {/* Nebula Clouds */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <div
                    className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
                    style={{
                        top: '-10%',
                        left: '-10%',
                        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)',
                        animation: 'pulse 8s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
                    style={{
                        bottom: '-15%',
                        right: '-15%',
                        background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, rgba(168, 85, 247, 0.2) 40%, transparent 70%)',
                        animation: 'pulse 10s ease-in-out infinite',
                        animationDelay: '2s',
                    }}
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

                        <form
                            onSubmit={handleSubmit}
                            onKeyDown={(e) => {
                                if (mode === 'SIGNUP' && e.key === 'Enter') e.preventDefault();
                            }}
                            className="space-y-4"
                        >
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
                                        disabled={mode === 'SIGNUP'}
                                        required={mode !== 'SIGNUP'}
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 text-sm hover:border-slate-700"
                                        placeholder={mode === 'SIGNUP' ? "Email will be filled by Google" : "you@citchennai.net"}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
                                <label
                                    className="
                                        flex 
                                        justify-between 
                                        items-center 
                                        w-full 
                                        text-xs font-bold
                                        text-slate-400 
                                        ml-1 
                                        uppercase 
                                        tracking-wide
                                    "
                                >
                                    <span>Password</span>

                                    {(mode === 'SIGNUP' || formData.email) && !formData.password && (
                                        <span className="text-[10px] text-red-400 flex items-center gap-1 font-normal">
                                            <AlertCircle size={10} /> Required
                                        </span>
                                    )}
                                </label>
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

                                            {/* <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '175ms' }}> */}
                                            <div
                                                className="grid grid-cols-2 gap-4 items-end animate-slide-up"
                                                style={{ animationDelay: '175ms' }}
                                            >

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
                                                        {!formData.registerNo ?

                                                            <span className="text-[10px] text-red-400 flex items-center gap-1 font-normal"><AlertCircle size={10} /> Required</span>
                                                            :
                                                            <span className="text-[10px] text-orange-400 flex items-center gap-1 font-normal"><AlertCircle size={10} /> permanent</span>
                                                        }
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
                                                            placeholder="24CS001"
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

                            {mode === 'LOGIN' && <button
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
                                        Sign In to Dashboard <ArrowRight size={18} />
                                    </>
                                )}
                            </button>}
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

                        {mode === 'LOGIN' && (
                            <div>

                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className="
                                        w-full mt-3
                                        flex items-center justify-center gap-3
                                        rounded-xl px-4 py-3
                                        border border-slate-700
                                        bg-slate-900 hover:bg-slate-800
                                        text-slate-200 text-sm font-semibold
                                        transition-colors
                                        disabled:opacity-60 disabled:cursor-not-allowed
                                    "
                                >
                                    {/* Google Icon */}
                                    <span className="flex items-center">
                                        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                                            <g clipPath="url(#clip0)">
                                                <path d="M8 3.16667C9.18 3.16667 10.2367 3.57333 11.07 4.36667L13.3533 2.08333C11.9667 0.793333 10.1567 0 8 0C4.87333 0 2.17 1.79333 0.853333 4.40667L3.51333 6.47C4.14333 4.57333 5.91333 3.16667 8 3.16667Z" fill="#EA4335" />
                                                <path d="M15.66 8.18335C15.66 7.66 15.61 7.15335 15.5333 6.66669H8V9.67335H12.3133C12.12 10.66 11.56 11.5 10.72 12.0667L13.2967 14.0667C14.8 12.6734 15.66 10.6134 15.66 8.18335Z" fill="#4285F4" />
                                                <path d="M3.51 9.53C3.35 9.04667 3.25667 8.53334 3.25667 8C3.25667 7.46667 3.34667 6.95334 3.51 6.47L0.85 4.40667C0.306667 5.48667 0 6.70667 0 8C0 9.29334 0.306667 10.5133 0.853333 11.5933L3.51 9.53Z" fill="#FBBC05" />
                                                <path d="M8 16C10.16 16 11.9767 15.29 13.2967 14.0633L10.72 12.0633C10.0033 12.5467 9.08 12.83 8 12.83C5.91333 12.83 4.14333 11.4233 3.51 9.52667L0.85 11.59C2.17 14.2067 4.87333 16 8 16Z" fill="#34A853" />
                                            </g>
                                        </svg>
                                    </span>

                                    <span>
                                        {isLoading ? "Continuing with Google..." : "Continue with Google"}
                                    </span>
                                </button>
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    Google sign-in works only for existing accounts
                                </p>
                            </div>
                        )}

                        {mode === "SIGNUP" && (<div>
                            <button
                                onClick={handleGoogleSignup}
                                disabled={
                                    isLoading ||
                                    !formData.password ||
                                    (
                                        activeRole === UserRole.STUDENT &&
                                        (!formData.registerNo || !formData.section || !formData.year || !formData.department)
                                    ) ||
                                    (
                                        activeRole === UserRole.FACULTY &&
                                        !formData.secretCode
                                    )
                                }
                                className="
                                    w-full mt-3
                                    flex items-center justify-center gap-3
                                    rounded-xl px-4 py-3
                                    border border-slate-700
                                    bg-slate-900 hover:bg-slate-800
                                    text-slate-200 text-sm font-semibold
                                    transition-colors
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                "
                            >
                                {/* Google Icon */}
                                <span className="flex items-center">
                                    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                                        <g clipPath="url(#clip0)">
                                            <path d="M8 3.16667C9.18 3.16667 10.2367 3.57333 11.07 4.36667L13.3533 2.08333C11.9667 0.793333 10.1567 0 8 0C4.87333 0 2.17 1.79333 0.853333 4.40667L3.51333 6.47C4.14333 4.57333 5.91333 3.16667 8 3.16667Z" fill="#EA4335" />
                                            <path d="M15.66 8.18335C15.66 7.66 15.61 7.15335 15.5333 6.66669H8V9.67335H12.3133C12.12 10.66 11.56 11.5 10.72 12.0667L13.2967 14.0667C14.8 12.6734 15.66 10.6134 15.66 8.18335Z" fill="#4285F4" />
                                            <path d="M3.51 9.53C3.35 9.04667 3.25667 8.53334 3.25667 8C3.25667 7.46667 3.34667 6.95334 3.51 6.47L0.85 4.40667C0.306667 5.48667 0 6.70667 0 8C0 9.29334 0.306667 10.5133 0.853333 11.5933L3.51 9.53Z" fill="#FBBC05" />
                                            <path d="M8 16C10.16 16 11.9767 15.29 13.2967 14.0633L10.72 12.0633C10.0033 12.5467 9.08 12.83 8 12.83C5.91333 12.83 4.14333 11.4233 3.51 9.52667L0.85 11.59C2.17 14.2067 4.87333 16 8 16Z" fill="#34A853" />
                                        </g>
                                    </svg>
                                </span>

                                <span>
                                    {isLoading ? "Creating..." : "Continue with Google"}
                                </span>
                            </button>
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Fill required details to continue with Google
                            </p>
                        </div>
                        )}

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

            {/* Animation Keyframes */}
            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
                
                @keyframes shootingStar {
                    0% {
                        transform: translateX(0) translateY(0) rotate(-45deg);
                        opacity: 1;
                    }
                    70% {
                        opacity: 1;
                    }
                    100% {
                        transform: translated(1000px) translateY(1000px) rotate(-45deg);
                        opacity: 0;
                    }
                }
                
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    33% { transform: translateY(-20px) translateX(10px); }
                    66% { transform: translateY(10px) translateX(-10px); }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.1); opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};
