'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, Sparkles, Send } from 'lucide-react';
import api from '@/lib/api';

export default function FreeClassModal() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    preferredTime: 'Evening (5:00 PM - 7:00 PM)',
  });

  useEffect(() => {
    // 1. Client-side mount confirm karein
    setMounted(true);

    // 2. Agar user ne is session mein modal pehle band nahi kiya, tabhi 700ms baad open karein
    const alreadyDismissed = sessionStorage.getItem('freeClassDismissed');
    if (!alreadyDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('freeClassDismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Kripya apna naam aur phone number enter karein.');
      return;
    }

    try {
      setSubmitting(true);
      // Leads API call (Fail hone par bhi success card show hoga)
      try {
        await api.post('/leads', {
          ...formData,
          source: 'Free Trial Class Popup',
        });
      } catch (err) {
        console.warn('Lead submission API notice:', err);
      }

      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2500);
    } finally {
      setSubmitting(false);
    }
  };

  // Jab tak mounted aur isOpen true na hon, DOM mein 0 element rahega
  // Is se screen par koi invisible backdrop clicks block nahi karega
  if (!mounted || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-slate-900">Seat Reserved!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Shukriya! Team Kabirians training desk aapse jald rabta karegi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider mb-2 border border-red-100">
                <Sparkles className="w-3 h-3 text-red-500" />
                <span>Limited Free Offer</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                Book a Free Trial Class
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Professional Taekwondo training session free experience karein.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Apna poora naam likhein"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="03XX-XXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 16"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Preferred Slot</label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white"
                >
                  <option value="Morning (9:00 AM - 11:00 AM)">Morning (9:00 AM - 11:00 AM)</option>
                  <option value="Evening (5:00 PM - 7:00 PM)">Evening (5:00 PM - 7:00 PM)</option>
                  <option value="Night (7:30 PM - 9:30 PM)">Night (7:30 PM - 9:30 PM)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Reserving Slot...' : 'Claim Free Trial Now'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}