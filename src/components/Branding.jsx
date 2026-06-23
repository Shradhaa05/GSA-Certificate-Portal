import React from 'react';
import { Mail, Award } from 'lucide-react';

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

export default function Branding({ className = "", compact = false }) {
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
    </div>
  );
}
