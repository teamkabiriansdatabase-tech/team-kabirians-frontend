'use client';

import {
  Plus, ArrowRight, FileSpreadsheet, ArrowLeft, Layers,
  Trash2, Download, CreditCard
} from 'lucide-react';
import {
  getAthletes,
  getRegId,
  getCategoryAthletesCount,
  getSubcategoryAthletesCount,
  exportCategoryWiseCSV,
  exportSingleCategoryCSV,
  downloadReceiptImage,
} from '../_utils/adminHelpers';

export function CategoriesTab({
  events,
  categories,
  registrations,
  selectedCatEvent,
  setSelectedCatEvent,
  setShowCreateEventModal,
  setShowAddSingleCategoryModal,
  setInlineConfirmation,
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in">
      {!selectedCatEvent && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-2xs">
            <div>
              <h2 className="text-xl font-black text-slate-900">Categories &amp; Sub-Divisions Hub</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an event to view categories, weight divisions, and live registered athlete counts.
              </p>
            </div>
            <button
              onClick={() => setShowCreateEventModal(true)}
              className="px-4 py-2.5 bg-[#E63946] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Event with Categories
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((ev: any) => {
              const matchedCats = categories.filter((c: any) => {
                const cEvId = c.eventId?._id ? c.eventId._id.toString() : c.eventId?.toString();
                return cEvId === ev._id.toString();
              });
              const eventRegs = registrations.filter((r: any) => {
                const eId = r.eventId?._id ? r.eventId._id.toString() : r.eventId?.toString();
                return eId === ev._id.toString();
              });
              const totalAthletesInEvent = eventRegs.reduce(
                (sum: number, r: any) => sum + getAthletes(r).length,
                0
              );

              return (
                <div
                  key={ev._id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:border-[#1E3A8A] hover:shadow-md transition space-y-4 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A]">
                      {ev.eventType}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {totalAthletesInEvent} Athletes
                    </span>
                  </div>

                  <div onClick={() => setSelectedCatEvent(ev)} className="cursor-pointer">
                    <h3 className="font-black text-slate-900 text-base group-hover:text-[#1E3A8A] transition">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{matchedCats.length} Categories Configured</p>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCatEvent(ev)}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Categories</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportCategoryWiseCSV(ev, eventRegs);
                      }}
                      title="Download Category Excel Roster"
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedCatEvent && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-2xs">
            <div>
              <button
                onClick={() => setSelectedCatEvent(null)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to All Events
              </button>
              <h2 className="text-xl font-black text-slate-900">
                {selectedCatEvent.title} &mdash; Categories &amp; Divisions
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  const evRegs = registrations.filter((r: any) => {
                    const eId = r.eventId?._id ? r.eventId._id.toString() : r.eventId?.toString();
                    return eId === selectedCatEvent._id.toString();
                  });
                  exportCategoryWiseCSV(selectedCatEvent, evRegs);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export All Categories (Excel)</span>
              </button>

              <button
                onClick={() => setShowAddSingleCategoryModal(true)}
                className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> + Add Category
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {categories
              .filter((c: any) => {
                const cEvId = c.eventId?._id ? c.eventId._id.toString() : c.eventId?.toString();
                return cEvId === selectedCatEvent._id.toString();
              })
              .map((cat: any, idx: number) => {
                const registeredCount = getCategoryAthletesCount(
                  registrations,
                  categories,
                  selectedCatEvent._id,
                  cat._id,
                  cat.name
                );
                const subList = Array.isArray(cat.subcategories)
                  ? cat.subcategories
                  : (cat.subcategories || '')
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter(Boolean);

                return (
                  <div
                    key={cat._id || idx}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900">{cat.name}</h3>
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Division #{idx + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-right">
                          <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                            Enrolled Athletes
                          </span>
                          <span className="text-sm font-black text-emerald-800">
                            {registeredCount} Registered
                          </span>
                        </div>

                        <div className="bg-slate-50 border px-3.5 py-1.5 rounded-xl text-right font-mono text-xs">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block font-sans">
                            Base Fee
                          </span>
                          <span className="font-bold text-slate-800">
                            Rs {cat.baseFee?.toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            exportSingleCategoryCSV(registrations, categories, selectedCatEvent, cat)
                          }
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Export Sheet</span>
                        </button>

                        <button
                          onClick={() =>
                            setInlineConfirmation({
                              actionType: 'delete_category',
                              id: cat._id,
                              title: cat.name,
                            })
                          }
                          className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-black uppercase text-slate-500 mb-2.5">
                        Sub-Divisions Breakdown:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                        {subList.map((subItem: any, sIdx: number) => {
                          const subTitle =
                            typeof subItem === 'string'
                              ? subItem
                              : subItem.name || subItem.title || 'Division';
                          const subCount = getSubcategoryAthletesCount(
                            registrations,
                            categories,
                            selectedCatEvent._id,
                            cat._id,
                            cat.name,
                            subTitle
                          );

                          return (
                            <div
                              key={sIdx}
                              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs"
                            >
                              <span className="font-bold text-slate-800 truncate mr-2">{subTitle}</span>
                              <span
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black font-mono ${
                                  subCount > 0
                                    ? 'bg-blue-100 text-[#1E3A8A]'
                                    : 'bg-slate-200/70 text-slate-500'
                                }`}
                              >
                                {subCount} Registered
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

export function RegistrationsTab({
  events,
  registrations,
  categories,
  selectedRegEvent,
  setSelectedRegEvent,
  inspectReg,
  setInspectReg,
  detailActiveTab,
  setDetailActiveTab,
  handleVerifyPayment,
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in">
      {!selectedRegEvent && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border shadow-2xs">
            <h2 className="text-xl font-black text-slate-900">Team Registrations Hub</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an event below to view registered teams and export rosters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((ev: any) => {
              const evRegs = registrations.filter(
                (r: any) => r.eventId?._id === ev._id || r.eventId === ev._id
              );
              return (
                <div
                  key={ev._id}
                  onClick={() => setSelectedRegEvent(ev)}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:border-[#1E3A8A] transition cursor-pointer space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {ev.eventType}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{evRegs.length} Teams</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base">{ev.title}</h3>
                  <div className="text-xs text-blue-600 font-bold pt-2 border-t flex items-center justify-between">
                    <span>Open Registered Teams</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedRegEvent && !inspectReg && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border shadow-2xs">
            <div>
              <button
                onClick={() => setSelectedRegEvent(null)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to All Events
              </button>
              <h2 className="text-xl font-black text-slate-900">
                {selectedRegEvent.title} &mdash; Registered Teams
              </h2>
            </div>

            <button
              onClick={() => {
                const evRegs = registrations.filter(
                  (r: any) =>
                    r.eventId?._id === selectedRegEvent._id || r.eventId === selectedRegEvent._id
                );
                exportCategoryWiseCSV(selectedRegEvent, evRegs);
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Category-Wise Excel</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border shadow-2xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[650px]">
              <thead>
                <tr className="border-b bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                  <th className="py-3.5 px-5">#</th>
                  <th className="py-3.5 px-5">TEAM NAME</th>
                  <th className="py-3.5 px-5">HEAD / COACH</th>
                  <th className="py-3.5 px-5">ATHLETES</th>
                  <th className="py-3.5 px-5">PAYMENT</th>
                  <th className="py-3.5 px-5">STATUS</th>
                  <th className="py-3.5 px-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {registrations
                  .filter(
                    (r: any) =>
                      r.eventId?._id === selectedRegEvent._id || r.eventId === selectedRegEvent._id
                  )
                  .map((reg: any, idx: number) => (
                    <tr key={getRegId(reg) || idx} className="hover:bg-slate-50">
                      <td className="py-3 px-5 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-5 font-black text-slate-900">
                        {reg.teamName || reg.teamId?.teamName || 'Registered Team'}
                      </td>
                      <td className="py-3 px-5">
                        {reg.coachName || reg.teamHead?.name || reg.teamId?.teamHeadName || 'Coach'}
                      </td>
                      <td className="py-3 px-5 font-bold">{getAthletes(reg).length}</td>
                      <td className="py-3 px-5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">
                          {reg.paymentOption}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                          {reg.registrationStatus}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <button
                          onClick={() => setInspectReg(reg)}
                          className="px-3.5 py-1.5 border rounded-xl text-blue-700 font-bold hover:bg-blue-50 cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedRegEvent && inspectReg && (
        <div className="space-y-6">
          <button
            onClick={() => setInspectReg(null)}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Teams List
          </button>

          <div className="bg-white rounded-3xl p-5 sm:p-8 border shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#0B132B] text-white flex items-center justify-center font-black text-xl sm:text-2xl shrink-0">
                {(inspectReg.teamName || inspectReg.teamId?.teamName)?.charAt(0) || 'T'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {inspectReg.teamName || inspectReg.teamId?.teamName || 'Team'}
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 uppercase">
                    {inspectReg.registrationStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Event: {selectedRegEvent.title}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-b pb-2 overflow-x-auto max-w-full scrollbar-none">
            {['team_head', 'team_members', 'payment_details'].map((tb) => (
              <button
                key={tb}
                onClick={() => setDetailActiveTab(tb as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap cursor-pointer ${
                  detailActiveTab === tb ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tb.replace('_', ' ')}
              </button>
            ))}
          </div>

          {detailActiveTab === 'team_head' && (
            <div className="bg-white p-6 rounded-3xl border shadow-2xs space-y-2 text-xs">
              <div className="font-bold text-sm text-slate-900">
                {inspectReg.coachName ||
                  inspectReg.teamHead?.name ||
                  inspectReg.teamId?.teamHeadName ||
                  'Head Coach'}
              </div>
              <div className="text-slate-500">
                Phone:{' '}
                {inspectReg.coachPhone ||
                  inspectReg.phone ||
                  inspectReg.teamHead?.phone ||
                  inspectReg.teamId?.contactPhone ||
                  '—'}
              </div>
              <div className="text-slate-500">
                Email:{' '}
                {inspectReg.coachEmail ||
                  inspectReg.email ||
                  inspectReg.teamHead?.email ||
                  inspectReg.teamId?.email ||
                  '—'}
              </div>
            </div>
          )}

          {detailActiveTab === 'team_members' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-5 animate-in fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-black text-base text-slate-900">
                    Registered Athletes / Competitors
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Athlete personal details, age, CNIC/B-Form, weight/belt division, and registered categories.
                  </p>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-[#1E3A8A] border border-blue-200">
                  {getAthletes(inspectReg).length} Total Athletes
                </span>
              </div>

              {getAthletes(inspectReg).length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Is team registration mein koi athlete mojood nahi hai.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getAthletes(inspectReg).map((p: any, idx: number) => {
                    const resolvedCategories = (() => {
                      if (p.categoryName) return [p.categoryName];

                      const rawCats = p.selectedCategories || p.categories || [];
                      if (Array.isArray(rawCats) && rawCats.length > 0) {
                        return rawCats.map((sc: any) => {
                          if (typeof sc === 'object' && sc !== null) {
                            if (sc.name) return sc.name;
                            if (sc.categoryName) return sc.categoryName;
                            const scId = sc._id || sc.categoryId || sc.id;
                            if (scId) {
                              const match = categories.find(
                                (c: any) => (c._id?.toString() || '') === scId.toString()
                              );
                              if (match?.name) return match.name;
                            }
                          }
                          const idStr = String(sc);
                          const match = categories.find(
                            (c: any) => (c._id?.toString() || '') === idStr
                          );
                          return match?.name || idStr;
                        });
                      }

                      if (
                        Array.isArray(inspectReg.categories) &&
                        inspectReg.categories.length > 0
                      ) {
                        const matched = categories.find((c: any) =>
                          inspectReg.categories.some(
                            (ic: any) => (ic._id || ic).toString() === (c._id || '').toString()
                          )
                        );
                        if (matched?.name) return [matched.name];
                      }

                      return ['Standard Category'];
                    })();

                    const cnicDisplay = p.cnic || p.cnicOrBForm || p.bForm || 'N/A';
                    const ageDisplay = p.age ? `${p.age} Yrs` : 'N/A';
                    const genderDisplay = p.gender || 'N/A';
                    const beltOrDivision =
                      p.subCategory ||
                      p.division ||
                      p.subDivision ||
                      p.belt ||
                      p.weightCategory ||
                      'Standard Open';

                    return (
                      <div
                        key={idx}
                        className="p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 transition"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#0B132B] text-white flex items-center justify-center font-black text-xs shadow-xs">
                              #{idx + 1}
                            </div>
                            <div>
                              <h5 className="font-black text-sm text-slate-900 leading-tight">
                                {p.name}
                              </h5>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Athlete ID: #
                                {p._id ? p._id.toString().slice(-6).toUpperCase() : `ATH-${idx + 1}`}
                              </span>
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1E3A8A] border border-blue-200">
                            {beltOrDivision}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold uppercase">
                              Age
                            </span>
                            <span className="font-bold text-slate-800">{ageDisplay}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold uppercase">
                              Gender
                            </span>
                            <span className="font-bold text-slate-800 capitalize">
                              {genderDisplay}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold uppercase">
                              CNIC / B-Form
                            </span>
                            <span className="font-mono font-bold text-slate-800 text-[11px]">
                              {cnicDisplay}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Registered Category:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {resolvedCategories.map((catTitle: string, cIdx: number) => (
                              <span
                                key={cIdx}
                                className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 inline-flex items-center gap-1.5"
                              >
                                <span>🥋</span>
                                <span>{catTitle}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {detailActiveTab === 'payment_details' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5 animate-in fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Payment &amp; Transaction Details
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Payment verification summary for this registration
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    inspectReg.paymentOption === 'half'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {inspectReg.paymentOption === 'half' ? 'Half Payment' : 'Full Payment'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Transaction ID:</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {inspectReg.transactionId || inspectReg.lastTransactionId || 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Payment Date:</span>
                    <span className="font-bold text-slate-800">
                      {new Date(
                        inspectReg.paymentDate || inspectReg.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Total Amount Due:</span>
                    <span className="font-mono font-bold text-slate-900">
                      PKR {Number(inspectReg.totalAmountDue || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Total Amount Paid:</span>
                    <span className="font-mono font-black text-emerald-700 text-sm">
                      PKR{' '}
                      {Number(
                        inspectReg.totalAmountPaid || inspectReg.totalAmountDue || 0
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Remaining Balance:</span>
                    <span
                      className={`font-mono font-bold ${
                        Number(inspectReg.remainingBalance || 0) > 0
                          ? 'text-red-600'
                          : 'text-slate-500'
                      }`}
                    >
                      PKR {Number(inspectReg.remainingBalance || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 font-bold">Payment Status:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        inspectReg.registrationStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : inspectReg.registrationStatus === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {inspectReg.registrationStatus || 'Under Review'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                    Payment Proof Receipt:
                  </span>
                  {(() => {
                    const slip =
                      inspectReg.paymentSlipUrl ||
                      inspectReg.paymentProofUrl ||
                      inspectReg.slipUrl ||
                      inspectReg.receiptUrl ||
                      inspectReg.proofUrl ||
                      inspectReg.paymentProof ||
                      inspectReg.paymentSlip;

                    return slip ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 overflow-hidden flex flex-col items-center gap-2">
                        <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                          <img
                            src={slip}
                            alt="Payment Receipt"
                            className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(slip, '_blank')}
                          />
                        </div>
                        <div className="w-full flex items-center justify-between px-1">
                          <span className="text-[10px] text-slate-400 font-bold">
                            Click image to enlarge
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              downloadReceiptImage(
                                slip,
                                `Receipt_${inspectReg.teamName || 'Team'}.jpg`
                              )
                            }
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                        <CreditCard className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-xs font-bold">No receipt image attached</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleVerifyPayment(getRegId(inspectReg), 'approved')}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Approve
            </button>
            <button
              onClick={() => handleVerifyPayment(getRegId(inspectReg), 'rejected')}
              className="px-5 py-2.5 bg-[#E63946] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}