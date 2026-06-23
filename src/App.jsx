import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Verification from './components/Verification';
import { Award, ShieldCheck, Search, Key } from 'lucide-react';
import { seedVerificationDb } from './utils/helpers';

export default function App() {
  const [user, setUser] = useState(null);
  const [activePortal, setActivePortal] = useState('public'); // 'public' (Verification) or 'admin' (GSA Login)

  useEffect(() => {
    // Seed verification database immediately on app start
    seedVerificationDb();

    // Check if user is logged in
    const storedUser = localStorage.getItem('gsa_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('gsa_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('gsa_user');
    setUser(null);
    setActivePortal('public');
  };

  // Renders GSA Ambassador Dashboard once authenticated
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Unauthenticated Landing Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex flex-col font-sans">
      {/* Background decoration elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '3s' }} />

      {/* Public Header */}
      <header className="w-full px-6 py-5 max-w-[1440px] mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-google-blue text-white rounded-xl shadow-md">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-base leading-tight block">GSA Certificate Portal</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              Google Student Ambassador Network
            </span>
          </div>
        </div>
        
        {/* Toggle between Verification and GSA Login */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 shadow-inner">
          <button
            onClick={() => setActivePortal('public')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all
              ${activePortal === 'public'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-google-green" />
            Verify Certificate
          </button>
          <button
            onClick={() => setActivePortal('admin')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all
              ${activePortal === 'admin'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Key className="h-3.5 w-3.5 text-google-blue" />
            Ambassador Access
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-10 flex flex-col justify-center items-center z-10">
        {activePortal === 'admin' ? (
          <div className="w-full max-w-md animate-float" style={{ animationIterationCount: 1, animationDuration: '0.6s' }}>
            <Login onLogin={handleLogin} />
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-8 animate-float" style={{ animationIterationCount: 1, animationDuration: '0.6s' }}>
            {/* Callouts */}
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                Verified Credentials Portal
              </h2>
              <p className="text-sm font-medium text-slate-500 max-w-xl mx-auto leading-relaxed">
                Google Student Ambassador certified distribution system. Enter a Certificate ID, participant name, or email below to check legitimacy.
              </p>
            </div>

            {/* Verification Widget */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-sky-100 p-8 shadow-xl">
              <Verification />
            </div>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="w-full border-t border-slate-100 py-6 text-center text-xs text-slate-400 bg-white/50 mt-auto">
        <p>&copy; 2026 Google Student Ambassador Program. Certified digital credential distribution service.</p>
      </footer>
    </div>
  );
}
