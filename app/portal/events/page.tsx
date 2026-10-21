'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  Video, Trophy, User as UserIcon, Search, ArrowRight,
  LogOut, Clock, ShieldCheck, FileDown, Layers, ChevronDown, ChevronUp, Monitor,
  Bell, CheckCircle2, CheckCheck, Menu
} from 'lucide-react';
import PortalSidebar from '@/components/PortalSidebar';

export default function PortalEventsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [userProfile, setUserProfile] = useState({ name: 'Team Head', role: 'Team Head' });
  
  // Track independent open category accordions per event card
  const [expandedEventIds, setExpandedEventIds] = useState<Record<string, boolean>>({});

  // Notifications Dropdown Popover States
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [portalNotifications, setPortalNotifications] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUserProfile({ name: u.name || 'Team Head', role: u.role || 'Team Head' });
      } catch (e) {}
    }
    fetchPortalEvents();
    fetchHeaderNotifications();

    // 15 seconds real-time auto-polling
    const interval = setInterval(() => {
      fetchHeaderNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchPortalEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portal/events');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setEvents(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching portal events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeaderNotifications = async () => {
    try {
      const res = await api.get('/portal/notifications');
      const list = res.data?.data || res.data?.notifications || res.data || [];
      if (Array.isArray(list)) setPortalNotifications(list);
    } catch (err) {
      try {
        const resFallback = await api.get('/api/v1/portal/notifications');
        const listFallback = resFallback.data?.data || [];
        if (Array.isArray(listFallback)) setPortalNotifications(listFallback);
      } catch (e) {}
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/portal/notifications/read-all');
    } catch (err) {
      try {
        await api.patch('/api/v1/portal/notifications/read-all');
      } catch (e) {}
    }
    setPortalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = portalNotifications.filter((n) => !n.isRead && !n.read).length;

  const handleSignOut = () => {
    localStorage.clear();
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    router.replace('/login');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'result':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'video_unlock':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActionLink = (type: string) => {
    switch (type) {
      case 'approval':
        return '/portal/slip';
      case 'result':
        return '/portal/results';
      case 'video_unlock':
        return '/portal/videos';
      case 'payment':
        return '/portal/payments';
      default:
        return '/portal/dashboard';
    }
  };

  const toggleEventCategories = (eventId: string) => {
    setExpandedEventIds((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : ev.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex font-sans text-slate-800 antialiased">
      {/* 1. SIDEBAR */}
      <PortalSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      {/* 2. MAIN VIEWPORT */}
      <div className="lg:pl-64 flex flex-col min-h-screen w-full min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-3 sm:px-8 flex items-center justify-between sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 lg:hidden bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-36 sm:w-64 md:w-80 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search tournaments by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 sm:pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-slate-50/50 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* NOTIFICATION BELL WITH DROPDOWN POPOVER */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63946] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN POPUP MENU */}
              {showNotifDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifDropdown(false)}
                  />

                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          Notifications
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {unreadCount} unread alerts
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {portalNotifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 space-y-1">
                          <Bell className="w-6 h-6 mx-auto opacity-30" />
                          <p className="text-xs font-bold text-slate-700">No new notifications</p>
                          <p className="text-[10px]">Approvals, video unlock, and results will appear here.</p>
                        </div>
                      ) : (
                        portalNotifications.slice(0, 10).map((n: any, idx: number) => {
                          const isRead = n.isRead || n.read;
                          const actionHref = getActionLink(n.type);

                          return (
                            <Link
                              key={n._id || idx}
                              href={actionHref}
                              onClick={() => setShowNotifDropdown(false)}
                              className={`p-3.5 text-xs transition flex items-start gap-3 cursor-pointer ${
                                isRead ? 'bg-white hover:bg-slate-50' : 'bg-red-50/30 hover:bg-red-50/50'
                              }`}
                            >
                              <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                                {getNotificationIcon(n.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-black text-slate-900 truncate">
                                    {n.title}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap">
                                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                  {n.message}
                                </p>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-[#1E3A8A] text-white font-black text-xs flex items-center justify-center shadow-xs">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-slate-900 leading-tight">
                  {userProfile.name}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {userProfile.role}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-600 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 3. MAIN CONTENT BODY */}
        <main className="p-8 space-y-6 flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Championships &amp; Tournaments
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Select an open tournament below to register your team&apos;s athletes and download event guidelines.
              </p>
            </div>

            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs self-start">
              {(['all', 'live', 'upcoming'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-[#0A1128] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'all' ? 'All Events' : tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">Loading tournaments...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-black text-slate-800">No Tournaments Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No events currently match your filter. Check back later or clear your search criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev, idx) => {
                const isLive = ev.status === 'live';
                const formattedDate = ev.eventDate
                  ? new Date(ev.eventDate).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'TBA';

                const formattedDeadline = ev.standardDeadline
                  ? new Date(ev.standardDeadline).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'TBA';

                const eventKey = String(ev._id || ev.id || `event-${idx}`);
                const isOpenAccordion = Boolean(expandedEventIds[eventKey]);
                const eventTypeLabel = ev.eventType || 'online';

                return (
                  <div
                    key={eventKey}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Banner Image with Status Badge & Event Type Badge */}
                    <div className="relative h-36 bg-gradient-to-br from-slate-900 to-[#101b3b] overflow-hidden">
                      {ev.coverImageUrl ? (
                        <img
                          src={ev.coverImageUrl}
                          alt={ev.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 to-indigo-900/40" />
                      )}

                      {/* Top Right Status Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                            isLive
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {isLive ? 'Live' : 'Upcoming'}
                        </span>
                      </div>

                      {/* Bottom Left Type Badge (Physical / Online) */}
                      <div className="absolute bottom-3 left-3 z-10">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
                          <Monitor className="w-3 h-3 text-cyan-400" />
                          <span>{eventTypeLabel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 space-y-4 flex-1">
                      {/* Title */}
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        {ev.title}
                      </h3>

                      {/* Official Rule Book PDF Button */}
                      {ev.rulesPdfUrl && (
                        <a
                          href={ev.rulesPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center justify-between shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <FileDown className="w-4 h-4 text-purple-600" />
                            <span>Official Rule Book (PDF)</span>
                          </div>
                          <span className="text-[10px] bg-purple-200/60 px-1.5 py-0.5 rounded">PDF</span>
                        </a>
                      )}

                      {/* Categories Accordion Section */}
                      <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-2">
                        <div 
                          onClick={() => toggleEventCategories(eventKey)}
                          className="flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            <span>Categories:</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-800 shadow-2xs">
                            <span>{ev.categories?.length || 0} Listed</span>
                            {isOpenAccordion ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                          </div>
                        </div>

                        {/* Collapsible Categories List */}
                        {isOpenAccordion && ev.categories && ev.categories.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-slate-200 max-h-48 overflow-y-auto pr-1">
                            {ev.categories.map((cat: any, cIdx: number) => (
                              <div key={cIdx} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                                <div className="flex justify-between items-center text-xs font-black text-slate-900">
                                  <span>{cat.name || cat.categoryName || 'Category'}</span>
                                  <span className="text-emerald-600 font-mono text-[11px]">
                                    PKR {cat.fee || cat.entryFee || '2,000'}
                                  </span>
                                </div>
                                {cat.subCategories && cat.subCategories.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {cat.subCategories.map((sub: any, sIdx: number) => (
                                      <span key={sIdx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                        {typeof sub === 'string' ? sub : sub.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Date & Standard Deadline Box */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="font-medium">Date:</span>
                          <span className="font-black text-slate-900 font-mono">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="font-medium">Standard Deadline:</span>
                          <span className="font-black text-slate-900 font-mono">{formattedDeadline}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button: Live par active, Upcoming par disabled */}
                    <div className="p-5 pt-0">
                      {isLive ? (
                        <Link
                          href={`/portal/events/${ev._id}/register`}
                          className="w-full py-3 bg-[#E63946] hover:bg-red-700 text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Register Athletes</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full py-3 bg-slate-100 text-slate-400 text-xs font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-200/60"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Registration Opening Soon (Upcoming)</span>
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
    </div>
  );
}