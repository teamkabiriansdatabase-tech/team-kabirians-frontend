'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { uploadDirectToCloudinary } from '@/lib/upload';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  Video, Trophy, User as UserIcon, ArrowRight, ArrowLeft,
  LogOut, Upload, CheckCircle2, Clock, AlertTriangle, X,
  ClipboardPaste, Bell, CheckCheck, Menu, ZoomIn
} from 'lucide-react';
import PortalSidebar from '@/components/PortalSidebar';

export default function PortalPaymentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fast Instant User Profile State
  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          return {
            name: u.name || 'Team Head',
            role: (u.role || 'TEAM HEAD').replace('_', ' ').toUpperCase(),
            id: u._id || u.id || '',
            email: u.email || '',
            phone: u.phone || u.phoneNumber || '',
          };
        } catch (e) {}
      }
    }
    return { name: 'Team Head', role: 'TEAM HEAD', id: '', email: '', phone: '' };
  });

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [eventsMap, setEventsMap] = useState<{ [key: string]: any }>({});
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedZoomSlip, setSelectedZoomSlip] = useState<string | null>(null);

  const [activeRemainingFormId, setActiveRemainingFormId] = useState<string | null>(null);
  const [secondTxId, setSecondTxId] = useState('');
  const [secondPayDate, setSecondPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [remainingSlipFile, setRemainingSlipFile] = useState<File | null>(null);
  const [submittingRemaining, setSubmittingRemaining] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Notifications Popover Dropdown States
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [portalNotifications, setPortalNotifications] = useState<any[]>([]);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 5000);
  };

  // Helper function to extract effective amount adjusted by Admin
  const getEffectiveAmount = (r: any): number => {
    if (!r) return 0;
    if (r.customAmount !== undefined && r.customAmount !== null && !isNaN(Number(r.customAmount))) {
      return Number(r.customAmount);
    }
    if (r.approvedAmount !== undefined && r.approvedAmount !== null && !isNaN(Number(r.approvedAmount))) {
      return Number(r.approvedAmount);
    }
    if (r.totalAmountPaid !== undefined && r.totalAmountPaid !== null && !isNaN(Number(r.totalAmountPaid))) {
      return Number(r.totalAmountPaid);
    }
    if (r.totalAmountDue !== undefined && r.totalAmountDue !== null && !isNaN(Number(r.totalAmountDue))) {
      return Number(r.totalAmountDue);
    }
    return Number(r.totalAmount || 0);
  };

  const isInternationalReg = (r: any): boolean => {
    if (!r) return false;
    if (r.isInternational === true || r.isInternational === 'true' || r.isUSD === true) return true;
    const curr = (r.currency || r.paymentCurrency || r.regCurrency || '').toUpperCase();
    if (curr === 'USD') return true;
    const country = (r.country || r.teamCountry || '').toLowerCase();
    if (country === 'international' || (country && country !== 'pakistan' && country !== 'pk')) return true;

    if (Array.isArray(r.athletes) && r.athletes.some((a: any) => (a.currency || '').toUpperCase() === 'USD' || a.isInternational === true)) {
      return true;
    }

    const amount = getEffectiveAmount(r);
    if (amount > 0 && amount <= 150) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.replace('/login?redirect=/portal/payments');
      return;
    }

    try {
      const u = JSON.parse(storedUser);
      fetchPaymentsData(u);
    } catch {
      router.replace('/login');
    }

    fetchHeaderNotifications();
    const interval = setInterval(() => {
      fetchHeaderNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  const getStoredReadIds = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('portal_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const fetchHeaderNotifications = async () => {
    let fetchedList: any[] = [];

    try {
      const res = await api.get('/portal/notifications');
      const list = res.data?.data || res.data?.notifications || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        fetchedList = list;
      }
    } catch (err) {
      try {
        const resFallback = await api.get('/api/v1/portal/notifications');
        const listFallback = resFallback.data?.data || [];
        if (Array.isArray(listFallback) && listFallback.length > 0) {
          fetchedList = listFallback;
        }
      } catch (e) {}
    }

    const storedReadIds = getStoredReadIds();
    const finalSyncedList = fetchedList.map((item: any) => {
      const itemId = String(item._id || '');
      const isAlreadyMarkedRead = storedReadIds.includes(itemId);
      return {
        ...item,
        isRead: isAlreadyMarkedRead ? true : Boolean(item.isRead || item.read),
      };
    });

    setPortalNotifications(finalSyncedList);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/portal/notifications/read-all');
    } catch (e) {
      try {
        await api.patch('/api/v1/portal/notifications/read-all');
      } catch (err) {}
    }

    const allIds = portalNotifications.map((n) => String(n._id || ''));
    const existing = getStoredReadIds();
    const combinedUnique = Array.from(new Set([...existing, ...allIds]));

    if (typeof window !== 'undefined') {
      localStorage.setItem('portal_read_notifications', JSON.stringify(combinedUnique));
    }

    setPortalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = portalNotifications.filter((n) => !n.isRead && !n.read).length;

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

  const fetchPaymentsData = async (currentUser: any) => {
    try {
      setLoading(true);
      let myRegs: any[] = [];
      let allEvents: any[] = [];

      try {
        const evRes = await api.get('/events');
        const eData = evRes.data?.data || evRes.data || [];
        if (Array.isArray(eData)) allEvents = eData;
      } catch (e) {
        console.warn('Events fetch fallback');
      }

      try {
        const res = await api.get('/portal/registrations');
        const rData = res.data?.data || res.data?.registrations || res.data || [];
        if (Array.isArray(rData)) myRegs = rData;
      } catch (e1) {
        try {
          const res2 = await api.get('/portal/dashboard');
          const d = res2.data?.data || {};
          if (Array.isArray(d.registrations)) myRegs = d.registrations;
        } catch (e2) {
          try {
            const res3 = await api.get('/admin/dashboard');
            const d3 = res3.data?.data || {};
            if (Array.isArray(d3.events) && allEvents.length === 0) allEvents = d3.events;
            if (Array.isArray(d3.registrations)) {
              const uId = String(currentUser._id || currentUser.id || '');
              const uEmail = (currentUser.email || '').toLowerCase();
              myRegs = d3.registrations.filter((r: any) => {
                const rUserId = String(r.userId?._id || r.userId || '');
                const rEmail = (r.email || r.coachEmail || r.userId?.email || '').toLowerCase();
                return (uId && rUserId === uId) || (uEmail && rEmail === uEmail);
              });
            }
          } catch (e3) {
            console.warn('Fallback payments fetch failed');
          }
        }
      }

      const evMap: { [key: string]: any } = {};
      allEvents.forEach((ev: any) => {
        const id = String(ev._id || ev.id);
        evMap[id] = ev;
      });

      setEventsMap(evMap);
      setRegistrations(myRegs);
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    router.replace('/login');
  };

  const getEventFromReg = (reg: any) => {
    const rawEv = reg.eventId || reg.event;
    if (typeof rawEv === 'object' && rawEv !== null && (rawEv._id || rawEv.id)) {
      const id = String(rawEv._id || rawEv.id);
      return {
        _id: id,
        title: rawEv.title || eventsMap[id]?.title || reg.eventTitle || 'Tournament Event',
        eventType: rawEv.eventType || eventsMap[id]?.eventType || 'physical',
        eventDate: rawEv.eventDate || eventsMap[id]?.eventDate || reg.createdAt,
      };
    }
    const idStr = String(rawEv || 'unknown');
    if (eventsMap[idStr]) return eventsMap[idStr];
    return {
      _id: idStr,
      title: reg.eventTitle || 'Tournament Event',
      eventType: 'physical',
      eventDate: reg.createdAt,
    };
  };

  const groupedEvents = (() => {
    const map: {
      [eventId: string]: {
        event: any;
        regs: any[];
        totalDuePKR: number;
        totalDueUSD: number;
        totalPaidPKR: number;
        totalPaidUSD: number;
      };
    } = {};

    registrations.forEach((reg) => {
      const ev = getEventFromReg(reg);
      const evId = String(ev._id || 'general');

      if (!map[evId]) {
        map[evId] = {
          event: ev,
          regs: [],
          totalDuePKR: 0,
          totalDueUSD: 0,
          totalPaidPKR: 0,
          totalPaidUSD: 0,
        };
      }

      const isUSD = isInternationalReg(reg);
      const amountVal = getEffectiveAmount(reg);

      map[evId].regs.push(reg);
      if (isUSD) {
        map[evId].totalDueUSD += amountVal;
        map[evId].totalPaidUSD += amountVal;
      } else {
        map[evId].totalDuePKR += amountVal;
        map[evId].totalPaidPKR += amountVal;
      }
    });

    return Object.values(map);
  })();

  const activeEventGroup = selectedEventId
    ? groupedEvents.find((g) => String(g.event._id) === String(selectedEventId))
    : null;

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
            {selectedEventId ? (
              <button
                onClick={() => {
                  setSelectedEventId(null);
                  setActiveRemainingFormId(null);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Events</span>
              </button>
            ) : (
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider truncate max-w-[200px] sm:max-w-none">
                Payments &amp; Ledger
              </span>
            )}
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
                          const isRead = Boolean(n.isRead || n.read);
                          const actionHref = getActionLink(n.type);

                          return (
                            <Link
                              key={n._id || idx}
                              href={actionHref}
                              onClick={() => {
                                const existing = getStoredReadIds();
                                if (!existing.includes(String(n._id))) {
                                  localStorage.setItem(
                                    'portal_read_notifications',
                                    JSON.stringify([...existing, String(n._id)])
                                  );
                                }
                                setShowNotifDropdown(false);
                              }}
                              className={`p-3.5 text-xs transition flex items-start gap-3 cursor-pointer ${
                                isRead ? 'bg-white hover:bg-slate-50 opacity-75' : 'bg-red-50/40 hover:bg-red-50/60 font-semibold'
                              }`}
                            >
                              <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                                {getNotificationIcon(n.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`truncate ${isRead ? 'text-slate-800' : 'text-slate-950 font-black'}`}>
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
                <div className="text-xs font-black text-slate-900 leading-tight">{userProfile.name}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{userProfile.role}</div>
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

        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          {notice && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition animate-in fade-in ${
                notice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {notice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{notice.message}</span>
              </div>
              <button onClick={() => setNotice(null)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#E63946] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">Loading payment records...</p>
            </div>
          ) : (
            <>
              {/* LEVEL 1: EVENTS LIST */}
              {!selectedEventId && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
                    <h1 className="text-xl font-black text-slate-900">Payments &amp; Financial Ledger</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select a tournament below to inspect your verified payment proof slips and enrollment ledger.
                    </p>
                  </div>

                  {groupedEvents.length === 0 ? (
                    <div className="bg-white rounded-3xl p-14 text-center border border-slate-200 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <CreditCard className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-black text-slate-900">No Payment Records Found</h3>
                      <Link
                        href="/portal/events"
                        prefetch={true}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A8A] text-white text-xs font-bold rounded-2xl shadow-xs"
                      >
                        <span>Register in a Tournament</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedEvents.map((group, idx) => {
                        const ev = group.event;
                        const allApproved = group.regs.every((r: any) => (r.registrationStatus || r.status || '').toLowerCase() === 'approved');
                        const anyAdjusted = group.regs.some((r: any) => r.approvedAmount !== undefined || r.customAmount !== undefined);

                        return (
                          <div
                            key={ev._id || idx}
                            onClick={() => setSelectedEventId(String(ev._id))}
                            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-[#1E3A8A] transition cursor-pointer flex flex-col justify-between space-y-5 group"
                          >
                            <div className="space-y-4">
                              <div className="flex justify-between items-start">
                                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                  <CreditCard className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {anyAdjusted && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200">
                                      Fee Adjusted by Admin
                                    </span>
                                  )}
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                    allApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                    {allApproved ? '✓ Verified & Enrolled' : 'Under Review'}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#1E3A8A] transition">
                                  {ev.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Tournament Date: {new Date(ev.eventDate || Date.now()).toLocaleDateString('en-GB')}
                                </p>
                              </div>

                              <div className="bg-slate-50 p-3.5 rounded-2xl border space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500 font-semibold">Total Fee (PKR):</span>
                                  <span className="font-mono font-black text-slate-900">PKR {group.totalDuePKR.toLocaleString()}</span>
                                </div>
                                {group.totalDueUSD > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-semibold">Total Fee (USD):</span>
                                    <span className="font-mono font-black text-blue-700">\${group.totalDueUSD.toLocaleString()} USD</span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                                  <span className="text-slate-500 font-semibold">Registered Batches:</span>
                                  <span className="font-mono font-black text-slate-700">{group.regs.length} {group.regs.length === 1 ? 'Batch' : 'Batches'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500 font-semibold">Payment Status:</span>
                                  <span className={`font-mono font-black ${allApproved ? 'text-emerald-700' : 'text-blue-700'}`}>
                                    {allApproved ? '100% Cleared' : 'Verification In Progress'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t flex items-center justify-between text-xs font-bold text-[#1E3A8A]">
                              <span>View Verified Slips &amp; Invoices</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* LEVEL 2: INSIDE SELECTED EVENT */}
              {selectedEventId && activeEventGroup && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
                    <button
                      onClick={() => {
                        setSelectedEventId(null);
                        setActiveRemainingFormId(null);
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to All Events
                    </button>
                    <h2 className="text-xl font-black text-slate-900">
                      {activeEventGroup.event.title} &mdash; Financial Ledger
                    </h2>
                  </div>

                  {/* SEPARATE PKR & USD METRIC COUNTERS (NO BACKSLASH) */}
                  {(() => {
                    const allApproved = activeEventGroup.regs.every((r: any) => (r.registrationStatus || r.status || '').toLowerCase() === 'approved');
                    const approvedCount = activeEventGroup.regs.filter((r: any) => (r.registrationStatus || r.status || '').toLowerCase() === 'approved').length;

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                        {/* 1. PKR Fee Counter */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                            Total Fee (PKR)
                          </span>
                          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                            PKR {activeEventGroup.totalDuePKR.toLocaleString()}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 mt-2 block">
                            {activeEventGroup.regs.filter((r: any) => !isInternationalReg(r)).length} Pakistani Batches
                          </span>
                        </div>

                        {/* 2. USD Dollar Fee Counter */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                            Total Fee (USD)
                          </span>
                          <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">
                            \${activeEventGroup.totalDueUSD.toLocaleString()} USD
                          </span>
                          <span className="text-[11px] font-bold text-blue-600 mt-2 block">
                            {activeEventGroup.regs.filter((r: any) => isInternationalReg(r)).length} International Batches
                          </span>
                        </div>

                        {/* 3. Payment Status */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                            Payment Status
                          </span>
                          <div className="mt-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border ${
                              allApproved
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {allApproved ? '✓ Verified / Approved' : 'Under Review'}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 mt-2 block">
                            {approvedCount} of {activeEventGroup.regs.length} Batches Approved
                          </span>
                        </div>

                        {/* 4. Payment Mode */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                            Payment Mode
                          </span>
                          <span className="text-sm font-black text-slate-900 mt-2 block">
                            Full Payment Verified
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 mt-2 block">
                            100% Cleared
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-6">
                    {activeEventGroup.regs.map((reg, idx) => {
                      const currentTotalFee = getEffectiveAmount(reg);
                      const isAdminOverridden = reg.approvedAmount !== undefined || reg.customAmount !== undefined;
                      const isRegUSD = isInternationalReg(reg);
                      const rawStatus = (reg.registrationStatus || reg.status || 'under_review').toLowerCase();
                      const isApproved = rawStatus === 'approved';
                      const officialSlip = reg.paymentSlipUrl || reg.paymentProofUrl || reg.slipUrl || reg.receiptUrl;

                      const athletesList = Array.isArray(reg.athletes) && reg.athletes.length > 0
                        ? reg.athletes
                        : Array.isArray(reg.players) && reg.players.length > 0
                        ? reg.players
                        : [];

                      const athleteNames = athletesList
                        .map((a: any) => a.name)
                        .filter(Boolean)
                        .join(', ');

                      const batchCode = `#TLP-${String(reg._id || '').slice(-8).toUpperCase()}`;

                      return (
                        <div key={reg._id || idx} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div className="flex items-start sm:items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-[#0A1128] text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                                #{idx + 1}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base font-black text-slate-900">
                                    Registration Batch <span className="font-mono text-[#1E3A8A]">{batchCode}</span>
                                  </h3>
                                  {athleteNames ? (
                                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#1E3A8A] border border-blue-200 text-xs font-black">
                                      {athleteNames}
                                    </span>
                                  ) : reg.teamName ? (
                                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                                      {reg.teamName}
                                    </span>
                                  ) : null}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-0.5">
                                  <span className="font-mono">
                                    TXN: <strong className="text-slate-600 font-semibold">{reg.transactionId || 'N/A'}</strong>
                                  </span>
                                  {reg.teamName && (
                                    <>
                                      <span>•</span>
                                      <span>Team: <strong className="text-slate-700">{reg.teamName}</strong></span>
                                    </>
                                  )}
                                  {athletesList.length > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-slate-600 font-medium">
                                        {athletesList.length} {athletesList.length === 1 ? 'Competitor' : 'Competitors'}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 items-center flex-wrap">
                              {isAdminOverridden && (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200">
                                  Fee Adjusted by Admin
                                </span>
                              )}
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {isApproved ? '✓ Verified & Cleared' : 'Under Review'}
                              </span>
                            </div>
                          </div>

                          {/* Single High-Res Slip & Fee Breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Left: Official Payment Slip */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="font-black text-slate-700 uppercase text-[10px] block">
                                  Official Payment Proof Slip
                                </span>
                                {officialSlip && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedZoomSlip(officialSlip)}
                                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                                  >
                                    <ZoomIn className="w-3.5 h-3.5" /> Click to Zoom
                                  </button>
                                )}
                              </div>

                              {officialSlip ? (
                                <div
                                  onClick={() => setSelectedZoomSlip(officialSlip)}
                                  className="h-52 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center p-1.5 cursor-pointer group relative"
                                  title="Click to view full-size high-res slip"
                                >
                                  <img
                                    src={officialSlip}
                                    alt="Payment Slip"
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                                    <ZoomIn className="w-4 h-4" /> Inspect Slip
                                  </div>
                                </div>
                              ) : (
                                <div className="h-52 rounded-xl bg-slate-200 flex flex-col items-center justify-center text-xs text-slate-400 font-bold gap-1">
                                  <CreditCard className="w-6 h-6 text-slate-400" />
                                  <span>No slip uploaded</span>
                                </div>
                              )}
                            </div>

                            {/* Right: Payment Ledger Details */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                              <span className="font-black text-slate-700 uppercase text-[10px] block">
                                Payment &amp; Package Summary
                              </span>

                              <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                                  <span className="text-slate-500 font-medium">Total Package Fee:</span>
                                  <div className="text-right">
                                    <strong className={`font-mono font-black text-sm ${isRegUSD ? 'text-blue-700' : 'text-slate-950'}`}>
                                      {isRegUSD ? `$${currentTotalFee.toLocaleString()} USD` : `PKR ${currentTotalFee.toLocaleString()}`}
                                    </strong>
                                    {isAdminOverridden && (
                                      <span className="block text-[10px] font-bold text-purple-700">
                                        (Fee Adjusted by Admin)
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                                  <span className="text-slate-500 font-medium">Payment Mode:</span>
                                  <strong className="text-slate-900 font-black">
                                    100% Full Payment
                                  </strong>
                                </div>

                                <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                                  <span className="text-slate-500 font-medium">Transaction Reference:</span>
                                  <strong className="font-mono text-slate-800 font-bold">
                                    {reg.transactionId || 'Direct Bank/Portal'}
                                  </strong>
                                </div>

                                <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                                  <span className="text-slate-500 font-medium">Payment Date:</span>
                                  <strong className="text-slate-800 font-medium">
                                    {reg.paymentDate ? new Date(reg.paymentDate).toLocaleDateString() : new Date(reg.createdAt || Date.now()).toLocaleDateString()}
                                  </strong>
                                </div>

                                <div className="flex justify-between items-center pt-1">
                                  <span className="text-slate-500 font-medium">Verification Status:</span>
                                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                                    isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                  }`}>
                                    {isApproved ? 'Approved & Enrolled' : 'Under Verification'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* HIGH-RES SLIP ZOOM MODAL */}
              {selectedZoomSlip && (
                <div
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in"
                  onClick={() => setSelectedZoomSlip(null)}
                >
                  <div
                    className="bg-white rounded-3xl p-4 max-w-4xl max-h-[90vh] flex flex-col space-y-3 shadow-2xl relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-xs font-black uppercase text-slate-500">Official Payment Slip (High-Res Inspection)</span>
                      <button
                        onClick={() => setSelectedZoomSlip(null)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="overflow-auto max-h-[75vh] flex items-center justify-center bg-slate-950 rounded-2xl p-2">
                      <img
                        src={selectedZoomSlip}
                        alt="High-Res Payment Slip"
                        className="max-w-full max-h-[72vh] object-contain rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <a
                        href={selectedZoomSlip}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-50 text-[#1E3A8A] font-bold text-xs rounded-xl hover:bg-blue-100 transition"
                      >
                        Open in New Tab
                      </a>
                      <button
                        onClick={() => setSelectedZoomSlip(null)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}