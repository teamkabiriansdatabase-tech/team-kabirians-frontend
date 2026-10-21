'use client';

import { useEffect, useState } from 'react';
import PublicNavbar from '@/components/Navbar';
import api from '@/lib/api';
import {
  Trophy, Medal, Search, Filter, Award, ChevronDown,
  Calendar, MapPin
} from 'lucide-react';

export default function PublicChampionshipResultsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPublicEventsAndResults();
  }, []);

  const fetchPublicEventsAndResults = async () => {
    try {
      setLoading(true);
      // Valid backend endpoint (Console ka 404 AxiosError khatam)
      const res = await api.get('/events');
      const data = res.data?.data || res.data?.events || res.data || [];
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeEvent =
    selectedEventId !== 'all'
      ? events.find((e) => String(e._id || e.id) === selectedEventId)
      : null;

  // Events se athletes/results extract karna
  const extractedResults = (() => {
    const targetEvents = activeEvent ? [activeEvent] : events;
    const list: any[] = [];

    targetEvents.forEach((ev) => {
      const isPublic = Boolean(
        ev.isResultsPublished || ev.resultsPublished || ev.status === 'completed'
      );

      if (Array.isArray(ev.results) && ev.results.length > 0) {
        ev.results.forEach((r: any) => {
          list.push({
            ...r,
            eventTitle: ev.title,
            eventId: ev._id || ev.id,
            isPublic,
          });
        });
      }

      if (Array.isArray(ev.categories)) {
        ev.categories.forEach((cat: any) => {
          if (Array.isArray(cat.athletes)) {
            cat.athletes.forEach((ath: any) => {
              list.push({
                ...ath,
                categoryName: cat.categoryName || cat.name || 'Open Division',
                eventTitle: ev.title,
                eventId: ev._id || ev.id,
                isPublic,
              });
            });
          }
        });
      }
    });

    return list;
  })();

  // Live Search filter
  const filteredResults = extractedResults.filter((item) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (item.name || item.athleteName || '').toLowerCase().includes(q);
    const teamMatch = (item.teamName || item.clubName || '').toLowerCase().includes(q);
    const categoryMatch = (item.categoryName || item.division || '').toLowerCase().includes(q);
    return nameMatch || teamMatch || categoryMatch;
  });

  // Category-wise grouping
  const categoryGroupedResults = filteredResults.reduce(
    (acc: { [cat: string]: any[] }, item: any) => {
      const catTitle = item.categoryName || item.division || 'Open Category';
      if (!acc[catTitle]) acc[catTitle] = [];
      acc[catTitle].push(item);
      return acc;
    },
    {}
  );

  const renderPositionBadge = (ath: any) => {
    const rawPos = String(ath.position || ath.medal || ath.rank || '').toLowerCase();

    if (rawPos.includes('1') || rawPos.includes('gold')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
          <Medal className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>1st Place (Gold) 🥇</span>
        </span>
      );
    }
    if (rawPos.includes('2') || rawPos.includes('silver')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
          <Medal className="w-4 h-4 text-slate-400 fill-slate-300" />
          <span>2nd Place (Silver) 🥈</span>
        </span>
      );
    }
    if (rawPos.includes('3') || rawPos.includes('bronze')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-orange-50 text-orange-900 border border-orange-300 shadow-2xs">
          <Medal className="w-4 h-4 text-amber-700 fill-orange-400" />
          <span>3rd Place (Bronze) 🥉</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-50 text-slate-600 border border-slate-200">
        <span>Participant</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased flex flex-col">
      {/* 1. SHARED PUBLIC NAVBAR MOUNTED HERE */}
      <PublicNavbar />

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto p-6 sm:p-10 space-y-6 flex-1 w-full">
        {/* Banner Section */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-black uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Official Competition Podium</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Championship Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto font-medium">
            Verified tournament standings and category podium placements published by the Tournament Committee.
          </p>
        </div>

        {/* Filter Controls (Search + Dropdown) */}
        <div className="space-y-3 pt-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team, player, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs placeholder-slate-400 transition"
            />
          </div>

          <div className="relative w-full">
            <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="all">All Events</option>
              {events.map((ev) => (
                <option key={ev._id || ev.id} value={String(ev._id || ev.id)}>
                  {ev.title} {ev.isResultsPublished ? '✓ (Published)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 3. RESULTS DISPLAY / EMPTY STATE */}
        <div className="pt-2">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
              <div className="w-8 h-8 border-3 border-[#E63946] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">Loading verified tournament results...</p>
            </div>
          ) : Object.keys(categoryGroupedResults).length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 sm:p-20 text-center space-y-4 shadow-2xs flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                <Award className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                No results published yet for this selection.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              {Object.entries(categoryGroupedResults).map(([catTitle, athletes]) => (
                <div
                  key={catTitle}
                  className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-7 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {catTitle}
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border">
                      {athletes.length} {athletes.length === 1 ? 'Competitor' : 'Competitors'}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="py-3.5 pl-4 pr-2 w-12">#</th>
                          <th className="py-3.5 px-4">Athlete / Player</th>
                          <th className="py-3.5 px-4">Team / Club</th>
                          <th className="py-3.5 px-4">Tournament</th>
                          <th className="py-3.5 pr-4 text-right">Podium Placement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {athletes.map((ath: any, idx: number) => (
                          <tr key={ath._id || idx} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 pl-4 pr-2 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-black text-slate-900">
                              <div className="text-xs sm:text-sm">{ath.name || ath.athleteName}</div>
                              {ath.belt && (
                                <span className="text-[10px] text-blue-700 font-bold uppercase">
                                  {ath.belt} Belt
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-600">
                              {ath.teamName || ath.clubName || 'Independent'}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-500 text-[11px]">
                              {ath.eventTitle}
                            </td>
                            <td className="py-3.5 pr-4 text-right">
                              {renderPositionBadge(ath)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="h-16 bg-white border-t border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium mt-auto">
        &copy; {new Date().getFullYear()} KABIRIANS EVENT SYSTEM &bull; Official Results Board
      </footer>
    </div>
  );
}