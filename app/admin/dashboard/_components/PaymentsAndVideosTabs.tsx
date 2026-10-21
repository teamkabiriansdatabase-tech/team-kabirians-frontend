'use client';

import {
  ArrowRight, ArrowLeft, FileSpreadsheet, CheckCircle2,
  CreditCard, Clock, AlertCircle, Filter, ChevronLeft,
  ChevronRight, Video, Folder, FolderOpen, Play, ExternalLink, Users
} from 'lucide-react';
import {
  getAthletes,
  getRegId,
  getEntityEventId,
  isRegPending,
  isRegApproved,
  isRegRejected,
  isInternationalReg,
  getCleanAthleteDivision,
  doesAthleteMatchCategory,
  doesAthleteMatchSubcategory,
  getCategoryAthletesCount,
  getSubcategoryAthletesCount,
  exportCategoryWiseCSV,
  getPlayerVideoUrl,
} from '../_utils/adminHelpers';

export function PaymentsTab({
  events,
  registrations,
  selectedPaymentEvent,
  setSelectedPaymentEvent,
  paymentFilterTab,
  setPaymentFilterTab,
  paymentPage,
  setPaymentPage,
  itemsPerPage,
  currentEventRegistrations,
  filteredPayments,
  totalPaymentPages,
  paginatedPayments,
  setSelectedPaymentProof,
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in">
      {!selectedPaymentEvent && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-xl font-black text-slate-900">Payment Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a championship tournament below to inspect PKR and International USD payment receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((ev: any) => {
              const evId = String(ev._id || ev.id);
              const evRegs = registrations.filter((r: any) => getEntityEventId(r) === evId);
              const evPending = evRegs.filter((r: any) =>
                isRegPending(r.registrationStatus || r.status)
              ).length;

              const pkrTotal = evRegs
                .filter((r: any) => !isInternationalReg(r))
                .reduce((sum: number, r: any) => sum + (Number(r.totalAmountPaid || r.totalAmountDue) || 0), 0);

              const usdTotal = evRegs
                .filter((r: any) => isInternationalReg(r))
                .reduce((sum: number, r: any) => sum + (Number(r.totalAmountPaid || r.totalAmountDue) || 0), 0);

              return (
                <div
                  key={ev._id}
                  onClick={() => {
                    setSelectedPaymentEvent(ev);
                    setPaymentFilterTab('all');
                    setPaymentPage(1);
                  }}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:border-[#1E3A8A] transition cursor-pointer space-y-4 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A]">
                      {ev.eventType}
                    </span>
                    {evPending > 0 ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                        {evPending} Review Pending
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        All Cleared
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base group-hover:text-[#1E3A8A] transition">
                      {ev.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        PKR {pkrTotal.toLocaleString()}
                      </span>
                      {usdTotal > 0 && (
                        <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          \${usdTotal.toLocaleString()} USD
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 font-bold pt-3 border-t flex items-center justify-between">
                    <span>Open Payments Ledger</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedPaymentEvent && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <button
                onClick={() => setSelectedPaymentEvent(null)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to All Events
              </button>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Payments &mdash; {selectedPaymentEvent.title}
              </h2>
            </div>

            <button
              onClick={() => exportCategoryWiseCSV(selectedPaymentEvent, currentEventRegistrations)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* SEPARATE PKR & USD METRIC CARDS */}
          {(() => {
            const pkrRegs = currentEventRegistrations.filter((r: any) => !isInternationalReg(r));
            const usdRegs = currentEventRegistrations.filter((r: any) => isInternationalReg(r));

            const pkrTotalAmount = pkrRegs.reduce(
              (sum: number, r: any) => sum + (Number(r.totalAmountPaid) || Number(r.totalAmountDue) || 0),
              0
            );

            const usdTotalAmount = usdRegs.reduce(
              (sum: number, r: any) => sum + (Number(r.totalAmountPaid) || Number(r.totalAmountDue) || 0),
              0
            );

            const pendingCount = currentEventRegistrations.filter((r: any) =>
              isRegPending(r.registrationStatus || r.status)
            ).length;

            const approvedCount = currentEventRegistrations.filter((r: any) =>
              isRegApproved(r.registrationStatus || r.status)
            ).length;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                    Pakistani Teams (PKR)
                  </span>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                    PKR {pkrTotalAmount.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-2">
                    {pkrRegs.length} {pkrRegs.length === 1 ? 'Team' : 'Teams'} Registered
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                    International Teams (USD)
                  </span>
                  <div className="text-2xl font-black text-blue-600 font-mono mt-1">
                    \${usdTotalAmount.toLocaleString()} USD
                  </div>
                  <div className="text-[11px] font-bold text-blue-600 mt-2">
                    {usdRegs.length} International {usdRegs.length === 1 ? 'Team' : 'Teams'}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                    Pending Review
                  </span>
                  <div className="text-2xl font-black text-[#E63946] font-mono mt-1">
                    {pendingCount} Teams
                  </div>
                  <div className="text-[11px] font-bold text-red-600 mt-2">
                    Verification required
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                    Full Payments Cleared
                  </span>
                  <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                    {approvedCount} Teams
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-2">
                    Approved &amp; Verified
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { id: 'all', label: `All (${currentEventRegistrations.length})` },
                {
                  id: 'pending',
                  label: `Pending (${
                    currentEventRegistrations.filter((r: any) =>
                      isRegPending(r.registrationStatus || r.status)
                    ).length
                  })`,
                },
                {
                  id: 'full',
                  label: `Approved (Full) (${
                    currentEventRegistrations.filter((r: any) =>
                      isRegApproved(r.registrationStatus || r.status)
                    ).length
                  })`,
                },
                {
                  id: 'rejected',
                  label: `Rejected (${
                    currentEventRegistrations.filter((r: any) =>
                      isRegRejected(r.registrationStatus || r.status)
                    ).length
                  })`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setPaymentFilterTab(tab.id as any);
                    setPaymentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border ${
                    paymentFilterTab === tab.id
                      ? 'bg-red-50 text-[#E63946] border-red-300 shadow-2xs font-black'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">Team Name</th>
                  <th className="py-4 px-6">Event</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment Mode</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedPayments.map((reg: any, idx: number) => {
                  const globalIndex = (paymentPage - 1) * itemsPerPage + idx + 1;
                  const rawStatus = (
                    reg.registrationStatus ||
                    reg.status ||
                    'under_review'
                  ).toLowerCase();
                  const isApproved = rawStatus === 'approved';
                  const isRejected = rawStatus === 'rejected';
                  const isPending = !isApproved && !isRejected;

                  const isInt = isInternationalReg(reg);
                  const amountDisplay = Number(reg.totalAmountPaid || reg.totalAmountDue || 0);

                  return (
                    <tr key={getRegId(reg) || idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 font-bold text-slate-400">{globalIndex}</td>
                      <td className="py-4 px-6 font-black text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{reg.teamName || reg.teamId?.teamName || 'Team Name'}</span>
                          {isInt && (
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                              🌐 INTL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {selectedPaymentEvent.title}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {isInt ? (
                          <span className="text-blue-700 font-black">\${amountDisplay.toLocaleString()} USD</span>
                        ) : (
                          <span>PKR {amountDisplay.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          FULL PAYMENT
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {isApproved ? 'Approved' : isPending ? 'Pending' : 'Rejected'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedPaymentProof(reg)}
                          className="px-4 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] font-black text-xs border border-blue-200 transition cursor-pointer shadow-2xs"
                        >
                          View / Verify
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function VideosTab({
  onlineEvents,
  categories,
  registrations,
  selectedVideoEvent,
  setSelectedVideoEvent,
  selectedVideoCategory,
  setSelectedVideoCategory,
  selectedVideoSubcategory,
  setSelectedVideoSubcategory,
  setActiveVideoPlayer,
}: any) {
  const getUnifiedRegistrations = () => {
    let localRegs: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('registrations');
        if (stored) localRegs = JSON.parse(stored);
      } catch (e) {}
    }
    const list = [...(registrations || []), ...localRegs];
    const seen = new Set();
    return list.filter((r) => {
      const id = String(r._id || r.id || '');
      if (id && seen.has(id)) return false;
      if (id) seen.add(id);
      return true;
    });
  };

  const allRegs = getUnifiedRegistrations();

  // Robust Direct Video URL Resolver
  const findVideoUrlForAthlete = (athlete: any, reg: any, athIdx: number): string => {
    // 1. Sirf athlete ki apni video fields check karein
    if (athlete?.videoUrl && athlete.videoUrl.trim() !== '') return athlete.videoUrl;
    if (athlete?.submissionVideoUrl && athlete.submissionVideoUrl.trim() !== '') return athlete.submissionVideoUrl;
    if (athlete?.youtubeUrl && athlete.youtubeUrl.trim() !== '') return athlete.youtubeUrl;

    // 2. LocalStorage match sirf specific index ya specific athlete ID ke sath
    if (typeof window !== 'undefined') {
      try {
        const rawRegId = String(reg?._id || reg?.id || '');
        const stored = localStorage.getItem('portal_video_submissions') || localStorage.getItem('team_videos');
        if (stored) {
          const parsed = JSON.parse(stored);
          const exactKey = `${rawRegId}_${athIdx}`;
          if (parsed[exactKey]) return parsed[exactKey];
          if (athlete?._id && parsed[`${rawRegId}_${athlete._id}`]) return parsed[`${rawRegId}_${athlete._id}`];
        }
      } catch (e) {}
    }

    return '';
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Online Video Submissions Hub
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect performance videos organized by Tournament, Category, and Sub-Division folders.
            </p>
          </div>
          {selectedVideoEvent && (
            <button
              type="button"
              onClick={() => {
                if (selectedVideoSubcategory) setSelectedVideoSubcategory(null);
                else if (selectedVideoCategory) setSelectedVideoCategory(null);
                else setSelectedVideoEvent(null);
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back One Level</span>
            </button>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs font-bold pt-2 border-t border-slate-100">
          <span
            onClick={() => {
              setSelectedVideoEvent(null);
              setSelectedVideoCategory(null);
              setSelectedVideoSubcategory(null);
            }}
            className={`cursor-pointer ${
              !selectedVideoEvent ? 'text-[#1E3A8A] font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            All Online Events
          </span>
          {selectedVideoEvent && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span
                onClick={() => {
                  setSelectedVideoCategory(null);
                  setSelectedVideoSubcategory(null);
                }}
                className={`cursor-pointer ${
                  !selectedVideoCategory ? 'text-[#1E3A8A] font-black' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {selectedVideoEvent.title}
              </span>
            </>
          )}
          {selectedVideoCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span
                onClick={() => setSelectedVideoSubcategory(null)}
                className={`cursor-pointer ${
                  !selectedVideoSubcategory ? 'text-[#1E3A8A] font-black' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {selectedVideoCategory.name}
              </span>
            </>
          )}
          {selectedVideoSubcategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[#E63946] font-black capitalize">{selectedVideoSubcategory}</span>
            </>
          )}
        </div>
      </div>

      {!selectedVideoEvent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {onlineEvents.map((ev: any) => {
            const evId = String(ev._id || ev.id);
            const evRegs = allRegs.filter((r: any) => getEntityEventId(r) === evId);
            const totalAthletes = evRegs.reduce((sum: number, r: any) => sum + getAthletes(r).length, 0);

            return (
              <div
                key={ev._id}
                onClick={() => setSelectedVideoEvent(ev)}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:border-purple-600 transition cursor-pointer space-y-4 group"
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                    {totalAthletes} Athletes
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-base group-hover:text-purple-700 transition">
                  {ev.title}
                </h3>
                <div className="text-xs text-purple-700 font-bold pt-3 border-t flex items-center justify-between">
                  <span>Open Category Folders</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedVideoEvent && !selectedVideoCategory && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories
            .filter((c: any) => getEntityEventId(c) === String(selectedVideoEvent._id || selectedVideoEvent.id))
            .map((cat: any, idx: number) => {
              const enrolledCount = getCategoryAthletesCount(
                allRegs,
                categories,
                selectedVideoEvent._id,
                cat._id,
                cat.name
              );

              const subList = Array.isArray(cat.subcategories)
                ? cat.subcategories
                : (cat.subcategories || '').split(',').map((s: string) => s.trim()).filter(Boolean);

              return (
                <div
                  key={cat._id || idx}
                  onClick={() => setSelectedVideoCategory(cat)}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:border-amber-500 transition cursor-pointer space-y-4 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <Folder className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {enrolledCount} Athletes
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base group-hover:text-amber-700 transition capitalize">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{subList.length} Sub-Divisions</p>
                  </div>
                  <div className="text-xs text-amber-700 font-bold pt-3 border-t flex items-center justify-between">
                    <span>Open Sub-Divisions</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {selectedVideoEvent && selectedVideoCategory && !selectedVideoSubcategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {(Array.isArray(selectedVideoCategory.subcategories)
            ? selectedVideoCategory.subcategories
            : (selectedVideoCategory.subcategories || '').split(',').map((s: string) => s.trim()).filter(Boolean)
          ).map((subItem: any, sIdx: number) => {
            const subName = typeof subItem === 'string' ? subItem : subItem.name || subItem.title || 'Division';
            const subCount = getSubcategoryAthletesCount(
              allRegs,
              categories,
              selectedVideoEvent._id,
              selectedVideoCategory._id,
              selectedVideoCategory.name,
              subName
            );

            return (
              <div
                key={sIdx}
                onClick={() => setSelectedVideoSubcategory(subName)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-600 transition cursor-pointer space-y-3 group"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black font-mono ${
                      subCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {subCount} Players
                  </span>
                </div>
                <h4 className="font-black text-slate-900 text-sm group-hover:text-purple-700 transition truncate capitalize">
                  {subName}
                </h4>
                <div className="text-[11px] text-purple-700 font-bold pt-2 border-t flex items-center justify-between">
                  <span>View Videos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LEVEL 4: VIDEOS TABLE */}
      {selectedVideoEvent && selectedVideoCategory && selectedVideoSubcategory && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[600px]">
            <thead>
              <tr className="border-b bg-slate-50 text-[11px] font-black text-slate-400 uppercase">
                <th className="py-4 px-6">#</th>
                <th className="py-4 px-6">Athlete Name</th>
                <th className="py-4 px-6">Team Name</th>
                <th className="py-4 px-6">Weight / Division</th>
                <th className="py-4 px-6 text-right">Video Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {(() => {
                const targetEvId = String(selectedVideoEvent._id || selectedVideoEvent.id);
                const eventCats = categories.filter((c: any) => getEntityEventId(c) === targetEvId);
                const eventRegs = allRegs.filter((r: any) => getEntityEventId(r) === targetEvId);

                const filteredList: any[] = [];

                eventRegs.forEach((reg: any) => {
                  const athletes = getAthletes(reg);
                  athletes.forEach((player: any, idx: number) => {
                    const isCatMatch = doesAthleteMatchCategory(
                      player,
                      selectedVideoCategory._id,
                      selectedVideoCategory.name,
                      eventCats.length,
                      eventCats
                    );
                    const isSubMatch = doesAthleteMatchSubcategory(player, selectedVideoSubcategory);

                    if (isCatMatch && isSubMatch) {
                      const resolvedUrl = findVideoUrlForAthlete(player, reg, idx);
                      filteredList.push({
                        ...player,
                        parentReg: reg,
                        athIndex: idx,
                        teamName: reg.teamName || reg.teamId?.teamName || 'Team',
                        resolvedVideoUrl: resolvedUrl,
                      });
                    }
                  });
                });

                if (filteredList.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        Is sub-division ({selectedVideoSubcategory}) mein koi athlete registered nahi hai.
                      </td>
                    </tr>
                  );
                }

                return filteredList.map((athlete: any, idx: number) => {
                  const displayDiv = getCleanAthleteDivision(athlete, selectedVideoSubcategory);
                  const hasVideo = Boolean(athlete.resolvedVideoUrl && athlete.resolvedVideoUrl.trim() !== '');

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-4 px-6 font-black text-slate-900">{athlete.name}</td>
                      <td className="py-4 px-6 font-bold text-slate-700">{athlete.teamName}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E3A8A] border border-blue-200 font-bold text-xs uppercase">
                          {displayDiv}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {hasVideo ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveVideoPlayer({
                                  url: athlete.resolvedVideoUrl,
                                  playerName: athlete.name,
                                  teamName: athlete.teamName,
                                  categoryName: selectedVideoCategory.name,
                                  subName: displayDiv,
                                })
                              }
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>View Video</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => window.open(athlete.resolvedVideoUrl, '_blank')}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>New Tab</span>
                            </button>
                          </div>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold border border-slate-200 inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>No Video Uploaded</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}