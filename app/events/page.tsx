'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { 
  Calendar, MapPin, Trophy, ArrowRight, 
  FileText, Clock, AlertCircle, Layers, ChevronDown, ChevronUp, Lock
} from 'lucide-react';

export default function PublicEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/events');
        
        if (!isMounted) return;
        const data = res.data?.data || res.data || [];
        setEvents(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (!isMounted) return;
        setError('Events load karne mein masla hua. Kripya reload karein.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleCategoryExpand = (eventId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBA';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB');
    } catch {
      return dateStr;
    }
  };

  const getBadgeDetails = (ev: any) => {
    const rawStatus = String(ev.status || ev.eventStatus || '').toLowerCase().trim();

    if (rawStatus === 'live' || rawStatus === 'open' || rawStatus === 'active') {
      return {
        label: 'LIVE NOW',
        badgeClass: 'bg-[#DC2626] text-white',
        isOpen: true,
        buttonText: 'Register Athletes Now',
      };
    }

    if (rawStatus === 'upcoming') {
      return {
        label: 'UPCOMING',
        badgeClass: 'bg-[#059669] text-white',
        isOpen: false,
        buttonText: 'Coming Soon',
      };
    }

    if (rawStatus === 'closed' || rawStatus === 'ended' || rawStatus === 'completed') {
      return {
        label: 'CLOSED',
        badgeClass: 'bg-slate-700 text-white',
        isOpen: false,
        buttonText: 'Registration Closed',
      };
    }

    return {
      label: rawStatus ? rawStatus.toUpperCase() : 'UPCOMING',
      badgeClass: 'bg-[#059669] text-white',
      isOpen: false,
      buttonText: 'Coming Soon',
    };
  };

  const handleRegisterClick = (eventId: string, isOpen: boolean) => {
    if (!isOpen) return;

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push(`/login?redirect=/portal/events/${eventId}/register`);
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role === 'team_head') {
        router.push(`/portal/events/${eventId}/register`);
      } else {
        router.push(`/login?redirect=/portal/events/${eventId}/register`);
      }
    } catch {
      router.push(`/login?redirect=/portal/events/${eventId}/register`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-bold uppercase tracking-wider border border-blue-100">
            Tournament Calendar
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Current & Upcoming Competitions
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Browse active tournaments. Team Heads must log in to register athletes and submit entries.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-2xl w-full" />
                <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
                <div className="h-10 bg-slate-200 rounded-xl w-full mt-4" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-center space-y-3 max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs font-bold text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const eventId = ev._id || ev.id;
              const isOnline = ev.eventType === 'online' || ev.isOnline;
              const badge = getBadgeDetails(ev);
              const categories = Array.isArray(ev.categories) ? ev.categories : [];
              const isExpanded = Boolean(expandedCategories[eventId]);

              return (
                <div 
                  key={eventId}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="relative h-48 bg-slate-900 overflow-hidden">
                      {ev.coverImageUrl ? (
                        <img 
                          src={ev.coverImageUrl} 
                          alt={ev.title} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 to-blue-950 text-white font-black text-xl">
                          {ev.title?.slice(0, 3)?.toUpperCase() || 'TKD'}
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4">
                        <span className={`px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md ${badge.badgeClass}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/75 backdrop-blur-sm text-white shadow-md flex items-center gap-1.5">
                          <span>{isOnline ? '🌐' : '📍'}</span>
                          <span>{isOnline ? 'ONLINE' : 'PHYSICAL'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                          {ev.title}
                        </h2>
                        {ev.location && !isOnline && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ev.location}</span>
                          </div>
                        )}
                      </div>

                      {ev.ruleBookPdfUrl && (
                        <a
                          href={ev.ruleBookPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Official Rule Book (PDF)</span>
                        </a>
                      )}

                      {categories.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => toggleCategoryExpand(eventId)}
                            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                          >
                            <span className="flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-blue-600" />
                              <span>Categories:</span>
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-blue-600">
                              <span>{categories.length} Listed</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
                              {categories.map((cat: any, cIdx: number) => {
                                const catName = typeof cat === 'object' ? (cat.name || cat.title || `Category ${cIdx + 1}`) : String(cat);
                                const catFee = typeof cat === 'object' ? (cat.fee || 2000) : 2000;
                                const subCats = Array.isArray(cat?.subcategories) ? cat.subcategories : [];

                                return (
                                  <div key={cIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="font-bold text-slate-800">{catName}</span>
                                      <span className="font-mono font-bold text-emerald-600 text-[11px]">PKR {catFee}</span>
                                    </div>
                                    {subCats.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {subCats.map((sub: any, sIdx: number) => (
                                          <span key={sIdx} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                                            {typeof sub === 'object' ? sub.name : sub}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Date:</span>
                          </span>
                          <strong className="text-slate-800 font-mono">{formatDate(ev.eventDate)}</strong>
                        </div>
                        
                        {(ev.standardDeadline || ev.deadline) && (
                          <div className="flex justify-between font-semibold text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Deadline:</span>
                            </span>
                            <span className="font-mono">
                              {formatDate(ev.standardDeadline || ev.deadline)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    {badge.isOpen ? (
                      <button
                        type="button"
                        onClick={() => handleRegisterClick(eventId, true)}
                        className="w-full py-3.5 bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <span>{badge.buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-3.5 bg-slate-200 text-slate-500 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed select-none"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{badge.buttonText}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}