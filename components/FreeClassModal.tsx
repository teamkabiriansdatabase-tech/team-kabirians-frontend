'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, Sparkles, Send } from 'lucide-react';
import axios from 'axios';
import publicApi from '@/lib/publicApi';

export default function FreeClassModal() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
  });

  useEffect(() => {
    setMounted(true);
    const handleOpenModal = () => {
      setSubmitted(false);
      setErrorMessage(null);
      setIsOpen(true);
    };
    window.addEventListener('openFreeTrialModal', handleOpenModal);

    // Show the offer on the first page of each browsing session.
    const alreadyDismissed = sessionStorage.getItem('freeClassDismissed');
    const timer = alreadyDismissed ? undefined : window.setTimeout(() => setIsOpen(true), 450);

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('openFreeTrialModal', handleOpenModal);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    window.sessionStorage.setItem('freeClassDismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.age.trim()) {
      setErrorMessage('Please complete all four fields to request your free class.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      const response = await publicApi.post('/leads/free-class', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        age: Number(formData.age),
        source: 'Free Trial Class Popup',
      });

      if (!response.data?.success || response.data?.data?.emailSentToAdmin === false) {
        throw new Error(response.data?.message || 'Your request could not be emailed. Please try again.');
      }
      setSubmitted(true);
      window.setTimeout(handleClose, 2200);
    } catch (err: unknown) {
      const responseMessage = axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined;
      const message = responseMessage || (err instanceof Error ? err.message : 'Your request could not be sent. Please try again.');
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="free-class-title"
        aria-describedby="free-class-description"
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right × Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-slate-900">Thank you, {formData.name.trim()}!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your free trial request has been received. We’ll be in touch soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider mb-2 border border-red-100">
                <Sparkles className="w-3 h-3 text-red-500" />
                <span>Complimentary Session</span>
              </div>
              <h2 id="free-class-title" className="text-2xl font-black text-slate-900 leading-tight">
                BOOK YOUR <span className="text-[#DC2626]">FREE CLASS TRIAL</span>
              </h2>
              <p id="free-class-description" className="text-xs text-slate-500 mt-1">
                Take the first step towards a stronger you!
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                {errorMessage}
              </div>
            )}

            <div className="space-y-3 pt-1">
              {/* Field 1: Student Name */}
              <div className="space-y-1">
                <label htmlFor="free-class-name" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Student Name *
                </label>
                <input
                  type="text"
                  id="free-class-name"
                  name="name"
                  required
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Enter student full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white transition"
                />
              </div>

              {/* Field 2: Contact Number */}
              <div className="space-y-1">
                <label htmlFor="free-class-phone" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="free-class-phone"
                  name="phone"
                  required
                  maxLength={30}
                  autoComplete="tel"
                  placeholder="e.g. 03001234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white transition font-mono"
                />
              </div>

              {/* Field 3: Email Address */}
              <div className="space-y-1">
                <label htmlFor="free-class-email" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="free-class-email"
                  name="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white transition"
                />
              </div>

              {/* Field 4: Age */}
              <div className="space-y-1">
                <label htmlFor="free-class-age" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Student Age *
                </label>
                <input
                  type="number"
                  id="free-class-age"
                  name="age"
                  required
                  min={3}
                  max={100}
                  step={1}
                  placeholder="e.g. 12"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-red-600 bg-slate-50 focus:bg-white transition font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#DC2626] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'RESERVING...' : 'BOOK FREE TRIAL'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
