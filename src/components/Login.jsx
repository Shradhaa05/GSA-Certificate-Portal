import React, { useState } from 'react';
import { Award, Mail, User, ShieldAlert, BadgeCheck } from 'lucide-react';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    gid: '',
    email: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    gid: false,
    email: false,
  });

  const [errors, setErrors] = useState({
    name: '',
    gid: '',
    email: '',
  });

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field, value) => {
    let errorMsg = '';
    if (!value.trim()) {
      errorMsg = `${field === 'gid' ? 'GID/Google ID' : field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
    } else if (field === 'email' && !emailRegex.test(value)) {
      errorMsg = 'Please enter a valid email address.';
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: errorMsg
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors or revalidate on change if touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setFormData({ name: '', gid: '', email: '' });
    setTouched({ name: false, gid: false, email: false });
    setErrors({ name: '', gid: '', email: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Trigger touch and validation on all fields
    const newTouched = { name: true, gid: true, email: true };
    setTouched(newTouched);
    
    let isValid = true;
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
      isValid = false;
    }
    
    // Validate GID
    if (!formData.gid.trim()) {
      newErrors.gid = 'GID / Google ID is required.';
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      onLogin(formData);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-sky-100 shadow-xl p-8 transition-all duration-300 hover:shadow-2xl text-left">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">GSA Authorization</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        
        {/* Full Name */}
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-semibold text-slate-600 block">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="h-5 w-5" />
            </div>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Your full name"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 text-slate-800 placeholder-slate-400 transition-all duration-200 focus:bg-white
                ${touched.name && errors.name 
                  ? 'border-google-red focus:ring-google-red/20 focus:border-google-red' 
                  : touched.name && !errors.name
                    ? 'border-google-green focus:ring-google-green/20 focus:border-google-green'
                    : 'border-slate-200 focus:ring-google-blue/20 focus:border-google-blue'
                }`}
              required
            />
          </div>
          {touched.name && errors.name && (
            <p className="text-xs text-google-red font-medium flex items-center gap-1 mt-1 animate-pulse-ring">
              <ShieldAlert className="h-3.5 w-3.5" />
              {errors.name}
            </p>
          )}
        </div>

        {/* GID / Google ID */}
        <div className="space-y-1">
          <label htmlFor="gid" className="text-sm font-semibold text-slate-600 block">
            GID / Google ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <input
              type="text"
              id="gid"
              value={formData.gid}
              onChange={(e) => handleChange('gid', e.target.value)}
              onBlur={() => handleBlur('gid')}
              placeholder="e.g. GID-1002348"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 text-slate-800 placeholder-slate-400 transition-all duration-200 focus:bg-white
                ${touched.gid && errors.gid 
                  ? 'border-google-red focus:ring-google-red/20 focus:border-google-red' 
                  : touched.gid && !errors.gid
                    ? 'border-google-green focus:ring-google-green/20 focus:border-google-green'
                    : 'border-slate-200 focus:ring-google-blue/20 focus:border-google-blue'
                }`}
              required
            />
          </div>
          {touched.gid && errors.gid && (
            <p className="text-xs text-google-red font-medium flex items-center gap-1 mt-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              {errors.gid}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline">
            <label htmlFor="email" className="text-sm font-semibold text-slate-600 block">
              Email Address
            </label>
            <span className="text-[10px] text-slate-400">Format: user@example.com</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="user@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 text-slate-800 placeholder-slate-400 transition-all duration-200 focus:bg-white
                ${touched.email && errors.email 
                  ? 'border-google-red focus:ring-google-red/20 focus:border-google-red' 
                  : touched.email && !errors.email
                    ? 'border-google-green focus:ring-google-green/20 focus:border-google-green'
                    : 'border-slate-200 focus:ring-google-blue/20 focus:border-google-blue'
                }`}
              required
            />
          </div>
          {touched.email && errors.email && (
            <p className="text-xs text-google-red font-medium flex items-center gap-1 mt-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm transition-all hover:bg-slate-50 active:scale-95 cursor-pointer bg-white"
          >
            Clear Form
          </button>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-500/10 transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 cursor-pointer"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
