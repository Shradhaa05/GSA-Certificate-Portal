import React, { useState } from 'react';
import { 
  Award, FileSpreadsheet, CheckSquare, Search, LogOut, User, 
  Layers, BadgeCheck, Activity, Award as AwardIcon, CheckCircle
} from 'lucide-react';
import Generator from './Generator';
import BatchGenerator from './BatchGenerator';
import Verification from './Verification';
import Branding from './Branding';

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('single');

  // Simple stats for visual wow factor
  const getStats = () => {
    const certs = JSON.parse(localStorage.getItem('gsa_certificates') || '[]');
    return {
      total: certs.length,
      recent: certs.slice(0, 3)
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <nav className="glass-panel border-b border-slate-100 sticky top-0 z-40 bg-white/75 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-google-blue text-white rounded-xl shadow-md shadow-google-blue/10 animate-float">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-lg leading-tight">GSA Certificate Portal</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Google Student Ambassador Workspace
            </p>
          </div>
        </div>

        {/* User logout section */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{user.gid}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-google-blue/10 text-google-blue border border-google-blue/20 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
            {user.name.charAt(0)}
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-google-red rounded-xl hover:bg-google-red/5 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Sidebar Info Panels (4 cols) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Welcome GSA Profile card */}
          <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-6 shadow-glass space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-google-blue">Welcome Back</span>
              <h2 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">{user.name}</h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Google Student Ambassador</p>
            </div>
            
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-google-blue" />
                  Ambassador ID
                </span>
                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {user.gid}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Email Contact
                </span>
                <span className="font-medium text-slate-600 truncate max-w-[150px]" title={user.email}>
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-4 shadow-glass text-center space-y-1">
              <p className="text-xs text-slate-500 font-semibold">Total Verified</p>
              <p className="text-2xl font-black text-google-red">{stats.total}</p>
            </div>
            <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-4 shadow-glass text-center space-y-1">
              <p className="text-xs text-slate-500 font-semibold">GSA Status</p>
              <span className="inline-flex items-center justify-center text-[10px] font-black text-white bg-google-green px-2 py-0.5 rounded-full uppercase mt-1">
                Active
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-3 shadow-glass">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('single')}
                className={`w-full flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-left text-sm font-bold transition-all duration-200
                  ${activeTab === 'single' 
                    ? 'bg-google-red text-white shadow-md shadow-google-red/10' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                <Layers className="h-4 w-4" />
                Certificate Generator
              </button>

              <button
                onClick={() => setActiveTab('batch')}
                className={`w-full flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-left text-sm font-bold transition-all duration-200
                  ${activeTab === 'batch' 
                    ? 'bg-google-red text-white shadow-md shadow-google-red/10' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Batch CSV Distribution
              </button>

              <button
                onClick={() => setActiveTab('verify')}
                className={`w-full flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-left text-sm font-bold transition-all duration-200
                  ${activeTab === 'verify' 
                    ? 'bg-google-red text-white shadow-md shadow-google-red/10' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                <Search className="h-4 w-4" />
                Verification Ledger
              </button>
            </div>
          </div>

          {/* Official branding profile widget */}
          <Branding />

        </div>

        {/* Content Workspace Pane (9 cols) */}
        <div className="xl:col-span-9">
          
          {/* Display Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {activeTab === 'single' && 'Single Certificate Workspace'}
                {activeTab === 'batch' && 'Batch Certificate Workspace'}
                {activeTab === 'verify' && 'GSA Ledger Directory'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'single' && 'Generate customized Google Student Ambassador certificates with drag-and-drop overlays.'}
                {activeTab === 'batch' && 'Distribute certificates in batches by uploading a CSV spreadsheet template.'}
                {activeTab === 'verify' && 'Search, verify, and review credential signatures registered in the ledger database.'}
              </p>
            </div>
          </div>

          {/* Active Workspace Renderer */}
          <div className="transition-all duration-300">
            {activeTab === 'single' && <Generator user={user} />}
            {activeTab === 'batch' && <BatchGenerator user={user} />}
            {activeTab === 'verify' && <Verification />}
          </div>

        </div>

      </div>

      {/* Workspace Footer */}
      <footer className="border-t border-slate-100 bg-white/70 py-6 text-center text-xs text-slate-400 mt-auto">
        <p>&copy; 2026 Google Student Ambassador Program. Certified digital credential distribution service.</p>
      </footer>
    </div>
  );
}
