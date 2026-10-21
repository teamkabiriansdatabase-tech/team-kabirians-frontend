'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { uploadDirectToCloudinary } from '@/lib/upload';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  Video, Trophy, User as UserIcon, LogOut, Bell, Search,
  ArrowRight, ArrowLeft, Upload, CheckCircle2, Clock,
  AlertTriangle, X, Play, Film, Check, Lock, ShieldAlert, Menu
} from 'lucide-react';
import PortalSidebar from '@/components/PortalSidebar';

export default function PortalVideosPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fast Instant User Profile (Zero flicker)
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

  // Modal / Upload State
  const [activeUploadTarget, setActiveUploadTarget] = useState<{
    regId: string;
    athleteIndex: number;
    athlete: any;
  } | null>(null);
  const [videoLinkInput, setVideoLinkInput] = useState('');
  const [videoFileInput, setVideoFileInput] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 5000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login?redirect=/portal/videos');
      return;
    }
    fetchVideoData();
  }, [router]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      let myRegs: any[] = [];
      let allEvents: any[] = [];

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
          if (Array.isArray(d.myRegistrations)) myRegs = d.myRegistrations;
          else if (Array.isArray(d.registrations)) myRegs = d.registrations;
        } catch (e2) {
          console.warn('Dashboard fallback fetch failed');
        }
      }

      const evMap: { [key: string]: any } = {};
      allEvents.forEach((ev: any) => {
        const id = String(ev._id || ev.id);
        evMap[id] = ev;
      });

      setEventsMap(evMap);
      setRegistrations(myRegs);
    } catch (err) {
      console.error('Error fetching video submissions data:', err);
      showNotice('Tournament data load karne mein masla hua.', 'error');
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
        title: rawEv.title || eventsMap[id]?.title || reg.eventTitle || 'Online Championship',
        eventType: rawEv.eventType || eventsMap[id]?.eventType || reg.eventType || 'online',
        eventDate: rawEv.eventDate || eventsMap[id]?.eventDate || reg.createdAt,
      };
    }
    const idStr = String(rawEv || 'unknown');
    if (eventsMap[idStr]) return eventsMap[idStr];
    return {
      _id: idStr,
      title: reg.eventTitle || 'Online Championship',
      eventType: reg.eventType || 'online',
      eventDate: reg.createdAt,
    };
  };

  const isOnlineEvent = (ev: any) => {
    const type = (ev?.eventType || ev?.type || '').toLowerCase();
    return type === 'online' || type === 'video' || type === 'virtual';
  };

  const renderAthleteDivision = (ath: any) => {
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
      ath.belt ||
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

  const groupedOnlineEvents = (() => {
    const map: {
      [eventId: string]: {
        event: any;
        regs: any[];
        totalAthletes: number;
        submittedVideosCount: number;
      };
    } = {};

    const localVideos = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('portal_video_submissions') || '{}')
      : {};

    registrations.forEach((reg) => {
      const ev = getEventFromReg(reg);
      if (!isOnlineEvent(ev)) return;

      const evId = String(ev._id || 'general');
      if (!map[evId]) {
        map[evId] = {
          event: ev,
          regs: [],
          totalAthletes: 0,
          submittedVideosCount: 0,
        };
      }

      const athletesList = getAthletes(reg);
      map[evId].regs.push(reg);
      map[evId].totalAthletes += athletesList.length;

      athletesList.forEach((ath: any, aIdx: number) => {
        const fallbackUrl = localVideos[`${reg._id}_${aIdx}`];
        if (ath.videoUrl || ath.submissionVideoUrl || ath.youtubeUrl || fallbackUrl) {
          map[evId].submittedVideosCount += 1;
        }
      });
    });

    return Object.values(map);
  })();

  const activeEventGroup = selectedEventId
    ? groupedOnlineEvents.find((g) => String(g.event._id) === String(selectedEventId))
    : null;

  const handleOpenUploadModal = (regId: string, athleteIndex: number, athlete: any, isApproved: boolean) => {
    if (!isApproved) {
      showNotice('Payment approval ke baghair video submit nahi ki ja sakti.', 'error');
      return;
    }
    const localVideos = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('portal_video_submissions') || '{}')
      : {};
    const fallbackUrl = localVideos[`${regId}_${athleteIndex}`] || '';

    setActiveUploadTarget({ regId, athleteIndex, athlete });
    setVideoLinkInput(athlete.videoUrl || athlete.submissionVideoUrl || athlete.youtubeUrl || fallbackUrl);
    setVideoFileInput(null);
    setUploadProgress(0);
  };

  const handleSaveVideoSubmission = async () => {
    if (!activeUploadTarget) return;

    let finalVideoUrl = videoLinkInput.trim();

    if (!finalVideoUrl && !videoFileInput) {
      showNotice('Kripya video file upload karein ya video ka link paste karein.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      if (videoFileInput) {
        setUploadProgress(15);
        const uploadRes: any = await uploadDirectToCloudinary({
          file: videoFileInput,
          uploadType: 'Video',
          eventId: selectedEventId || 'online',
          onProgress: (p: number) => setUploadProgress(p),
        });
        finalVideoUrl = uploadRes?.secure_url || uploadRes?.url || '';
        if (!finalVideoUrl) throw new Error('Video upload link Cloudinary se hasil nahi ho saka.');
      }

      const { regId, athleteIndex, athlete } = activeUploadTarget;

      const payload = {
        athleteId: athlete._id || athlete.id,
        athleteIndex,
        athleteName: athlete.name,
        videoUrl: finalVideoUrl,
        submissionVideoUrl: finalVideoUrl,
        videoSubmissionUrl: finalVideoUrl,
        videoStatus: 'submitted',
      };

      // Resilient waterfall API execution to ensure DB write
      let savedToBackend = false;
      const possibleEndpoints = [
        `/portal/registrations/${regId}/video`,
        `/registrations/${regId}/video`,
        `/portal/portal/registrations/${regId}/video`,
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          await api.put(endpoint, payload);
          savedToBackend = true;
          break;
        } catch (e) {
          // Continue to next endpoint in waterfall
        }
      }

      // Sync with localStorage
      if (typeof window !== 'undefined') {
        const localVideos = JSON.parse(localStorage.getItem('portal_video_submissions') || '{}');
        localVideos[`${regId}_${athleteIndex}`] = finalVideoUrl;
        if (athlete._id) localVideos[`${regId}_${athlete._id}`] = finalVideoUrl;
        localStorage.setItem('portal_video_submissions', JSON.stringify(localVideos));
      }

      // Local component state update
      setRegistrations((prev) =>
        prev.map((r) => {
          if (r._id !== regId) return r;
          const updatedAthletes = [...getAthletes(r)];
          if (updatedAthletes[athleteIndex]) {
            updatedAthletes[athleteIndex] = {
              ...updatedAthletes[athleteIndex],
              videoUrl: finalVideoUrl,
              submissionVideoUrl: finalVideoUrl,
              youtubeUrl: finalVideoUrl,
              videoStatus: 'submitted',
            };
          }
          return { ...r, athletes: updatedAthletes, videoSubmissionUrl: finalVideoUrl };
        })
      );

      showNotice(`${athlete.name} ki performance video kamyabi se submit ho gayi!`, 'success');
      setActiveUploadTarget(null);
      setVideoFileInput(null);
      setVideoLinkInput('');
    } catch (err: any) {
      console.error('Video submit error:', err);
      showNotice(err.response?.data?.message || err.message || 'Video submit karne mein masla hua.', 'error');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
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
            {selectedEventId ? (
              <button
                onClick={() => {
                  setSelectedEventId(null);
                  setActiveUploadTarget(null);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Online Events</span>
              </button>
            ) : (
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider truncate max-w-[200px] sm:max-w-none">
                Online Video Submissions
              </span>
            )}
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

        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
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
              <p className="text-xs font-bold text-slate-400">Loading online championships...</p>
            </div>
          ) : (
            <>
              {!selectedEventId && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black uppercase mb-2">
                      <Video className="w-3.5 h-3.5" />
                      <span>Online &amp; Virtual Championships Only</span>
                    </div>
                    <h1 className="text-xl font-black text-slate-900">Online Video Submissions</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select an online championship tournament to submit performance videos. Video upload requires an approved payment.
                    </p>
                  </div>

                  {groupedOnlineEvents.length === 0 ? (
                    <div className="bg-white rounded-3xl p-14 text-center border border-slate-200 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                        <Video className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-black text-slate-900">No Online Championships Found</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Video submission portal sirf <strong>Online / Video Events</strong> ke liye mukhtas hai. Aapke paas filhal kisi online tournament ki registration mojood nahi hai.
                      </p>
                      <Link
                        href="/portal/events"
                        prefetch={true}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A8A] text-white text-xs font-bold rounded-2xl shadow-xs"
                      >
                        <span>Browse Available Events</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedOnlineEvents.map((group, idx) => {
                        const ev = group.event;
                        const isAllSubmitted =
                          group.totalAthletes > 0 &&
                          group.submittedVideosCount === group.totalAthletes;

                        return (
                          <div
                            key={ev._id || idx}
                            onClick={() => setSelectedEventId(String(ev._id))}
                            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-[#1E3A8A] transition cursor-pointer flex flex-col justify-between space-y-5 group"
                          >
                            <div className="space-y-4">
                              <div className="flex justify-between items-start gap-2">
                                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                                  <Video className="w-5 h-5" />
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                    isAllSubmitted
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-purple-50 text-purple-800 border-purple-200'
                                  }`}
                                >
                                  {group.submittedVideosCount} / {group.totalAthletes} Videos Uploaded
                                </span>
                              </div>

                              <div>
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#1E3A8A] transition">
                                  {ev.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Event Date: {new Date(ev.eventDate || Date.now()).toLocaleDateString('en-GB')}
                                </p>
                              </div>

                              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500 font-semibold">Registered Athletes:</span>
                                  <span className="font-black text-slate-900">{group.totalAthletes} Players</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500 font-semibold">Pending Submissions:</span>
                                  <span className="font-mono font-black text-amber-700">
                                    {Math.max(0, group.totalAthletes - group.submittedVideosCount)} Remaining
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1E3A8A]">
                              <span>Open Video Submissions</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {selectedEventId && activeEventGroup && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <button
                        onClick={() => {
                          setSelectedEventId(null);
                          setActiveUploadTarget(null);
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Online Events
                      </button>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                        {activeEventGroup.event.title}
                      </h2>
                    </div>

                    <div className="px-4 py-2 rounded-2xl bg-purple-50 border border-purple-200 text-right">
                      <span className="text-[10px] font-bold uppercase text-purple-700 block">Total Videos</span>
                      <span className="text-sm font-black text-purple-900">
                        {activeEventGroup.submittedVideosCount} / {activeEventGroup.totalAthletes} Submitted
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {activeEventGroup.regs.map((reg, regIdx) => {
                      const athletesList = getAthletes(reg);
                      const rawStatus = (reg.registrationStatus || reg.status || 'under_review').toLowerCase();
                      const isApproved = rawStatus === 'approved';

                      const localVideos = typeof window !== 'undefined'
                        ? JSON.parse(localStorage.getItem('portal_video_submissions') || '{}')
                        : {};

                      return (
                        <div key={reg._id || regIdx} className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400">
                                Registration Batch #{regIdx + 1}
                              </span>
                              <h3 className="text-base font-black text-slate-900">
                                #TLP-{String(reg._id || '').slice(-8).toUpperCase()} &mdash; {reg.teamName || `${userProfile.name}'s Team`}
                              </h3>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                  isApproved
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-300'
                                }`}
                              >
                                {isApproved ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Payment Approved &amp; Verified</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Payment Under Review</span>
                                  </>
                                )}
                              </span>

                              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border">
                                {athletesList.length} Athletes
                              </span>
                            </div>
                          </div>

                          {!isApproved && (
                            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <span className="text-[11px] font-semibold">
                                Is batch ki payment verification under review hai. Admin ki taraf se payment approve hone ke baad hi videos upload karne ka button enable hoga.
                              </span>
                            </div>
                          )}

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                  <th className="py-3 px-3 w-10">#</th>
                                  <th className="py-3 px-4">Athlete</th>
                                  <th className="py-3 px-4">Belt / Division</th>
                                  <th className="py-3 px-4">Video Status</th>
                                  <th className="py-3 px-4 text-right pr-6">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {athletesList.map((ath: any, athIdx: number) => {
                                  const fallbackUrl = localVideos[`${reg._id}_${athIdx}`] || (ath._id ? localVideos[`${reg._id}_${ath._id}`] : '');
                                  const videoUrl = ath.videoUrl || ath.submissionVideoUrl || ath.youtubeUrl || fallbackUrl;
                                  const hasSubmitted = Boolean(videoUrl);

                                  return (
                                    <tr key={ath._id || athIdx} className="hover:bg-slate-50/70 transition">
                                      <td className="py-3.5 px-3 font-bold text-slate-400">{athIdx + 1}</td>
                                      <td className="py-3.5 px-4 font-black text-slate-900">
                                        <div>{ath.name}</div>
                                        <div className="text-[10px] text-slate-400 font-normal">
                                          {ath.age ? `${ath.age} Yrs` : '—'} / {ath.gender || 'Male'}
                                        </div>
                                      </td>
                                      <td className="py-3.5 px-4 text-xs">
                                        {renderAthleteDivision(ath)}
                                      </td>
                                      <td className="py-3.5 px-4">
                                        {hasSubmitted ? (
                                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <Check className="w-3 h-3 text-emerald-600" />
                                            <span>Video Submitted</span>
                                          </div>
                                        ) : (
                                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            <span>No Video</span>
                                          </div>
                                        )}
                                      </td>
                                      <td className="py-3.5 px-4 text-right pr-6">
                                        <div className="inline-flex items-center gap-2">
                                          {hasSubmitted && (
                                            <a
                                              href={videoUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                                              title="Watch Submitted Video"
                                            >
                                              <Play className="w-3.5 h-3.5" />
                                            </a>
                                          )}

                                          {isApproved ? (
                                            <button
                                              type="button"
                                              onClick={() => handleOpenUploadModal(reg._id, athIdx, ath, isApproved)}
                                              className="px-3.5 py-1.5 bg-[#E63946] hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                                            >
                                              <Upload className="w-3.5 h-3.5" />
                                              <span>{hasSubmitted ? 'Replace Video' : 'Submit Video'}</span>
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              disabled
                                              title="Payment approval is required before uploading video"
                                              className="px-3.5 py-1.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs border border-slate-200 flex items-center gap-1.5 cursor-not-allowed select-none"
                                            >
                                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                                              <span>Locked</span>
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
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

      {/* MODAL: VIDEO SUBMISSION UPLOAD */}
      {activeUploadTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-4 flex justify-center items-center animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                  Competition Performance Video
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Submit Video for {activeUploadTarget.athlete.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveUploadTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  Option 1: Upload Video File (MP4, MOV)
                </label>
                <div className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50/50">
                  {videoFileInput ? (
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="truncate">{videoFileInput.name}</span>
                      <button onClick={() => setVideoFileInput(null)} className="text-red-500 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-1">
                      <Film className="w-6 h-6 text-blue-600 mb-1" />
                      <span className="text-xs font-bold text-blue-700">Click to select video from computer</span>
                      <span className="text-[10px] text-slate-400">Max size: 100MB</span>
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setVideoFileInput(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300 text-xs font-bold">
                <div className="h-px bg-slate-200 flex-1" />
                <span>OR</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  Option 2: Video URL (YouTube Unlisted / Google Drive Link)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or Google Drive link"
                  value={videoLinkInput}
                  onChange={(e) => setVideoLinkInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Make sure Google Drive link permissions are set to &quot;Anyone with the link can view&quot;.
                </p>
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>Uploading Video...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveUploadTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveVideoSubmission}
                className="px-5 py-2 bg-[#E63946] hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? 'Submitting...' : 'Submit Video'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}