'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  Video, Trophy, User as UserIcon, LogOut, Bell, Search,
  Clock, CheckCircle, ArrowRight, CheckCircle2, CheckCheck, Menu
} from 'lucide-react';
import PortalSidebar from '@/components/PortalSidebar';

export default function TeamHeadDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Instant local state (No blank flash)
  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          return {
            name: u.name || u.fullName || 'Team Head',
            role: (u.role || 'TEAM HEAD').replace('_', ' ').toUpperCase(),
          };
        } catch (e) {}
      }
    }
    return { name: 'Team Head', role: 'TEAM HEAD' };
  });

  const [metrics, setMetrics] = useState({
    totalRegistrations: 0,
    pendingPayments: 0,
    approved: 0,
    upcomingEventsCount: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);

  // Notifications Popover Dropdown States
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [portalNotifications, setPortalNotifications] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login?redirect=/portal/dashboard');
      return;
    }
    fetchDashboardData();

    // 15 seconds auto-polling for real-time alerts
    const interval = setInterval(() => {
      fetchHeaderNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portal/dashboard');
      if (res.data?.success && res.data.data) {
        const { metrics: m, myRegistrations, registrations } = res.data.data;
        const targetRegs = Array.isArray(myRegistrations)
          ? myRegistrations
          : Array.isArray(registrations)
          ? registrations
          : [];

        if (m) {
          setMetrics({
            totalRegistrations: m.totalRegistrations ?? targetRegs.length,
            pendingPayments: m.pendingPayments ?? targetRegs.filter((r: any) => (r.registrationStatus || r.status || '').toLowerCase() !== 'approved').length,
            approved: m.approved ?? targetRegs.filter((r: any) => (r.registrationStatus || r.status || '').toLowerCase() === 'approved').length,
            upcomingEventsCount: m.upcomingEventsCount || 0,
          });
        }
        setRecentRegistrations(targetRegs.slice(0, 5));
        fetchHeaderNotifications(targetRegs);
      }
    } catch (err) {
      console.error('Error fetching portal dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeaderNotifications = async (currentRegs?: any[]) => {
    let fetchedList: any[] = [];

    // 1. Direct Backend Endpoint Call
    try {
      const res = await api.get('/portal/notifications');
      const list = res.data?.data || res.data?.notifications || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        fetchedList = list;
      }
    } catch (err) {
      try {
        const resFallback = await api.get('/api/v1/portal/notifications');
        const listFallback = resFallback.data?.data || resFallback.data?.notifications || resFallback.data || [];
        if (Array.isArray(listFallback) && listFallback.length > 0) {
          fetchedList = listFallback;
        }
      } catch (e) {}
    }

    // 2. Safe Fallback agar endpoint response na de
    if (fetchedList.length === 0) {
      const sourceRegs = currentRegs || recentRegistrations;
      if (Array.isArray(sourceRegs) && sourceRegs.length > 0) {
        fetchedList = sourceRegs.map((reg: any) => {
          const isApproved = (reg.registrationStatus || reg.status || '').toLowerCase() === 'approved';
          return {
            _id: reg._id,
            title: isApproved
              ? 'Registration Approved & Verified'
              : 'Payment Verification Under Review',
            message: isApproved
              ? `Registration #TLP-${String(reg._id || '').slice(-8).toUpperCase()} officially approve ho chuki hai. Accreditation pass available hai.`
              : `Registration #TLP-${String(reg._id || '').slice(-8).toUpperCase()} ki verification review mein hai.`,
            type: isApproved ? 'approval' : 'payment',
            isRead: isApproved,
            createdAt: reg.createdAt || new Date(),
          };
        });
      }
    }

    setPortalNotifications(fetchedList);
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
            <div className="relative w-36 sm:w-64 md:w-72 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tournament..."
                className="w-full pl-9 pr-3 sm:pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-600"
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

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <main className="p-8 space-y-8 flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#E63946] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {/* Welcome Banner */}
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                  <span>Welcome back, {userProfile.name}!</span>
                  <span className="text-2xl">👋</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Here&apos;s a live overview of your team&apos;s tournament activities, entries, and accreditation.
                </p>
              </div>

              {/* Metric Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Registrations</span>
                    <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{metrics.totalRegistrations}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Payments</span>
                    <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{metrics.pendingPayments}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Approved Entries</span>
                    <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{metrics.approved}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Open Events</span>
                    <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{metrics.upcomingEventsCount}</p>
                  </div>
                </div>
              </div>

              {/* Quick Action Navigation Card */}
              <div className="bg-gradient-to-r from-[#0A1128] to-[#1E3A8A] rounded-3xl p-7 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight">Need to register new athletes?</h3>
                  <p className="text-xs text-slate-300">
                    Browse all live tournaments, select sub-categories, and submit payment verifications.
                  </p>
                </div>
                <Link
                  href="/portal/events"
                  prefetch={true}
                  className="px-5 py-3 bg-[#E63946] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer flex-shrink-0"
                >
                  <span>Explore Tournaments</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Recent Registrations Table Section */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900">Recent Team Registrations</h3>
                  <Link href="/portal/slip" prefetch={true} className="text-xs font-bold text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>

                {recentRegistrations.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                    No recent registrations found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                          <th className="py-3 px-4">#</th>
                          <th className="py-3 px-4">Registration ID</th>
                          <th className="py-3 px-4">Athletes</th>
                          <th className="py-3 px-4">Payment Option</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        {recentRegistrations.map((reg, idx) => (
                          <tr key={reg._id || idx} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              #TLP-{String(reg._id || '').slice(-8).toUpperCase()}
                            </td>
                            <td className="py-3.5 px-4 font-black">
                              {Array.isArray(reg.athletes) ? reg.athletes.length : (Array.isArray(reg.players) ? reg.players.length : 1)} Players
                            </td>
                            <td className="py-3.5 px-4 uppercase font-bold text-blue-700">
                              {reg.paymentOption || 'Full'} Payment
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  (reg.registrationStatus || reg.status || '').toLowerCase() === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {reg.registrationStatus || reg.status || 'Under Review'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}