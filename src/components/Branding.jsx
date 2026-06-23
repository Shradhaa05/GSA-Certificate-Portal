import React, { useState, useEffect } from 'react';
import { Mail, Award, MessageSquare, Send, Check } from 'lucide-react';

const LinkedinIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Branding({ className = "", compact = false, showFeedbackForm = false }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const loadFeedbacks = () => {
      const stored = JSON.parse(localStorage.getItem('gsa_feedbacks') || '[]');
      setFeedbacks(stored);
    };
    loadFeedbacks();
    
    // Set up local storage listener for updates across tabs
    window.addEventListener('storage', loadFeedbacks);
    
    // Set up a custom interval to check periodically (e.g. every 2 seconds) in case of local updates
    const interval = setInterval(loadFeedbacks, 2000);
    
    return () => {
      window.removeEventListener('storage', loadFeedbacks);
      clearInterval(interval);
    };
  }, [submitted]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return;
    }

    const newFeedback = {
      id: `fb-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      message: formData.message,
      createdAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('gsa_feedbacks') || '[]');
    localStorage.setItem('gsa_feedbacks', JSON.stringify([newFeedback, ...existing]));

    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });

    // Auto reset submission notice after 4 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  const contactInfo = {
    name: 'Shradha Sangita Dash',
    linkedin: 'https://www.linkedin.com/in/shradhasangitadash/',
    email: 'shradhasangitadash@gmail.com'
  };

  if (compact) {
    return (
      <div className={`text-slate-500 border-t border-slate-100 pt-4 mt-auto text-center ${className}`}>
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Official Issuer</p>
        <p className="font-semibold text-slate-700 text-sm mt-1">{contactInfo.name}</p>
      </div>
    );
  }

  return (
    <div className={`glass-panel bg-white/70 border border-slate-100 rounded-2xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-google-red/10 text-google-red rounded-xl">
          <Award className="h-6 w-6" />
        </div>
        <div className="space-y-1 text-left">
          <span className="text-[10px] uppercase tracking-wider text-google-red font-extrabold">Official Issuer</span>
          <h3 className="text-lg font-bold text-slate-800 leading-tight">{contactInfo.name}</h3>
        </div>
      </div>

      {/* Contact buttons */}
      <div className="mt-4 border-t border-slate-100 pt-4 grid grid-cols-2 gap-2">
        {/* LinkedIn Button */}
        <a
          href={contactInfo.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn Profile"
          className="flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-100 bg-white/50 text-slate-600 hover:text-google-blue hover:bg-google-blue/5 hover:border-google-blue/30 transition-all duration-200 text-xs font-semibold"
        >
          <LinkedinIcon className="h-4 w-4" />
          <span>LinkedIn</span>
        </a>

        {/* Email Button */}
        <a
          href={`mailto:${contactInfo.email}`}
          title="Send Email"
          className="flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-100 bg-white/50 text-slate-600 hover:text-google-red hover:bg-google-red/5 hover:border-google-red/30 transition-all duration-200 text-xs font-semibold"
        >
          <Mail className="h-4 w-4" />
          <span>Email</span>
        </a>
      </div>

      {/* Feedback section underneath */}
      {showFeedbackForm && (
        <div className="mt-5 border-t border-slate-100 pt-5 text-left space-y-3">
          <div className="flex items-center gap-1.5 text-slate-700">
            <MessageSquare className="h-4 w-4 text-google-blue" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Share Feedback</h4>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl p-3 flex items-start gap-2 animate-pulse-ring">
              <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Feedback Submitted!</p>
                <p className="text-green-700 mt-0.5">Thank you! Shradha Dash will review your feedback in her admin workspace.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-google-blue/20 focus:border-google-blue transition-all"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-google-blue/20 focus:border-google-blue transition-all"
                />
              </div>
              <div>
                <textarea
                  required
                  rows="3"
                  placeholder="Write your feedback here: how is this portal useful, and what should I add?"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-google-blue/20 focus:border-google-blue transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-google-blue hover:bg-google-blue/90 text-white font-semibold text-xs transition-all active:scale-95 shadow-sm hover:shadow cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Feedback
              </button>
            </form>
          )}

          {/* Feedback & replies stream list */}
          {feedbacks.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center gap-1.5 text-slate-500 mb-2">
                <MessageSquare className="h-3.5 w-3.5 text-google-blue" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Feedbacks & Replies</span>
              </div>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="text-xs space-y-1.5 bg-white border border-slate-100 p-3 rounded-xl text-left shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">{fb.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-normal whitespace-pre-wrap">{fb.message}</p>
                    
                    {fb.reply && (
                      <div className="mt-2 pl-3 border-l-2 border-google-blue bg-blue-50/20 p-2 rounded-r-lg space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-extrabold uppercase text-google-blue">Ambassador Reply</span>
                          {fb.repliedAt && (
                            <span className="text-[8px] text-slate-400 font-medium">
                              {new Date(fb.repliedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 leading-normal font-medium whitespace-pre-wrap">{fb.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
