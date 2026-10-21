'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Bell, Search, LogOut, CheckCircle2, Trophy, Video,
  CreditCard, CheckCheck
} from 'lucide-react';

interface PortalHeaderProps {
  title?: string;
  searchPlaceholder?: string;
}

export default function PortalHeader({ searchPlaceholder = 'Search tournament...' }: PortalHeaderProps) {
  const router = useRouter();

  // Instant local state
  const [userProfile] = useState(() => {
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

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [portalNotifications, setPortalNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchHeaderNotifications();
    const interval = setInterval(fetchHeaderNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchHeaderNotifications = async () => {
    try {
      const res = await api.get('/portal/notifications');
      const list = res.data?.data || res.data?.notifications || res.data || [];
      if (Array.isArray(list)) setPortalNotifications(list);
    } catch (err) {
      try {
        const resFallback = await api.get('/api/v1/portal/notifications');
        const list = resFallback.data?.data || [];
        if (Array.isArray(list)) setPortalNotifications(list);
      } catch (e) {}
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/portal/notifications/read-all');
    } catch (e) {
      try {
        await api.patch('/api/v1/portal/notifications/read-all');
      } catch (err) {}
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
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* BELL ICON & NOTIFICATIONS DROPDOWN */}
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

        {/* PROFILE BADGE */}
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
  );
}