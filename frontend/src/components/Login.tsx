
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Shield, GraduationCap, ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, Hash, Key, LayoutGrid } from 'lucide-react';
import { loginUser, signupUser, googleAuthMock } from '../services/api';

interface LoginProps {
  onLogin: (user: User) => void;
}

const DEPARTMENTS = ['CSE', 'CYBERSECURITY', 'AIML', 'AIDS', 'BIOMED', 'MECH', 'EEE', 'ECE', 'IT'];
const YEARS = ['I', 'II', 'III', 'IV'];

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.STUDENT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'CSE',
    year: 'I',
    registerNo: '',
    secretCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        // Signup Logic
        if (activeRole === UserRole.STUDENT && !formData.email.endsWith('@citchennai.net')) {
            throw new Error("Students must use an @citchennai.net email address.");
        }
        
        const payload = {
            ...formData,
            role: activeRole
        };
        const user = await signupUser(payload);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
     setIsLoading(true);
     try {
         // Simulate Google Auth Response
         const user = await googleAuthMock('google_user@citchennai.net', 'Google User');
         onLogin(user);
     } catch (err: any) {
         setError(err.message);
     } finally {
         setIsLoading(false);
     }
  };

  const toggleMode = () => {
      setMode(prev => prev === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
      setError(null);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md animate-slide-up">
        
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
                onClick={() => { setMode('LOGIN'); setError(null); }}
                className={`py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    mode === 'LOGIN' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
                Sign In
            </button>
            <button
                onClick={() => { setMode('SIGNUP'); setError(null); }}
                className={`py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    mode === 'SIGNUP' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
                Create Account
            </button>
          </div>

          <div className="px-6 pb-8">
            {/* 2. Role Toggle */}
            <div className="flex justify-center mb-6">
                <div className="inline-flex p-1 bg-slate-900/80 rounded-lg border border-slate-700/50">
                    <button
                    type="button"
                    onClick={() => setActiveRole(UserRole.STUDENT)}
                    className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                        activeRole === UserRole.STUDENT
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    >
                    <GraduationCap size={14} /> Student
                    </button>
                    <button
                    type="button"
                    onClick={() => setActiveRole(UserRole.FACULTY)}
                    className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                        activeRole === UserRole.FACULTY
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    >
                    <Shield size={14} /> Faculty
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs animate-fade-in">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm"
                            placeholder="John Doe"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1 animate-slide-up" style={{ animationDelay: '50ms' }}>
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">
                        Email Address 
                        {mode === 'SIGNUP' && activeRole === UserRole.STUDENT && <span className="text-cyan-400 normal-case ml-1 font-normal">(@citchennai.net)</span>}
                    </label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                        <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm"
                        placeholder={activeRole === UserRole.STUDENT ? "you@citchennai.net" : "faculty@university.edu"}
                        />
                    </div>
                </div>

                <div className="space-y-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                        <input
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm"
                        placeholder="••••••••"
                        />
                    </div>
                </div>

                {mode === 'SIGNUP' && (
                    <>
                        <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Dept.</label>
                                <div className="relative">
                                    <select 
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-3 px-3 text-slate-200 outline-none transition-all text-sm appearance-none"
                                    >
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <LayoutGrid className="absolute right-3 top-3 text-slate-600 pointer-events-none" size={16} />
                                </div>
                            </div>
                            
                            {activeRole === UserRole.STUDENT && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Year</label>
                                    <div className="relative">
                                        <select 
                                            name="year"
                                            value={formData.year}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-3 px-3 text-slate-200 outline-none transition-all text-sm appearance-none"
                                        >
                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {activeRole === UserRole.STUDENT ? (
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
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm font-mono"
                                    placeholder="21050XX"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1 animate-slide-up" style={{ animationDelay: '200ms' }}>
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Secret Faculty Code</label>
                                <div className="relative group">
                                    <Key className="absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                                    <input
                                    name="secretCode"
                                    type="password"
                                    required
                                    value={formData.secretCode}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm"
                                    placeholder="Provided by Admin"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 mt-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                    activeRole === UserRole.STUDENT 
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
            <div className="mt-6 text-center pt-4 border-t border-slate-800/50">
              <p className="text-sm text-slate-400">
                {mode === 'LOGIN' ? "Don't have an account yet?" : "Already have an account? "}
                <br className="sm:hidden"/>
                <button 
                  onClick={toggleMode}
                  className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors ml-2 text-base hover:underline decoration-cyan-500/50 underline-offset-4"
                >
                  {mode === 'LOGIN' ? 'Sign Up Now' : 'Log In'}
                </button>
              </p>
            </div>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider font-bold">
                    <span className="bg-slate-900 px-3 text-slate-600">Or continue with</span>
                </div>
            </div>

            <button 
                type="button"
                onClick={handleGoogleClick}
                className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-3 group"
            >
               <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
        
        <div className="mt-8 text-center text-slate-600 text-xs">
            <p>Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.</p>
        </div>
      </div>
    </div>
  );
};
