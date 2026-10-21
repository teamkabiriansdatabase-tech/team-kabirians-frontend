'use client';

import {
  X, Trash2, Layers, Download, CreditCard, Clock,
  ExternalLink, Edit, Printer, AlertTriangle, CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import {
  getAthletes,
  getRegId,
  isRegPending,
  isRegApproved,
  downloadReceiptImage,
} from '../_utils/adminHelpers';

export default function AdminModals({
  showCreateEventModal,
  setShowCreateEventModal,
  handleCreateEvent,
  coverFile,
  setCoverFile,
  eventForm,
  setEventForm,
  ruleBookPdfFile,
  setRuleBookPdfFile,
  modalCategories,
  setModalCategories,
  newCatName,
  setNewCatName,
  newCatFee,
  setNewCatFee,
  newCatLateFee,
  setNewCatLateFee,
  newCatSubs,
  setNewCatSubs,
  handleAddCategoryToModal,
  eventPublishing,
  publishStatusText,
  showEditEventModal,
  setShowEditEventModal,
  handleUpdateEvent,
  editCoverFile,
  setEditCoverFile,
  editEventForm,
  setEditEventForm,
  editRuleBookPdfFile,
  setEditRuleBookPdfFile,
  editCategories,
  setEditCategories,
  newEditCatName,
  setNewEditCatName,
  newEditCatFee,
  setNewEditCatFee,
  newEditCatLateFee,
  setNewEditCatLateFee,
  newEditCatSubs,
  setNewEditCatSubs,
  handleAddCategoryInEditModal,
  handleRemoveCategoryInEditModal,
  editUpdating,
  showAddSingleCategoryModal,
  setShowAddSingleCategoryModal,
  selectedCatEvent,
  handleCreateSingleCategory,
  singleCatForm,
  setSingleCatForm,
  selectedPaymentProof,
  setSelectedPaymentProof,
  setRegistrations,
  fetchAdminData,
  showNotice,
  handleVerifyPayment,
  activeVideoPlayer,
  setActiveVideoPlayer,
  selectedEventStats,
  setSelectedEventStats,
  registrations,
  handleChangeEventStatus,
  handleOpenEditEvent,
  setInlineConfirmation,
  printablePassReg,
  setPrintablePassReg,
  handlePrintSlip,
  selectedOfflineEvent,
  categories,
  assigningPlayer,
  setAssigningPlayer,
  handleAssignResult,
  activeRuleTextModal,
  setActiveRuleTextModal,
}: any) {
  return (
    <>
      {/* MODAL 1: ADD NEW EVENT */}
      {showCreateEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-start pb-3 border-b">
              <div>
                <h3 className="text-xl font-black text-slate-900">Add New Event</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attach Cover Banner, Rule Book, Sub-Categories, and Deadlines.
                </p>
              </div>
              <button
                onClick={() => setShowCreateEventModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-5 text-xs font-semibold">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">
                  COVER IMAGE BANNER
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-[#1E3A8A] file:font-bold file:cursor-pointer"
                />

                {coverFile && (
                  <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-40 w-full shadow-xs">
                    <img
                      src={URL.createObjectURL(coverFile)}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverFile(null)}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-red-600 text-white rounded-lg cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    EVENT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sindh National Championship 2026"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    TYPE
                  </label>
                  <select
                    value={eventForm.eventType}
                    onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs border rounded-xl bg-white"
                  >
                    <option value="online">Online</option>
                    <option value="physical">Physical (Offline)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  placeholder="Event overview..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tournament Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Standard Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventForm.standardDeadline}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, standardDeadline: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-red-600 mb-1">
                    Late Fee Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventForm.lateFeeStartDate}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, lateFeeStartDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-red-200 rounded-xl bg-white text-red-700"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-slate-700">
                    TOURNAMENT RULE BOOK
                  </label>
                  <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, ruleBookType: 'text' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        eventForm.ruleBookType === 'text'
                          ? 'bg-[#1E3A8A] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Paste Text Rules
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, ruleBookType: 'pdf' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        eventForm.ruleBookType === 'pdf'
                          ? 'bg-[#1E3A8A] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Upload PDF
                    </button>
                  </div>
                </div>

                {eventForm.ruleBookType === 'text' ? (
                  <textarea
                    rows={3}
                    value={eventForm.ruleBookText}
                    onChange={(e) => setEventForm({ ...eventForm, ruleBookText: e.target.value })}
                    placeholder="Enter competition rules, scoring criteria, and uniform guidelines here..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setRuleBookPdfFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-purple-50 file:text-purple-700 file:font-bold file:cursor-pointer"
                    />
                    {ruleBookPdfFile && (
                      <div className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800">
                        <span className="font-bold truncate">{ruleBookPdfFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setRuleBookPdfFile(null)}
                          className="text-purple-600 hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-slate-700">
                    EVENT CATEGORIES &amp; CHARGES
                  </label>
                  <span className="text-xs font-bold bg-blue-50 text-[#1E3A8A] px-2.5 py-0.5 rounded-full">
                    {modalCategories.length} Categories Added
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Base Fee"
                      value={newCatFee || ''}
                      onChange={(e) => setNewCatFee(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border rounded-xl outline-none font-mono"
                    />
                    <input
                      type="number"
                      placeholder="Late Fee Extra"
                      value={newCatLateFee || ''}
                      onChange={(e) => setNewCatLateFee(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-red-200 text-red-700 rounded-xl outline-none font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Subcategories (Comma separated: Under 54 kg, Under 58 kg)"
                      value={newCatSubs}
                      onChange={(e) => setNewCatSubs(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border rounded-xl outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategoryToModal}
                      className="px-4 py-2 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      + Add Category
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {modalCategories.map((cat: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white rounded-xl border flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{cat.name}</span>
                        <div className="text-[10px] text-slate-400">{cat.subcategories}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-600">
                          PKR {cat.baseFee}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setModalCategories(
                              modalCategories.filter((_: any, i: number) => i !== idx)
                            )
                          }
                          className="text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateEventModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={eventPublishing}
                  className="px-6 py-2.5 bg-[#0B132B] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  {eventPublishing ? publishStatusText || 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT EVENT */}
      {showEditEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-start pb-3 border-b">
              <div>
                <h3 className="text-xl font-black text-slate-900">Edit Tournament</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Modify championship details, rule book, and update categories.
                </p>
              </div>
              <button
                onClick={() => setShowEditEventModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">
                  Update Cover Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-[#1E3A8A] file:font-bold file:cursor-pointer"
                />
                {(editCoverFile || editEventForm.existingCoverUrl) && (
                  <div className="mt-2.5 relative rounded-2xl overflow-hidden border bg-slate-900 h-36 w-full">
                    <img
                      src={
                        editCoverFile
                          ? URL.createObjectURL(editCoverFile)
                          : editEventForm.existingCoverUrl
                      }
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editEventForm.title}
                    onChange={(e) =>
                      setEditEventForm({ ...editEventForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-xs border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editEventForm.eventType}
                    onChange={(e) =>
                      setEditEventForm({ ...editEventForm, eventType: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-xs border rounded-xl bg-white"
                  >
                    <option value="online">Online</option>
                    <option value="physical">Physical (Offline)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Tournament Status
                </label>
                <select
                  value={editEventForm.status}
                  onChange={(e) =>
                    setEditEventForm({ ...editEventForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-xs border rounded-xl bg-white"
                >
                  <option value="upcoming">Upcoming (Registration Closed)</option>
                  <option value="live">Live (Registration Open)</option>
                  <option value="closed">Closed</option>
                  <option value="ended">Ended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editEventForm.description}
                  onChange={(e) =>
                    setEditEventForm({ ...editEventForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 text-xs border rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tournament Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editEventForm.eventDate}
                    onChange={(e) =>
                      setEditEventForm({ ...editEventForm, eventDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Standard Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={editEventForm.standardDeadline}
                    onChange={(e) =>
                      setEditEventForm({ ...editEventForm, standardDeadline: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-red-600 mb-1">
                    Late Fee Start Date
                  </label>
                  <input
                    type="date"
                    value={editEventForm.lateFeeStartDate}
                    onChange={(e) =>
                      setEditEventForm({ ...editEventForm, lateFeeStartDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-red-200 rounded-xl bg-white text-red-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-red-600 mb-1">
                  Late Fee Surcharge (PKR)
                </label>
                <input
                  type="number"
                  value={editEventForm.lateFee}
                  onChange={(e) =>
                    setEditEventForm({ ...editEventForm, lateFee: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs border border-red-200 rounded-xl outline-none font-mono text-red-700"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-slate-700">
                    TOURNAMENT RULE BOOK
                  </label>
                  <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() =>
                        setEditEventForm({ ...editEventForm, ruleBookType: 'text' })
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        editEventForm.ruleBookType === 'text'
                          ? 'bg-[#1E3A8A] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Paste Text Rules
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditEventForm({ ...editEventForm, ruleBookType: 'pdf' })
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        editEventForm.ruleBookType === 'pdf'
                          ? 'bg-[#1E3A8A] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Upload PDF
                    </button>
                  </div>
                </div>

                {editEventForm.ruleBookType === 'text' ? (
                  <textarea
                    rows={3}
                    value={editEventForm.ruleBookText}
                    onChange={(e) =>
                      setEditEventForm({ ...editEventForm, ruleBookText: e.target.value })
                    }
                    placeholder="Enter competition rules, scoring criteria, and uniform guidelines here..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setEditRuleBookPdfFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-purple-50 file:text-purple-700 file:font-bold file:cursor-pointer"
                    />

                    {editRuleBookPdfFile ? (
                      <div className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800">
                        <span className="font-bold truncate">
                          New PDF: {editRuleBookPdfFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditRuleBookPdfFile(null)}
                          className="text-purple-600 hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : editEventForm.existingPdfUrl ? (
                      <div className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800">
                        <span className="font-bold truncate">Existing PDF File Attached</span>
                        <a
                          href={editEventForm.existingPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-700 underline font-bold cursor-pointer"
                        >
                          View PDF
                        </a>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Manage Categories in this Tournament</span>
                  </label>
                  <span className="text-[11px] font-bold bg-blue-50 text-[#1E3A8A] px-2.5 py-0.5 rounded-full">
                    {editCategories.length} Configured
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">
                    + Add New Category
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={newEditCatName}
                      onChange={(e) => setNewEditCatName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Base Fee (PKR)"
                      value={newEditCatFee || ''}
                      onChange={(e) => setNewEditCatFee(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border rounded-xl outline-none font-mono"
                    />
                    <input
                      type="number"
                      placeholder="Late Fee Extra"
                      value={newEditCatLateFee || ''}
                      onChange={(e) => setNewEditCatLateFee(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-red-200 text-red-700 rounded-xl outline-none font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Sub-divisions / Weight (Comma separated: Under 54 kg, Under 58 kg)"
                      value={newEditCatSubs}
                      onChange={(e) => setNewEditCatSubs(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border rounded-xl outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategoryInEditModal}
                      className="px-4 py-2 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {editCategories.length === 0 ? (
                    <div className="text-center py-3 text-slate-400 text-xs italic">
                      No categories linked. Add one above.
                    </div>
                  ) : (
                    editCategories.map((cat: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => {
                              const updated = [...editCategories];
                              updated[idx].name = e.target.value;
                              setEditCategories(updated);
                            }}
                            placeholder="Category Name"
                            className="font-bold text-slate-900 text-xs border-b border-transparent focus:border-blue-600 outline-none flex-1 py-0.5"
                          />
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 font-mono text-xs">
                              <span className="text-[10px] text-slate-400">Rs</span>
                              <input
                                type="number"
                                value={cat.baseFee}
                                onChange={(e) => {
                                  const updated = [...editCategories];
                                  updated[idx].baseFee = Number(e.target.value);
                                  setEditCategories(updated);
                                }}
                                className="w-16 px-1.5 py-0.5 border rounded text-emerald-700 font-bold outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCategoryInEditModal(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">
                            Sub-Divisions / Weight Classes:
                          </label>
                          <input
                            type="text"
                            value={cat.subcategories}
                            onChange={(e) => {
                              const updated = [...editCategories];
                              updated[idx].subcategories = e.target.value;
                              setEditCategories(updated);
                            }}
                            placeholder="Comma-separated weight classes"
                            className="w-full px-2.5 py-1 text-xs border rounded-lg bg-slate-50/70 outline-none text-slate-700 font-medium"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditEventModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editUpdating}
                  className="px-6 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  {editUpdating ? publishStatusText || 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD SINGLE CATEGORY */}
      {showAddSingleCategoryModal && selectedCatEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Add Category to Tournament
                </h3>
                <p className="text-[10px] text-slate-400">{selectedCatEvent.title}</p>
              </div>
              <button
                onClick={() => setShowAddSingleCategoryModal(false)}
                className="cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateSingleCategory} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Female Kyorugi"
                  value={singleCatForm.name}
                  onChange={(e) =>
                    setSingleCatForm({ ...singleCatForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase mb-1">
                    Base Fee (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={singleCatForm.baseFee}
                    onChange={(e) =>
                      setSingleCatForm({ ...singleCatForm, baseFee: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-red-600 uppercase mb-1">
                    Late Fee Extra (PKR)
                  </label>
                  <input
                    type="number"
                    value={singleCatForm.lateFee}
                    onChange={(e) =>
                      setSingleCatForm({ ...singleCatForm, lateFee: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-red-200 text-red-700 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 uppercase mb-1">
                  Sub-Categories / Weight Divisions
                </label>
                <input
                  type="text"
                  placeholder="Under 46 kg, Under 49 kg, Open Division"
                  value={singleCatForm.subcategories}
                  onChange={(e) =>
                    setSingleCatForm({ ...singleCatForm, subcategories: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1E3A8A] text-white rounded-xl font-bold mt-2 shadow-xs cursor-pointer"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PAYMENT PROOF */}
      {selectedPaymentProof && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs p-4 sm:py-8 flex justify-center items-start animate-in fade-in"
          onClick={() => setSelectedPaymentProof(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 space-y-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Payment Verification &amp; Slips
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect initial deposit slip and venue remaining balance payment receipts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPaymentProof(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const proofId = getRegId(selectedPaymentProof);
              const initialSlip =
                selectedPaymentProof.paymentSlipUrl ||
                selectedPaymentProof.paymentProofUrl ||
                selectedPaymentProof.slipUrl ||
                selectedPaymentProof.receiptUrl ||
                selectedPaymentProof.proofUrl;

              const remainingSlip =
                selectedPaymentProof.remainingSlipUrl ||
                selectedPaymentProof.remainingPaymentSlipUrl ||
                selectedPaymentProof.secondPaymentSlipUrl ||
                selectedPaymentProof.finalSlipUrl;

              const isHalf =
                (selectedPaymentProof.paymentOption || '').toLowerCase() === 'half';
              const totalDue = Number(selectedPaymentProof.totalAmountDue || 0);
              const halfCalculated = Math.round(totalDue / 2);
              const totalPaid = Number(
                selectedPaymentProof.totalAmountPaid || (isHalf ? halfCalculated : totalDue)
              );
              const remainingBalance = Number(
                selectedPaymentProof.remainingBalance ?? (isHalf ? totalDue - totalPaid : 0)
              );

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 uppercase text-[11px]">
                          1. Initial Payment Slip{' '}
                          {isHalf ? '(50% Advance)' : '(Full Payment)'}
                        </span>
                        {initialSlip && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadReceiptImage(
                                initialSlip,
                                `Initial_Slip_${selectedPaymentProof.teamName || 'Team'}.jpg`
                              )
                            }
                            className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            <Download className="w-3 h-3" /> Download
                          </button>
                        )}
                      </div>
                      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 h-60 flex items-center justify-center p-2">
                        {initialSlip ? (
                          <img
                            src={initialSlip}
                            alt="Initial Slip"
                            className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(initialSlip, '_blank')}
                          />
                        ) : (
                          <div className="text-center p-4 text-slate-400">
                            <CreditCard className="w-8 h-8 mx-auto mb-1 opacity-40 text-blue-900" />
                            <p className="text-xs">No initial receipt attached</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 uppercase text-[11px]">
                          2. Remaining Balance Slip (Venue Clearance)
                        </span>
                        {remainingSlip && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadReceiptImage(
                                remainingSlip,
                                `Remaining_Slip_${selectedPaymentProof.teamName || 'Team'}.jpg`
                              )
                            }
                            className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            <Download className="w-3 h-3" /> Download
                          </button>
                        )}
                      </div>
                      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 h-60 flex items-center justify-center p-2">
                        {remainingSlip ? (
                          <img
                            src={remainingSlip}
                            alt="Remaining Balance Slip"
                            className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(remainingSlip, '_blank')}
                          />
                        ) : (
                          <div className="text-center p-4 text-slate-400">
                            <Clock className="w-8 h-8 mx-auto mb-1 opacity-40 text-amber-500" />
                            <p className="text-xs font-bold">
                              Remaining balance slip not yet submitted
                            </p>
                            {remainingBalance > 0 && (
                              <p className="text-[10px] text-amber-600 mt-1">
                                PKR {remainingBalance.toLocaleString()} pending at venue counter.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Team
                      </span>
                      <span className="font-black text-slate-900 text-sm">
                        {selectedPaymentProof.teamName || 'Team'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Current Type
                      </span>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isHalf
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isHalf ? 'Half Payment' : 'Full Payment'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Total Due
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        PKR {totalDue.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Paid So Far
                      </span>
                      <span className="font-mono font-black text-emerald-700">
                        PKR {totalPaid.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Balance Due
                      </span>
                      <span
                        className={`font-mono font-black ${
                          remainingBalance > 0 ? 'text-red-600' : 'text-slate-700'
                        }`}
                      >
                        PKR {remainingBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200">
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const halfAmt = halfCalculated;
                            const remAmt = totalDue - halfAmt;

                            await api.put(`/admin/registrations/${proofId}/status`, {
                              status: 'approved',
                              registrationStatus: 'approved',
                              paymentOption: 'half',
                              totalAmountPaid: halfAmt,
                              remainingBalance: remAmt,
                            });

                            setRegistrations((prev: any[]) =>
                              prev.map((r) =>
                                getRegId(r) === proofId
                                  ? {
                                      ...r,
                                      registrationStatus: 'approved',
                                      status: 'approved',
                                      paymentOption: 'half',
                                      totalAmountPaid: halfAmt,
                                      remainingBalance: remAmt,
                                      paymentStatus: 'Paid',
                                    }
                                  : r
                              )
                            );

                            await fetchAdminData();
                            setSelectedPaymentProof(null);
                            showNotice(
                              `Half Payment (PKR ${halfAmt.toLocaleString()}) verified! Remaining Balance: PKR ${remAmt.toLocaleString()}`,
                              'success'
                            );
                          } catch (err: any) {
                            showNotice(
                              err.response?.data?.message || 'Failed to verify half payment.',
                              'error'
                            );
                          }
                        }}
                        className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition"
                      >
                        ✓ Verify Half Payment (50%)
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.put(`/admin/registrations/${proofId}/status`, {
                              status: 'approved',
                              registrationStatus: 'approved',
                              paymentOption: 'full',
                              totalAmountPaid: totalDue,
                              remainingBalance: 0,
                            });

                            setRegistrations((prev: any[]) =>
                              prev.map((r) =>
                                getRegId(r) === proofId
                                  ? {
                                      ...r,
                                      registrationStatus: 'approved',
                                      status: 'approved',
                                      paymentOption: 'full',
                                      totalAmountPaid: totalDue,
                                      remainingBalance: 0,
                                      paymentStatus: 'Paid',
                                    }
                                  : r
                              )
                            );

                            await fetchAdminData();
                            setSelectedPaymentProof(null);
                            showNotice(
                              'Registration approved & marked as 100% Full Payment Paid!',
                              'success'
                            );
                          } catch (err: any) {
                            showNotice(
                              err.response?.data?.message || 'Failed to approve full payment.',
                              'error'
                            );
                          }
                        }}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition"
                      >
                        ✓ Approve 100% Full Payment
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleVerifyPayment(proofId, 'rejected');
                          setSelectedPaymentProof(null);
                        }}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold cursor-pointer transition"
                      >
                        Reject
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentProof(null)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 5: VIDEO PLAYER */}
      {activeVideoPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveVideoPlayer(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {activeVideoPlayer.playerName} &mdash; Routine Video
                </h3>
                <p className="text-xs text-slate-500">
                  {activeVideoPlayer.teamName} | {activeVideoPlayer.categoryName} (
                  {activeVideoPlayer.subName})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(activeVideoPlayer.url, '_blank')}
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-purple-200 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </button>
                <button
                  onClick={() => setActiveVideoPlayer(null)}
                  className="p-1 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-md">
              <video
                src={activeVideoPlayer.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveVideoPlayer(null)}
                className="px-5 py-2 bg-[#0B132B] text-white font-bold rounded-xl cursor-pointer"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: EVENT STATS */}
      {selectedEventStats && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setSelectedEventStats(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative border my-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-4 border-b">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-slate-900">
                    {selectedEventStats.title}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-50 text-emerald-700">
                    ● {selectedEventStats.status || 'Upcoming'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedEventStats.eventType === 'online' ? '🌐 Online' : '📍 Physical'} |
                  Date: <b>{new Date(selectedEventStats.eventDate).toLocaleDateString()}</b> |
                  Deadline:{' '}
                  <b className="text-red-600">
                    {new Date(
                      selectedEventStats.standardDeadline ||
                        selectedEventStats.registrationDeadline
                    ).toLocaleDateString()}
                  </b>
                </p>
              </div>
              <button
                onClick={() => setSelectedEventStats(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {[
                {
                  label: 'Teams',
                  val: registrations.filter(
                    (r: any) =>
                      r.eventId?._id === selectedEventStats._id ||
                      r.eventId === selectedEventStats._id
                  ).length,
                },
                {
                  label: 'Athletes',
                  val: registrations
                    .filter(
                      (r: any) =>
                        r.eventId?._id === selectedEventStats._id ||
                        r.eventId === selectedEventStats._id
                    )
                    .reduce((sum: number, r: any) => sum + getAthletes(r).length, 0),
                },
                {
                  label: 'Pending Review',
                  val: registrations.filter(
                    (r: any) =>
                      (r.eventId?._id === selectedEventStats._id ||
                        r.eventId === selectedEventStats._id) &&
                      isRegPending(r.registrationStatus || r.status)
                  ).length,
                },
                {
                  label: 'Half Paid',
                  val: registrations.filter(
                    (r: any) =>
                      (r.eventId?._id === selectedEventStats._id ||
                        r.eventId === selectedEventStats._id) &&
                      (r.paymentOption === 'half' ||
                        r.registrationStatus === 'partially_paid')
                  ).length,
                },
                {
                  label: 'Approved',
                  val: registrations.filter(
                    (r: any) =>
                      (r.eventId?._id === selectedEventStats._id ||
                        r.eventId === selectedEventStats._id) &&
                      isRegApproved(r.registrationStatus || r.status)
                  ).length,
                },
                {
                  label: 'Revenue Paid',
                  val: `PKR ${registrations
                    .filter(
                      (r: any) =>
                        r.eventId?._id === selectedEventStats._id ||
                        r.eventId === selectedEventStats._id
                    )
                    .reduce((sum: number, r: any) => sum + (r.totalAmountPaid || 0), 0)
                    .toLocaleString()}`,
                },
              ].map((m, i) => (
                <div key={i} className="bg-slate-50 p-3.5 rounded-2xl border">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    {m.label}
                  </div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{m.val}</div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Change Status:
                </span>
                {['upcoming', 'live', 'closed', 'ended'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleChangeEventStatus(selectedEventStats._id, st)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize cursor-pointer ${
                      selectedEventStats.status === st
                        ? 'bg-[#0B132B] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedEventStats;
                    setSelectedEventStats(null);
                    handleOpenEditEvent(target);
                  }}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Details
                </button>

                <button
                  onClick={() =>
                    setInlineConfirmation({
                      actionType: 'delete_event',
                      id: selectedEventStats._id,
                      title: selectedEventStats.title,
                    })
                  }
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>

                <button
                  onClick={() => setSelectedEventStats(null)}
                  className="px-5 py-2 bg-[#0B132B] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: PRINTABLE PASS */}
      {printablePassReg && (
        <div
          id="printable-slip-wrapper"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-3 sm:py-6 flex justify-center items-start print:p-0 print:m-0 print:bg-white print:static print:overflow-visible animate-in fade-in"
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
                #official-print-slip { display: block !important; position: relative !important; top: 0 !important; left: 0 !important; width: 100% !important; max-width: 100% !important; box-shadow: none !important; border: 2px solid #0f172a !important; padding: 16px 20px !important; margin: 0 auto !important; page-break-inside: avoid !important; break-inside: avoid !important; background: white !important; }
                .no-print { display: none !important; }
              }
            </style>
          `,
            }}
          />

          <div
            id="official-print-slip"
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl relative border-2 border-slate-900 text-slate-800 space-y-3.5 print:space-y-2.5"
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 no-print">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Official Accreditation Pass &amp; Payment Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="px-4 py-2 bg-[#0B132B] hover:bg-slate-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition hover:scale-105 cursor-pointer"
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

            <div className="text-center space-y-0.5 border-b-2 border-slate-900 pb-3 relative">
              <div className="inline-block px-3 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[9px] font-black uppercase tracking-widest">
                Official Competitor Accreditation &amp; Payment Receipt
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">
                TAEKWONDO LOVERS PAKISTAN
              </h1>
              <div className="text-[11px] font-black uppercase tracking-widest text-[#E63946]">
                powered by TEAM KABIRIANS
              </div>

              <div className="flex flex-wrap items-center justify-between text-[10px] font-bold text-slate-500 pt-2 mt-1.5 border-t border-dashed border-slate-200">
                <span>
                  REG ID:{' '}
                  <strong className="font-mono text-slate-900">
                    #TLP-{getRegId(printablePassReg).slice(-8).toUpperCase()}
                  </strong>
                </span>
                <span>
                  Issue Date:{' '}
                  <strong className="text-slate-900">
                    {new Date(printablePassReg.createdAt || Date.now()).toLocaleDateString(
                      'en-GB'
                    )}
                  </strong>
                </span>
                <span>
                  Print Date:{' '}
                  <strong className="text-slate-900">
                    {new Date().toLocaleDateString('en-GB')}
                  </strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">
                    Tournament / Championship:
                  </span>
                  <span className="font-black text-slate-900 text-xs sm:text-sm">
                    {printablePassReg.eventId?.title ||
                      selectedOfflineEvent?.title ||
                      'Tournament Event'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">
                    Tournament Date:
                  </span>
                  <span className="font-bold text-slate-800">
                    {printablePassReg.eventId?.eventDate
                      ? new Date(printablePassReg.eventId.eventDate).toLocaleDateString('en-GB')
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">
                    Team / Club Name:
                  </span>
                  <span className="font-black text-slate-900 text-xs sm:text-sm">
                    {printablePassReg.teamName ||
                      printablePassReg.teamId?.teamName ||
                      'Registered Team'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      Head / Coach:
                    </span>
                    <span className="font-bold text-slate-800 truncate block">
                      {printablePassReg.coachName ||
                        printablePassReg.teamHead?.name ||
                        printablePassReg.teamId?.teamHeadName ||
                        'Head Coach'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      Contact Phone:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {printablePassReg.coachPhone ||
                        printablePassReg.phone ||
                        printablePassReg.teamId?.contactPhone ||
                        'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black uppercase tracking-wider text-slate-700 text-[11px]">
                  Registered Competitors ({getAthletes(printablePassReg).length})
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Official Verification List
                </span>
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
                        const rawCats =
                          athlete.selectedCategories || athlete.categories || [];
                        if (Array.isArray(rawCats) && rawCats.length > 0) {
                          const sc = rawCats[0];
                          if (typeof sc === 'object' && sc !== null) {
                            return sc.name || sc.categoryName || 'Division';
                          }
                          const match = categories.find(
                            (c: any) => (c._id?.toString() || '') === String(sc)
                          );
                          return match?.name || 'Category';
                        }
                        return 'Standard Category';
                      })();

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-1.5 px-2.5 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-1.5 px-2.5 font-black text-slate-900">
                            {athlete.name}
                          </td>
                          <td className="py-1.5 px-2.5">
                            {athlete.age ? `${athlete.age} Yrs` : '—'} /{' '}
                            {athlete.gender || '—'}
                          </td>
                          <td className="py-1.5 px-2.5 font-mono text-[10px]">
                            {athlete.cnic || athlete.cnicOrBForm || 'N/A'}
                          </td>
                          <td className="py-1.5 px-2.5 font-bold uppercase text-[#1E3A8A]">
                            {athlete.subCategory || athlete.division || athlete.belt || 'White'}
                          </td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-700">
                            {resolvedCategory}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {(() => {
              const isHalf =
                (printablePassReg.paymentOption || '').toLowerCase() === 'half';
              const totalDue = Number(printablePassReg.totalAmountDue || 0);
              const totalPaid = Number(
                printablePassReg.totalAmountPaid || (isHalf ? totalDue / 2 : totalDue)
              );
              const remainingDue = Number(
                printablePassReg.remainingBalance || (isHalf ? totalDue - totalPaid : 0)
              );

              return (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">
                        Scheme
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          isHalf
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isHalf ? 'Half Payment' : 'Full Payment'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">
                        Total Package
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        PKR {totalDue.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">
                        Cleared / Paid
                      </span>
                      <span className="font-mono font-black text-emerald-700 text-xs">
                        PKR {totalPaid.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">
                        Balance Due
                      </span>
                      <span
                        className={`font-mono font-black text-xs ${
                          remainingDue > 0 ? 'text-red-600' : 'text-slate-600'
                        }`}
                      >
                        PKR {remainingDue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {remainingDue > 0 ? (
                    <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[10px] leading-tight flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-black uppercase tracking-wide">
                          Mandatory Venue Payment Notice:{' '}
                        </strong>
                        The remaining balance of{' '}
                        <strong>PKR {remainingDue.toLocaleString()}</strong> must be cleared in
                        cash at the official tournament accreditation counter prior to athlete
                        weigh-in. No competitor will be allowed to fight without 100% dues
                        clearance.
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] leading-tight flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-black uppercase tracking-wide">
                          100% Fees Cleared &amp; Verified:{' '}
                        </strong>
                        All registration dues are fully paid. Present this verified slip at the
                        desk to collect competitor accreditation passes, chest numbers, and
                        official wristbands.
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pt-3 border-t-2 border-slate-200 grid grid-cols-4 gap-3 items-center">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full border-2 border-double border-red-600 flex flex-col items-center justify-center p-1.5 text-red-700 transform -rotate-6 select-none bg-red-50/40">
                  <span className="text-[7px] font-black tracking-widest uppercase">
                    ★ TLP OFFICIAL ★
                  </span>
                  <div className="text-[9px] font-black uppercase leading-tight my-0.5 border-y border-red-600 py-0.5 w-full">
                    APPROVED
                  </div>
                  <span className="text-[6px] font-bold tracking-tight uppercase">
                    REGISTRATION DESK
                  </span>
                  <span className="text-[7px] font-mono font-black mt-0.5 text-slate-800">
                    SEC-#{getRegId(printablePassReg).slice(-6).toUpperCase()}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
                  Official Seal
                </span>
              </div>

              <div className="space-y-4 text-center">
                <div className="h-8 border-b border-dashed border-slate-400" />
                <div>
                  <div className="text-[11px] font-black text-slate-900 truncate">
                    {printablePassReg.coachName ||
                      printablePassReg.teamHead?.name ||
                      'Head Coach'}
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">
                    Coach / Representative
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-center">
                <div className="h-8 border-b border-dashed border-slate-400" />
                <div>
                  <div className="text-[11px] font-black text-slate-900">Desk Officer</div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">
                    Scrutiny In-Charge
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-center">
                <div className="h-8 border-b border-dashed border-slate-400" />
                <div>
                  <div className="text-[11px] font-black text-slate-900">
                    Organizing Secretary
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">
                    Team Kabirians Executive
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[8px] font-mono text-slate-400">
              <span>
                SYSTEM-VERIFIED-HASH: {getRegId(printablePassReg).toUpperCase()}-KABIRIANS-
                {new Date().getFullYear()}
              </span>
              <span>VALID ONLY WITH OFFICIAL STAMP &amp; SIGNATURES</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: ASSIGN MEDAL */}
      {assigningPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setAssigningPlayer(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2.5 border-b">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Assign Medal &mdash; {assigningPlayer.playerName}
                </h3>
                <p className="text-[11px] text-slate-400 font-bold">
                  {assigningPlayer.categoryName} ({assigningPlayer.subCategory})
                </p>
              </div>
              <button onClick={() => setAssigningPlayer(null)} className="cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAssignResult} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 uppercase mb-1 text-[11px] font-bold">
                  Team Name
                </label>
                <input
                  type="text"
                  disabled
                  value={assigningPlayer.teamName}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 uppercase mb-1 text-[11px] font-bold">
                  Podium Position *
                </label>
                <select
                  value={assigningPlayer.position}
                  onChange={(e) =>
                    setAssigningPlayer({ ...assigningPlayer, position: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white outline-none font-bold text-slate-800 cursor-pointer"
                >
                  <option value="1st (Gold 🥇)">1st (Gold 🥇)</option>
                  <option value="2nd (Silver 🥈)">2nd (Silver 🥈)</option>
                  <option value="3rd (Bronze 🥉)">3rd (Bronze 🥉)</option>
                  <option value="Special Award 🎖️">Special Award 🎖️</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 uppercase mb-1 text-[11px] font-bold">
                  Score / Points
                </label>
                <input
                  type="text"
                  value={assigningPlayer.score}
                  onChange={(e) =>
                    setAssigningPlayer({ ...assigningPlayer, score: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-slate-700 uppercase text-[11px] font-bold">
                  Result Visibility Status
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setAssigningPlayer({ ...assigningPlayer, isPublished: false })
                    }
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      !assigningPlayer.isPublished
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-black shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-black">🔒 Private (Draft)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Save privately, publish later
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAssigningPlayer({ ...assigningPlayer, isPublished: true })
                    }
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      assigningPlayer.isPublished
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-black">🌐 Publish Live</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Visible to all teams now
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#E63946] hover:bg-red-700 text-white rounded-xl font-black cursor-pointer shadow-sm transition"
                >
                  {assigningPlayer.isPublished
                    ? 'Save & Publish Result Live'
                    : 'Save Result as Private (Draft)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: TEXT RULES */}
      {activeRuleTextModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          onClick={() => setActiveRuleTextModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-black text-slate-900">
                {activeRuleTextModal.title} &mdash; Rules
              </h3>
              <button
                onClick={() => setActiveRuleTextModal(null)}
                className="text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border text-xs text-slate-700 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
              {activeRuleTextModal.text}
            </div>
            <button
              onClick={() => setActiveRuleTextModal(null)}
              className="w-full py-2 bg-[#0B132B] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}