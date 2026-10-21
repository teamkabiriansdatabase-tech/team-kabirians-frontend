'use client';

import {
  MapPin, ArrowRight, Printer, ArrowLeft, ChevronRight,
  Trophy, Folder, FolderOpen
} from 'lucide-react';
import {
  getAthletes,
  getRegId,
  doesAthleteMatchCategory,
  doesAthleteMatchSubcategory,
  getCategoryAthletesCount,
  getSubcategoryAthletesCount,
} from '../_utils/adminHelpers';

export function OfflineTab({
  offlineEvents,
  registrations,
  selectedOfflineEvent,
  setSelectedOfflineEvent,
  setPrintablePassReg,
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Offline / Physical Tournaments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical Tournaments &gt; Team Slips &gt; View, Download &amp; Print Stamped Passes.
          </p>
        </div>
        {selectedOfflineEvent && (
          <button
            onClick={() => setSelectedOfflineEvent(null)}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            &larr; Back to Physical Events
          </button>
        )}
      </div>

      {!selectedOfflineEvent ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offlineEvents.map((ev: any) => (
            <div
              key={ev._id}
              onClick={() => setSelectedOfflineEvent(ev)}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-600 transition cursor-pointer space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-base">{ev.title}</h3>
              <div className="text-xs text-emerald-700 font-bold pt-2 border-t flex items-center justify-between">
                <span>View Team Slips</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-2xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[600px]">
            <thead>
              <tr className="border-b bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                <th className="py-3 px-5">#</th>
                <th className="py-3 px-5">TEAM</th>
                <th className="py-3 px-5">CONTACT</th>
                <th className="py-3 px-5">ATHLETES</th>
                <th className="py-3.5 px-5 text-right">OFFICIAL STAMPED PASS</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {registrations
                .filter(
                  (r: any) =>
                    r.eventId?._id === selectedOfflineEvent._id ||
                    r.eventId === selectedOfflineEvent._id
                )
                .map((reg: any, idx: number) => (
                  <tr key={getRegId(reg) || idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-5 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-5 font-black text-slate-900">
                      {reg.teamName || reg.teamId?.teamName}
                    </td>
                    <td className="py-3.5 px-5 font-mono">
                      {reg.coachPhone || reg.phone || reg.teamId?.contactPhone || '—'}
                    </td>
                    <td className="py-3.5 px-5 font-bold">{getAthletes(reg).length}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setPrintablePassReg(reg)}
                        className="px-3.5 py-1.5 bg-[#0B132B] hover:bg-slate-900 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> View / Print Pass
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ResultsTab({
  events,
  categories,
  registrations,
  results,
  selectedResultEvent,
  setSelectedResultEvent,
  selectedResultCategory,
  setSelectedResultCategory,
  selectedResultSubcategory,
  setSelectedResultSubcategory,
  setAssigningPlayer,
  handleToggleResult,
  handleBulkPublishSubcategoryResults,
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Tournament Results &amp; Podium Rankings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Navigate by Event &rarr; Category &rarr; Sub-Category to assign medals. Keep results{' '}
              <strong className="text-slate-700">Private (Draft)</strong> and publish when ready.
            </p>
          </div>
          {selectedResultEvent && (
            <button
              onClick={() => {
                if (selectedResultSubcategory) setSelectedResultSubcategory(null);
                else if (selectedResultCategory) setSelectedResultCategory(null);
                else setSelectedResultEvent(null);
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
              setSelectedResultEvent(null);
              setSelectedResultCategory(null);
              setSelectedResultSubcategory(null);
            }}
            className={`cursor-pointer ${
              !selectedResultEvent
                ? 'text-[#1E3A8A] font-black'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            All Tournaments
          </span>
          {selectedResultEvent && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span
                onClick={() => {
                  setSelectedResultCategory(null);
                  setSelectedResultSubcategory(null);
                }}
                className={`cursor-pointer ${
                  !selectedResultCategory
                    ? 'text-[#1E3A8A] font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {selectedResultEvent.title}
              </span>
            </>
          )}
          {selectedResultCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span
                onClick={() => setSelectedResultSubcategory(null)}
                className={`cursor-pointer ${
                  !selectedResultSubcategory
                    ? 'text-[#1E3A8A] font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {selectedResultCategory.name}
              </span>
            </>
          )}
          {selectedResultSubcategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[#E63946] font-black">{selectedResultSubcategory}</span>
            </>
          )}
        </div>
      </div>

      {!selectedResultEvent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((ev: any) => {
            const matchedCats = categories.filter((c: any) => {
              const cEvId = c.eventId?._id ? c.eventId._id.toString() : c.eventId?.toString();
              return cEvId === ev._id.toString();
            });
            const evResults = results.filter(
              (rs: any) => rs.eventId?._id === ev._id || rs.eventId === ev._id
            );
            const pubCount = evResults.filter((rs: any) => rs.isPublished).length;
            const draftCount = evResults.length - pubCount;

            return (
              <div
                key={ev._id}
                onClick={() => setSelectedResultEvent(ev)}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:border-amber-500 transition cursor-pointer space-y-4 group"
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A]">
                      {matchedCats.length} Categories
                    </span>
                    {evResults.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-500">
                        {pubCount} Public • {draftCount} Private
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-base group-hover:text-amber-700 transition">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Date: {new Date(ev.eventDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-xs text-amber-700 font-bold pt-3 border-t flex items-center justify-between">
                  <span>Open Category Folders</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedResultEvent && !selectedResultCategory && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories
            .filter((c: any) => {
              const cEvId = c.eventId?._id ? c.eventId._id.toString() : c.eventId?.toString();
              return cEvId === selectedResultEvent._id.toString();
            })
            .map((cat: any, idx: number) => {
              const subList = Array.isArray(cat.subcategories)
                ? cat.subcategories
                : (cat.subcategories || '')
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean);
              const enrolledCount = getCategoryAthletesCount(
                registrations,
                categories,
                selectedResultEvent._id,
                cat._id,
                cat.name
              );

              return (
                <div
                  key={cat._id || idx}
                  onClick={() => {
                    setSelectedResultCategory(cat);
                    if (subList.length === 0) setSelectedResultSubcategory('All Athletes');
                  }}
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
                    <h3 className="font-black text-slate-900 text-base group-hover:text-amber-700 transition">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{subList.length} Sub-Divisions</p>
                  </div>

                  <div className="text-xs text-amber-700 font-bold pt-3 border-t flex items-center justify-between">
                    <span>
                      {subList.length > 0 ? 'Open Sub-Category Folders' : 'View Athletes'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {selectedResultEvent && selectedResultCategory && !selectedResultSubcategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {(Array.isArray(selectedResultCategory.subcategories)
            ? selectedResultCategory.subcategories
            : (selectedResultCategory.subcategories || '')
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean)
          ).map((subItem: any, sIdx: number) => {
            const subName =
              typeof subItem === 'string'
                ? subItem
                : subItem.name || subItem.title || 'Division';
            const subAthleteCount = getSubcategoryAthletesCount(
              registrations,
              categories,
              selectedResultEvent._id,
              selectedResultCategory._id,
              selectedResultCategory.name,
              subName
            );

            return (
              <div
                key={sIdx}
                onClick={() => setSelectedResultSubcategory(subName)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#1E3A8A] transition cursor-pointer space-y-3 group"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-slate-100 text-slate-700">
                    {subAthleteCount} Players
                  </span>
                </div>

                <h4 className="font-black text-slate-900 text-sm group-hover:text-[#1E3A8A] transition truncate">
                  {subName}
                </h4>

                <div className="text-[11px] text-[#1E3A8A] font-bold pt-2 border-t flex items-center justify-between">
                  <span>Manage Results</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedResultEvent &&
        selectedResultCategory &&
        selectedResultSubcategory &&
        (() => {
          const eventCatsCount = categories.filter((c: any) => {
            const cEvId = c.eventId?._id ? c.eventId._id.toString() : c.eventId?.toString();
            return cEvId === selectedResultEvent._id.toString();
          }).length;

          const rawSubList: any[] = Array.isArray(selectedResultCategory.subcategories)
            ? selectedResultCategory.subcategories
            : (selectedResultCategory.subcategories || '')
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean);
          const allSubs = rawSubList.map((s) =>
            (typeof s === 'string' ? s : s.name || s.title || '').trim()
          );

          const eventRegs = registrations.filter((r: any) => {
            const eId = r.eventId?._id ? r.eventId._id.toString() : r.eventId?.toString();
            return eId === selectedResultEvent._id.toString();
          });

          const categoryAthletes = eventRegs.flatMap((r: any) =>
            getAthletes(r)
              .filter((p: any) =>
                doesAthleteMatchCategory(
                  p,
                  selectedResultCategory._id,
                  selectedResultCategory.name,
                  eventCatsCount
                )
              )
              .map((p: any) => ({
                ...p,
                teamName: r.teamName || r.teamId?.teamName || 'Registered Team',
              }))
          );

          const subMatchedAthletes = categoryAthletes.filter((p: any) =>
            doesAthleteMatchSubcategory(p, selectedResultSubcategory, allSubs)
          );

          const playersToDisplay =
            subMatchedAthletes.length > 0 ? subMatchedAthletes : categoryAthletes;

          return (
            <div className="space-y-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Active Division Roster
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedResultCategory.name} &mdash;{' '}
                    <span className="text-[#E63946]">{selectedResultSubcategory}</span>
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleBulkPublishSubcategoryResults(false, playersToDisplay)
                    }
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200"
                  >
                    🔒 Keep All Private (Draft)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleBulkPublishSubcategoryResults(true, playersToDisplay)
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    🌐 Publish All Results Live
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                  <thead>
                    <tr className="border-b bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                      <th className="py-3.5 px-5">#</th>
                      <th className="py-3.5 px-5">ATHLETE</th>
                      <th className="py-3.5 px-5">GENDER / AGE</th>
                      <th className="py-3.5 px-5">TEAM</th>
                      <th className="py-3.5 px-5">ASSIGNED POSITION</th>
                      <th className="py-3.5 px-5">VISIBILITY (CLICK TO TOGGLE)</th>
                      <th className="py-3.5 px-5 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {playersToDisplay.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-10 text-center text-slate-400 font-semibold"
                        >
                          Is category division mein koi athlete registered nahi hai.
                        </td>
                      </tr>
                    ) : (
                      playersToDisplay.map((player: any, idx: number) => {
                        const resMatch = results.find(
                          (rs: any) =>
                            (rs.eventId?._id === selectedResultEvent._id ||
                              rs.eventId === selectedResultEvent._id) &&
                            rs.playerName === player.name
                        );

                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-5 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3.5 px-5 font-black text-slate-900">
                              {player.name}
                            </td>
                            <td className="py-3.5 px-5 text-slate-500">
                              {player.gender || 'Male'}{' '}
                              {player.age ? `(${player.age} Yrs)` : ''}
                            </td>
                            <td className="py-3.5 px-5 font-bold text-slate-700">
                              {player.teamName}
                            </td>
                            <td className="py-3.5 px-5">
                              {resMatch ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-full shadow-2xs">
                                    {resMatch.position}
                                  </span>
                                  {resMatch.score && (
                                    <span className="font-mono text-[11px] font-bold text-slate-500">
                                      ({resMatch.score} pts)
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="py-3.5 px-5">
                              {resMatch ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleResult(resMatch._id)}
                                  title="Click to switch between Private (Draft) and Public (Live)"
                                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer transition border ${
                                    resMatch.isPublished
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                  }`}
                                >
                                  {resMatch.isPublished
                                    ? '🌐 Published (Live)'
                                    : '🔒 Private (Draft)'}
                                </button>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setAssigningPlayer({
                                    teamName: player.teamName,
                                    playerName: player.name,
                                    categoryId: selectedResultCategory._id,
                                    categoryName: selectedResultCategory.name,
                                    subCategory: selectedResultSubcategory,
                                    position: resMatch?.position || '1st (Gold 🥇)',
                                    score: resMatch?.score || '9.85',
                                    isPublished: resMatch ? Boolean(resMatch.isPublished) : false,
                                  })
                                }
                                className="px-3.5 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition"
                              >
                                {resMatch ? 'Edit Result' : 'Assign Medal'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
    </div>
  );
}