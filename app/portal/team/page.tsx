'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  Video, Trophy, User as UserIcon, LogOut, Bell, Search,
  Plus, Trash2, Edit3, Shield, CheckCircle2, AlertTriangle, X, Menu,
  ChevronDown, ChevronUp, Layers, Folder, ArrowRight
} from 'lucide-react';
import PortalSidebar from '@/components/PortalSidebar';

export default function MyTeamPortalPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const [athletes, setAthletes] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [eventsMap, setEventsMap] = useState<{ [key: string]: any }>({});
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const toggleBatch = (key: string) => {
    setExpandedBatches((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login?redirect=/portal/team');
      return;
    }
    fetchTeamData();
  }, [router]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      let roster: any[] = [];
      let myRegs: any[] = [];
      const evMap: { [key: string]: any } = {};

      try {
        const res2 = await api.get('/portal/dashboard');
        const d = res2.data?.data || {};
        if (Array.isArray(d.registrations)) myRegs = d.registrations;
        else if (Array.isArray(d.myRegistrations)) myRegs = d.myRegistrations;
        if (Array.isArray(d.events)) {
          d.events.forEach((ev: any) => {
            const id = String(ev._id || ev.id);
            evMap[id] = ev;
          });
        }
        if (Array.isArray(d.athletes)) roster = d.athletes;
      } catch (e1) {
        try {
          const res = await api.get('/portal/team');
          const data = res.data?.data || res.data?.athletes || res.data || [];
          if (Array.isArray(data)) roster = data;
        } catch (e2) {
          console.warn('Fallback team fetch');
        }
      }

      setRegistrations(myRegs);
      setEventsMap(evMap);
      setAthletes(roster);
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setLoading(false);
    }
  };

  const registeredTournaments = (() => {
    const map: { [id: string]: { event: any; regs: any[]; athletesCount: number } } = {};
    registrations.forEach((reg) => {
      const rawEv = reg.eventId || reg.event;
      const evId = typeof rawEv === 'object' && rawEv !== null ? String(rawEv._id || rawEv.id) : String(rawEv || 'general');
      const evTitle = typeof rawEv === 'object' && rawEv !== null ? (rawEv.title || eventsMap[evId]?.title) : (eventsMap[evId]?.title || reg.eventTitle || 'Tournament Event');
      const evDate = typeof rawEv === 'object' && rawEv !== null ? (rawEv.eventDate || eventsMap[evId]?.eventDate) : (eventsMap[evId]?.eventDate || reg.createdAt);

      if (!map[evId]) {
        map[evId] = {
          event: { _id: evId, title: evTitle, eventDate: evDate },
          regs: [],
          athletesCount: 0,
        };
      }
      const aths = Array.isArray(reg.athletes) && reg.athletes.length > 0
        ? reg.athletes
        : Array.isArray(reg.players) && reg.players.length > 0
        ? reg.players
        : [];
      map[evId].regs.push(reg);
      map[evId].athletesCount += aths.length;
    });
    return Object.values(map);
  })();

  const allClubAthletes = (() => {
    const seen = new Set<string>();
    const list: any[] = [];

    registrations.forEach((reg) => {
      const aths = Array.isArray(reg.athletes) && reg.athletes.length > 0
        ? reg.athletes
        : Array.isArray(reg.players) && reg.players.length > 0
        ? reg.players
        : [];
      aths.forEach((a: any) => {
        const key = `${a.name || ''}_${a.cnic || a.cnicOrBForm || a._id || ''}`.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ ...a, teamName: reg.teamName || 'Registered Team' });
        }
      });
    });

    if (list.length === 0 && athletes.length > 0) return athletes;
    return list;
  })();

  const activeTournament = registeredTournaments.find((rt) => String(rt.event._id) === String(selectedTab));

  const currentTabAthletes = (() => {
    if (selectedTab === 'all' || !activeTournament) {
      return allClubAthletes;
    }
    return activeTournament.regs.flatMap((r) => {
      const aths = Array.isArray(r.athletes) && r.athletes.length > 0
        ? r.athletes
        : Array.isArray(r.players) && r.players.length > 0
        ? r.players
        : [];
      return aths.map((a: any) => ({ ...a, teamName: r.teamName || 'Registered Team' }));
    });
  })();

  // Prioritizes sub-divisions and eliminates "WHITE" fallback[cite: 8]
  const renderBeltOrDivision = (ath: any) => {
    const catArray = Array.isArray(ath.selectedCategories) && ath.selectedCategories.length > 0
      ? ath.selectedCategories
      : Array.isArray(ath.categories) && ath.categories.length > 0
      ? ath.categories
      : [];

    const firstCat = catArray[0];
    const catName =
      (typeof firstCat === 'object' && firstCat !== null ? firstCat.name || firstCat.categoryName || firstCat.title : '') ||
      ath.categoryName ||
      ath.category ||
      '';

    const subName =
      (typeof firstCat === 'object' && firstCat !== null ? firstCat.subCategory || firstCat.selectedSubcategory || firstCat.division : '') ||
      ath.subCategory ||
      ath.selectedSubcategory ||
      ath.subDivision ||
      ath.division ||
      ath.weightCategory ||
      ath.weight ||
      '';

    if (catName && subName) {
      return (
        <span className="font-bold text-[#1E3A8A] uppercase">
          {catName} <span className="text-slate-600 font-semibold lowercase">({subName})</span>
        </span>
      );
    }
    if (subName) {
      return <span className="font-bold text-[#1E3A8A] uppercase">{subName}</span>;
    }
    if (catName) {
      return <span className="font-bold text-[#1E3A8A] uppercase">{catName}</span>;
    }
    if (ath.belt && ath.belt.trim().toUpperCase() !== 'WHITE') {
      return <span className="font-bold text-slate-700 uppercase">{ath.belt}</span>;
    }
    return <span className="font-bold text-slate-500 uppercase">Standard Open</span>;
  };

  const filteredAthletes = currentTabAthletes.filter((a) => {
    const q = searchQuery.toLowerCase();
    const firstCat = (Array.isArray(a.selectedCategories) && a.selectedCategories[0]) || (Array.isArray(a.categories) && a.categories[0]);
    const catName = (typeof firstCat === 'object' && firstCat !== null ? firstCat.name || firstCat.categoryName : '') || a.categoryName || '';
    const subName = (typeof firstCat === 'object' && firstCat !== null ? firstCat.subCategory || firstCat.selectedSubcategory : '') || a.subCategory || a.division || '';
    return (
      (a.name || '').toLowerCase().includes(q) ||
      (a.cnic || a.cnicOrBForm || '').toLowerCase().includes(q) ||
      (a.belt || '').toLowerCase().includes(q) ||
      catName.toLowerCase().includes(q) ||
      subName.toLowerCase().includes(q)
    );
  });

  const handleSignOut = () => {
    localStorage.clear();
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex font-sans text-slate-800 antialiased">
      <PortalSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

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
                placeholder="Search athlete by name, belt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 sm:pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>

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
              <p className="text-xs font-bold text-slate-400">Loading team roster...</p>
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900">My Team Roster &amp; Competitors</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hierarchical tournament roster, club athletes directory, and enrolled divisions[cite: 8].
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-right">
                    <span className="text-[10px] font-bold uppercase text-blue-600 block">Total Athletes</span>
                    <span className="text-sm font-black text-[#1E3A8A]">{allClubAthletes.length} Players</span>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Tournaments</span>
                    <span className="text-sm font-black text-slate-800">{registeredTournaments.length} Enrolled</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedTab('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    selectedTab === 'all'
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>All Club Athletes ({allClubAthletes.length})</span>
                </button>

                {registeredTournaments.map((t) => (
                  <button
                    key={t.event._id}
                    type="button"
                    onClick={() => setSelectedTab(String(t.event._id))}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      selectedTab === String(t.event._id)
                        ? 'bg-[#1E3A8A] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{t.event.title} ({t.athletesCount})</span>
                  </button>
                ))}
              </div>

              {selectedTab === 'all' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Master Club Directory ({filteredAthletes.length} Athletes)
                    </span>
                  </div>

                  {filteredAthletes.length === 0 ? (
                    <div className="p-14 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-black text-slate-900">No Athletes Found</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Aapke team roster mein abhi koi athlete shamil nahi hai ya search query se match nahi hua.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            <th className="py-4 pl-6 pr-3 w-12">#</th>
                            <th className="py-4 px-4">Athlete Name</th>
                            <th className="py-4 px-4">Age / Gender</th>
                            <th className="py-4 px-4">CNIC / B-Form</th>
                            <th className="py-4 px-4">Belt / Division</th>
                            <th className="py-4 px-4">Registered Club / Team</th>
                            <th className="py-4 px-4 text-right pr-6">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {filteredAthletes.map((athlete, idx) => (
                            <tr key={athlete._id || idx} className="hover:bg-slate-50/80 transition">
                              <td className="py-4 pl-6 pr-3 font-bold text-slate-400">{idx + 1}</td>
                              <td className="py-4 px-4 font-black text-slate-900">{athlete.name}</td>
                              <td className="py-4 px-4 text-slate-600">
                                {athlete.age ? `${athlete.age} Yrs` : '—'} / {athlete.gender || 'Male'}
                              </td>
                              <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                                {athlete.cnic || athlete.cnicOrBForm || 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-xs">
                                {renderBeltOrDivision(athlete)}
                              </td>
                              <td className="py-4 px-4 text-slate-600 font-medium">
                                {athlete.teamName || 'Registered Team'}
                              </td>
                              <td className="py-4 px-4 text-right pr-6">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {selectedTab !== 'all' && activeTournament && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#1E3A8A] tracking-wider block">Tournament Roster</span>
                      <h2 className="text-lg font-black text-slate-900">{activeTournament.event.title}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Date: {new Date(activeTournament.event.eventDate || Date.now()).toLocaleDateString('en-GB')} • {activeTournament.regs.length} Enrolled Batches
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-[#1E3A8A] border border-blue-200">
                      {activeTournament.athletesCount} Athletes Enrolled
                    </span>
                  </div>

                  <div className="space-y-4">
                    {activeTournament.regs.map((reg: any, bIdx: number) => {
                      const batchKey = `batch_${reg._id || bIdx}`;
                      const isExpanded = expandedBatches[batchKey] !== false;
                      const rawAths = Array.isArray(reg.athletes) && reg.athletes.length > 0
                        ? reg.athletes
                        : Array.isArray(reg.players) && reg.players.length > 0
                        ? reg.players
                        : [];
                      const batchAthletes = rawAths.filter((a: any) => {
                        const q = searchQuery.toLowerCase();
                        const firstCat = (Array.isArray(a.selectedCategories) && a.selectedCategories[0]) || (Array.isArray(a.categories) && a.categories[0]);
                        const catName = (typeof firstCat === 'object' && firstCat !== null ? firstCat.name || firstCat.categoryName : '') || a.categoryName || '';
                        const subName = (typeof firstCat === 'object' && firstCat !== null ? firstCat.subCategory || firstCat.selectedSubcategory : '') || a.subCategory || a.division || '';
                        return (
                          (a.name || '').toLowerCase().includes(q) ||
                          (a.cnic || a.cnicOrBForm || '').toLowerCase().includes(q) ||
                          (a.belt || '').toLowerCase().includes(q) ||
                          catName.toLowerCase().includes(q) ||
                          subName.toLowerCase().includes(q)
                        );
                      });
                      const batchCode = `#TLP-${String(reg._id || '').slice(-8).toUpperCase()}`;

                      return (
                        <div key={batchKey} className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                          <div
                            onClick={() => toggleBatch(batchKey)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition border-b border-slate-100"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-[#0A1128] text-white flex items-center justify-center font-black text-xs">
                                #{bIdx + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-black text-slate-900">
                                    {reg.teamName || 'Registered Team'}
                                  </h3>
                                  <span className="font-mono text-xs text-[#1E3A8A] font-bold">
                                    {batchCode}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  TXN: {reg.transactionId || 'Direct'} • {rawAths.length} Competitors
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {reg.registrationStatus === 'approved' ? '✓ Verified' : 'Under Review'}
                              </span>
                              <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="overflow-x-auto">
                              {batchAthletes.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                                  No athletes matching search filter in this batch.
                                </div>
                              ) : (
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-black uppercase text-slate-400">
                                      <th className="py-3 pl-6 pr-3 w-10">#</th>
                                      <th className="py-3 px-4">Athlete Name</th>
                                      <th className="py-3 px-4">Age / Gender</th>
                                      <th className="py-3 px-4">CNIC / B-Form</th>
                                      <th className="py-3 px-4">Belt / Division</th>
                                      <th className="py-3 px-4 text-right pr-6">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {batchAthletes.map((ath: any, i: number) => (
                                      <tr key={i} className="hover:bg-slate-50 transition">
                                        <td className="py-3 pl-6 pr-3 font-bold text-slate-400">{i + 1}</td>
                                        <td className="py-3 px-4 font-black text-slate-900">{ath.name}</td>
                                        <td className="py-3 px-4 text-slate-600">
                                          {ath.age ? `${ath.age} Yrs` : '—'} / {ath.gender || 'Male'}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                                          {ath.cnic || ath.cnicOrBForm || 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-xs">
                                          {renderBeltOrDivision(ath)}
                                        </td>
                                        <td className="py-3 px-4 text-right pr-6">
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            Active
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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