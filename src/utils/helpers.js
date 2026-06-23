import QRCode from 'qrcode';

/**
 * Generates a unique Certificate ID in the format: GSA-YYYYMMDD-XXXX
 */
export const generateCertificateId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GSA-${dateStr}-${randomStr}`;
};

/**
 * Simple and robust CSV parser
 * Handles standard commas, quotes, and whitespace.
 * Returns an array of { name: string, date: string }
 */
export const parseCSV = (csvText) => {
  if (!csvText) return [];
  
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];
  
  // Parse header to check order (Name, Date)
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const nameIndex = header.findIndex(h => h.includes('name'));
  const dateIndex = header.findIndex(h => h.includes('date'));
  const textIndex = header.findIndex(h => h.includes('text') || h.includes('desc') || h.includes('custom'));
  
  if (nameIndex === -1 || dateIndex === -1) {
    throw new Error('CSV must contain "Name" and "Date" columns.');
  }
  
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse line respecting quotes
    const columns = [];
    let insideQuote = false;
    let currentColumn = '';
    
    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        columns.push(currentColumn.trim());
        currentColumn = '';
      } else {
        currentColumn += char;
      }
    }
    columns.push(currentColumn.trim());
    
    // Clean columns from enclosing quotes
    const cleanedCols = columns.map(col => col.replace(/^"|"$/g, '').trim());
    
    const name = cleanedCols[nameIndex];
    const date = cleanedCols[dateIndex];
    const customText = textIndex !== -1 && cleanedCols[textIndex] ? cleanedCols[textIndex] : '';
    
    if (name && date) {
      results.push({ name, date, customText });
    }
  }
  
  return results;
};

/**
 * Generates QR Code Data URL as a Promise
 */
export const generateQRCode = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 150,
      color: {
        dark: '#202124', // google gray 900
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('QR Code generation failed', err);
    return '';
  }
};

/**
 * Pre-seed verification database with mock certificates if empty
 */
export const seedVerificationDb = () => {
  const existing = localStorage.getItem('gsa_certificates');
  if (!existing) {
    localStorage.setItem('gsa_certificates', JSON.stringify([]));
  } else {
    try {
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed)) {
        // Filter out the 3 default mock certificate IDs to clear them
        const cleaned = parsed.filter(cert => 
          cert.id !== 'GSA-20260615-RHLK' && 
          cert.id !== 'GSA-20260615-PRYS' && 
          cert.id !== 'GSA-20260615-AMND'
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('gsa_certificates', JSON.stringify(cleaned));
        }
      }
    } catch (e) {
      localStorage.setItem('gsa_certificates', JSON.stringify([]));
    }
  }
};

/**
 * Removes white or near-white background from an image Data URL,
 * returning a transparent PNG Data URL.
 */
export const removeImageBackground = (imageSrc, threshold = 200) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Loop through all pixels (R, G, B, A)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate brightness/white distance
        // If a pixel is bright (close to white), make it transparent
        if (r > threshold && g > threshold && b > threshold) {
          data[i + 3] = 0; // alpha = 0 (fully transparent)
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      resolve(imageSrc);
    };
  });
};

export const seedFeedbacksDb = () => {
  const existing = localStorage.getItem('gsa_feedbacks');
  if (!existing) {
    localStorage.setItem('gsa_feedbacks', JSON.stringify([]));
  } else {
    try {
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed)) {
        // Clear mock feedbacks from browser state if they exist
        const cleaned = parsed.filter(fb => fb.id !== 'fb-1' && fb.id !== 'fb-2');
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('gsa_feedbacks', JSON.stringify(cleaned));
        }
      }
    } catch (e) {
      localStorage.setItem('gsa_feedbacks', JSON.stringify([]));
    }
  }
};


