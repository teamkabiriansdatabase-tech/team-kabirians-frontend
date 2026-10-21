'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface FloatingWhatsAppProps {
  phoneNumber?: string; // Format: bina '+' ke, country code ke sath (e.g. 923001234567)
  supportMessage?: string;
}

export default function FloatingWhatsApp({
  phoneNumber = '923001234567', // <-- Apna official number yahan likhein
  supportMessage = 'Assalam-o-Alaikum! Mujhe Team Head Portal ke hawale se guidance chahiyay.'
}: FloatingWhatsAppProps) {
  const [showTooltip, setShowTooltip] = useState(true);

  const handleOpenWhatsApp = () => {
    const encodedText = encodeURIComponent(supportMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 print:hidden select-none">
      {/* Pop-up Hint Tooltip */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2.5 bg-white text-slate-800 text-xs font-bold py-2.5 px-4 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Need help? Chat with Admin</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md transition cursor-pointer ml-1"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Animated WhatsApp Button with Official Brand Icon */}
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        className="relative group w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer border-2 border-white/20"
        aria-label="Contact Support on WhatsApp"
        title="Chat on WhatsApp"
      >
        {/* Radar Pulse Effect */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping group-hover:opacity-50 pointer-events-none" />

        {/* Official WhatsApp Vector Logo */}
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current relative z-10"
        >
          <path d="M16.002 0.003c-8.834 0-15.998 7.164-15.998 15.998 0 2.824 0.738 5.578 2.14 7.994l-2.144 7.834 8.016-2.102c2.35 1.282 5.006 1.958 7.712 1.958 8.834 0 16-7.164 16-16s-7.166-15.998-15.998-15.998zM16.002 29.336c-2.482 0-4.912-0.666-7.038-1.928l-0.504-0.3-5.234 1.374 1.398-5.104-0.33-0.524c-1.392-2.214-2.128-4.786-2.128-7.424 0-7.628 6.208-13.834 13.836-13.834 7.626 0 13.834 6.206 13.834 13.834 0 7.626-6.208 13.836-13.834 13.836zM23.594 19.462c-0.416-0.208-2.464-1.216-2.846-1.354s-0.66-0.208-0.938 0.208c-0.278 0.416-1.074 1.354-1.318 1.632s-0.486 0.312-0.902 0.104c-0.416-0.208-1.758-0.648-3.348-2.066-1.236-1.102-2.072-2.464-2.314-2.88s-0.026-0.642 0.182-0.85c0.188-0.186 0.416-0.486 0.624-0.728 0.208-0.244 0.278-0.416 0.416-0.694s0.070-0.52-0.034-0.728c-0.104-0.208-0.938-2.26-1.284-3.096-0.338-0.814-0.682-0.704-0.938-0.716s-0.52-0.014-0.798-0.014c-0.278 0-0.728 0.104-1.11 0.52s-1.458 1.424-1.458 3.472 1.492 4.028 1.7 4.306c0.208 0.278 2.936 4.484 7.112 6.288 0.994 0.43 1.77 0.686 2.374 0.878 1 0.318 1.91 0.272 2.63 0.166 0.804-0.12 2.464-1.006 2.812-1.978 0.346-0.972 0.346-1.806 0.242-1.978s-0.38-0.278-0.796-0.486z" />
        </svg>

        {/* Small Active Green Dot */}
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-300 border-2 border-white rounded-full z-20 shadow-xs" />
      </button>
    </div>
  );
}