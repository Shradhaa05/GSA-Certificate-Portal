import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Image as ImageIcon, Type, Calendar, FileText, CheckCircle2, 
  Settings, Move, Sliders, Check, RefreshCw, Mail, Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import DraggableItem from './DraggableItem';
import { generateCertificateId, removeImageBackground } from '../utils/helpers';
import jsPDF from 'jspdf';

const FONT_FAMILIES = [
  { name: 'Outfit (Default Modern)', value: 'Outfit' },
  { name: 'Inter (Clean Sans)', value: 'Inter' },
  { name: 'Playfair Display (Elegant Serif)', value: 'Playfair Display' },
  { name: 'EB Garamond (Classic Scholar)', value: 'EB Garamond' },
  { name: 'Cinzel (Royal Serif)', value: 'Cinzel' },
  { name: 'Great Vibes (Calligraphy Cursive)', value: 'Great Vibes' },
  { name: 'Alex Brush (Traditional Script)', value: 'Alex Brush' }
];

export default function Generator({ user }) {
  // Input fields
  const [participantName, setParticipantName] = useState('Write Name');
  const [eventDate, setEventDate] = useState('15 June 2026');
  
  // Custom texts array (up to 5)
  const [customTexts, setCustomTexts] = useState([
    {
      id: 'ct1',
      text: 'for outstanding performance',
      show: true,
      x: 30,
      y: 55,
      fontSize: 16,
      fontWeight: 'normal',
      color: '#3c4043',
      fontFamily: 'Outfit'
    }
  ]);
  
  // Visibility toggles
  const [showName, setShowName] = useState(true);
  const [showDate, setShowDate] = useState(true);
  
  // Custom templates
  const [templateUrl, setTemplateUrl] = useState('/Participation_Certificate.png');
  const [sigUrl, setSigUrl] = useState('/gsa_signature.png');
  
  // File refs for hidden inputs
  const templateInputRef = useRef(null);
  const sigInputRef = useRef(null);

  // Generated metadata
  const [certId, setCertId] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

  // Positioning state (Percentages 0 - 100)
  const [positions, setPositions] = useState({
    name: { x: 30, y: 44 },
    date: { x: 14, y: 76 },
    sig: { x: 68, y: 74 }
  });

  // Active element selector for styling panel
  const [activeElement, setActiveElement] = useState('name');

  // Element Styling configurations
  const [styles, setStyles] = useState({
    name: { fontSize: 26, fontWeight: 'bold', color: '#ea4335', fontFamily: 'Outfit' },
    date: { fontSize: 13, fontWeight: 'normal', color: '#3c4043', fontFamily: 'Outfit' },
    sig: { scale: 0.9 }
  });

  const [recipientEmail, setRecipientEmail] = useState('');
  const [shareFormat, setShareFormat] = useState('pdf'); // 'pdf' or 'png'
  const [shareNotice, setShareNotice] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Derive structural values of custom texts to prevent resetting registration/IDs on layout drag/style changes
  const customTextsContent = customTexts.map(i => `${i.id}:${i.text}:${i.show}`).join('|');

  // Generate Unique ID on mount or Name/Date/CustomTexts change
  useEffect(() => {
    const id = generateCertificateId();
    setCertId(id);
    setIsGenerated(false);
  }, [participantName, eventDate, showName, showDate, customTextsContent]);

  // Adjust active element if it gets hidden
  useEffect(() => {
    if (activeElement === 'name' && !showName) setActiveElement('sig');
    if (activeElement === 'date' && !showDate) setActiveElement('sig');
    if (activeElement.startsWith('ct')) {
      const item = customTexts.find(i => i.id === activeElement);
      if (!item || !item.show) setActiveElement('sig');
    }
  }, [showName, showDate, customTexts, activeElement]);

  const handlePositionDrag = (element, newPos) => {
    if (typeof element === 'string' && element.startsWith('ct')) {
      setCustomTexts(prev => prev.map(item => 
        item.id === element ? { ...item, x: newPos.x, y: newPos.y } : item
      ));
    } else {
      setPositions(prev => ({
        ...prev,
        [element]: newPos
      }));
    }
  };

  const updateStyle = (element, key, value) => {
    if (typeof element === 'string' && element.startsWith('ct')) {
      setCustomTexts(prev => prev.map(item => 
        item.id === element ? { ...item, [key]: value } : item
      ));
    } else {
      setStyles(prev => ({
        ...prev,
        [element]: {
          ...prev[element],
          [key]: value
        }
      }));
    }
  };

  // Upload Template PNG
  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setTemplateUrl(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Upload Signature PNG
  const handleSigUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const transparentSig = await removeImageBackground(event.target.result);
        setSigUrl(transparentSig);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save to verification database in localStorage
  const handleRegisterCertificate = () => {
    if ((showName && !participantName.trim()) || (showDate && !eventDate.trim())) return;

    const newRecord = {
      id: certId,
      name: showName ? participantName : '',
      date: showDate ? eventDate : '',
      customTexts: customTexts.filter(i => i.show).map(i => ({ id: i.id, text: i.text, x: i.x, y: i.y })),
      email: recipientEmail.trim() || 'student.participant@gsa.org',
      issuer: 'Shradha Sangita Dash',
      role: 'Google Student Ambassador',
      generatedBy: {
        name: user.name,
        gid: user.gid,
        email: user.email
      },
      createdAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('gsa_certificates') || '[]');
    // Avoid duplicate records if clicking multiple times for same ID
    const exists = existing.find(c => c.id === certId);
    if (!exists) {
      localStorage.setItem('gsa_certificates', JSON.stringify([newRecord, ...existing]));
    }

    setIsGenerated(true);
    
    // Celebration Confetti!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  // High-Resolution canvas rendering logic
  const drawCertificateToCanvas = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 1414; // A4 Landscape ratio ~1.414
    const ctx = canvas.getContext('2d');

    // 1. Draw Template Image
    const tempImg = new Image();
    tempImg.src = templateUrl;
    await new Promise((resolve) => {
      tempImg.onload = resolve;
      tempImg.onerror = () => {
        // Fallback if image fails to load
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        resolve();
      };
    });
    ctx.drawImage(tempImg, 0, 0, 2000, 1414);

    // 2. Draw Participant Name
    if (showName) {
      ctx.fillStyle = styles.name.color;
      ctx.font = `${styles.name.fontWeight === 'bold' ? '700' : '500'} ${styles.name.fontSize * 2.2}px "${styles.name.fontFamily || 'Outfit'}", Outfit, Inter, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(participantName, (positions.name.x / 100) * 2000, (positions.name.y / 100) * 1414);
    }

    // 3. Draw Event Date
    if (showDate) {
      ctx.fillStyle = styles.date.color;
      ctx.font = `500 ${styles.date.fontSize * 2.2}px "${styles.date.fontFamily || 'Outfit'}", Outfit, Inter, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(eventDate, (positions.date.x / 100) * 2000, (positions.date.y / 100) * 1414);
    }

    // Draw Custom Texts
    customTexts.forEach(item => {
      if (item.show && item.text) {
        ctx.fillStyle = item.color;
        ctx.font = `${item.fontWeight === 'bold' ? '700' : '500'} ${item.fontSize * 2.2}px "${item.fontFamily || 'Outfit'}", Outfit, Inter, sans-serif`;
        ctx.textBaseline = 'top';
        ctx.fillText(item.text, (item.x / 100) * 2000, (item.y / 100) * 1414);
      }
    });

    // 4. Draw Branding Text (removed per user request)

    // 5. Draw Signature
    if (sigUrl) {
      const sigImg = new Image();
      sigImg.src = sigUrl;
      await new Promise((resolve) => {
        sigImg.onload = resolve;
        sigImg.onerror = resolve;
      });
      if (sigImg.complete && sigImg.naturalWidth > 0) {
        // scale width/height while maintaining aspect ratio
        const sigW = 220 * styles.sig.scale;
        const sigH = sigW * (sigImg.height / sigImg.width);
        ctx.drawImage(sigImg, (positions.sig.x / 100) * 2000, (positions.sig.y / 100) * 1414, sigW, sigH);
      }
    }

    // 6. Draw QR Code (removed per user request)

    return canvas;
  };

  const handleDownloadPNG = async () => {
    // If not registered yet, auto-register to database
    if (!isGenerated) {
      handleRegisterCertificate();
    }
    
    const canvas = await drawCertificateToCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `GSA_Certificate_${participantName.replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!isGenerated) {
      handleRegisterCertificate();
    }

    const canvas = await drawCertificateToCanvas();
    const imgData = canvas.toDataURL('image/png');
    
    // Create landscape PDF at same coordinate resolution
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [2000, 1414]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, 2000, 1414);
    pdf.save(`GSA_Certificate_${participantName.replace(/\s+/g, '_')}.pdf`);
  };

  const generatePDFBlob = async () => {
    const canvas = await drawCertificateToCanvas();
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [2000, 1414]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, 2000, 1414);
    return pdf.output('blob');
  };

  const generatePNGBlob = async () => {
    const canvas = await drawCertificateToCanvas();
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  };

  const uploadCertificate = async (format) => {
    try {
      let blob;
      let filename = `GSA_Certificate_${participantName.replace(/\s+/g, '_')}`;
      if (format === 'pdf') {
        blob = await generatePDFBlob();
        filename += '.pdf';
      } else {
        blob = await generatePNGBlob();
        filename += '.png';
      }

      const file = new File([blob], filename, { type: format === 'pdf' ? 'application/pdf' : 'image/png' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('expire', '86400'); // link expires in 24 hours

      const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const json = await response.json();
      if (json.status === 'success' && json.data?.url) {
        // Convert preview page link to direct download link: https://tmpfiles.org/dl/{id}/{name}
        return json.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
      }
      throw new Error('Invalid upload response structure');
    } catch (err) {
      console.error('Anonymous certificate upload failed:', err);
      return null;
    }
  };

  const handleShareNative = async () => {
    if (!recipientEmail.trim()) {
      alert('Please enter a recipient email.');
      return;
    }

    setIsUploading(true);
    setShareNotice('Generating certificate and opening share panel...');

    try {
      let blob;
      let filename = `GSA_Certificate_${participantName.replace(/\s+/g, '_')}`;
      let mimeType = '';
      if (shareFormat === 'pdf') {
        blob = await generatePDFBlob();
        filename += '.pdf';
        mimeType = 'application/pdf';
      } else {
        blob = await generatePNGBlob();
        filename += '.png';
        mimeType = 'image/png';
      }

      const file = new File([blob], filename, { type: mimeType });
      const subject = `Certified GSA Certificate - ${participantName}`;
      const body = `Hi ${participantName},

Thank you for participating in the Google Student Ambassador event.

Your certified GSA certificate has been generated and logged under ID: ${certId}.

Best wishes,
Shradha Sangita Dash
Google Student Ambassador`;

      const shareData = {
        files: [file],
        title: subject,
        text: body
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareNotice('Success! Certificate file shared successfully.');
      } else {
        throw new Error('Web Share API for files is not supported on this browser.');
      }
    } catch (err) {
      console.error('Sharing failed:', err);
      setShareNotice('Sharing failed or not supported. Please use Gmail Web or Mail Client options below.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setShareNotice(''), 6000);
    }
  };

  const handleSendMailto = async () => {
    if (!recipientEmail.trim()) return;

    setIsUploading(true);
    setShareNotice('Opening local mail client...');

    // Also download locally for admin's local copy/backup
    if (shareFormat === 'pdf') {
      await handleDownloadPDF();
    } else {
      await handleDownloadPNG();
    }

    const subject = `Certified GSA Certificate - ${participantName}`;
    const body = `Hi ${participantName},

Thank you for participating in the Google Student Ambassador event.

Your certified GSA certificate has been generated and logged under ID: ${certId}.

(Note: The certificate file (${shareFormat.toUpperCase()}) has been downloaded to your machine. Please attach it to this email draft.)

Best wishes,
Shradha Sangita Dash
Google Student Ambassador`;

    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoUrl;

    setIsUploading(false);
    setShareNotice('Success! Local mail client opened. Please attach the downloaded certificate.');
    setTimeout(() => setShareNotice(''), 6000);
  };

  const handleSendToGmail = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!recipientEmail.trim()) return;

    setIsUploading(true);
    setShareNotice('Uploading certificate to secure host & preparing Gmail...');

    // Try to upload certificate to tmpfiles.org
    const uploadedUrl = await uploadCertificate(shareFormat);

    // Also download locally for admin's local copy/backup
    if (shareFormat === 'pdf') {
      await handleDownloadPDF();
    } else {
      await handleDownloadPNG();
    }

    const subject = `Certified GSA Certificate - ${participantName}`;
    let body = '';

    if (uploadedUrl) {
      body = `Hi ${participantName},

Thank you for participating in the Google Student Ambassador event.

Your certified GSA certificate has been generated and logged under ID: ${certId}.

You can download your certificate directly using the link below:
${uploadedUrl}

(Note: The link will remain active for 24 hours. A copy has also been saved to your local downloads.)

Best wishes,
Shradha Sangita Dash
Google Student Ambassador`;
    } else {
      body = `Hi ${participantName},

Thank you for participating in the Google Student Ambassador event.

Your certified GSA certificate has been generated and logged under ID: ${certId}.

We have downloaded the certificate file (${shareFormat.toUpperCase()}) to your computer. Please attach the downloaded file from your Downloads folder to this email draft and send it.

Best wishes,
Shradha Sangita Dash
Google Student Ambassador`;
    }

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, '_blank');

    setIsUploading(false);
    if (uploadedUrl) {
      setShareNotice('Success! Gmail opened with the direct certificate download link prefilled in the body! You can also attach the downloaded file.');
    } else {
      setShareNotice('Gmail opened. Please drag & drop the downloaded certificate from your downloads folder.');
    }
    
    setTimeout(() => {
      setShareNotice('');
    }, 6000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Design Workspace: 7 cols */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Real-time Certificate Canvas Preview Wrapper */}
        <div className="glass-panel bg-white/70 rounded-2xl border border-slate-100 p-4 shadow-glass">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Move className="h-4 w-4 text-google-blue" />
              Live Interactive Workspace
            </h3>
            <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full uppercase">
              Drag elements to position
            </span>
          </div>

          {/* Scalable landscape viewport */}
          <div className="relative w-full aspect-[1.414/1] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-google-card certificate-preview-container">
            {/* Template image background */}
            <img 
              src={templateUrl} 
              alt="Template" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Draggable overlays */}
            
            {/* Participant Name */}
            {showName && (
              <DraggableItem
                position={positions.name}
                onDrag={(pos) => handlePositionDrag('name', pos)}
                label="Participant Name"
                active={activeElement === 'name'}
                onClick={() => setActiveElement('name')}
              >
                <div 
                  style={{ 
                    fontSize: `${styles.name.fontSize * 0.9}px`, // Scaled for live viewport size
                    fontWeight: styles.name.fontWeight === 'bold' ? '700' : '500',
                    color: styles.name.color,
                    fontFamily: styles.name.fontFamily || 'Outfit'
                  }}
                  className="leading-none px-2 py-1 select-none pointer-events-none select-none border border-transparent group-hover:border-dashed group-hover:border-slate-400"
                >
                  {participantName || 'Write Name'}
                </div>
              </DraggableItem>
            )}

            {/* Event Date */}
            {showDate && (
              <DraggableItem
                position={positions.date}
                onDrag={(pos) => handlePositionDrag('date', pos)}
                label="Event Date"
                active={activeElement === 'date'}
                onClick={() => setActiveElement('date')}
              >
                <div 
                  style={{ 
                    fontSize: `${styles.date.fontSize * 0.9}px`,
                    color: styles.date.color,
                    fontFamily: styles.date.fontFamily || 'Outfit'
                  }}
                  className="font-medium leading-none px-2 py-1 select-none pointer-events-none select-none border border-transparent group-hover:border-dashed group-hover:border-slate-400"
                >
                  {eventDate || '15 June 2026'}
                </div>
              </DraggableItem>
            )}

            {/* Custom Texts */}
            {customTexts.map((item) => {
              if (!item.show) return null;
              return (
                <DraggableItem
                  key={item.id}
                  position={{ x: item.x, y: item.y }}
                  onDrag={(pos) => handlePositionDrag(item.id, pos)}
                  label={`Custom Text (${item.text})`}
                  active={activeElement === item.id}
                  onClick={() => setActiveElement(item.id)}
                >
                  <div 
                    style={{ 
                      fontSize: `${item.fontSize * 0.9}px`,
                      fontWeight: item.fontWeight === 'bold' ? '700' : '500',
                      color: item.color,
                      fontFamily: item.fontFamily || 'Outfit'
                    }}
                    className="leading-none px-2 py-1 select-none pointer-events-none select-none border border-transparent group-hover:border-dashed group-hover:border-slate-400"
                  >
                    {item.text || 'Add custom text here'}
                  </div>
                </DraggableItem>
              );
            })}

            {/* Branding Text (removed per user request) */}

            {/* Signature image */}
            {sigUrl && (
              <DraggableItem
                position={positions.sig}
                onDrag={(pos) => handlePositionDrag('sig', pos)}
                label="Signature Image"
                active={activeElement === 'sig'}
                onClick={() => setActiveElement('sig')}
              >
                <img
                  src={sigUrl}
                  alt="Signature"
                  style={{ transform: `scale(${styles.sig.scale})` }}
                  className="h-10 object-contain origin-top-left pointer-events-none select-none border border-transparent group-hover:border-dashed group-hover:border-slate-400"
                />
              </DraggableItem>
            )}

            {/* QR Code image (removed per user request) */}

          </div>
        </div>

        {/* Certificate Actions Panel */}
        <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-6 shadow-glass flex flex-wrap gap-4 items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-extrabold text-slate-400">Current ID</p>
            <p className="font-mono text-sm font-semibold text-slate-700">{certId}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRegisterCertificate}
              className={`flex items-center gap-1.5 py-2.5 px-5 rounded-xl font-semibold text-sm transition-all active:scale-95
                ${isGenerated 
                  ? 'bg-google-green text-white cursor-default shadow-md shadow-google-green/10'
                  : 'bg-google-red text-white hover:bg-google-red/90 shadow-md shadow-google-red/10'
                }`}
            >
              {isGenerated ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Generated & Logged!
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Lock & Log Certificate
                </>
              )}
            </button>
            <button
              onClick={handleDownloadPNG}
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm transition-all hover:bg-slate-50 active:scale-95 shadow-sm bg-white"
            >
              <Download className="h-4 w-4 text-google-blue" />
              Download PNG
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm transition-all hover:bg-slate-50 active:scale-95 shadow-sm bg-white"
            >
              <FileText className="h-4 w-4 text-google-red" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Send & Share Options - Appears after Locking/Logging */}
        {isGenerated && (
          <div className="glass-panel bg-white/70 border border-google-green/20 rounded-2xl p-6 shadow-glass space-y-4 animate-float text-left" style={{ animationIterationCount: 1, animationDuration: '0.5s' }}>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-2 bg-google-blue/10 text-google-blue rounded-xl">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Send & Share Certificate</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Automatic Certificate Delivery</p>
              </div>
            </div>

            {shareNotice && (
              <div className="bg-sky-50 border border-sky-200 text-sky-800 text-xs rounded-xl p-3 flex items-start gap-2 animate-pulse-ring">
                <Check className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="font-semibold">{shareNotice}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gmail Address display/input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Recipient Email ID</label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="student.participant@gmail.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-google-blue/20 focus:border-google-blue transition-all"
                  />
                </div>

                {/* File Format Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Certificate Format (PDF or PNG)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShareFormat('pdf')}
                      className={`py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        shareFormat === 'pdf'
                          ? 'border-google-blue bg-google-blue/5 text-google-blue font-extrabold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setShareFormat('png')}
                      className={`py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        shareFormat === 'png'
                          ? 'border-google-blue bg-google-blue/5 text-google-blue font-extrabold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      PNG
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Action Options */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Choose Delivery Method</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Option 1: Web Share API (Attach File Directly) */}
                  <button
                    type="button"
                    onClick={handleShareNative}
                    disabled={isUploading || !recipientEmail.trim()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-google-green bg-google-green/5 text-google-green hover:bg-google-green/10 transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-center space-y-1.5"
                  >
                    <Send className="h-5 w-5 shrink-0" />
                    <span className="text-xs font-bold block">Share Directly</span>
                    <span className="text-[9px] font-semibold text-slate-400 block leading-tight">Attaches certificate file on mobile/mac</span>
                  </button>

                  {/* Option 2: Gmail Web Compose (With Direct Link) */}
                  <button
                    type="button"
                    onClick={() => handleSendToGmail()}
                    disabled={isUploading || !recipientEmail.trim()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white text-google-blue hover:bg-google-blue/5 hover:border-google-blue/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-center space-y-1.5"
                  >
                    <Mail className="h-5 w-5 shrink-0" />
                    <span className="text-xs font-bold block">Gmail Web</span>
                    <span className="text-[9px] font-semibold text-slate-400 block leading-tight">Drafts email with secure direct link</span>
                  </button>

                  {/* Option 3: Local Mail client (mailto) */}
                  <button
                    type="button"
                    onClick={handleSendMailto}
                    disabled={isUploading || !recipientEmail.trim()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-center space-y-1.5"
                  >
                    <Mail className="h-5 w-5 text-slate-500 shrink-0" />
                    <span className="text-xs font-bold block">Mail Client</span>
                    <span className="text-[9px] font-semibold text-slate-400 block leading-tight">Opens Apple Mail/Outlook draft</span>
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Editor Controls Side Panel: 4 cols */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Certificate Form Details */}
        <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-6 shadow-glass space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-google-red" />
            Certificate Details
          </h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-600">Participant Name</label>
                <label className="flex items-center gap-1 text-[10px] font-bold text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showName}
                    onChange={(e) => setShowName(e.target.checked)}
                    className="rounded border-slate-300 text-google-red focus:ring-google-red/20 h-3 w-3"
                  />
                  Enable
                </label>
              </div>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                disabled={!showName}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-google-red/20 focus:border-google-red transition-all disabled:opacity-50 disabled:bg-slate-50"
                placeholder="Participant Name"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-600">Event Date</label>
                <label className="flex items-center gap-1 text-[10px] font-bold text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showDate}
                    onChange={(e) => setShowDate(e.target.checked)}
                    className="rounded border-slate-300 text-google-red focus:ring-google-red/20 h-3 w-3"
                  />
                  Enable
                </label>
              </div>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                disabled={!showDate}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-google-red/20 focus:border-google-red transition-all disabled:opacity-50 disabled:bg-slate-50"
                placeholder="Event Date"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block text-left">Participant Email</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-google-red/20 focus:border-google-red transition-all"
                placeholder="student.participant@gmail.com"
              />
            </div>

            {customTexts.map((item, index) => (
              <div key={item.id} className="space-y-1.5 p-3 bg-slate-50/50 border border-slate-200/60 rounded-xl relative group/item">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600">Custom Text {index + 1}</label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={item.show}
                        onChange={(e) => {
                          setCustomTexts(prev => prev.map(val => 
                            val.id === item.id ? { ...val, show: e.target.checked } : val
                          ));
                        }}
                        className="rounded border-slate-300 text-google-red focus:ring-google-red/20 h-3 w-3"
                      />
                      Enable
                    </label>
                    {customTexts.length > 1 && (
                      <button
                        onClick={() => {
                          setCustomTexts(prev => prev.filter(val => val.id !== item.id));
                          if (activeElement === item.id) setActiveElement('sig');
                        }}
                        className="text-[10px] font-bold text-google-red hover:text-google-red/80 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    setCustomTexts(prev => prev.map(val => 
                      val.id === item.id ? { ...val, text: e.target.value } : val
                    ));
                  }}
                  disabled={!item.show}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-google-red/20 focus:border-google-red transition-all disabled:opacity-50 disabled:bg-slate-50"
                  placeholder={`Custom Text ${index + 1}`}
                />
              </div>
            ))}

            {/* Add Custom Text Button */}
            {customTexts.length < 5 && (
              <button
                onClick={() => {
                  const newId = `ct${Date.now()}`;
                  const lastY = customTexts[customTexts.length - 1]?.y || 50;
                  setCustomTexts(prev => [
                    ...prev,
                    {
                      id: newId,
                      text: `Custom Text ${prev.length + 1}`,
                      show: true,
                      x: 30,
                      y: Math.min(lastY + 8, 90),
                      fontSize: 16,
                      fontWeight: 'normal',
                      color: '#3c4043'
                    }
                  ]);
                  setActiveElement(newId);
                }}
                className="w-full py-2 border border-dashed border-slate-300 hover:border-google-red hover:bg-google-red/5 rounded-xl text-slate-600 hover:text-google-red text-xs font-semibold transition-all flex items-center justify-center gap-1.5 bg-white cursor-pointer"
              >
                + Add Custom Text ({customTexts.length}/5)
              </button>
            )}
          </div>
        </div>

        {/* Upload Assets Panel */}
        <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-6 shadow-glass space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-google-blue" />
            Branding Templates
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Choose Certificate Template
              </label>
              <select
                value={templateUrl}
                onChange={(e) => setTemplateUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:ring-google-blue/20 focus:border-google-blue transition-all mb-3"
              >
                <option value="/Participation_Certificate.png">Participation Certificate</option>
                <option value="/Certificate_of_Participation_for_Music_Night.jpg">Music Night Participation</option>
                <option value="/Top_Lyria_Artist_for_Music_Night.jpg">Music Night Top Lyria Artist</option>
                <option value="/Certificate_of_Participation.png">General Participation</option>
                <option value="/Top_Prompt_Creator.png">Top Prompt Creator</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Or Upload Custom Layout (PNG)
              </label>
              <button
                onClick={() => templateInputRef.current.click()}
                className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-xl text-slate-600 hover:text-google-blue hover:border-google-blue hover:bg-google-blue/5 text-xs font-medium transition-all flex items-center justify-center gap-1.5 bg-white"
              >
                <ImageIcon className="h-4 w-4" />
                Upload Custom Template
              </button>
              <input
                type="file"
                ref={templateInputRef}
                onChange={handleTemplateUpload}
                accept="image/png"
                className="hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Ambassador Signature PNG
              </label>
              <button
                onClick={() => sigInputRef.current.click()}
                className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-xl text-slate-600 hover:text-google-blue hover:border-google-blue hover:bg-google-blue/5 text-xs font-medium transition-all flex items-center justify-center gap-1.5 bg-white"
              >
                <ImageIcon className="h-4 w-4" />
                Upload Signature Image
              </button>
              <input
                type="file"
                ref={sigInputRef}
                onChange={handleSigUpload}
                accept="image/png"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Real-time Styling customizer */}
        <div className="glass-panel bg-white/70 border border-slate-100 rounded-2xl p-6 shadow-glass space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-google-yellow" />
            Style Properties
          </h3>

          {/* Quick tab controls */}
          <div className="flex bg-slate-100 p-1 rounded-xl flex-wrap gap-1">
            {[
              showName && 'name',
              showDate && 'date',
              ...customTexts.filter(item => item.show).map(item => item.id),
              'sig'
            ].filter(Boolean).map((el) => {
              let label = el;
              if (el === 'name') label = 'name';
              else if (el === 'date') label = 'date';
              else if (el === 'sig') label = 'sig';
              else if (el.startsWith('ct')) {
                const idx = customTexts.findIndex(item => item.id === el);
                label = `text ${idx + 1}`;
              }
              return (
                <button
                  key={el}
                  onClick={() => setActiveElement(el)}
                  className={`py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all
                    ${activeElement === el 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            {/* Name Styles Controls */}
            {activeElement === 'name' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Font Size</span>
                    <span>{styles.name.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="50"
                    value={styles.name.fontSize}
                    onChange={(e) => updateStyle('name', 'fontSize', parseInt(e.target.value))}
                    className="w-full accent-google-red"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Font Family</label>
                  <select
                    value={styles.name.fontFamily || 'Outfit'}
                    onChange={(e) => updateStyle('name', 'fontFamily', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-google-red/20 focus:border-google-red transition-all cursor-pointer"
                  >
                    {FONT_FAMILIES.map(font => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Text Weight</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateStyle('name', 'fontWeight', 'normal')}
                      className={`py-1.5 border rounded-lg text-xs font-medium transition-all ${
                        styles.name.fontWeight === 'normal'
                          ? 'border-google-red bg-google-red/5 text-google-red'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => updateStyle('name', 'fontWeight', 'bold')}
                      className={`py-1.5 border rounded-lg text-xs font-bold transition-all ${
                        styles.name.fontWeight === 'bold'
                          ? 'border-google-red bg-google-red/5 text-google-red'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Bold
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Text Color</label>
                  <div className="flex gap-2">
                    {['#ea4335', '#1a73e8', '#202124', '#34a853', '#fbbc05'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateStyle('name', 'color', color)}
                        style={{ backgroundColor: color }}
                        className={`h-6 w-6 rounded-full border border-slate-300 flex items-center justify-center transition-all hover:scale-110 ${
                          styles.name.color === color ? 'ring-2 ring-slate-400 ring-offset-1' : ''
                        }`}
                      >
                        {styles.name.color === color && <Check className="h-3 w-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Date Styles Controls */}
            {activeElement === 'date' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Font Size</span>
                    <span>{styles.date.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={styles.date.fontSize}
                    onChange={(e) => updateStyle('date', 'fontSize', parseInt(e.target.value))}
                    className="w-full accent-google-red"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Font Family</label>
                  <select
                    value={styles.date.fontFamily || 'Outfit'}
                    onChange={(e) => updateStyle('date', 'fontFamily', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-google-red/20 focus:border-google-red transition-all cursor-pointer"
                  >
                    {FONT_FAMILIES.map(font => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Text Color</label>
                  <div className="flex gap-2">
                    {['#3c4043', '#ea4335', '#1a73e8', '#202124'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateStyle('date', 'color', color)}
                        style={{ backgroundColor: color }}
                        className={`h-6 w-6 rounded-full border border-slate-300 flex items-center justify-center transition-all hover:scale-110 ${
                          styles.date.color === color ? 'ring-2 ring-slate-400 ring-offset-1' : ''
                        }`}
                      >
                        {styles.date.color === color && <Check className="h-3 w-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Custom Text Styles Controls */}
            {activeElement.startsWith('ct') && (() => {
              const activeItem = customTexts.find(i => i.id === activeElement);
              if (!activeItem) return null;
              return (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Font Size</span>
                      <span>{activeItem.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="45"
                      value={activeItem.fontSize}
                      onChange={(e) => updateStyle(activeItem.id, 'fontSize', parseInt(e.target.value))}
                      className="w-full accent-google-red"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Font Family</label>
                    <select
                      value={activeItem.fontFamily || 'Outfit'}
                      onChange={(e) => updateStyle(activeItem.id, 'fontFamily', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-google-red/20 focus:border-google-red transition-all cursor-pointer"
                    >
                      {FONT_FAMILIES.map(font => (
                        <option key={font.value} value={font.value}>{font.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Text Weight</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateStyle(activeItem.id, 'fontWeight', 'normal')}
                        className={`py-1.5 border rounded-lg text-xs font-medium transition-all ${
                          activeItem.fontWeight === 'normal'
                            ? 'border-google-red bg-google-red/5 text-google-red'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        onClick={() => updateStyle(activeItem.id, 'fontWeight', 'bold')}
                        className={`py-1.5 border rounded-lg text-xs font-bold transition-all ${
                          activeItem.fontWeight === 'bold'
                            ? 'border-google-red bg-google-red/5 text-google-red'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Bold
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Text Color</label>
                    <div className="flex gap-2">
                      {['#3c4043', '#ea4335', '#1a73e8', '#202124', '#34a853', '#fbbc05'].map((color) => (
                        <button
                          key={color}
                          onClick={() => updateStyle(activeItem.id, 'color', color)}
                          style={{ backgroundColor: color }}
                          className={`h-6 w-6 rounded-full border border-slate-300 flex items-center justify-center transition-all hover:scale-110 ${
                            activeItem.color === color ? 'ring-2 ring-slate-400 ring-offset-1' : ''
                          }`}
                        >
                          {activeItem.color === color && <Check className="h-3 w-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Brand Styles Controls (removed per user request) */}

            {/* Signature Scale Controls */}
            {activeElement === 'sig' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Image Scale</span>
                  <span>{Math.round(styles.sig.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={styles.sig.scale * 10}
                  onChange={(e) => updateStyle('sig', 'scale', parseFloat(e.target.value) / 10)}
                  className="w-full accent-google-red"
                />
              </div>
            )}

            {/* QR Code Scale Controls (removed per user request) */}
          </div>
        </div>

      </div>
    </div>
  );
}
