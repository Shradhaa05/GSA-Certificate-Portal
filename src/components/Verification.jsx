import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, User, Calendar, Tag, UserCheck, Mail, Library } from 'lucide-react';

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
import { seedVerificationDb } from '../utils/helpers';

export default function Verification() {
  const [searchQuery, setSearchQuery] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [showDirectory, setShowDirectory] = useState(true);

  // Load certificates and seed DB if empty on mount
  useEffect(() => {
    seedVerificationDb();
    const stored = JSON.parse(localStorage.getItem('gsa_certificates') || '[]');
    // Sort by creation date or ID descending
    const sorted = stored.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setCertificates(sorted);
    setSearchResults(sorted);
  }, []);

  // Filter list on search query change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(certificates);
      return;
    }
    
    const query = searchQuery.trim().toLowerCase();
    const filtered = certificates.filter(cert => {
      return (
        cert.id.toLowerCase().includes(query) ||
        cert.name.toLowerCase().includes(query) ||
        (cert.email && cert.email.toLowerCase().includes(query))
      );
    });
    setSearchResults(filtered);
  }, [searchQuery, certificates]);

  const handleSelectCertificate = (cert) => {
    setSelectedCert(cert);
    // Smooth scroll to the details view on mobile
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Header panel */}
      <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-6 shadow-glass space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Credential Verification Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify the authenticity of Google Student Ambassador (GSA) certificates.
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setShowDirectory(true)}
              className={`flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all
                ${showDirectory 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Library className="h-3.5 w-3.5" />
              Certificate Directory
            </button>
            <button
              onClick={() => {
                setShowDirectory(false);
                setSelectedCert(null);
              }}
              className={`flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all
                ${!showDirectory 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Search className="h-3.5 w-3.5" />
              Search Lookup
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by unique Certificate ID, participant name, or email..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-google-red/20 focus:border-google-red transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Results List: Left column (7 cols if details selected, otherwise 12) */}
        <div className={`space-y-4 ${selectedCert ? 'md:col-span-6' : 'md:col-span-12'}`}>
          <div className="flex justify-between items-center px-1">
            <h4 className="text-sm font-bold text-slate-700">
              {searchQuery.trim() ? `Search Results (${searchResults.length})` : `Verified Certificates (${certificates.length})`}
            </h4>
            {selectedCert && (
              <button 
                onClick={() => setSelectedCert(null)}
                className="text-xs text-google-blue font-semibold hover:underline md:hidden"
              >
                Close details
              </button>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-8 text-center space-y-3">
              <ShieldCheck className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Credentials Found</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No verified records matched your query "{searchQuery}". Please check the ID or spelling and try again.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {searchResults.map((cert) => (
                <div
                  key={cert.id}
                  onClick={() => handleSelectCertificate(cert)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 text-left bg-white
                    ${selectedCert?.id === cert.id 
                      ? 'border-google-blue bg-google-blue/5 ring-1 ring-google-blue' 
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {cert.id}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-green-100 text-green-800 font-extrabold px-1.5 py-0.5 rounded-full">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          VERIFIED
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm pt-1">{cert.name}</h5>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {cert.date}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Issuer</p>
                      <p className="text-[10px] font-bold text-slate-600">GSA Ambassador</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Certificate Verification details card: Right Column */}
        {selectedCert && (
          <div className="md:col-span-6 glass-panel bg-white/70 border border-google-blue/20 rounded-2xl p-6 shadow-glass space-y-5 animate-float" style={{ animationIterationCount: 1, animationDuration: '0.8s' }}>
            
            {/* Checked stamp */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-google-green/10 text-google-green rounded-2xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-1">
                  Credential Authenticated
                </h4>
                <p className="text-xs text-google-green font-bold">100% Genuine GSA Record</p>
              </div>
            </div>

            {/* Details panel */}
            <div className="space-y-3.5">
              {/* ID */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  Certificate ID
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedCert.id}
                </span>
              </div>

              {/* Recipient */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Participant Name
                </span>
                <span className="text-xs font-bold text-slate-800">{selectedCert.name}</span>
              </div>

              {/* Event Date */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Certified Date
                </span>
                <span className="text-xs font-semibold text-slate-700">{selectedCert.date}</span>
              </div>

              {/* Verified Issuer */}
              <div className="flex justify-between items-start border-b border-slate-50 pb-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                  Certified By
                </span>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block">{selectedCert.issuer}</span>
                  <span className="text-[10px] text-google-blue font-bold uppercase">{selectedCert.role}</span>
                </div>
              </div>

              {/* Registry User Log */}
              {selectedCert.generatedBy && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-left space-y-1">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Ambassador System Signature</p>
                  <p className="text-[11px] font-semibold text-slate-600">
                    Logged By: {selectedCert.generatedBy.name} ({selectedCert.generatedBy.gid})
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Timestamp: {new Date(selectedCert.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Verification contact link drawer */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-[10px] uppercase font-extrabold text-slate-400">Ambassador Contacts</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://www.linkedin.com/in/shradhasangitadash/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 p-2 rounded-xl border border-slate-100 text-slate-600 hover:text-google-blue hover:bg-google-blue/5 hover:border-google-blue/30 transition-all text-xs font-semibold"
                >
                  <LinkedinIcon className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
                <a
                  href={`mailto:shradhasangitadash@gmail.com`}
                  className="flex items-center justify-center gap-1 p-2 rounded-xl border border-slate-100 text-slate-600 hover:text-google-red hover:bg-google-red/5 hover:border-google-red/30 transition-all text-xs font-semibold"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
