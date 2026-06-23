import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { parseCSV, generateCertificateId } from '../utils/helpers';

export default function BatchGenerator({ user }) {
  const [participants, setParticipants] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [templateUrl, setTemplateUrl] = useState('/Participation_Certificate.png');
  
  const fileInputRef = useRef(null);

  // File drag & drop handlers
  const handleDragOver = (e) => e.preventDefault();
  
  const handleFileDrop = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsDone(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileSelect = (e) => {
    setErrorMsg('');
    setIsDone(false);
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrorMsg('Invalid file format. Please upload a valid CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCSV(text);
        setParticipants(parsed);
        if (parsed.length === 0) {
          setErrorMsg('No valid rows found in CSV. Expected headers: Name, Date');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Error parsing CSV file.');
      }
    };
    reader.readAsText(file);
  };

  // Run canvas rendering in a loop & zip them
  const handleBatchGenerate = async () => {
    if (participants.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    setProgress(0);
    setIsDone(false);

    const zip = new JSZip();
    const existingCerts = JSON.parse(localStorage.getItem('gsa_certificates') || '[]');
    const newRecords = [];

    // Pre-load default assets
    const sigUrl = '/gsa_signature.png';

    // 1. Load Background Template
    const tempImg = new Image();
    tempImg.src = templateUrl;
    await new Promise(resolve => tempImg.onload = resolve);

    // 2. Load Signature
    const sigImg = new Image();
    sigImg.src = sigUrl;
    await new Promise(resolve => sigImg.onload = resolve);

    // Default positions (centered/bottom/right etc)
    const positions = {
      name: { x: 30, y: 44 },
      date: { x: 14, y: 76 },
      sig: { x: 68, y: 74 },
      customText: { x: 30, y: 55 }
    };

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const certId = generateCertificateId();
      
      // Update progress
      setProgress(Math.round(((i + 0.5) / participants.length) * 100));

      // QR Code generation removed per user request

      // Render to hidden canvas
      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 1414;
      const ctx = canvas.getContext('2d');

      // Draw Template background
      ctx.drawImage(tempImg, 0, 0, 2000, 1414);

      // Draw Participant Name (Red Bold)
      ctx.fillStyle = '#ea4335';
      ctx.font = '700 58px Outfit, Inter, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(p.name, (positions.name.x / 100) * 2000, (positions.name.y / 100) * 1414);

      // Draw Date (Slate Medium)
      ctx.fillStyle = '#3c4043';
      ctx.font = '500 28px Outfit, Inter, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(p.date, (positions.date.x / 100) * 2000, (positions.date.y / 100) * 1414);

      // Draw Custom Text
      if (p.customText) {
        ctx.fillStyle = '#3c4043';
        ctx.font = '500 32px Outfit, Inter, sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(p.customText, (positions.customText.x / 100) * 2000, (positions.customText.y / 100) * 1414);
      }

      // Draw Branding (removed per user request)

      // Draw Signature
      if (sigImg.complete && sigImg.naturalWidth > 0) {
        ctx.drawImage(sigImg, (positions.sig.x / 100) * 2000, (positions.sig.y / 100) * 1414, 200, 200 * (sigImg.height / sigImg.width));
      }

      // QR Code drawing removed per user request

      // Add to Zip
      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.split(',')[1];
      const filename = `GSA_Certificate_${p.name.replace(/\s+/g, '_')}.png`;
      zip.file(filename, base64Data, { base64: true });

      // Save to verification list
      newRecords.push({
        id: certId,
        name: p.name,
        date: p.date,
        customText: p.customText || '',
        email: 'student.participant@gsa.org',
        issuer: 'Shradha Sangita Dash',
        role: 'Google Student Ambassador',
        generatedBy: {
          name: user.name,
          gid: user.gid,
          email: user.email
        },
        createdAt: new Date().toISOString()
      });

      // Update progress tick
      setProgress(Math.round(((i + 1) / participants.length) * 100));
    }

    // Save all new records to localStorage
    localStorage.setItem('gsa_certificates', JSON.stringify([...newRecords, ...existingCerts]));

    // Generate Zip
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GSA_Batch_Certificates_${new Date().toISOString().slice(0, 10)}.zip`;
    link.click();
    
    URL.revokeObjectURL(url);
    setIsProcessing(false);
    setIsDone(true);

    // Explode Confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Upload Zone Card */}
      <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-8 shadow-glass text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Batch Certificate Distribution</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Upload a CSV file containing participant names and event dates to automatically generate signed certificates.
        </p>

        {/* Layout Template Selector */}
        <div className="max-w-xs mx-auto text-left space-y-1 pb-2">
          <label className="text-xs font-bold text-slate-600 block">Select Layout Template</label>
          <select
            value={templateUrl}
            onChange={(e) => setTemplateUrl(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-google-blue/20 focus:border-google-blue transition-all"
          >
            <option value="/Participation_Certificate.png">Participation Certificate</option>
            <option value="/Certificate_of_Participation_for_Music_Night.jpg">Music Night Participation</option>
            <option value="/Top_Lyria_Artist_for_Music_Night.jpg">Music Night Top Lyria Artist</option>
            <option value="/Certificate_of_Participation.png">General Participation</option>
            <option value="/Top_Prompt_Creator.png">Top Prompt Creator</option>
          </select>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current.click()}
          className="border-2 border-dashed border-slate-200 hover:border-google-blue hover:bg-google-blue/5 rounded-2xl p-8 cursor-pointer transition-all duration-200 group bg-white/50"
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-sky-50 text-google-blue group-hover:bg-google-blue group-hover:text-white rounded-full transition-all duration-200">
              <Upload className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-700">Drag & drop your CSV file here</p>
              <p className="text-xs text-slate-400">or click to browse from your device</p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            className="hidden"
          />
        </div>

        {errorMsg && (
          <p className="text-xs text-google-red font-medium flex items-center justify-center gap-1">
            <ShieldAlert className="h-4 w-4" />
            {errorMsg}
          </p>
        )}

        {/* Format layout helper */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-left text-xs max-w-sm mx-auto">
          <p className="font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5 text-google-green" />
            Required CSV Format Structure
          </p>
          <pre className="font-mono bg-slate-100 p-1.5 rounded text-[10px] text-slate-600 overflow-x-auto">
{`Name,Date,Text (Optional)
Rahul Kumar,15 June 2026,for outstanding performance
Priya Singh,15 June 2026,for excellence in web dev
Aman Das,15 June 2026,`}
          </pre>
        </div>
      </div>

      {/* Uploaded List & Controls */}
      {participants.length > 0 && (
        <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-6 shadow-glass space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-800">
                Ready to Process
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Loaded {participants.length} entries from the spreadsheet file.
              </p>
            </div>
            {!isProcessing && !isDone && (
              <button
                onClick={handleBatchGenerate}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-google-red text-white hover:bg-google-red/90 text-sm font-bold shadow-md shadow-google-red/10 transition-all active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
                Generate All Certificates
              </button>
            )}
          </div>

          {/* Progress Indicators */}
          {isProcessing && (
            <div className="space-y-2 p-4 bg-sky-50 rounded-xl border border-sky-100 animate-pulse">
              <div className="flex justify-between items-center text-xs font-semibold text-sky-800">
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Generating high-res canvas files...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-sky-200/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-google-blue rounded-full transition-all duration-200" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {isDone && (
            <div className="space-y-1.5 p-4 bg-green-50 rounded-xl border border-green-100 text-google-green text-sm flex items-start gap-2.5">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Batch Generation Complete!</p>
                <p className="text-xs text-green-700 mt-0.5">
                  All {participants.length} certificates have been drawn, registered in the local verification ledger, and exported as a ZIP archive.
                </p>
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Participant Name</th>
                  <th className="py-2.5 px-4">Event Date</th>
                  <th className="py-2.5 px-4">Custom Text</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((p, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 text-slate-700">
                    <td className="py-2 px-4 font-mono text-slate-400">{index + 1}</td>
                    <td className="py-2 px-4 font-semibold text-slate-800">{p.name}</td>
                    <td className="py-2 px-4">{p.date}</td>
                    <td className="py-2 px-4 text-slate-500 italic">{p.customText || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
