import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { User } from '../types';
import { ErrorModal } from './ErrorModal';

interface LoginProps {
    onLogin: (user: User) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData({ ...formData, [name]: value });
        setError(null);
    };

    const handleGoogleSignIn = () => {
        window.location.href = `${API_BASE}/auth/google/redirect`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await loginUser({
                email: formData.email,
                password: formData.password
            });

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
        setFormData({ email: "", password: "" });
        setShowErrorModal(false);

    };

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
                        {mode == "LOGIN" && <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >

                            <div className="space-y-1 animate-slide-up" style={{ animationDelay: '50ms' }}>
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 text-sm hover:border-slate-700"
                                        placeholder="you@citchennai.net"
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

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3.5 mt-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-cyan-600 to-blue-600 shadow-cyan-900/20 hover:shadow-cyan-500/30 disabled:opacity-70 disabled:scale-100 disabled:cursor-wait`}
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
                            </button>
                        </form>}

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


                        <div>

                            <button
                                onClick={handleGoogleSignIn}
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
                                {mode == "LOGIN" ? "Google sign-in works only for existing accounts" : "Continue with Google to create a new account"}
                            </p>
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
