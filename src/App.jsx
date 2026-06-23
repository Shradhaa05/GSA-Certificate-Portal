import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { Award } from 'lucide-react';
import { seedVerificationDb, seedFeedbacksDb } from './utils/helpers';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Seed database immediately on app start
    seedVerificationDb();
    seedFeedbacksDb();

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
  };

  // Renders GSA Ambassador Dashboard once authenticated
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Unauthenticated Landing Page (Centred Login with branding header)
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex flex-col font-sans relative">
      {/* Background decoration elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '3s' }} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto px-6 py-16 flex flex-col justify-center items-stretch z-10 space-y-8">
        
        {/* Logo / Header area */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3.5 bg-google-blue text-white rounded-2xl shadow-lg shadow-google-blue/10 mb-2 animate-float">
            <Award className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            GSA Certificate Portal
          </h2>
          <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
            Google Student Ambassador Certificate Verification & Generation System
          </p>
        </div>

        {/* Authorization Form */}
        <div className="w-full max-w-md animate-float" style={{ animationIterationCount: 1, animationDuration: '0.6s' }}>
          <Login onLogin={handleLogin} />
        </div>
      </main>

      {/* Public Footer */}
      <footer className="w-full border-t border-slate-100 py-6 text-center text-xs text-slate-400 bg-white/50 mt-auto z-10">
        <p>&copy; 2026 Google Student Ambassador Program. Certified digital credential distribution service.</p>
      </footer>
    </div>
  );
}
