'use client';

import {
  Users, CreditCard, Clock, CheckCircle2, FileText, Calendar,
  Layers, Award, Plus, Image as ImageIcon, Edit, ExternalLink,
  BookOpen, ArrowRight
} from 'lucide-react';

export function DashboardTab({
  totalRegistrations,
  pendingPayments,
  halfPayments,
  fullPayments,
  pendingApprovals,
  totalEventsCount,
  categoriesCount,
  totalTeamsCount,
  setShowCreateEventModal,
}: any) {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tournament overview and registration analytics.
          </p>
        </div>
        <button
          onClick={() => setShowCreateEventModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#E63946] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Event
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Registrations', val: totalRegistrations, icon: Users, bg: 'bg-blue-600', trend: 'Live entries' },
          { label: 'Pending Payments', val: pendingPayments, icon: CreditCard, bg: 'bg-[#E63946]', trend: 'Needs review' },
          { label: 'Half Payments', val: halfPayments, icon: Clock, bg: 'bg-amber-500', trend: 'Remaining balance due' },
          { label: 'Full Payments', val: fullPayments, icon: CheckCircle2, bg: 'bg-emerald-600', trend: 'Cleared' },
          { label: 'Pending Approvals', val: pendingApprovals, icon: FileText, bg: 'bg-purple-600', trend: 'Awaiting pass' },
          { label: 'Total Events', val: totalEventsCount, icon: Calendar, bg: 'bg-rose-600', trend: 'In system' },
          { label: 'Categories Configured', val: categoriesCount, icon: Layers, bg: 'bg-indigo-600', trend: 'Active divisions' },
          { label: 'Total Teams', val: totalTeamsCount, icon: Award, bg: 'bg-teal-600', trend: 'Participating clubs' },
        ].map((k, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className={`w-10 h-10 rounded-xl ${k.bg} text-white flex items-center justify-center mb-3`}>
              <k.icon className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">{k.label}</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{k.val}</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-1">{k.trend}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventsTab({
  eventTabFilter,
  setEventTabFilter,
  filteredEventsByTab,
  categories,
  setShowCreateEventModal,
  setSelectedEventStats,
  handleOpenEditEvent,
  setActiveRuleTextModal,
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Events Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any championship card to inspect registered teams, payments, or edit tournament details.
          </p>
        </div>
        <button
          onClick={() => setShowCreateEventModal(true)}
          className="px-4 py-2.5 bg-[#E63946] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Event
        </button>
      </div>

      <div className="flex gap-2 bg-white p-2.5 rounded-2xl border shadow-2xs overflow-x-auto max-w-full pb-2 scrollbar-none">
        {['all', 'active', 'upcoming', 'past'].map((tab) => (
          <button
            key={tab}
            onClick={() => setEventTabFilter(tab as any)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap cursor-pointer ${
              eventTabFilter === tab ? 'bg-[#E63946] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab} Events
          </button>
        ))}
      </div>

      {filteredEventsByTab.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border">
          No events found. Click &quot;Add New Event&quot; to create a tournament.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {filteredEventsByTab.map((ev: any) => {
            const evStatus = ev.status || 'upcoming';
            const isLive = evStatus === 'live';
            const isClosed = evStatus === 'closed';
            const isEnded = evStatus === 'ended';

            const matchedCategories =
              Array.isArray(ev.categories) && ev.categories.length > 0
                ? ev.categories
                : categories.filter((c: any) => {
                    const cEvId = c.eventId?._id ? c.eventId._id.toString() : c.eventId?.toString();
                    return cEvId === ev._id.toString();
                  });

            const categoryCount = matchedCategories.length;

            return (
              <div
                key={ev._id}
                onClick={() => setSelectedEventStats(ev)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group relative h-full"
              >
                <div className="flex flex-col flex-1">
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden shrink-0">
                    {ev.coverImageUrl ? (
                      <img
                        src={ev.coverImageUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 to-blue-950 text-white/40">
                        <ImageIcon className="w-12 h-12 mb-1 opacity-40" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Kabirians Event</span>
                      </div>
                    )}

                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 flex-wrap justify-end max-w-[70%]">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditEvent(ev, e)}
                        title="Edit Tournament Details & Categories"
                        className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs transition hover:scale-110 cursor-pointer shrink-0"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-600" />
                      </button>

                      {isLive && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-600 text-white shadow-md animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                      {evStatus === 'upcoming' && (
                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#059669] text-white shadow-md">
                          UPCOMING
                        </span>
                      )}
                      {isClosed && (
                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-600 text-white shadow-md">
                          CLOSED
                        </span>
                      )}
                      {isEnded && (
                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-300 shadow-md">
                          ENDED
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3.5 left-3.5">
                      <span className="text-[11px] font-black uppercase px-3 py-1 rounded-full bg-black/70 text-white backdrop-blur-xs flex items-center gap-1.5 shadow">
                        {ev.eventType === 'online' ? (
                          <>
                            <span>🌐</span>
                            <span>ONLINE</span>
                          </>
                        ) : (
                          <>
                            <span>📍</span>
                            <span>PHYSICAL</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-xl font-black text-slate-900 leading-snug line-clamp-2">{ev.title}</h3>

                    {(ev.ruleBookPdfUrl || ev.ruleBookText) && (
                      <div className="pt-0.5">
                        {ev.ruleBookPdfUrl ? (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(ev.ruleBookPdfUrl, '_blank');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Official Rule Book (PDF)</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </span>
                        ) : (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveRuleTextModal({ title: ev.title, text: ev.ruleBookText });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] text-xs font-bold border border-blue-200 transition cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Read Event Rules</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs font-bold pt-1">
                      <span className="text-slate-600">Categories:</span>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] font-black text-xs">
                        {categoryCount} Listed
                      </span>
                    </div>

                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-400 font-medium shrink-0">Date:</span>
                        <span className="font-black text-slate-800 truncate text-right">
                          {new Date(ev.eventDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-400 font-medium shrink-0">Standard Deadline:</span>
                        <span className="font-black text-slate-800 truncate text-right">
                          {new Date(ev.standardDeadline || ev.registrationDeadline).toLocaleDateString()}
                        </span>
                      </div>
                      {ev.lateFeeStartDate && (
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-red-500 font-medium shrink-0">Late Fee Starts:</span>
                          <span className="font-black text-red-600 truncate text-right">
                            {new Date(ev.lateFeeStartDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <button
                    type="button"
                    className="w-full py-3.5 bg-[#DC2626] hover:bg-red-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md cursor-pointer"
                  >
                    <span>View Event Stats &amp; Teams</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}