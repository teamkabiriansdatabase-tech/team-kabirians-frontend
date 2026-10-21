'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  Video, Trophy, User as UserIcon, LogOut, Bell,
  Lock, Mail, Phone, Shield, Save, KeyRound, CheckCircle2,
  AlertTriangle, X, Building2, CreditCard as IdCard, CheckCheck, Menu
} from 'lucide-react';
import PortalSidebar from '@/components/PortalSidebar';

export default function PortalProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fast Instant User Profile State (Zero Flicker)
  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          return {
            name: u.name || u.fullName || 'Team Head',
            role: (u.role || 'TEAM HEAD').replace('_', ' ').toUpperCase(),
            email: u.email || '',
            phone: u.phone || u.phoneNumber || '',
            teamName: u.teamName || u.clubName || '',
            cnic: u.cnic || u.cnicOrBForm || '',
            address: u.address || '',
          };
        } catch (e) {}
      }
    }
    return {
      name: 'Team Head',
      role: 'TEAM HEAD',
      email: '',
      phone: '',
      teamName: '',
      cnic: '',
      address: '',
    };
  });

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    teamName: '',
    cnic: '',
    address: '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications Popover Dropdown States
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [portalNotifications, setPortalNotifications] = useState<any[]>([]);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login?redirect=/portal/profile');
      return;
    }
    fetchUserProfile();
    fetchHeaderNotifications();

    const interval = setInterval(() => {
      fetchHeaderNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  // Persistent read IDs helper
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

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      let userData: any = null;

      try {
        const res = await api.get('/portal/profile');
        userData = res.data?.data || res.data?.user || res.data;
      } catch (e1) {
        try {
          const res2 = await api.get('/auth/me');
          userData = res2.data?.data || res2.data?.user || res2.data;
        } catch (e2) {
          const stored = localStorage.getItem('user');
          if (stored) userData = JSON.parse(stored);
        }
      }

      if (userData) {
        const resolved = {
          name: userData.name || userData.fullName || userProfile.name,
          role: (userData.role || 'TEAM HEAD').replace('_', ' ').toUpperCase(),
          email: userData.email || userProfile.email,
          phone: userData.phone || userData.phoneNumber || userProfile.phone,
          teamName: userData.teamName || userData.clubName || userProfile.teamName,
          cnic: userData.cnic || userData.cnicOrBForm || userProfile.cnic,
          address: userData.address || userProfile.address,
        };
        setUserProfile(resolved);
        setFormData(resolved);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);

      const payload = {
        name: formData.name,
        phone: formData.phone,
        teamName: formData.teamName,
        cnic: formData.cnic,
        address: formData.address,
      };

      try {
        await api.put('/portal/profile', payload);
      } catch (e1) {
        try {
          await api.patch('/users/profile', payload);
        } catch (e2) {
          console.warn('Profile API fallback to local storage');
        }
      }

      const stored = localStorage.getItem('user');
      let currentObj = {};
      if (stored) {
        try { currentObj = JSON.parse(stored); } catch (e) {}
      }
      const newStoredUser = { ...currentObj, ...payload };
      localStorage.setItem('user', JSON.stringify(newStoredUser));

      setUserProfile((prev) => ({ ...prev, ...payload }));
      showNotice('Profile information kamyabi se update ho gayi!', 'success');
    } catch (err: any) {
      console.error('Profile update failed:', err);
      showNotice(err.response?.data?.message || 'Profile update karne mein masla hua.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      showNotice('Kripya apna current password likhein.', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showNotice('Naya password kam az kam 6 characters ka hona chahiye.', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotice('Naya password aur confirm password match nahi kar rahe.', 'error');
      return;
    }

    try {
      setSavingPassword(true);

      const payload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      };

      try {
        await api.put('/portal/change-password', payload);
      } catch (e1) {
        await api.put('/auth/change-password', payload);
      }

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotice('Password kamyabi se change ho gaya!', 'success');
    } catch (err: any) {
      console.error('Password change error:', err);
      showNotice(err.response?.data?.message || 'Password update karne mein masla hua.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    router.replace('/login');
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
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider truncate max-w-[200px] sm:max-w-none">
              Account &amp; Profile Settings
            </span>
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

        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto max-w-5xl mx-auto w-full">
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
              <p className="text-xs font-bold text-slate-400">Loading profile settings...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              {/* Profile Top Summary Card */}
              <div className="bg-gradient-to-r from-[#0A1128] via-[#111f48] to-[#1E3A8A] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white text-2xl font-black shadow-md border-2 border-white/20">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight">{userProfile.name}</h1>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Active Head
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                      <span>{userProfile.email}</span>
                      <span>&bull;</span>
                      <span className="text-amber-300 font-bold">{userProfile.teamName || 'Official Team'}</span>
                    </p>
                  </div>
                </div>

                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/10 text-right sm:text-left">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Designation</span>
                  <span className="text-xs font-black text-white">{userProfile.role}</span>
                </div>
              </div>

              {/* Grid: Personal Details & Password Update */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Personal & Team Details Form */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-7 space-y-5">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black text-slate-900">Personal &amp; Club Information</h2>
                      <p className="text-xs text-slate-400">Yeh details official slips aur certificates par print hongi.</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 block">Full Name</label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 block">Email Address (Read Only)</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            disabled
                            value={formData.email}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 block">Contact Phone Number</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={formData.phone}
                            placeholder="0300-1234567"
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 block">Club / Academy Name</label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={formData.teamName}
                            placeholder="e.g. Islamabad Martial Arts Club"
                            onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 block">CNIC / ID Number</label>
                        <div className="relative">
                          <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={formData.cnic}
                            placeholder="35202-xxxxxxx-x"
                            onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 block">Club / Dojo City &amp; Address</label>
                        <input
                          type="text"
                          value={formData.address}
                          placeholder="City, District, Dojo Address"
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-2.5 bg-[#E63946] hover:bg-red-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Security & Password Update Form */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-7 space-y-5">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black text-slate-900">Security</h2>
                      <p className="text-xs text-slate-400">Update account password</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700 block">Current Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700 block">New Password</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          placeholder="Minimum 6 characters"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700 block">Confirm New Password</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          placeholder="Re-type new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <Shield className="w-4 h-4" />
                        <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}