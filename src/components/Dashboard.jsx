import React, { useState, useEffect } from 'react';
import { 
  Award, FileSpreadsheet, CheckSquare, Search, LogOut, User, 
  Layers, BadgeCheck, Activity, Award as AwardIcon, CheckCircle,
  MessageSquare, Trash2, Edit, CornerDownRight
} from 'lucide-react';
import Generator from './Generator';
import BatchGenerator from './BatchGenerator';
import Verification from './Verification';
import Branding from './Branding';

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('single');
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', message: '' });
  const [replyingFeedbackId, setReplyingFeedbackId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Load feedbacks on mount and when active tab changes
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('gsa_feedbacks') || '[]');
    setFeedbacks(stored);
  }, [activeTab]);

  const handleDeleteFeedback = (id) => {
    const updated = feedbacks.filter(fb => fb.id !== id);
    setFeedbacks(updated);
    localStorage.setItem('gsa_feedbacks', JSON.stringify(updated));
  };

  const handleStartEdit = (fb) => {
    setEditingFeedbackId(fb.id);
    setEditForm({ name: fb.name, email: fb.email, message: fb.message });
  };

  const handleSaveEdit = (id) => {
    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.message.trim()) return;
    const updated = feedbacks.map(fb => 
      fb.id === id ? { ...fb, name: editForm.name, email: editForm.email, message: editForm.message } : fb
    );
    setFeedbacks(updated);
    localStorage.setItem('gsa_feedbacks', JSON.stringify(updated));
    setEditingFeedbackId(null);
  };

  const handleStartReply = (fb) => {
    setReplyingFeedbackId(fb.id);
    setReplyText(fb.reply || '');
  };

  const handleSaveReply = (id) => {
    if (!replyText.trim()) return;
    const updated = feedbacks.map(fb => 
      fb.id === id ? { ...fb, reply: replyText, repliedAt: new Date().toISOString() } : fb
    );
    setFeedbacks(updated);
    localStorage.setItem('gsa_feedbacks', JSON.stringify(updated));
    setReplyingFeedbackId(null);
    setReplyText('');
  };

  const handleDeleteReply = (id) => {
    const updated = feedbacks.map(fb => 
      fb.id === id ? { ...fb, reply: null, repliedAt: null } : fb
    );
    setFeedbacks(updated);
    localStorage.setItem('gsa_feedbacks', JSON.stringify(updated));
  };

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

              <button
                onClick={() => setActiveTab('feedback')}
                className={`w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-left text-sm font-bold transition-all duration-200
                  ${activeTab === 'feedback' 
                    ? 'bg-google-red text-white shadow-md shadow-google-red/10' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>Feedback</span>
                </div>
                {feedbacks.length > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0
                    ${activeTab === 'feedback' 
                      ? 'bg-white text-google-red' 
                      : 'bg-google-red text-white'
                    }`}
                  >
                    {feedbacks.length}
                  </span>
                )}
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
                {activeTab === 'feedback' && 'Feedback'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'single' && 'Generate customized Google Student Ambassador certificates with drag-and-drop overlays.'}
                {activeTab === 'batch' && 'Distribute certificates in batches by uploading a CSV spreadsheet template.'}
                {activeTab === 'verify' && 'Search, verify, and review credential signatures registered in the ledger database.'}
                {activeTab === 'feedback' && 'Review thoughts, submissions, and feedback shared by students about their credentials.'}
              </p>
            </div>
          </div>

          {/* Active Workspace Renderer */}
          <div className="transition-all duration-300">
            {activeTab === 'single' && <Generator user={user} />}
            {activeTab === 'batch' && <BatchGenerator user={user} />}
            {activeTab === 'verify' && <Verification />}
            {activeTab === 'feedback' && (
              <div className="glass-panel bg-white/70 border border-slate-100 rounded-3xl p-6 shadow-glass space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-800">Feedback</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      View reviews and suggestions submitted by participants of the GSA programs.
                    </p>
                  </div>
                  {feedbacks.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear all feedbacks?')) {
                          setFeedbacks([]);
                          localStorage.setItem('gsa_feedbacks', JSON.stringify([]));
                        }
                      }}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-google-red/20 text-google-red hover:bg-google-red/5 text-xs font-bold transition-all cursor-pointer bg-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear All
                    </button>
                  )}
                </div>

                {feedbacks.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No Feedbacks Submitted Yet</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      When students submit their feedback on the public verification page, they will show up here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {feedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        className="border border-slate-100 bg-white rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-all duration-200 relative group"
                      >
                        {editingFeedbackId === fb.id ? (
                          <div className="space-y-3 w-full">
                            <h4 className="text-xs font-extrabold uppercase text-google-blue">Edit Feedback</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-1">Student Name</label>
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-google-blue/20 focus:border-google-blue transition-all font-semibold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-1">Email Address</label>
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-google-blue/20 focus:border-google-blue transition-all font-semibold"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">Feedback Message</label>
                              <textarea
                                rows="3"
                                value={editForm.message}
                                onChange={(e) => setEditForm(prev => ({ ...prev, message: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-google-blue/20 focus:border-google-blue transition-all resize-none"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingFeedbackId(null)}
                                className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs transition-all hover:bg-slate-50 cursor-pointer bg-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(fb.id)}
                                className="py-1.5 px-3.5 rounded-lg bg-google-blue text-white font-semibold text-xs shadow-sm transition-all hover:bg-google-blue/90 cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-4 w-full">
                            {/* Avatar circle */}
                            <div className="h-10 w-10 rounded-full bg-google-blue/10 border border-google-blue/20 text-google-blue flex items-center justify-center font-bold text-sm uppercase shrink-0">
                              {fb.name.charAt(0)}
                            </div>

                            {/* Message details */}
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <div>
                                  <span className="font-bold text-slate-800 text-sm">{fb.name}</span>
                                  <span className="text-xs text-slate-400 ml-0 sm:ml-2 block sm:inline font-mono">{fb.email}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {new Date(fb.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">
                                {fb.message}
                              </p>

                              {/* Admin Reply section */}
                              <div className="mt-3 pt-3 border-t border-slate-50 space-y-2">
                                {fb.reply ? (
                                  <div className="flex items-start gap-2 bg-google-blue/5 border border-google-blue/10 rounded-xl p-3 text-left">
                                    <CornerDownRight className="h-4 w-4 text-google-blue shrink-0 mt-0.5" />
                                    <div className="space-y-1 flex-1 min-w-0">
                                      <div className="flex justify-between items-baseline">
                                        <span className="text-[10px] font-extrabold uppercase text-google-blue">Your Reply</span>
                                        {fb.repliedAt && (
                                          <span className="text-[9px] text-slate-400">
                                            {new Date(fb.repliedAt).toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{fb.reply}</p>
                                      <div className="flex gap-2 pt-1.5 justify-end">
                                        <button
                                          onClick={() => handleStartReply(fb)}
                                          className="text-[10px] font-bold text-google-blue hover:underline cursor-pointer"
                                        >
                                          Edit Reply
                                        </button>
                                        <button
                                          onClick={() => handleDeleteReply(fb.id)}
                                          className="text-[10px] font-bold text-google-red hover:underline cursor-pointer"
                                        >
                                          Delete Reply
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : replyingFeedbackId === fb.id ? (
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-left w-full">
                                    <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Draft Reply</span>
                                    <textarea
                                      rows="2"
                                      placeholder="Write your response to the student..."
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-google-blue/20 focus:border-google-blue transition-all resize-none font-medium"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setReplyingFeedbackId(null)}
                                        className="py-1 px-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-[10px] transition-all hover:bg-slate-50 cursor-pointer bg-white"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleSaveReply(fb.id)}
                                        className="py-1 px-3 rounded-lg bg-google-blue text-white font-bold text-[10px] shadow-sm transition-all hover:bg-google-blue/90 cursor-pointer"
                                      >
                                        Send Reply
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleStartReply(fb)}
                                    className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-google-blue hover:border-google-blue/30 hover:bg-google-blue/5 text-[10px] font-bold transition-all cursor-pointer bg-white"
                                  >
                                    <CornerDownRight className="h-3 w-3" />
                                    Reply to Student
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Edit / Delete Actions */}
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleStartEdit(fb)}
                                title="Edit Feedback"
                                className="p-1.5 rounded-lg border border-transparent hover:border-google-blue/10 text-slate-400 hover:text-google-blue hover:bg-google-blue/5 transition-all cursor-pointer bg-white"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteFeedback(fb.id)}
                                title="Delete Feedback"
                                className="p-1.5 rounded-lg border border-transparent hover:border-google-red/10 text-slate-400 hover:text-google-red hover:bg-google-red/5 transition-all cursor-pointer bg-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
