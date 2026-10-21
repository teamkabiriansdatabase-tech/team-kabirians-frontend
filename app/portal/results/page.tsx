'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  Video, Trophy, User as UserIcon, ArrowRight, ArrowLeft,
  LogOut, Medal, Award, Printer, X,
  CheckCircle2, Clock, Lock, Star, Bell, CheckCheck,
  Search, Menu
} from 'lucide-react';
import PortalSidebar from '@/components/PortalSidebar';

export default function PortalResultsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fast Instant User Profile State (No flickering)
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
            phone: u.phone || '',
          };
        } catch (e) {}
      }
    }
    return { name: 'Team Head', role: 'TEAM HEAD', email: '', phone: '' };
  });

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [eventsMap, setEventsMap] = useState<{ [key: string]: any }>({});
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'all' | 'past'>('all');
  const [selectedCertificateAthlete, setSelectedCertificateAthlete] = useState<{
    athlete: any;
    event: any;
    teamName: string;
    categoryTitle: string;
  } | null>(null);

  // Notifications Popover Dropdown States
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [portalNotifications, setPortalNotifications] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login?redirect=/portal/results');
      return;
    }
    fetchMyRegisteredResults();
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

  const fetchMyRegisteredResults = async () => {
    try {
      setLoading(true);
      let myRegs: any[] = [];
      let allEvents: any[] = [];

      try {
        const evRes = await api.get('/events');
        const eData = evRes.data?.data || evRes.data?.events || evRes.data || [];
        if (Array.isArray(eData)) allEvents = eData;
      } catch (e) {}

      try {
        const res = await api.get('/portal/registrations');
        const rData = res.data?.data || res.data?.registrations || res.data || [];
        if (Array.isArray(rData)) myRegs = rData;
      } catch (e1) {
        try {
          const res2 = await api.get('/portal/dashboard');
          const d = res2.data?.data || {};
          if (Array.isArray(d.myRegistrations)) myRegs = d.myRegistrations;
        } catch (e2) {}
      }

      // 1. Backend API se published results fetch karein
      let publishedResults: any[] = [];
      try {
        const resPub = await api.get('/admin/results');
        const pubData = resPub.data?.data || resPub.data?.results || resPub.data || [];
        if (Array.isArray(pubData)) publishedResults = pubData;
      } catch (e) {}

      // 2. LocalStorage fallback se bhi published results merge karein
      if (typeof window !== 'undefined') {
        const savedLocal = localStorage.getItem('tlp_official_results');
        if (savedLocal) {
          try {
            const parsedLocal = JSON.parse(savedLocal);
            parsedLocal.forEach((locRes: any) => {
              if (locRes.isPublished) {
                const exists = publishedResults.some(
                  (pr: any) => String(pr.playerName).trim().toLowerCase() === String(locRes.playerName).trim().toLowerCase()
                );
                if (!exists) publishedResults.push(locRes);
              }
            });
          } catch (e) {}
        }
      }

      const evMap: { [key: string]: any } = {};
      allEvents.forEach((ev: any) => {
        const id = String(ev._id || ev.id);
        
        const hasPublishedResults = publishedResults.some((pr: any) => {
          const prEvId = String(pr.eventId?._id || pr.eventId || '');
          return (prEvId === id || !prEvId) && Boolean(pr.isPublished) === true;
        });

        evMap[id] = {
          ...ev,
          isResultsPublished: Boolean(
            ev.isResultsPublished ||
            ev.resultsPublished ||
            hasPublishedResults
          ),
        };
      });

      myRegs = myRegs.map((reg: any) => {
        const rawEv = reg.eventId || reg.event;
        const evId = String(typeof rawEv === 'object' ? rawEv._id || rawEv.id : rawEv);

        const updatedAthletes = (reg.athletes || []).map((ath: any) => {
          const match = publishedResults.find(
            (pr: any) => {
              const matchesName = (pr.playerName || '').trim().toLowerCase() === (ath.name || '').trim().toLowerCase();
              return matchesName && Boolean(pr.isPublished) === true;
            }
          );

          if (match) {
            return {
              ...ath,
              medal: match.position,
              position: match.position,
              result: match.position,
              score: match.score || '9.85',
            };
          }
          return {
            ...ath,
            medal: '',
            position: '',
            result: '',
          };
        });

        return { ...reg, athletes: updatedAthletes };
      });

      setEventsMap(evMap);
      setRegistrations(myRegs);
    } catch (err) {
      console.error('Error fetching registered results:', err);
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

  const getAthletes = (reg: any): any[] => {
    if (!reg) return [];
    if (Array.isArray(reg.athletes) && reg.athletes.length > 0) return reg.athletes;
    if (Array.isArray(reg.players) && reg.players.length > 0) return reg.players;
    return [];
  };

  const getEventFromReg = (reg: any) => {
    const rawEv = reg.eventId || reg.event;
    if (typeof rawEv === 'object' && rawEv !== null && (rawEv._id || rawEv.id)) {
      const id = String(rawEv._id || rawEv.id);
      const backendEv = eventsMap[id] || {};
      const isPub = Boolean(
        rawEv.isResultsPublished ||
        rawEv.resultsPublished ||
        backendEv.isResultsPublished ||
        backendEv.resultsPublished
      );
      return {
        _id: id,
        title: rawEv.title || backendEv.title || reg.eventTitle || 'Tournament Championship',
        eventType: rawEv.eventType || backendEv.eventType || 'physical',
        eventDate: rawEv.eventDate || backendEv.eventDate || reg.createdAt,
        venue: rawEv.venue || backendEv.venue || 'Official Arena',
        isResultsPublished: isPub,
      };
    }
    const idStr = String(rawEv || 'unknown');
    const backendEv = eventsMap[idStr] || {};
    const isPub = Boolean(backendEv.isResultsPublished || backendEv.resultsPublished);
    return {
      _id: idStr,
      title: reg.eventTitle || backendEv.title || 'Tournament Championship',
      eventType: backendEv.eventType || 'physical',
      eventDate: backendEv.eventDate || reg.createdAt,
      venue: backendEv.venue || 'Official Arena',
      isResultsPublished: isPub,
    };
  };

  const myRegisteredTournaments = (() => {
    const map: {
      [eventId: string]: {
        event: any;
        regs: any[];
        athletes: any[];
        categoriesMap: { [catName: string]: any[] };
        totalMedals: number;
        goldCount: number;
        silverCount: number;
        bronzeCount: number;
        isPast: boolean;
      };
    } = {};

    registrations.forEach((reg) => {
      const ev = getEventFromReg(reg);
      const evId = String(ev._id || 'general');

      if (!map[evId]) {
        const evDate = new Date(ev.eventDate || Date.now());
        const isPastEvent = evDate < new Date() || ev.isResultsPublished;

        map[evId] = {
          event: ev,
          regs: [],
          athletes: [],
          categoriesMap: {},
          totalMedals: 0,
          goldCount: 0,
          silverCount: 0,
          bronzeCount: 0,
          isPast: isPastEvent,
        };
      }

      map[evId].regs.push(reg);
      const teamAthletes = getAthletes(reg);

      teamAthletes.forEach((ath: any) => {
        const categoryKey =
          ath.categoryName ||
          ath.division ||
          ath.subCategory ||
          ath.weightCategory ||
          'Standard Open Category';

        if (!map[evId].categoriesMap[categoryKey]) {
          map[evId].categoriesMap[categoryKey] = [];
        }

        const athleteItem = {
          ...ath,
          teamName: reg.teamName || `${userProfile.name}'s Team`,
          regId: reg._id,
          categoryTitle: categoryKey,
        };

        map[evId].athletes.push(athleteItem);
        map[evId].categoriesMap[categoryKey].push(athleteItem);

        if (ev.isResultsPublished) {
          const medal = (ath.medal || ath.position || ath.result || '').toLowerCase();
          if (medal.includes('gold') || medal === '1' || medal === '1st') {
            map[evId].goldCount += 1;
            map[evId].totalMedals += 1;
          } else if (medal.includes('silver') || medal === '2' || medal === '2nd') {
            map[evId].silverCount += 1;
            map[evId].totalMedals += 1;
          } else if (medal.includes('bronze') || medal === '3' || medal === '3rd') {
            map[evId].bronzeCount += 1;
            map[evId].totalMedals += 1;
          }
        }
      });
    });

    return Object.values(map);
  })();

  const clubOverallTally = (() => {
    let gold = 0;
    let silver = 0;
    let bronze = 0;
    let podiums = 0;
    const athleteSet = new Set<string>();

    myRegisteredTournaments.forEach((group) => {
      if (group.event.isResultsPublished) {
        gold += group.goldCount || 0;
        silver += group.silverCount || 0;
        bronze += group.bronzeCount || 0;
        podiums += group.totalMedals || 0;
      }
      (group.athletes || []).forEach((a: any) => {
        const id = (a._id || a.id || a.name || '').toLowerCase();
        if (id) athleteSet.add(id);
      });
    });

    return {
      gold,
      silver,
      bronze,
      podiums,
      athletes: athleteSet.size || myRegisteredTournaments.reduce((acc, g) => acc + (g.athletes?.length || 0), 0)
    };
  })();

  const activeEventGroup = selectedEventId
    ? myRegisteredTournaments.find((g) => String(g.event._id) === String(selectedEventId))
    : null;

  const displayedTournaments = myRegisteredTournaments.filter((g) => {
    const matchesSearch =
      (g.event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.event.venue || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (tabFilter === 'past') return matchesSearch && g.isPast;
    return matchesSearch;
  });

  const renderMedalBadge = (ath: any) => {
    const rawMedal = (ath.medal || ath.position || ath.result || '').toLowerCase();

    if (rawMedal.includes('gold') || rawMedal === '1' || rawMedal === '1st') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-300">
          <Medal className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
          <span>1st Place (Gold 🥇)</span>
        </span>
      );
    }
    if (rawMedal.includes('silver') || rawMedal === '2' || rawMedal === '2nd') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-300">
          <Medal className="w-3.5 h-3.5 text-slate-500 fill-slate-300" />
          <span>2nd Place (Silver 🥈)</span>
        </span>
      );
    }
    if (rawMedal.includes('bronze') || rawMedal === '3' || rawMedal === '3rd') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-orange-50 text-orange-900 border border-orange-300">
          <Medal className="w-3.5 h-3.5 text-amber-700 fill-orange-400" />
          <span>3rd Place (Bronze 🥉)</span>
        </span>
      );
    }
    if (ath.score || ath.points) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-800 border border-blue-200">
          <Star className="w-3 h-3 text-blue-600" />
          <span>Score: {ath.score || ath.points} Pts</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
        <span>Participant</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex font-sans text-slate-800 antialiased">
      {/* 1. TEAM HEAD PORTAL SIDEBAR */}
      <PortalSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      {/* 2. MAIN VIEWPORT */}
      <div className="lg:pl-64 flex flex-col min-h-screen w-full min-w-0 print:hidden">
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
                  setSelectedCertificateAthlete(null);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Registered Events</span>
              </button>
            ) : (
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider truncate max-w-[200px] sm:max-w-none">
                Results &amp; Standings
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

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#E63946] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">Loading your registered tournament results...</p>
            </div>
          ) : (
            <>
              {/* LEVEL 1: LIST OF ONLY REGISTERED / PARTICIPATED EVENTS */}
              {!selectedEventId && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                     <h1 className="text-xl font-black text-slate-900">My Team's Tournament Results</h1>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Yahan sirf woh tournaments dikh rahe hain jinme aapki team ne register kiya hai ya past mein participate kiya hai.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-56">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search tournament..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>

                      <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                        <button
                          onClick={() => setTabFilter('all')}
                          className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                            tabFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          All Registered ({myRegisteredTournaments.length})
                        </button>
                        <button
                          onClick={() => setTabFilter('past')}
                          className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                            tabFilter === 'past' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          Past Participated
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CLUB MEDAL TALLY SUMMARY BAR (SHOWS 0 UNLESS PUBLISHED) */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/70 p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-lg shadow-xs">
                        🥇
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">Gold Medals</span>
                        <span className="text-xl font-black text-amber-950 font-mono leading-tight">{clubOverallTally.gold}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-300 text-slate-800 flex items-center justify-center font-black text-lg shadow-xs">
                        🥈
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">Silver Medals</span>
                        <span className="text-xl font-black text-slate-900 font-mono leading-tight">{clubOverallTally.silver}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/70 p-4 rounded-2xl border border-orange-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-400 text-orange-950 flex items-center justify-center font-black text-lg shadow-xs">
                        🥉
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-orange-800 tracking-wider block">Bronze Medals</span>
                        <span className="text-xl font-black text-orange-950 font-mono leading-tight">{clubOverallTally.bronze}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 p-4 rounded-2xl border border-emerald-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">Total Podiums</span>
                        <span className="text-xl font-black text-emerald-950 font-mono leading-tight">{clubOverallTally.podiums}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/70 p-4 rounded-2xl border border-blue-200 shadow-2xs flex items-center gap-3 col-span-2 sm:col-span-1">
                      <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-black shadow-xs">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider block">Club Athletes</span>
                        <span className="text-xl font-black text-blue-950 font-mono leading-tight">{clubOverallTally.athletes}</span>
                      </div>
                    </div>
                  </div>

                  {displayedTournaments.length === 0 ? (
                    <div className="bg-white rounded-3xl p-14 text-center border border-slate-200 space-y-4 shadow-2xs">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Trophy className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-black text-slate-900">No Registered Tournaments Found</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Aapki team abhi kisi event mein registered nahi hai. Live tournaments mein register karne ke baad unke results yahan show honge.
                      </p>
                      <Link
                        href="/portal/events"
                        prefetch={true}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A8A] text-white text-xs font-bold rounded-2xl shadow-xs"
                      >
                        <span>Explore Tournaments</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayedTournaments.map((group, idx) => {
                        const ev = group.event;
                        const isPublic = ev.isResultsPublished;

                        return (
                          <div
                            key={ev._id || idx}
                            onClick={() => setSelectedEventId(String(ev._id))}
                            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-[#1E3A8A] transition cursor-pointer flex flex-col justify-between space-y-5 group"
                          >
                            <div className="space-y-4">
                              <div className="flex justify-between items-start gap-2">
                                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                                  <Trophy className="w-5 h-5" />
                                </div>
                                {isPublic ? (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Results Published ✓
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Matches In Progress</span>
                                  </span>
                                )}
                              </div>

                              <div>
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#1E3A8A] transition leading-snug">
                                  {ev.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Date: {new Date(ev.eventDate || Date.now()).toLocaleDateString('en-GB')}</span>
                                </p>
                              </div>

                              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500 font-semibold">Your Registered Athletes:</span>
                                  <span className="font-black text-slate-900">{group.athletes.length} Players</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500 font-semibold">Status:</span>
                                  <span className={`font-black ${isPublic ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {isPublic ? `${group.totalMedals} Medals Awarded` : 'Under Evaluation'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1E3A8A]">
                              <span>{isPublic ? 'View Category-Wise Results' : 'View Tournament Details'}</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* LEVEL 2: CATEGORY-WISE DISPLAY WHEN EVENT IS SELECTED */}
              {selectedEventId && activeEventGroup && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <button
                        onClick={() => setSelectedEventId(null)}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Tournaments
                      </button>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                        {activeEventGroup.event.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeEventGroup.event.isResultsPublished ? (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Official Public Results</span>
                        </span>
                      ) : (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Results Under Evaluation</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TOURNAMENT CLUB MEDAL TALLY BAR */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/70 p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-lg shadow-xs">
                        🥇
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">Gold Medals</span>
                        <span className="text-xl font-black text-amber-950 font-mono leading-tight">{activeEventGroup.goldCount}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-300 text-slate-800 flex items-center justify-center font-black text-lg shadow-xs">
                        🥈
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">Silver Medals</span>
                        <span className="text-xl font-black text-slate-900 font-mono leading-tight">{activeEventGroup.silverCount}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/70 p-4 rounded-2xl border border-orange-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-400 text-orange-950 flex items-center justify-center font-black text-lg shadow-xs">
                        🥉
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-orange-800 tracking-wider block">Bronze Medals</span>
                        <span className="text-xl font-black text-orange-950 font-mono leading-tight">{activeEventGroup.bronzeCount}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 p-4 rounded-2xl border border-emerald-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">Total Podiums</span>
                        <span className="text-xl font-black text-emerald-950 font-mono leading-tight">{activeEventGroup.totalMedals}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/70 p-4 rounded-2xl border border-blue-200 shadow-2xs flex items-center gap-3 col-span-2 sm:col-span-1">
                      <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-black shadow-xs">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider block">Participating</span>
                        <span className="text-xl font-black text-blue-950 font-mono leading-tight">{activeEventGroup.athletes.length}</span>
                      </div>
                    </div>
                  </div>

                  {!activeEventGroup.event.isResultsPublished ? (
                    <div className="bg-white rounded-3xl border border-amber-200 p-12 text-center space-y-4 shadow-2xs">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <Lock className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">Official Results Awaiting Publication</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Is tournament ke official results abhi organizing committee ki taraf se finalize nahi hue. Jaise hi admin results ko approve aur public karega, yahan category-wise standings aur certificates unlock ho jayenge.
                      </p>
                      <div className="inline-block px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600">
                        Status: Evaluating &amp; Scoring Matches
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.keys(activeEventGroup.categoriesMap).length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl border text-center text-slate-400 text-xs">
                          No category records found for this tournament.
                        </div>
                      ) : (
                        Object.entries(activeEventGroup.categoriesMap).map(([categoryName, athleteList]) => (
                          <div
                            key={categoryName}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4"
                          >
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
                                <h3 className="text-base font-black text-slate-900 tracking-tight">
                                  {categoryName}
                                </h3>
                              </div>
                              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border">
                                {athleteList.length} {athleteList.length === 1 ? 'Competitor' : 'Competitors'}
                              </span>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                    <th className="py-3 px-3 w-10">#</th>
                                    <th className="py-3 px-4">Athlete</th>
                                    <th className="py-3 px-4">Belt / Division</th>
                                    <th className="py-3 px-4">Standing / Medal</th>
                                    <th className="py-3 px-4 text-right pr-6">E-Diploma</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                  {athleteList.map((ath: any, athIdx: number) => (
                                    <tr key={ath._id || athIdx} className="hover:bg-slate-50/70 transition">
                                      <td className="py-3.5 px-3 font-bold text-slate-400">{athIdx + 1}</td>
                                      <td className="py-3.5 px-4 font-black text-slate-900">
                                        <div>{ath.name}</div>
                                        <div className="text-[10px] text-slate-400 font-normal">
                                          {ath.age ? `${ath.age} Yrs` : '—'} / {ath.gender || 'Male'}
                                        </div>
                                      </td>
                                      <td className="py-3.5 px-4 font-bold uppercase text-[#1E3A8A]">
                                        {ath.subCategory || ath.division || ath.belt || 'Standard'}
                                      </td>
                                      <td className="py-3.5 px-4">
                                        {renderMedalBadge(ath)}
                                      </td>
                                      <td className="py-3.5 px-4 text-right pr-6">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSelectedCertificateAthlete({
                                              athlete: ath,
                                              event: activeEventGroup.event,
                                              teamName: ath.teamName || `${userProfile.name}'s Team`,
                                              categoryTitle: categoryName,
                                            })
                                          }
                                          className="px-3.5 py-1.5 bg-[#0A1128] hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition hover:scale-105 cursor-pointer inline-flex items-center gap-1.5"
                                        >
                                          <Award className="w-3.5 h-3.5 text-amber-400" />
                                          <span>Print Certificate</span>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* PRINTABLE DIPLOMA MODAL */}
      {selectedCertificateAthlete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-4 flex justify-center items-start print:p-0 print:m-0 print:bg-white print:static animate-in fade-in">
          <div
            dangerouslySetInnerHTML={{
              __html: `
              <style>
                @media print {
                  @page { size: A4 landscape; margin: 10mm; }
                  html, body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  aside, header, main, nav { display: none !important; }
                  #official-certificate { display: block !important; border: 8px double #1E3A8A !important; box-shadow: none !important; margin: 0 auto !important; width: 100% !important; background: white !important; }
                  .no-print { display: none !important; }
                }
              </style>
            `,
            }}
          />

          <div
            id="official-certificate"
            className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-8 md:p-12 shadow-2xl relative border-4 sm:border-8 border-double border-slate-900 text-slate-800 space-y-6 mt-4 sm:mt-6 print:mt-0 print:border-8 print:border-double"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 no-print">
              <span className="text-xs font-black uppercase text-slate-400">Official Achievement Certificate</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition hover:scale-105 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCertificateAthlete(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6 relative">
              <div className="inline-block px-4 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-black uppercase tracking-widest">
                Certificate of Achievement &amp; Participation
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight uppercase">
                TAEKWONDO LOVERS PAKISTAN
              </h1>
              <div className="text-xs font-black uppercase tracking-widest text-[#E63946]">
                SANCTIONED BY TEAM KABIRIANS &amp; NATIONAL BOARD
              </div>
            </div>

            <div className="text-center space-y-4 py-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">This is to proudly certify that</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E3A8A] underline decoration-[#E63946] underline-offset-8">
                {selectedCertificateAthlete.athlete.name}
              </h2>
              <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed pt-2">
                representing <strong>{selectedCertificateAthlete.teamName}</strong> has completed competition in{' '}
                <strong>{selectedCertificateAthlete.categoryTitle}</strong> at{' '}
                <strong>{selectedCertificateAthlete.event.title}</strong> on{' '}
                <strong>{new Date(selectedCertificateAthlete.event.eventDate || Date.now()).toLocaleDateString('en-GB')}</strong>.
              </p>

              <div className="py-2 inline-block">
                {renderMedalBadge(selectedCertificateAthlete.athlete)}
              </div>
            </div>

            <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-3 gap-6 items-end text-center">
              <div className="space-y-4">
                <div className="h-10 border-b border-dashed border-slate-400" />
                <div>
                  <div className="text-xs font-black text-slate-900">Head Coach</div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">{userProfile.name}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-double border-red-600 text-red-700 bg-red-50/40 flex flex-col items-center justify-center p-1 transform -rotate-6 select-none">
                  <span className="text-[6px] font-black uppercase tracking-widest">OFFICIAL SEAL</span>
                  <div className="text-[8px] font-black uppercase border-y py-0.5 w-full my-0.5">VERIFIED</div>
                  <span className="text-[6px] font-bold">TLP BOARD</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-10 border-b border-dashed border-slate-400" />
                <div>
                  <div className="text-xs font-black text-slate-900">President / Secretary</div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Team Kabirians</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}