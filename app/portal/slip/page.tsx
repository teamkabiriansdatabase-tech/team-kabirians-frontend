'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  Video, Trophy, User as UserIcon, ArrowRight, ArrowLeft,
  LogOut, Printer, CheckCircle2, AlertTriangle, X, Clock,
  Bell, Menu
} from 'lucide-react';
import PortalSidebar from '@/components/PortalSidebar';

export default function RegistrationsAndSlipsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const rawParamId = params?.id;
  const targetRegId = Array.isArray(rawParamId) ? rawParamId[0] : rawParamId ? String(rawParamId) : '';

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
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [printablePassReg, setPrintablePassReg] = useState<any | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.replace('/login?redirect=/portal/slip');
      return;
    }

    try {
      const u = JSON.parse(storedUser);
      fetchRegistrationsData(u);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  const fetchRegistrationsData = async (currentUser: any) => {
    try {
      setLoading(true);
      let myRegs: any[] = [];
      let allEvents: any[] = [];
      let allCats: any[] = [];

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
            if (Array.isArray(d3.categories)) allCats = d3.categories;
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
            console.warn('Fallback registration fetch failed');
          }
        }
      }

      const evMap: { [key: string]: any } = {};
      allEvents.forEach((ev: any) => {
        const id = String(ev._id || ev.id);
        evMap[id] = ev;
        if (Array.isArray(ev.categories)) {
          allCats.push(...ev.categories);
        }
      });

      setEventsMap(evMap);
      setCategoriesList(allCats);
      setRegistrations(myRegs);

      if (targetRegId && targetRegId !== 'all') {
        const matchedReg = myRegs.find((r: any) => String(r._id || r.id) === String(targetRegId));
        if (matchedReg) {
          const rawEv = matchedReg.eventId || matchedReg.event;
          const evId = typeof rawEv === 'object' && rawEv !== null ? String(rawEv._id || rawEv.id) : String(rawEv || '');
          if (evId) setSelectedEventId(evId);
          setPrintablePassReg(matchedReg);
        }
      }
    } catch (err) {
      console.error('Error loading registrations:', err);
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
    const map: { [eventId: string]: { event: any; regs: any[]; totalAthletes: number } } = {};
    registrations.forEach((reg) => {
      const ev = getEventFromReg(reg);
      const evId = String(ev._id || 'general');
      if (!map[evId]) {
        map[evId] = { event: ev, regs: [], totalAthletes: 0 };
      }
      map[evId].regs.push(reg);
      map[evId].totalAthletes += getAthletes(reg).length;
    });
    return Object.values(map);
  })();

  const activeEventGroup = selectedEventId
    ? groupedEvents.find((g) => String(g.event._id) === String(selectedEventId))
    : null;

  const handlePrintSlip = () => {
    const wrapper = document.getElementById('printable-slip-wrapper');
    if (wrapper) wrapper.scrollTop = 0;
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex font-sans text-slate-800 antialiased">
      {/* 1. SIDEBAR */}
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
                onClick={() => setSelectedEventId(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Events</span>
              </button>
            ) : (
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider truncate max-w-[200px] sm:max-w-none">
                Registrations &amp; Official Slips
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
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
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#E63946] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">Loading registrations &amp; official slips...</p>
            </div>
          ) : (
            <>
              {/* LEVEL 1: EVENTS LIST */}
              {!selectedEventId && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
                    <h1 className="text-xl font-black text-slate-900">Registrations &amp; Official Slips</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select an event below to view your submitted registrations and print your official stamped accreditation slips.
                    </p>
                  </div>

                  {groupedEvents.length === 0 ? (
                    <div className="bg-white rounded-3xl p-14 text-center border border-slate-200 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <FileText className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-black text-slate-900">No Registrations Found</h3>
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
                        const approvedCount = group.regs.filter(
                          (r) => (r.registrationStatus || r.status || '').toLowerCase() === 'approved'
                        ).length;

                        return (
                          <div
                            key={ev._id || idx}
                            onClick={() => setSelectedEventId(String(ev._id))}
                            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-[#1E3A8A] transition cursor-pointer flex flex-col justify-between space-y-5 group"
                          >
                            <div className="space-y-4">
                              <div className="flex justify-between items-start gap-2">
                                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                  {group.regs.length} {group.regs.length === 1 ? 'Registration' : 'Registrations'}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#1E3A8A] transition">
                                  {ev.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Tournament Date: {new Date(ev.eventDate || Date.now()).toLocaleDateString('en-GB')}
                                </p>
                              </div>

                              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500 font-semibold">Total Athletes:</span>
                                  <span className="font-black text-slate-900">{group.totalAthletes} Players</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500 font-semibold">Verified Slips Ready:</span>
                                  <span className="font-black text-emerald-700">
                                    {approvedCount} / {group.regs.length} Approved
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1E3A8A]">
                              <span>Open Registrations &amp; Slips</span>
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
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">
                        Official Accreditation &amp; Slips
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                        {activeEventGroup.event.title}
                      </h2>
                    </div>

                    <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Batches</span>
                      <span className="text-sm font-black text-slate-900">
                        {activeEventGroup.regs.length} Entries ({activeEventGroup.totalAthletes} Athletes)
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            <th className="py-4 pl-6 pr-3 whitespace-nowrap w-12">#</th>
                            <th className="py-4 px-4 whitespace-nowrap">REG ID</th>
                            <th className="py-4 px-4 whitespace-nowrap">TEAM / BATCH</th>
                            <th className="py-4 px-4 whitespace-nowrap">ATHLETES</th>
                            <th className="py-4 px-4 whitespace-nowrap">PAYMENT SCHEME</th>
                            <th className="py-4 px-4 whitespace-nowrap">VERIFICATION STATUS</th>
                            <th className="py-4 pl-4 pr-6 text-right whitespace-nowrap">OFFICIAL SLIP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {activeEventGroup.regs.map((reg, idx) => {
                            const athletesList = getAthletes(reg);
                            const athletesCount = athletesList.length;
                            const athleteNames = athletesList.map((a: any) => a.name).filter(Boolean).join(', ');
                            const isHalf = (reg.paymentOption || '').toLowerCase() === 'half';
                            const totalDue = Number(reg.totalAmountDue ?? reg.totalAmount ?? 0);
                            const totalPaid = Number(reg.totalAmountPaid ?? reg.paidAmount ?? 0);
                            const remBalance = Number(reg.remainingBalance ?? Math.max(0, totalDue - totalPaid));
                            const rawStatus = (reg.registrationStatus || reg.status || 'under_review').toLowerCase();
                            const isApproved = rawStatus === 'approved';
                            const isRejected = rawStatus === 'rejected';

                            return (
                              <tr key={reg._id || idx} className="hover:bg-slate-50/80 transition">
                                <td className="py-4 pl-6 pr-3 font-bold text-slate-400 whitespace-nowrap">
                                  {idx + 1}
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap">
                                  <span className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px]">
                                    #TLP-{String(reg._id || '').slice(-8).toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap">
                                  <div className="font-black text-slate-900 text-xs">
                                    {reg.teamName || `${userProfile.name}'s Team`}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                    Date: {new Date(reg.createdAt || Date.now()).toLocaleDateString('en-GB')}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="inline-flex items-center gap-1.5 font-black text-slate-900 whitespace-nowrap">
                                    <span className="w-5 h-5 rounded-full bg-blue-50 text-[#1E3A8A] text-[10px] flex items-center justify-center border border-blue-200">
                                      {athletesCount}
                                    </span>
                                    <span>{athletesCount === 1 ? 'Athlete' : 'Athletes'}</span>
                                  </div>
                                  {athleteNames && (
                                    <div className="text-[11px] text-slate-500 font-medium truncate max-w-[180px] mt-0.5" title={athleteNames}>
                                      {athleteNames}
                                    </div>
                                  )}
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                    <span>100% Full Paid</span>
                                  </span>
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase border whitespace-nowrap ${
                                      isApproved
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : isRejected
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}
                                  >
                                    {isApproved ? '✓ Approved' : isRejected ? '✕ Rejected' : '● Under Review'}
                                  </span>
                                </td>
                                <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setPrintablePassReg(reg)}
                                    className="px-4 py-2.5 bg-[#0A1128] hover:bg-slate-900 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-xs transition hover:scale-[1.02] cursor-pointer whitespace-nowrap"
                                  >
                                    <Printer className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>View / Print Slip</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODAL: OFFICIAL 1-PAGE A4 ACCREDITATION & PAYMENT SLIP (SCROLLABLE & FULLY VISIBLE) */}
      {printablePassReg && (
        <div
          id="printable-slip-wrapper"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-center print:p-0 print:m-0 print:bg-white print:static print:overflow-visible animate-in fade-in"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: `
            <style>
              @media print {
                @page { size: A4 portrait; margin: 6mm 10mm; }
                html, body { background: white !important; color: #0f172a !important; height: auto !important; min-height: auto !important; overflow: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                aside, header, main, nav { display: none !important; }
                #printable-slip-wrapper { position: static !important; display: block !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; background: white !important; }
                #official-print-slip { display: block !important; position: relative !important; top: 0 !important; left: 0 !important; width: 100% !important; max-width: 100% !important; box-shadow: none !important; border: 2px solid #0f172a !important; padding: 16px 20px !important; margin: 0 auto !important; page-break-inside: avoid !important; break-inside: avoid !important; background: white !important; max-height: none !important; overflow: visible !important; }
                .no-print { display: none !important; }
              }
            </style>
          `,
            }}
          />

          <div
            id="official-print-slip"
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl relative border-2 border-slate-900 text-slate-800 space-y-3.5 print:space-y-2.5 print:max-h-none print:overflow-visible my-auto"
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 no-print sticky top-0 bg-white z-10 py-1">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Official Accreditation Pass &amp; Payment Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="px-4 py-2 bg-[#0A1128] hover:bg-slate-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition hover:scale-105 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintablePassReg(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* HEADER WITH BALANCED & PROPER SIZED LOGOS */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 relative">
              <div className="w-20 h-20 flex items-center justify-center flex-shrink-0">
                <img src="/assets/logo tlp.png" alt="TLP Logo" className="w-18 h-18 object-contain" />
              </div>

              <div className="text-center space-y-0.5 flex-1 px-2">
                <div className="inline-block px-3 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[9px] font-black uppercase tracking-widest">
                  Official Competitor Accreditation &amp; Payment Receipt
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase">
                  TAEKWONDO LOVERS PAKISTAN
                </h1>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#E63946]">
                  powered by TEAM KABIRIANS
                </div>
              </div>

              <div className="w-20 h-20 flex items-center justify-center flex-shrink-0">
                <img src="/assets/team kabirians.png" alt="Team Kabirians Logo" className="w-18 h-18 object-contain" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[10px] font-bold text-slate-500 pt-1 pb-1 border-b border-dashed border-slate-200">
              <span>
                REG ID: <strong className="font-mono text-slate-900">#TLP-{String(printablePassReg._id || '').slice(-8).toUpperCase()}</strong>
              </span>
              <span>
                Issue Date: <strong className="text-slate-900">{new Date(printablePassReg.createdAt || Date.now()).toLocaleDateString('en-GB')}</strong>
              </span>
              <span>
                Print Date: <strong className="text-slate-900">{new Date().toLocaleDateString('en-GB')}</strong>
              </span>
            </div>

            {(() => {
              const evInfo = getEventFromReg(printablePassReg);
              return (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                  <div className="space-y-1">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Tournament / Championship:</span>
                      <span className="font-black text-slate-900 text-xs sm:text-sm">{evInfo.title}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Tournament Date:</span>
                      <span className="font-bold text-slate-800">
                        {evInfo.eventDate ? new Date(evInfo.eventDate).toLocaleDateString('en-GB') : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Team / Club Name:</span>
                      <span className="font-black text-slate-900 text-xs sm:text-sm">
                        {printablePassReg.teamName || `${userProfile.name}'s Team`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-0.5">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Head / Coach:</span>
                        <span className="font-bold text-slate-800 truncate block">
                          {printablePassReg.coachName || printablePassReg.teamHead?.name || userProfile.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Contact Phone:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {printablePassReg.coachPhone || printablePassReg.phone || userProfile.phone || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black uppercase tracking-wider text-slate-700 text-[11px]">
                  Registered Competitors ({getAthletes(printablePassReg).length})
                </span>
                <span className="text-[10px] font-bold text-slate-400">Official Verification List</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-100 text-[9px] font-black uppercase text-slate-600 border-b border-slate-200">
                      <th className="py-1.5 px-2.5">#</th>
                      <th className="py-1.5 px-2.5">Athlete Name</th>
                      <th className="py-1.5 px-2.5">Age / Gender</th>
                      <th className="py-1.5 px-2.5">CNIC / B-Form</th>
                      <th className="py-1.5 px-2.5">Belt / Division</th>
                      <th className="py-1.5 px-2.5">Registered Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
                    {getAthletes(printablePassReg).map((athlete: any, idx: number) => {
                      const resolvedCategory = (() => {
                        if (athlete.categoryName) return athlete.categoryName;
                        const rawCats = athlete.categories || athlete.selectedCategories || [];
                        if (Array.isArray(rawCats) && rawCats.length > 0) {
                          const sc = rawCats[0];
                          if (typeof sc === 'object' && sc !== null) return sc.categoryName || sc.name || 'Division';
                          const match = categoriesList.find((c) => String(c._id || c.id) === String(sc));
                          return match?.name || 'Category';
                        }
                        return 'Standard Category';
                      })();

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-1.5 px-2.5 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-1.5 px-2.5 font-black text-slate-900">{athlete.name}</td>
                          <td className="py-1.5 px-2.5">{athlete.age ? `${athlete.age} Yrs` : '—'} / {athlete.gender || 'Male'}</td>
                          <td className="py-1.5 px-2.5 font-mono text-[10px]">{athlete.cnic || athlete.cnicOrBForm || 'N/A'}</td>
                          <td className="py-1.5 px-2.5 font-bold uppercase text-[#1E3A8A]">
                            {athlete.subCategory || athlete.division || athlete.belt || 'Standard Open'}
                          </td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-700">{resolvedCategory}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {(() => {
              const totalDue = Number(
                printablePassReg.approvedAmount ??
                printablePassReg.customAmount ??
                printablePassReg.totalAmountDue ??
                printablePassReg.totalAmount ??
                0
              );
              const totalPaid = Number(
                printablePassReg.totalAmountPaid ??
                printablePassReg.paidAmount ??
                totalDue
              );
              const remainingDue = 0;

              return (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Scheme</span>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                        100% Full Payment Paid
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Total Package</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        PKR {totalDue.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Cleared / Paid</span>
                      <span className="font-mono font-black text-emerald-700 text-xs">
                        PKR {totalPaid.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Balance Due</span>
                      <span className={`font-mono font-black text-xs ${remainingDue > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        PKR {remainingDue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {remainingDue > 0 ? (
                    <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[10px] leading-tight flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-black uppercase tracking-wide">Mandatory Venue Payment Notice: </strong>
                        The remaining balance of <strong>PKR {remainingDue.toLocaleString()}</strong> must be cleared at the official tournament accreditation counter prior to athlete weigh-in.
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] leading-tight flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-black uppercase tracking-wide">100% Fees Cleared &amp; Verified: </strong>
                        All registration dues are fully paid. Present this verified slip at the desk to collect competitor accreditation passes.
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* STAMP, OFFICIAL SEALS & SIGNATURES SECTION (PROPER SIZES & PHYSICAL STAMP AREA) */}
            <div className="pt-3 border-t-2 border-slate-200 grid grid-cols-4 gap-3 items-end">
              {/* OFFICIAL STAMP IMAGE */}
              <div className="flex flex-col items-center justify-center text-center relative">
                <div className="w-24 h-24 flex items-center justify-center relative select-none">
                  <img
                    src="/assets/Stamp.png"
                    alt="Official Stamp"
                    className="w-22 h-22 object-contain transform -rotate-6 opacity-95 pointer-events-none"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </div>
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                  Official Seal
                </span>
              </div>

              {/* M. ASIF ALI NADIR SIGNATURE */}
              <div className="space-y-2 text-center">
                <div className="h-12 flex items-end justify-center">
                  <img
                    src="/assets/asif nadir sign.png"
                    alt="M. Asif Ali Nadir Signature"
                    className="h-12 max-w-full object-contain mx-auto pointer-events-none"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1">
                  <div className="text-[11px] font-black text-slate-900 leading-tight">M. Asif Ali Nadir</div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">G. Secretary</span>
                  <span className="text-[8px] text-slate-400 font-semibold block">Taekwondo Lovers Pakistan</span>
                </div>
              </div>

              {/* BILAWAL SHAHZAD SIGNATURE */}
              <div className="space-y-2 text-center">
                <div className="h-12 flex items-end justify-center">
                  <img
                    src="/assets/Bilawal Sign.jpeg"
                    alt="Bilawal Shahzad Signature"
                    className="h-12 max-w-full object-contain mx-auto pointer-events-none"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1">
                  <div className="text-[11px] font-black text-slate-900 leading-tight">Bilawal Shahzad</div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Head of Management Committee</span>
                  <span className="text-[8px] text-slate-400 font-semibold block">Team Kabirians</span>
                </div>
              </div>

              {/* DESK OFFICER / PHYSICAL STAMP AREA */}
              <div className="space-y-2 text-center">
                <div className="h-12 flex items-end justify-center pb-1">
                  <span className="font-mono text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                    Physical Stamp Area
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1">
                  <div className="text-[11px] font-black text-slate-900">Desk Officer</div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">
                    Scrutiny In-Charge
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[8px] font-mono text-slate-400">
              <span>SYSTEM-VERIFIED-HASH: {String(printablePassReg._id || '').toUpperCase()}-KABIRIANS-{new Date().getFullYear()}</span>
              <span>VALID ONLY WITH OFFICIAL STAMP &amp; SIGNATURES</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}