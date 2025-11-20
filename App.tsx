import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Code2, LogOut, Sparkles } from 'lucide-react';
import { UserRole } from './types';
import { FacultyDashboard } from './frontend/src/components/FacultyDashboard';
import { StudentDashboard } from './frontend/src/components/StudentDashboard';
import { Login } from './frontend/src/components/Login';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="min-h-screen font-sans text-slate-200 selection:bg-blue-500/30">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-cyan-600/5 rounded-full blur-[80px]"></div>
        </div>

        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            {/* Navigation Bar */}
            <nav className="glass-panel border-b border-white/5 sticky top-0 z-40 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center gap-3 animate-fade-in">
                    <div className="relative group">
                       <div className={`absolute inset-0 rounded-lg blur opacity-40 group-hover:opacity-75 transition-opacity duration-500 ${role === UserRole.FACULTY ? 'bg-indigo-500' : 'bg-cyan-500'}`}></div>
                       <div className={`relative p-2 rounded-lg ${role === UserRole.FACULTY ? 'bg-indigo-950/80 border border-indigo-500/50' : 'bg-cyan-950/80 border border-cyan-500/50'} text-white transition-colors duration-300`}>
                         <Code2 size={24} />
                       </div>
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                      HackHub
                    </span>
                  </div>

                  <div className="flex items-center gap-4 animate-fade-in">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800">
                        <div className={`w-2 h-2 rounded-full ${role === UserRole.FACULTY ? 'bg-indigo-500 animate-pulse' : 'bg-cyan-500 animate-pulse'}`}></div>
                        <span className="text-xs font-medium text-slate-400">
                            {role === UserRole.FACULTY ? 'Faculty Admin' : 'Student Account'}
                        </span>
                    </div>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                    >
                      <LogOut size={18}/>
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
              {role === UserRole.FACULTY ? <FacultyDashboard /> : <StudentDashboard />}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} HackHub. Connecting Campus Innovators.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
                    </div>
                </div>
            </footer>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;