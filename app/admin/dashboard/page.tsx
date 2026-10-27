'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { uploadDirectToCloudinary } from '@/lib/upload';
import {
  LayoutDashboard, Calendar, Users, CreditCard, Video,
  Trophy, Plus, LogOut, Trash2, AlertCircle, Clock,
  CheckCircle2, Printer, ArrowRight, X, ChevronRight, Bell,
  Search, Award, FileText, Check, Settings, ExternalLink,
  Layers, Folder, FolderOpen, Download, FileSpreadsheet,
  MapPin, BookOpen, Image as ImageIcon, User as UserIcon,
  ArrowLeft, Activity, AlertTriangle, Filter, ChevronLeft,
  Play, Edit, Menu
} from 'lucide-react';
import { VideosTab, PaymentsTab } from './_components/PaymentsAndVideosTabs';
import {
  doesAthleteMatchCategory as helperMatchCategory,
  doesAthleteMatchSubcategory as helperMatchSubcategory,
  getCategoryAthletesCount as helperCatCount,
  getSubcategoryAthletesCount as helperSubCount,
  getAthletes,
  getEntityEventId,
  getPlayerVideoUrl
} from './_utils/adminHelpers';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Active Navigation Tab
  const [activeNav, setActiveNav] = useState<
    'Dashboard' | 'Events' | 'Categories' | 'Team Registrations' | 'Payments' | 'Online Videos' | 'Offline Registrations' | 'Results' | 'Users' | 'Settings' | 'Activity Logs' | 'Notifications' | 'Profile'
  >('Dashboard');

  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Backend States
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // In-Page Confirmation & Notifications
  const [inlineConfirmation, setInlineConfirmation] = useState<{
    actionType: 'delete_event' | 'delete_category' | 'verify_payment' | 'delete_registration' | 'delete_user';
    id: string;
    title: string;
    meta?: any;
  } | null>(null);

  const [inPageNotice, setInPageNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setInPageNotice({ message, type });
    setTimeout(() => setInPageNotice(null), 4500);
  };

  // Events Filter & Selected Modal
  const [eventTabFilter, setEventTabFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('all');
  const [selectedEventStats, setSelectedEventStats] = useState<any | null>(null);

  // Drilldown States
  const [selectedCatEvent, setSelectedCatEvent] = useState<any | null>(null);
  const [selectedCategoryRoster, setSelectedCategoryRoster] = useState<{
    categoryName: string;
    subCategoryName?: string;
    athletes: any[];
  } | null>(null);
  const [selectedRegEvent, setSelectedRegEvent] = useState<any | null>(null);
  const [inspectReg, setInspectReg] = useState<any | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'team_head' | 'team_members' | 'payment_details'>('team_head');

  // Payments States
  const [selectedPaymentEvent, setSelectedPaymentEvent] = useState<any | null>(null);
  const [paymentFilterTab, setPaymentFilterTab] = useState<'all' | 'pending' | 'full' | 'rejected'>('all');
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<any | null>(null);
  const [editingPaymentAmount, setEditingPaymentAmount] = useState<number | string>('');
  const [zoomedReceiptUrl, setZoomedReceiptUrl] = useState<string | null>(null);
  const [paymentPage, setPaymentPage] = useState(1);
  const itemsPerPage = 6;

  // Online Videos States
  const [selectedVideoEvent, setSelectedVideoEvent] = useState<any | null>(null);
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<any | null>(null);
  const [selectedVideoSubcategory, setSelectedVideoSubcategory] = useState<string | null>(null);
  const [activeVideoPlayer, setActiveVideoPlayer] = useState<{
    url: string;
    playerName: string;
    teamName: string;
    categoryName: string;
    subName: string;
  } | null>(null);

  // Offline Events States
  const [selectedOfflineEvent, setSelectedOfflineEvent] = useState<any | null>(null);
  const [printablePassReg, setPrintablePassReg] = useState<any | null>(null);

  // Results States
  const [selectedResultEvent, setSelectedResultEvent] = useState<any | null>(null);
  const [selectedResultCategory, setSelectedResultCategory] = useState<any | null>(null);
  const [selectedResultSubcategory, setSelectedResultSubcategory] = useState<string | null>(null);
  const [assigningPlayer, setAssigningPlayer] = useState<{
    teamName: string;
    playerName: string;
    categoryId?: string;
    categoryName?: string;
    subCategory?: string;
    position: string;
    score: string;
    isPublished: boolean;
  } | null>(null);

  // Create Event Form States
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [activeRuleTextModal, setActiveRuleTextModal] = useState<{ title: string; text: string } | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '', description: '', eventType: 'online', eventDate: '',
    standardDeadline: '', lateFeeStartDate: '', registrationDeadline: '',
    lateFee: 500, ruleBookType: 'text' as 'text' | 'pdf', ruleBookText: '',
    bankName: '', accountTitle: '', accountNumber: '', iban: ''
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ruleBookPdfFile, setRuleBookPdfFile] = useState<File | null>(null);
  const [eventPublishing, setEventPublishing] = useState(false);
  const [publishStatusText, setPublishStatusText] = useState('');

  // Edit Event States
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventForm, setEditEventForm] = useState({
    title: '', description: '', eventType: 'online', eventDate: '',
    standardDeadline: '', lateFeeStartDate: '', registrationDeadline: '',
    lateFee: 500, ruleBookType: 'text' as 'text' | 'pdf', ruleBookText: '',
    status: 'upcoming', existingCoverUrl: '', existingPdfUrl: '',
    bankName: '', accountTitle: '', accountNumber: '', iban: ''
  });
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editRuleBookPdfFile, setEditRuleBookPdfFile] = useState<File | null>(null);
  const [editUpdating, setEditUpdating] = useState(false);

  // Categories in Edit Modal
  const [editCategories, setEditCategories] = useState<
    Array<{ _id?: string; name: string; baseFee: number; lateFee: number; baseFeeUSD?: number; lateFeeUSD?: number; subcategories: string }>
  >([]);
  const [newEditCatName, setNewEditCatName] = useState('');
  const [newEditCatFee, setNewEditCatFee] = useState<number>(2000);
  const [newEditCatLateFee, setNewEditCatLateFee] = useState<number>(500);
  const [newEditCatFeeUSD, setNewEditCatFeeUSD] = useState<number>(20);
  const [newEditCatLateFeeUSD, setNewEditCatLateFeeUSD] = useState<number>(5);
  const [newEditCatSubs, setNewEditCatSubs] = useState('');

  // Categories in Create Modal
  const [modalCategories, setModalCategories] = useState<
    Array<{ name: string; baseFee: number; lateFee: number; baseFeeUSD: number; lateFeeUSD: number; subcategories: string }>
  >([
    { name: 'Senior Male Kyorugi', baseFee: 2500, lateFee: 1000, baseFeeUSD: 25, lateFeeUSD: 10, subcategories: 'Under 54 kg, Under 58 kg' },
    { name: 'Junior Poomsae', baseFee: 2000, lateFee: 800, baseFeeUSD: 20, lateFeeUSD: 8, subcategories: 'Individual Open' },
  ]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatFee, setNewCatFee] = useState<number>(2000);
  const [newCatLateFee, setNewCatLateFee] = useState<number>(500);
  const [newCatFeeUSD, setNewCatFeeUSD] = useState<number>(20);
  const [newCatLateFeeUSD, setNewCatLateFeeUSD] = useState<number>(5);
  const [newCatSubs, setNewCatSubs] = useState('');

  // Single Category Modal
  const [showAddSingleCategoryModal, setShowAddSingleCategoryModal] = useState(false);
  const [singleCatForm, setSingleCatForm] = useState({
    name: '', baseFee: 2000, lateFee: 500, baseFeeUSD: 20, lateFeeUSD: 5, subcategories: 'Under 54 kg, Under 58 kg',
  });

  // Tab 10: Settings State
  const [settingsForm, setSettingsForm] = useState({
    websiteName: 'EventPortal',
    contactEmail: 'admin@eventportal.com',
    contactPhone: '+92 300 1234567',
    address: 'Karachi, Pakistan'
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Helper: Safe Registration ID Extractor
  const getRegId = (reg: any): string => {
    if (!reg) return '';
    if (typeof reg === 'string') return reg.trim();
    const raw = reg._id || reg.id || reg.registrationId;
    if (!raw) return '';
    if (typeof raw === 'object' && raw.$oid) return String(raw.$oid);
    return String(raw).trim();
  };

  // Sync editing payment amount whenever modal opens
  useEffect(() => {
    if (selectedPaymentProof) {
      const initAmount =
        selectedPaymentProof.totalAmountPaid !== undefined && selectedPaymentProof.totalAmountPaid !== null
          ? selectedPaymentProof.totalAmountPaid
          : selectedPaymentProof.totalAmountDue || 0;
      setEditingPaymentAmount(initAmount);
    }
  }, [selectedPaymentProof]);

  // Auto-sync polling every 15 seconds
  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(() => {
      fetchAdminData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data?.success) {
        const d = res.data.data;
        setRegistrations(d.registrations || []);
        setEvents(d.events || []);
        setCategories(d.categories || []);

        const savedLocal = typeof window !== 'undefined' ? localStorage.getItem('tlp_official_results') : null;
        const parsedLocal = savedLocal ? JSON.parse(savedLocal) : [];
        const backendResults = Array.isArray(d.results) ? d.results : [];
        setResults(backendResults.length > 0 ? backendResults : parsedLocal);

        setLogs(d.logs || []);

        let notifs = Array.isArray(d.notifications) ? d.notifications : [];
        if (notifs.length === 0) {
          try {
            const notifRes = await api.get('/admin/notifications');
            const nData = notifRes.data?.data || notifRes.data?.notifications || notifRes.data || [];
            if (Array.isArray(nData) && nData.length > 0) {
              notifs = nData;
            }
          } catch (e) {}
        }
        setNotifications(notifs);

        let fetchedUsers: any[] = Array.isArray(d.users) ? d.users : [];
        if (fetchedUsers.length === 0 && Array.isArray(d.registrations) && d.registrations.length > 0) {
          const seenEmails = new Set<string>();
          const fallbackUsers: any[] = [];

          d.registrations.forEach((reg: any, i: number) => {
            const email = (
              reg.userEmail || reg.email || reg.teamHeadEmail || reg.coachEmail || reg.user?.email || ''
            ).trim().toLowerCase();

            const name = reg.userName || reg.name || reg.teamHeadName || reg.coachName || reg.teamName || reg.teamId?.teamName || reg.user?.name || 'Coach / Team Head';
            const userRole = reg.user?.role || reg.role || 'TEAM_HEAD';

            if (email && !seenEmails.has(email)) {
              seenEmails.add(email);
              fallbackUsers.push({
                _id: reg.userId || reg.user?._id || reg.teamHeadId || `user-${i + 1}`,
                name: name,
                email: email,
                role: userRole,
                createdAt: reg.createdAt || new Date().toISOString(),
                status: 'active',
              });
            }
          });

          if (fallbackUsers.length > 0) {
            fetchedUsers = fallbackUsers;
          }
        }
        setUsersList(fetchedUsers);

        if (d.settings) {
          setSettingsForm(d.settings);
        } else if (typeof window !== 'undefined') {
          const localSettings = localStorage.getItem('tlp_platform_settings');
          if (localSettings) setSettingsForm(JSON.parse(localSettings));
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) router.replace('/admin/login');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    router.replace('/admin/login');
  };

  // Status Helpers
  const isRegPending = (st: string) => {
    const s = (st || '').toLowerCase();
    return s === 'under_review' || s === 'pending_payment' || s === 'pending';
  };
  const isRegApproved = (st: string) => (st || '').toLowerCase() === 'approved';
  const isRegRejected = (st: string) => (st || '').toLowerCase() === 'rejected';

  // Helper: International Registration Check
  const isInternationalReg = (r: any) => {
    if (!r) return false;
    if (r.isInternational === true || r.isInternational === 'true' || r.isUSD === true) return true;
    const curr = (r.currency || r.paymentCurrency || r.regCurrency || '').toUpperCase();
    if (curr === 'USD') return true;
    const country = (r.country || r.teamCountry || '').toLowerCase();
    if (country === 'international' || (country && country !== 'pakistan' && country !== 'pk')) return true;

    const aths = getAthletes(r);
    if (aths.some((a: any) => (a.currency || '').toUpperCase() === 'USD' || a.isInternational === true)) {
      return true;
    }

    const amount = Number(r.totalAmountPaid || r.totalAmountDue || r.totalAmount || 0);
    if (amount > 0 && amount <= 150) {
      return true;
    }

    return false;
  };

  // KPIs
  const totalAthletesCount = registrations.reduce((sum, r) => {
    const aths = getAthletes(r);
    if (aths.length > 0) return sum + aths.length;
    const metaCount = Number(r.athleteCount || r.totalAthletes || r.athletesCount || 1);
    return sum + (isNaN(metaCount) || metaCount <= 0 ? 1 : metaCount);
  }, 0);
  const totalRegistrations = totalAthletesCount;
  const pendingPayments = registrations.filter((r) => isRegPending(r.registrationStatus || r.status)).length;
  const fullPayments = registrations.filter((r) => isRegApproved(r.registrationStatus || r.status)).length;
  const pendingApprovals = pendingPayments;
  const totalEventsCount = events.length;
  const totalTeamsCount = new Set(
    registrations.map((r) => (r.teamName || r.teamId?.teamName || '').trim()).filter(Boolean)
  ).size || 0;

  const pakistaniTeamsCount = new Set(
    registrations
      .filter((r) => !isInternationalReg(r))
      .map((r) => (r.teamName || r.teamId?.teamName || '').trim())
      .filter(Boolean)
  ).size || 0;

  const internationalTeamsCount = new Set(
    registrations
      .filter((r) => isInternationalReg(r))
      .map((r) => (r.teamName || r.teamId?.teamName || '').trim())
      .filter(Boolean)
  ).size || 0;

  // Filtered Events
  const filteredEventsByTab = events.filter((ev) => {
    const st = ev.status || 'upcoming';
    if (eventTabFilter === 'active') return st === 'live';
    if (eventTabFilter === 'upcoming') return st === 'upcoming';
    if (eventTabFilter === 'past') return st === 'closed' || st === 'ended';
    return true;
  });

  const onlineEvents = events.filter((e) => e.eventType === 'online');
  const offlineEvents = events.filter((e) => e.eventType === 'physical');

  // Payments filtering for Selected Event
  const currentEventRegistrations = selectedPaymentEvent
    ? registrations.filter((r) => {
        const eId = getEntityEventId(r);
        return eId === String(selectedPaymentEvent._id || selectedPaymentEvent.id);
      })
    : [];

  const filteredPayments = currentEventRegistrations.filter((r) => {
    const st = (r.registrationStatus || r.status || '').toLowerCase();
    if (paymentFilterTab === 'pending') return isRegPending(st);
    if (paymentFilterTab === 'full') return isRegApproved(st);
    if (paymentFilterTab === 'rejected') return isRegRejected(st);
    return true;
  });

  const totalPaymentPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const paginatedPayments = filteredPayments.slice((paymentPage - 1) * itemsPerPage, paymentPage * itemsPerPage);

  const doesAthleteMatchCategory = (
    player: any,
    categoryId: string,
    categoryName: string,
    totalEventCatsCount: number
  ) => {
    return helperMatchCategory(player, categoryId, categoryName, totalEventCatsCount, categories);
  };

  const doesAthleteMatchSubcategory = (
    player: any,
    targetSubName: string,
    allCategorySubs: string[] = []
  ) => {
    return helperMatchSubcategory(player, targetSubName, allCategorySubs);
  };

  const getCategoryAthletesCount = (eventId: string, categoryId: string, categoryName: string) => {
    return helperCatCount(registrations, categories, eventId, categoryId, categoryName);
  };

  const getSubcategoryAthletesCount = (eventId: string, categoryId: string, categoryName: string, subName: string) => {
    return helperSubCount(registrations, categories, eventId, categoryId, categoryName, subName);
  };

  const getAthletesForCategory = (eventId: string, categoryId: string, categoryName: string, subName?: string) => {
    const targetEvId = String(eventId || '').trim();

    const eventRegs = registrations.filter((r) => {
      const rEvId = getEntityEventId(r);
      return !targetEvId || rEvId === targetEvId;
    });

    const list: any[] = [];
    eventRegs.forEach((reg) => {
      const teamName = reg.teamName || reg.teamId?.teamName || 'Registered Team';
      const coachName = reg.coachName || reg.teamHead?.name || reg.teamId?.teamHeadName || 'Coach';
      const coachPhone = reg.coachPhone || reg.phone || reg.teamId?.contactPhone || '—';
      const status = reg.registrationStatus || reg.status || 'under_review';
      const pStatus = isRegApproved(status) ? 'Paid / Cleared' : isRegPending(status) ? 'Pending Review' : 'Rejected';

      getAthletes(reg).forEach((player: any) => {
        const isCatMatch = doesAthleteMatchCategory(player, categoryId, categoryName, categories.length);

        if (isCatMatch) {
          if (!subName || subName === 'All Athletes' || doesAthleteMatchSubcategory(player, subName)) {
            list.push({
              ...player,
              teamName,
              coachName,
              coachPhone,
              paymentStatus: pStatus,
            });
          }
        }
      });
    });

    return list;
  };

  // Enhanced Verify Payment Handler with Custom Editable Amount
  const handleVerifyPayment = async (
    registrationOrId: any,
    status: 'approved' | 'rejected',
    customAmountOverride?: number
  ) => {
    const registrationId = typeof registrationOrId === 'string' ? registrationOrId : getRegId(registrationOrId);

    if (!registrationId || registrationId === 'undefined' || registrationId === 'null') {
      showNotice('Registration ID nahi mili. Page refresh karke dobara try karein.', 'error');
      return;
    }

    try {
      const finalAmount =
        customAmountOverride !== undefined && !isNaN(customAmountOverride)
          ? Number(customAmountOverride)
          : Number(editingPaymentAmount);

      const bodyPayload = {
        id: registrationId,
        _id: registrationId,
        registrationId,
        status,
        registrationStatus: status,
        customAmount: finalAmount,
        totalAmountPaid: finalAmount,
        totalAmountDue: finalAmount,
      };

      try {
        await api.put(`/portal/registrations/${registrationId}/payment-status`, bodyPayload);
      } catch (ep1) {
        try {
          await api.put(`/admin/registrations/${registrationId}/status`, bodyPayload);
        } catch (ep2) {
          try {
            await api.patch(`/admin/registrations/${registrationId}/status`, bodyPayload);
          } catch (ep3) {
            await api.put(`/admin/registrations/${registrationId}/verify-payment`, bodyPayload);
          }
        }
      }

      setRegistrations((prev) =>
        prev.map((r) =>
          getRegId(r) === registrationId
            ? {
                ...r,
                registrationStatus: status,
                status: status,
                paymentStatus: status === 'approved' ? 'Paid' : 'Rejected',
                totalAmountPaid: finalAmount,
                totalAmountDue: finalAmount,
                remainingBalance: 0,
              }
            : r
        )
      );

      if (selectedPaymentProof && getRegId(selectedPaymentProof) === registrationId) {
        setSelectedPaymentProof((prev: any) => ({
          ...prev,
          registrationStatus: status,
          status,
          totalAmountPaid: finalAmount,
          totalAmountDue: finalAmount,
        }));
      }

      if (inspectReg && getRegId(inspectReg) === registrationId) {
        setInspectReg((prev: any) => ({
          ...prev,
          registrationStatus: status,
          status,
          totalAmountPaid: finalAmount,
          totalAmountDue: finalAmount,
        }));
      }

      setSelectedPaymentProof(null);
      await fetchAdminData();
      showNotice(
        `Payment successfully marked as ${status.toUpperCase()} with amount: ${finalAmount}!`,
        'success'
      );
    } catch (err: any) {
      console.error('Verify Payment Error:', err);
      showNotice(err.response?.data?.message || 'Payment verification failed.', 'error');
    }
  };

  const handlePrintSlip = () => {
    const wrapper = document.getElementById('printable-slip-wrapper');
    if (wrapper) wrapper.scrollTop = 0;
    window.scrollTo(0, 0);
    setTimeout(() => window.print(), 150);
  };

  const handleAddCategoryToModal = () => {
    if (!newCatName.trim()) {
      showNotice('Please enter a category name first.', 'error');
      return;
    }
    setModalCategories([
      ...modalCategories,
      {
        name: newCatName.trim(),
        baseFee: Number(newCatFee) || 1000,
        lateFee: Number(newCatLateFee) || 0,
        baseFeeUSD: Number(newCatFeeUSD) || 20,
        lateFeeUSD: Number(newCatLateFeeUSD) || 0,
        subcategories: newCatSubs.trim() || 'Open Division',
      },
    ]);
    setNewCatName('');
    setNewCatFee(2000);
    setNewCatLateFee(500);
    setNewCatFeeUSD(20);
    setNewCatLateFeeUSD(5);
    setNewCatSubs('');
  };

  const handleCreateSingleCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatEvent) return;
    try {
      const subcats = singleCatForm.subcategories.split(',').map((s) => s.trim()).filter(Boolean);
      await api.post('/categories', {
        eventId: selectedCatEvent._id,
        name: singleCatForm.name.trim(),
        baseFee: Number(singleCatForm.baseFee) || 1000,
        lateFee: Number(singleCatForm.lateFee) || 0,
        baseFeeUSD: Number(singleCatForm.baseFeeUSD) || 20,
        lateFeeUSD: Number(singleCatForm.lateFeeUSD) || 0,
        subcategories: subcats.length > 0 ? subcats : ['Open Division'],
        status: 'active',
      });
      setShowAddSingleCategoryModal(false);
      setSingleCatForm({ name: '', baseFee: 2000, lateFee: 500, baseFeeUSD: 20, lateFeeUSD: 5, subcategories: '' });
      fetchAdminData();
      showNotice('Category added successfully to tournament.', 'success');
    } catch (err: any) {
      showNotice(err.response?.data?.message || 'Failed to add category.', 'error');
    }
  };

  const handleAssignResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningPlayer || !selectedResultEvent) return;

    const payload = {
      _id: Date.now().toString(),
      eventId: selectedResultEvent._id,
      eventTitle: selectedResultEvent.title,
      categoryId: assigningPlayer.categoryId || selectedResultCategory?._id,
      categoryName: assigningPlayer.categoryName || selectedResultCategory?.name || 'General',
      subCategory: assigningPlayer.subCategory || selectedResultSubcategory || 'Open',
      teamName: assigningPlayer.teamName,
      playerName: assigningPlayer.playerName,
      position: assigningPlayer.position,
      score: assigningPlayer.score || '9.85',
      isPublished: Boolean(assigningPlayer.isPublished),
    };

    try {
      const res = await api.post('/admin/results', payload);
      if (res.data?.data?._id) payload._id = res.data.data._id;
    } catch (apiErr) {}

    setResults((prev) => {
      const filtered = prev.filter(
        (r) =>
          !(
            String(r.eventId?._id || r.eventId) === String(selectedResultEvent._id) &&
            r.playerName === assigningPlayer.playerName
          )
      );
      const updatedList = [...filtered, payload];
      localStorage.setItem('tlp_official_results', JSON.stringify(updatedList));
      return updatedList;
    });

    const savedVisibility = assigningPlayer.isPublished ? 'Published Live' : 'Saved as Private (Draft)';
    const pName = assigningPlayer.playerName;
    setAssigningPlayer(null);
    showNotice(`Result for ${pName} saved! Status: ${savedVisibility}`, 'success');
  };

  const handleToggleResult = async (id: string) => {
    setResults((prev) => {
      const updated = prev.map((r) => (r._id === id ? { ...r, isPublished: !r.isPublished } : r));
      localStorage.setItem('tlp_official_results', JSON.stringify(updated));
      return updated;
    });

    try {
      await api.put(`/admin/results/${id}/toggle-publish`);
    } catch (e) {}

    showNotice('Result visibility updated successfully!', 'success');
  };

  const handleBulkPublishSubcategoryResults = async (publishState: boolean, playersInView: any[]) => {
    const matchingResults = results.filter(
      (rs) =>
        String(rs.eventId?._id || rs.eventId) === String(selectedResultEvent?._id) &&
        playersInView.some((p) => p.name === rs.playerName)
    );

    if (matchingResults.length === 0) {
      showNotice('Pehle players ko medals assign karein.', 'error');
      return;
    }

    for (const rs of matchingResults) {
      if (Boolean(rs.isPublished) !== publishState) {
        try {
          await api.put(`/admin/results/${rs._id}/toggle-publish`);
        } catch (e) {}
      }
    }

    setResults((prev) => {
      const updated = prev.map((r) =>
        matchingResults.some((m) => m._id === r._id) ? { ...r, isPublished: publishState } : r
      );
      localStorage.setItem('tlp_official_results', JSON.stringify(updated));
      return updated;
    });

    showNotice(
      publishState
        ? 'Is division ke tamam results PUBLIC (Live) kar diye gaye hain!'
        : 'Is division ke tamam results PRIVATE (Draft) kar diye gaye hain!',
      'success'
    );
  };

  const handleOpenEditEvent = (ev: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingEventId(ev._id);
    setEditEventForm({
      title: ev.title || '',
      description: ev.description || '',
      eventType: ev.eventType || 'online',
      eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString().split('T')[0] : '',
      standardDeadline: ev.standardDeadline ? new Date(ev.standardDeadline).toISOString().split('T')[0] : (ev.registrationDeadline ? new Date(ev.registrationDeadline).toISOString().split('T')[0] : ''),
      lateFeeStartDate: ev.lateFeeStartDate ? new Date(ev.lateFeeStartDate).toISOString().split('T')[0] : '',
      registrationDeadline: ev.registrationDeadline ? new Date(ev.registrationDeadline).toISOString().split('T')[0] : '',
      lateFee: ev.lateFee || 0,
      ruleBookType: ev.ruleBookPdfUrl ? 'pdf' : 'text',
      ruleBookText: ev.ruleBookText || '',
      status: ev.status || 'upcoming',
      existingCoverUrl: ev.coverImageUrl || '',
      existingPdfUrl: ev.ruleBookPdfUrl || '',
      bankName: ev.bankName || ev.bankDetails?.bankName || '',
      accountTitle: ev.accountTitle || ev.bankDetails?.accountTitle || '',
      accountNumber: ev.accountNumber || ev.bankDetails?.accountNumber || '',
      iban: ev.iban || ev.bankDetails?.iban || ''
    });

    const eventCats = categories.filter((c) => {
      const cEvId = c.eventId?._id ? c.eventId._id.toString() : c.eventId?.toString();
      return cEvId === ev._id.toString();
    });

    setEditCategories(
      eventCats.map((c) => ({
        _id: c._id,
        name: c.name,
        baseFee: c.baseFee,
        lateFee: c.lateFee || 0,
        baseFeeUSD: c.baseFeeUSD ?? 20,
        lateFeeUSD: c.lateFeeUSD ?? 5,
        subcategories: Array.isArray(c.subcategories)
          ? c.subcategories.map((s: any) => (typeof s === 'string' ? s : s.name || s.title || '')).join(', ')
          : (c.subcategories || ''),
      }))
    );

    setEditCoverFile(null);
    setEditRuleBookPdfFile(null);
    setNewEditCatName('');
    setNewEditCatFee(2000);
    setNewEditCatLateFee(500);
    setNewEditCatFeeUSD(20);
    setNewEditCatLateFeeUSD(5);
    setNewEditCatSubs('');
    setShowEditEventModal(true);
  };

  const handleAddCategoryInEditModal = () => {
    if (!newEditCatName.trim()) {
      showNotice('Please enter a category name.', 'error');
      return;
    }
    setEditCategories([
      ...editCategories,
      {
        name: newEditCatName.trim(),
        baseFee: Number(newEditCatFee) || 1000,
        lateFee: Number(newEditCatLateFee) || 0,
        baseFeeUSD: Number(newEditCatFeeUSD) || 20,
        lateFeeUSD: Number(newEditCatLateFeeUSD) || 0,
        subcategories: newEditCatSubs.trim() || 'Open Division',
      },
    ]);
    setNewEditCatName('');
    setNewEditCatFee(2000);
    setNewEditCatLateFee(500);
    setNewEditCatFeeUSD(20);
    setNewEditCatLateFeeUSD(5);
    setNewEditCatSubs('');
  };

  const handleRemoveCategoryInEditModal = (index: number) => {
    setEditCategories(editCategories.filter((_, i) => i !== index));
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventId) return;
    setEditUpdating(true);
    try {
      let coverImageUrl = editEventForm.existingCoverUrl;
      let ruleBookPdfUrl = editEventForm.existingPdfUrl;

      if (editCoverFile) {
        setPublishStatusText('Uploading updated cover banner...');
        const res: any = await uploadDirectToCloudinary({ file: editCoverFile, uploadType: 'Cover' });
        coverImageUrl = res?.secure_url || res?.url || '';
      }

      if (editEventForm.ruleBookType === 'pdf' && editRuleBookPdfFile) {
        setPublishStatusText('Uploading updated rulebook PDF...');
        const res: any = await uploadDirectToCloudinary({ file: editRuleBookPdfFile, uploadType: 'RuleBook' });
        ruleBookPdfUrl = res?.secure_url || res?.url || '';
      }

      setPublishStatusText('Saving tournament & category updates...');
      await api.put(`/events/${editingEventId}`, {
        title: editEventForm.title,
        description: editEventForm.description,
        coverImageUrl,
        ruleBookPdfUrl: editEventForm.ruleBookType === 'pdf' ? ruleBookPdfUrl : '',
        ruleBookText: editEventForm.ruleBookType === 'text' ? editEventForm.ruleBookText : '',
        eventType: editEventForm.eventType,
        eventDate: editEventForm.eventDate,
        standardDeadline: editEventForm.standardDeadline,
        lateFeeStartDate: editEventForm.lateFeeStartDate,
        registrationDeadline: editEventForm.registrationDeadline || editEventForm.standardDeadline,
        lateFee: Number(editEventForm.lateFee) || 0,
        bankName: editEventForm.bankName,
        accountTitle: editEventForm.accountTitle,
        accountNumber: editEventForm.accountNumber,
        iban: editEventForm.iban,
        bankDetails: {
          bankName: editEventForm.bankName,
          accountTitle: editEventForm.accountTitle,
          accountNumber: editEventForm.accountNumber,
          iban: editEventForm.iban,
        },
        status: editEventForm.status,
        categories: editCategories,
      });

      setShowEditEventModal(false);
      setEditingEventId(null);
      if (selectedEventStats && selectedEventStats._id === editingEventId) setSelectedEventStats(null);
      fetchAdminData();
      showNotice('Tournament, rulebook, and categories updated successfully!', 'success');
    } catch (err: any) {
      showNotice(err.response?.data?.message || 'Failed to update tournament.', 'error');
    } finally {
      setEditUpdating(false);
      setPublishStatusText('');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventPublishing(true);
    try {
      let coverImageUrl = '';
      let ruleBookPdfUrl = '';

      if (coverFile) {
        setPublishStatusText('Uploading cover banner...');
        const res: any = await uploadDirectToCloudinary({ file: coverFile, uploadType: 'Cover' });
        coverImageUrl = res?.secure_url || res?.url || '';
      }

      if (eventForm.ruleBookType === 'pdf' && ruleBookPdfFile) {
        setPublishStatusText('Uploading rulebook PDF...');
        const res: any = await uploadDirectToCloudinary({ file: ruleBookPdfFile, uploadType: 'RuleBook' });
        ruleBookPdfUrl = res?.secure_url || res?.url || '';
      }

      setPublishStatusText('Saving tournament records and categories...');
      await api.post('/events', {
        title: eventForm.title,
        description: eventForm.description,
        coverImageUrl,
        ruleBookPdfUrl: eventForm.ruleBookType === 'pdf' ? ruleBookPdfUrl : '',
        ruleBookText: eventForm.ruleBookType === 'text' ? eventForm.ruleBookText : '',
        eventType: eventForm.eventType,
        eventDate: eventForm.eventDate,
        standardDeadline: eventForm.standardDeadline,
        lateFeeStartDate: eventForm.lateFeeStartDate,
        registrationDeadline: eventForm.registrationDeadline || eventForm.standardDeadline,
        lateFee: Number(eventForm.lateFee) || 0,
        bankName: eventForm.bankName,
        accountTitle: eventForm.accountTitle,
        accountNumber: eventForm.accountNumber,
        iban: eventForm.iban,
        bankDetails: {
          bankName: eventForm.bankName,
          accountTitle: eventForm.accountTitle,
          accountNumber: eventForm.accountNumber,
          iban: eventForm.iban,
        },
        categories: modalCategories,
      });

      setShowCreateEventModal(false);
      setEventForm({
        title: '', description: '', eventType: 'online', eventDate: '',
        standardDeadline: '', lateFeeStartDate: '', registrationDeadline: '',
        lateFee: 500, ruleBookType: 'text' as 'text' | 'pdf', ruleBookText: '',
        bankName: '', accountTitle: '', accountNumber: '', iban: ''
      });
      setCoverFile(null);
      setRuleBookPdfFile(null);
      fetchAdminData();
      showNotice('Tournament published successfully!', 'success');
    } catch (err: any) {
      showNotice(err.response?.data?.message || err.message || 'Failed to create event.', 'error');
    } finally {
      setEventPublishing(false);
      setPublishStatusText('');
    }
  };

  const handleExecuteConfirmedAction = async () => {
    if (!inlineConfirmation) return;
    try {
      if (inlineConfirmation.actionType === 'delete_event') {
        await api.delete(`/events/${inlineConfirmation.id}`);
        setSelectedEventStats(null);
        showNotice(`Tournament "${inlineConfirmation.title}" deleted successfully.`, 'success');
      } else if (inlineConfirmation.actionType === 'delete_category') {
        await api.delete(`/categories/${inlineConfirmation.id}`);
        showNotice(`Category "${inlineConfirmation.title}" deleted successfully.`, 'success');
      } else if (inlineConfirmation.actionType === 'verify_payment') {
        const status = inlineConfirmation.meta?.status || 'approved';
        await handleVerifyPayment(inlineConfirmation.id, status);
      } else if (inlineConfirmation.actionType === 'delete_user') {
        try {
          await api.delete(`/admin/users/${inlineConfirmation.id}`);
        } catch (e1) {
          try {
            await api.delete(`/users/${inlineConfirmation.id}`);
          } catch (e2) {}
        }
        setUsersList((prev) => prev.filter((u) => (u._id || u.id) !== inlineConfirmation.id));
        showNotice(`User "${inlineConfirmation.title}" deleted successfully.`, 'success');
      }
      fetchAdminData();
    } catch (err: any) {
      showNotice(err.response?.data?.message || 'Operation failed.', 'error');
    } finally {
      setInlineConfirmation(null);
    }
  };

  const handleChangeEventStatus = async (id: string, status: string) => {
    try {
      await api.put(`/events/${id}/status`, { status });
      setEvents((prev) => prev.map((e) => (e._id === id ? { ...e, status } : e)));
      if (selectedEventStats && selectedEventStats._id === id) {
        setSelectedEventStats({ ...selectedEventStats, status });
      }
      showNotice(`Tournament status updated to ${status.toUpperCase()}.`, 'success');
    } catch (err: any) {
      showNotice('Failed to update status.', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('tlp_platform_settings', JSON.stringify(settingsForm));
      try {
        await api.put('/admin/settings', settingsForm);
      } catch (apiErr) {}
      setSettingsSaved(true);
      showNotice('Platform settings saved successfully!', 'success');
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      showNotice('Failed to update settings.', 'error');
    }
  };

  const exportCategoryWiseCSV = (targetEvent: any, eventRegs: any[]) => {
    const headers = [
      'Category Name', 'Subcategory / Division', 'Team Name', 'Team Head',
      'Contact Phone', 'Athlete Name', 'Weight Category', 'Payment Option',
      'Fee Due (PKR)', 'Fee Paid (PKR)', 'Status'
    ];
    const rows: string[][] = [];
    const flatAthletes: any[] = [];

    eventRegs.forEach((reg) => {
      const tName = reg.teamName || reg.teamId?.teamName || 'Team';
      const tHead = reg.coachName || reg.teamHead?.name || reg.teamId?.teamHeadName || 'Coach';
      const phone = reg.coachPhone || reg.phone || reg.teamId?.contactPhone || '—';
      const payType = 'Full Payment';
      const due = reg.remainingBalance || 0;
      const paid = reg.totalAmountPaid || 0;
      const st = reg.registrationStatus || 'under_review';

      getAthletes(reg).forEach((player: any) => {
        const rawCats = (player.selectedCategories && player.selectedCategories.length > 0)
          ? player.selectedCategories
          : [{ categoryName: player.categoryName || 'General', selectedSubcategory: player.subCategory || player.division || 'Open' }];

        rawCats.forEach((cat: any) => {
          flatAthletes.push({
            catName: cat.categoryName || cat.name || player.categoryName || 'General',
            subName: cat.selectedSubcategory || player.subCategory || player.division || player.belt || 'Open Division',
            tName, tHead, phone,
            playerName: player.name,
            weight: player.weightCategory || player.subCategory || '—',
            payType, due, paid, st
          });
        });
      });
    });

    flatAthletes.sort((a, b) => a.catName.localeCompare(b.catName) || a.subName.localeCompare(b.subName));
    flatAthletes.forEach((item) => {
      rows.push([
        `"${item.catName}"`, `"${item.subName}"`, `"${item.tName}"`, `"${item.tHead}"`,
        `"${item.phone}"`, `"${item.playerName}"`, `"${item.weight}"`, `"${item.payType}"`,
        `"${item.due}"`, `"${item.paid}"`, `"${item.st}"`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${(targetEvent.title || 'Event').replace(/\s+/g, '_')}_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSingleCategoryCSV = (targetEvent: any, targetCategory: any) => {
    const eventRegs = registrations.filter((r) => {
      const eId = getEntityEventId(r);
      return eId === String(targetEvent._id || targetEvent.id);
    });

    const headers = [
      'Category Name', 'Subcategory / Division', 'Athlete Name', 'Weight Category',
      'Team Name', 'Coach / Head', 'Phone Number', 'Payment Status', 'Amount Paid (PKR)'
    ];
    const rows: string[][] = [];
    const flatAthletes: any[] = [];

    eventRegs.forEach((reg) => {
      const tName = reg.teamName || reg.teamId?.teamName || 'Team';
      const tHead = reg.coachName || reg.teamHead?.name || reg.teamId?.teamHeadName || 'Coach';
      const phone = reg.coachPhone || reg.phone || reg.teamId?.contactPhone || '—';
      const paid = reg.totalAmountPaid || 0;
      const st = reg.registrationStatus || 'under_review';

      getAthletes(reg).forEach((player: any) => {
        if (doesAthleteMatchCategory(player, targetCategory._id, targetCategory.name, categories.length)) {
          flatAthletes.push({
            catName: targetCategory.name,
            subName: player.subCategory || player.division || player.belt || player.selectedSubcategory || 'Open Division',
            playerName: player.name,
            weight: player.weightCategory || player.subCategory || '—',
            tName, tHead, phone, st, paid,
          });
        }
      });
    });

    flatAthletes.sort((a, b) => a.subName.localeCompare(b.subName) || a.playerName.localeCompare(b.playerName));
    flatAthletes.forEach((item) => {
      rows.push([
        `"${item.catName}"`, `"${item.subName}"`, `"${item.playerName}"`, `"${item.weight}"`,
        `"${item.tName}"`, `"${item.tHead}"`, `"${item.phone}"`, `"${item.st}"`, `"${item.paid}"`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${(targetEvent.title || 'Event').replace(/\s+/g, '_')}_${targetCategory.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] w-full font-sans text-slate-800 relative">
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* 1. SIDEBAR */}
      <aside
        className={`fixed top-0 bottom-0 left-0 h-screen w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out select-none print:hidden ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-red-600 to-rose-600 rounded-xl flex items-center justify-center text-white font-black">K</div>
              <div>
                <div className="text-white font-black text-lg leading-none">Event<span className="text-[#E63946]">Portal</span></div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Admin Portal</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1 text-xs font-bold overflow-y-auto flex-1 scrollbar-none">
            {[
              { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'Events', icon: Calendar, label: 'Events' },
              { id: 'Categories', icon: Layers, label: 'Categories' },
              { id: 'Team Registrations', icon: Users, label: 'Team Registrations' },
              { id: 'Payments', icon: CreditCard, label: 'Payments' },
              { id: 'Online Videos', icon: Video, label: 'Online Video Submissions' },
              { id: 'Offline Registrations', icon: MapPin, label: 'Offline Registrations' },
              { id: 'Results', icon: Trophy, label: 'Results' },
              { id: 'Users', icon: UserIcon, label: 'Users' },
              { id: 'Settings', icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id as any);
                  setSelectedPaymentEvent(null);
                  setSelectedPaymentProof(null);
                  setSelectedCatEvent(null);
                  setSelectedRegEvent(null);
                  setSelectedVideoEvent(null);
                  setSelectedVideoCategory(null);
                  setSelectedVideoSubcategory(null);
                  setSelectedOfflineEvent(null);
                  setSelectedResultEvent(null);
                  setSelectedResultCategory(null);
                  setSelectedResultSubcategory(null);
                  setInspectReg(null);
                  setInlineConfirmation(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${
                  activeNav === item.id ? 'bg-[#E63946] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#101b3d] border border-slate-800 text-center shrink-0">
          <div className="text-[11px] font-bold text-white">Organize • Manage • Inspire</div>
          <div className="text-[9px] text-slate-400 mt-0.5 font-medium">Team Kabirians Championship</div>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <div className="lg:pl-64 flex flex-col min-h-screen w-full min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-3 sm:px-8 flex items-center justify-between sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 lg:hidden bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-32 sm:w-64 md:w-80 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text" placeholder="Search events, teams, athletes..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setActiveNav('Activity Logs')} className="text-xs font-bold text-slate-600 hover:text-[#1E3A8A] flex items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">System Logs</span>
            </button>

            <button onClick={() => setActiveNav('Notifications')} className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 cursor-pointer">
              <Bell className="w-4 h-4" />
              {pendingApprovals > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63946] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {pendingApprovals}
                </span>
              )}
            </button>

            <button onClick={() => setActiveNav('Profile')} className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-[#0B132B] text-white font-black text-sm flex items-center justify-center">A</div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900">Admin</div>
                <div className="text-[10px] text-slate-400">Master Console</div>
              </div>
            </button>
            <button onClick={handleSignOut} title="Sign Out" className="text-slate-400 hover:text-red-600 cursor-pointer p-1.5"><LogOut className="w-4 h-4" /></button>
          </div>
        </header>

        <main className="p-8 space-y-6 flex-1 overflow-y-auto print:hidden">
          {inlineConfirmation && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
              onClick={() => setInlineConfirmation(null)}
            >
              <div 
                className="w-full max-w-lg bg-[#FFFDF5] border-2 border-amber-300 p-6 rounded-3xl shadow-2xl space-y-4 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-700 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-black text-slate-900">Confirmation Required</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Are you sure you want to proceed with this action for <span className="font-black text-slate-900">&quot;{inlineConfirmation.title}&quot;</span>? This cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-200">
                  <button 
                    type="button" 
                    onClick={() => setInlineConfirmation(null)} 
                    className="px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleExecuteConfirmedAction} 
                    className="px-6 py-2.5 bg-[#E63946] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                  >
                    Confirm &amp; Proceed
                  </button>
                </div>
              </div>
            </div>
          )}

          {inPageNotice && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition animate-in fade-in ${
              inPageNotice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {inPageNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{inPageNotice.message}</span>
              </div>
              <button onClick={() => setInPageNotice(null)} className="p-1 hover:opacity-70 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {activeNav === 'Dashboard' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time tournament overview and registration analytics.</p>
                </div>
                <button onClick={() => setShowCreateEventModal(true)} className="px-4 py-2.5 bg-[#E63946] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer">
                  <Plus className="w-4 h-4" /> Add New Event
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Registrations', val: totalRegistrations, icon: Users, bg: 'bg-blue-600', trend: 'Athletes Enrolled' },
                  { label: 'Pending Payments', val: pendingPayments, icon: CreditCard, bg: 'bg-[#E63946]', trend: 'Needs review' },
                  { label: 'Pakistani Teams', val: pakistaniTeamsCount, icon: Award, bg: 'bg-emerald-600', trend: 'National clubs' },
                  { label: 'International Teams', val: internationalTeamsCount, icon: Trophy, bg: 'bg-indigo-600', trend: 'Overseas clubs' },
                  { label: 'Full Payments', val: fullPayments, icon: CheckCircle2, bg: 'bg-teal-600', trend: 'Approved & Cleared' },
                  { label: 'Total Events', val: totalEventsCount, icon: Calendar, bg: 'bg-rose-600', trend: 'In system' },
                  { label: 'Categories Configured', val: categories.length, icon: Layers, bg: 'bg-purple-600', trend: 'Active divisions' },
                  { label: 'Participating Clubs', val: totalTeamsCount, icon: Users, bg: 'bg-slate-700', trend: 'Registered clubs' },
                ].map((k, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className={`w-10 h-10 rounded-xl ${k.bg} text-white flex items-center justify-center mb-3`}><k.icon className="w-5 h-5" /></div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">{k.label}</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{k.val}</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">{k.trend}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: EVENTS */}
          {activeNav === 'Events' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-2xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Events Management</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Click any championship card to inspect registered teams, payments, or edit tournament details.</p>
                </div>
                <button onClick={() => setShowCreateEventModal(true)} className="px-4 py-2.5 bg-[#E63946] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer">
                  <Plus className="w-4 h-4" /> Add New Event
                </button>
              </div>

              <div className="flex gap-2 bg-white p-2.5 rounded-2xl border shadow-2xs w-fit">
                {['all', 'active', 'upcoming', 'past'].map((tab) => (
                  <button
                    key={tab} onClick={() => setEventTabFilter(tab as any)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
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
                  {filteredEventsByTab.map((ev) => {
                    const evStatus = ev.status || 'upcoming';
                    const isLive = evStatus === 'live';
                    const isClosed = evStatus === 'closed';
                    const isEnded = evStatus === 'ended';
                    const matchedCategories = Array.isArray(ev.categories) && ev.categories.length > 0
                      ? ev.categories
                      : categories.filter((c) => (c.eventId?._id || c.eventId)?.toString() === ev._id.toString());

                    return (
                      <div
                        key={ev._id}
                        onClick={() => setSelectedEventStats(ev)}
                        className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group relative h-full"
                      >
                        <div className="flex flex-col flex-1">
                          <div className="relative h-48 w-full bg-slate-900 overflow-hidden shrink-0">
                            {ev.coverImageUrl ? (
                              <img src={ev.coverImageUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                              {isLive && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-600 text-white shadow-md animate-pulse">LIVE NOW</span>}
                              {evStatus === 'upcoming' && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#059669] text-white shadow-md">UPCOMING</span>}
                              {isClosed && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-600 text-white shadow-md">CLOSED</span>}
                              {isEnded && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-300 shadow-md">ENDED</span>}
                            </div>

                            <div className="absolute bottom-3.5 left-3.5">
                              <span className="text-[11px] font-black uppercase px-3 py-1 rounded-full bg-black/70 text-white backdrop-blur-xs flex items-center gap-1.5 shadow">
                                {ev.eventType === 'online' ? <><span>🌐</span><span>ONLINE</span></> : <><span>📍</span><span>PHYSICAL</span></>}
                              </span>
                            </div>
                          </div>

                          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                            <h3 className="text-xl font-black text-slate-900 leading-snug line-clamp-2">{ev.title}</h3>
                            {(ev.ruleBookPdfUrl || ev.ruleBookText) && (
                              <div className="pt-0.5">
                                {ev.ruleBookPdfUrl ? (
                                  <span
                                    onClick={(e) => { e.stopPropagation(); window.open(ev.ruleBookPdfUrl, '_blank'); }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Official Rule Book (PDF)</span>
                                    <ExternalLink className="w-3 h-3 ml-0.5" />
                                  </span>
                                ) : (
                                  <span
                                    onClick={(e) => { e.stopPropagation(); setActiveRuleTextModal({ title: ev.title, text: ev.ruleBookText }); }}
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
                              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] font-black text-xs">{matchedCategories.length} Listed</span>
                            </div>

                            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-slate-400 font-medium shrink-0">Date:</span>
                                <span className="font-black text-slate-800 truncate text-right">{new Date(ev.eventDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-slate-400 font-medium shrink-0">Standard Deadline:</span>
                                <span className="font-black text-slate-800 truncate text-right">{new Date(ev.standardDeadline || ev.registrationDeadline).toLocaleDateString()}</span>
                              </div>
                              {ev.lateFeeStartDate && (
                                <div className="flex justify-between items-center gap-2">
                                  <span className="text-red-500 font-medium shrink-0">Late Fee Starts:</span>
                                  <span className="font-black text-red-600 truncate text-right">{new Date(ev.lateFeeStartDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-6 pt-0 mt-auto">
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      setSelectedEventStats(ev);
    }}
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
          )}

          {/* TAB 3: CATEGORIES */}
          {activeNav === 'Categories' && (
            <div className="space-y-6 animate-in fade-in">
              {!selectedCatEvent ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-2xs">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Categories &amp; Sub-Divisions Hub</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Select an event to view categories, weight divisions, and live registered athlete counts.</p>
                    </div>
                    <button onClick={() => setShowCreateEventModal(true)} className="px-4 py-2.5 bg-[#E63946] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer">
                      <Plus className="w-4 h-4" /> Add Event with Categories
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {events.map((ev) => {
                      const evId = String(ev._id || ev.id);
                      const matchedCats = categories.filter((c) => getEntityEventId(c) === evId);
                      const eventRegs = registrations.filter((r) => getEntityEventId(r) === evId);
                      const totalAthletesInEvent = eventRegs.reduce((sum, r) => sum + getAthletes(r).length, 0);

                      return (
                        <div key={ev._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:border-[#1E3A8A] hover:shadow-md transition space-y-4 group">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A]">{ev.eventType}</span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{totalAthletesInEvent} Athletes</span>
                          </div>
                          <div onClick={() => setSelectedCatEvent(ev)} className="cursor-pointer">
                            <h3 className="font-black text-slate-900 text-base group-hover:text-[#1E3A8A] transition">{ev.title}</h3>
                            <p className="text-xs text-slate-400 mt-1">{matchedCats.length} Categories Configured</p>
                          </div>
                          <div className="pt-3 border-t flex items-center justify-between gap-2">
                            <button onClick={() => setSelectedCatEvent(ev)} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer">
                              <span>Open Categories</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); exportCategoryWiseCSV(ev, eventRegs); }}
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
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-2xs">
                    <div>
                      <button onClick={() => setSelectedCatEvent(null)} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1.5 cursor-pointer">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to All Events
                      </button>
                      <h2 className="text-xl font-black text-slate-900">{selectedCatEvent.title} &mdash; Categories &amp; Divisions</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => {
                          const evRegs = registrations.filter((r) => getEntityEventId(r) === String(selectedCatEvent._id || selectedCatEvent.id));
                          exportCategoryWiseCSV(selectedCatEvent, evRegs);
                        }}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export All Categories (Excel)</span>
                      </button>
                      <button onClick={() => setShowAddSingleCategoryModal(true)} className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer">
                        <Plus className="w-4 h-4" /> + Add Category
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const selEvId = String(selectedCatEvent._id || selectedCatEvent.id);
                    const eventCats = categories.filter((c) => getEntityEventId(c) === selEvId);
                    const allEvAthletes = registrations
                      .filter((r) => getEntityEventId(r) === selEvId)
                      .flatMap((r) => getAthletes(r));
                    const unassignedEventAthletes = allEvAthletes.filter((a: any) => {
                      return !eventCats.some((cat: any) => doesAthleteMatchCategory(a, cat._id, cat.name, eventCats.length));
                    });

                    return (
                      <div className="space-y-4">
                        {unassignedEventAthletes.length > 0 && (
                          <div
                            onClick={() => {
                              setSelectedCategoryRoster({
                                categoryName: selectedCatEvent.title,
                                subCategoryName: 'Unassigned Division / Category',
                                athletes: unassignedEventAthletes
                              });
                            }}
                            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100/80 transition shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                                <Layers className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-black text-amber-950 text-sm">Unassigned Division Grouping</h4>
                                <p className="text-[11px] text-amber-800">
                                  {unassignedEventAthletes.length} registered athletes have not been matched with any configured category. Click to inspect roster.
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-amber-200 text-amber-950 font-black rounded-xl text-xs">
                              {unassignedEventAthletes.length} Athletes &rarr;
                            </span>
                          </div>
                        )}

                        {eventCats.map((cat, idx) => {
                          const registeredCount = getCategoryAthletesCount(selectedCatEvent._id, cat._id, cat.name);
                          const subList = Array.isArray(cat.subcategories) ? cat.subcategories : (cat.subcategories || '').split(',').map((s: string) => s.trim()).filter(Boolean);

                          return (
                            <div key={cat._id || idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold"><Layers className="w-5 h-5" /></div>
                                  <div>
                                    <h3 className="text-base font-black text-slate-900">{cat.name}</h3>
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Division #{idx + 1}</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <div
                                    onClick={() => {
                                      const roster = getAthletesForCategory(selectedCatEvent._id, cat._id, cat.name);
                                      setSelectedCategoryRoster({ categoryName: cat.name, athletes: roster });
                                    }}
                                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-right cursor-pointer transition shadow-2xs group"
                                    title="Click to view enrolled athlete roster"
                                  >
                                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">Enrolled Athletes</span>
                                    <span className="text-sm font-black text-emerald-800 flex items-center justify-end gap-1">
                                      {registeredCount} Registered
                                      <Users className="w-3.5 h-3.5 text-emerald-600 opacity-70 group-hover:opacity-100" />
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-right font-mono text-xs">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block font-sans">Dual Pricing</span>
                                    <span className="font-bold text-slate-800">PKR {cat.baseFee?.toLocaleString() || 0}</span>
                                    <span className="text-[11px] text-blue-700 font-bold block">${cat.baseFeeUSD || 20} USD</span>
                                  </div>
                                  <button onClick={() => exportSingleCategoryCSV(selectedCatEvent, cat)} className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer">
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    <span>Export Sheet</span>
                                  </button>
                                  <button
                                    onClick={() => setInlineConfirmation({ actionType: 'delete_category', id: cat._id, title: cat.name })}
                                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer"
                                    title="Delete Category"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div>
                                <div className="text-[11px] font-black uppercase text-slate-500 mb-2.5">Sub-Divisions Breakdown (Click to view roster):</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                                  {subList.map((subItem: any, sIdx: number) => {
                                    const subTitle = typeof subItem === 'string' ? subItem : subItem.name || subItem.title || 'Division';
                                    const subCount = getSubcategoryAthletesCount(selectedCatEvent._id, cat._id, cat.name, subTitle);
                                    return (
                                      <div
                                        key={sIdx}
                                        onClick={() => {
                                          const roster = getAthletesForCategory(selectedCatEvent._id, cat._id, cat.name, subTitle);
                                          setSelectedCategoryRoster({ categoryName: cat.name, subCategoryName: subTitle, athletes: roster });
                                        }}
                                        className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition cursor-pointer flex justify-between items-center text-xs group"
                                        title={`Click to view athletes in ${subTitle}`}
                                      >
                                        <div className="truncate mr-2">
                                          <span className="font-bold text-slate-800 group-hover:text-[#1E3A8A] block truncate">{subTitle}</span>
                                          <span className="text-[10px] text-slate-400 group-hover:text-blue-600 font-medium">View roster &rarr;</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black font-mono shrink-0 ${subCount > 0 ? 'bg-blue-100 text-[#1E3A8A]' : 'bg-slate-200/70 text-slate-500'}`}>
                                          {subCount}
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
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TEAM REGISTRATIONS */}
          {activeNav === 'Team Registrations' && (
            <div className="space-y-6 animate-in fade-in">
              {!selectedRegEvent && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl border shadow-2xs">
                    <h2 className="text-xl font-black text-slate-900">Team Registrations Hub</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Select an event below to view registered teams and export rosters.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {events.map((ev) => {
                      const evId = String(ev._id || ev.id);
                      const evRegs = registrations.filter((r) => getEntityEventId(r) === evId);
                      return (
                        <div key={ev._id} onClick={() => setSelectedRegEvent(ev)} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:border-[#1E3A8A] transition cursor-pointer space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">{ev.eventType}</span>
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
                  <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-2xs">
                    <div>
                      <button onClick={() => setSelectedRegEvent(null)} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1 cursor-pointer">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to All Events
                      </button>
                      <h2 className="text-xl font-black text-slate-900">{selectedRegEvent.title} &mdash; Registered Teams</h2>
                    </div>
                    <button
                      onClick={() => {
                        const evRegs = registrations.filter((r) => getEntityEventId(r) === String(selectedRegEvent._id || selectedRegEvent.id));
                        exportCategoryWiseCSV(selectedRegEvent, evRegs);
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Export Category-Wise Excel</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border shadow-2xs overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
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
                        {registrations.filter((r) => getEntityEventId(r) === String(selectedRegEvent._id || selectedRegEvent.id)).map((reg, idx) => (
                          <tr key={getRegId(reg) || idx} className="hover:bg-slate-50">
                            <td className="py-3 px-5 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-5 font-black text-slate-900">{reg.teamName || reg.teamId?.teamName || 'Registered Team'}</td>
                            <td className="py-3 px-5">{reg.coachName || reg.teamHead?.name || reg.teamId?.teamHeadName || 'Coach'}</td>
                            <td className="py-3 px-5 font-bold">{getAthletes(reg).length}</td>
                            <td className="py-3 px-5"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">{reg.paymentOption}</span></td>
                            <td className="py-3 px-5"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">{reg.registrationStatus}</span></td>
                            <td className="py-3 px-5 text-right">
                              <button onClick={() => setInspectReg(reg)} className="px-3.5 py-1.5 border rounded-xl text-blue-700 font-bold hover:bg-blue-50 cursor-pointer">View</button>
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
                  <button onClick={() => setInspectReg(null)} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Teams List
                  </button>

                  <div className="bg-white rounded-3xl p-8 border shadow-2xs flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-[#0B132B] text-white flex items-center justify-center font-black text-2xl">
                        {(inspectReg.teamName || inspectReg.teamId?.teamName)?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-black text-slate-900">{inspectReg.teamName || inspectReg.teamId?.teamName || 'Team'}</h2>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 uppercase">{inspectReg.registrationStatus}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Event: {selectedRegEvent.title}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 border-b pb-2">
                    {['team_head', 'team_members', 'payment_details'].map((tb) => (
                      <button
                        key={tb} onClick={() => setDetailActiveTab(tb as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize cursor-pointer ${detailActiveTab === tb ? 'bg-[#1E3A8A] text-white' : 'text-slate-600'}`}
                      >
                        {tb.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {detailActiveTab === 'team_head' && (
                    <div className="bg-white p-6 rounded-3xl border shadow-2xs space-y-2 text-xs">
                      <div className="font-bold text-sm text-slate-900">{inspectReg.coachName || inspectReg.teamHead?.name || inspectReg.teamId?.teamHeadName || 'Head Coach'}</div>
                      <div className="text-slate-500">Phone: {inspectReg.coachPhone || inspectReg.phone || inspectReg.teamHead?.phone || inspectReg.teamId?.contactPhone || '—'}</div>
                      <div className="text-slate-500">Email: {inspectReg.coachEmail || inspectReg.email || inspectReg.teamHead?.email || inspectReg.teamId?.email || '—'}</div>
                    </div>
                  )}

                  {detailActiveTab === 'team_members' && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-5 animate-in fade-in">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <div>
                          <h4 className="font-black text-base text-slate-900">Registered Athletes / Competitors</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Athlete personal details, age, CNIC/B-Form, weight/belt division, and registered categories.</p>
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
                            const cnicDisplay = p.cnic || p.cnicOrBForm || p.bForm || 'N/A';
                            const ageDisplay = p.age ? `${p.age} Yrs` : 'N/A';
                            const genderDisplay = p.gender || 'N/A';
                            const beltOrDivision = p.subCategory || p.division || p.subDivision || p.belt || p.weightCategory || 'Standard Open';

                            return (
                              <div key={idx} className="p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 transition">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#0B132B] text-white flex items-center justify-center font-black text-xs shadow-xs">#{idx + 1}</div>
                                    <div>
                                      <h5 className="font-black text-sm text-slate-900 leading-tight">{p.name}</h5>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                        Athlete ID: #{p._id ? p._id.toString().slice(-6).toUpperCase() : `ATH-${idx + 1}`}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1E3A8A] border border-blue-200">{beltOrDivision}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                                  <div>
                                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Age</span>
                                    <span className="font-bold text-slate-800">{ageDisplay}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Gender</span>
                                    <span className="font-bold text-slate-800 capitalize">{genderDisplay}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px] font-bold uppercase">CNIC / B-Form</span>
                                    <span className="font-mono font-bold text-slate-800 text-[11px]">{cnicDisplay}</span>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-400 font-bold">Transaction ID:</span>
                            <span className="font-mono font-black text-slate-900 text-sm">{inspectReg.transactionId || inspectReg.lastTransactionId || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-400 font-bold">Total Amount Due:</span>
                            <span className="font-mono font-bold text-slate-900">PKR {Number(inspectReg.totalAmountDue || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-400 font-bold">Total Amount Paid:</span>
                            <span className="font-mono font-black text-emerald-700 text-sm">PKR {Number(inspectReg.totalAmountPaid || inspectReg.totalAmountDue || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-400 font-bold">Remaining Balance:</span>
                            <span className="font-mono font-bold text-red-600">PKR {Number(inspectReg.remainingBalance || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Payment Proof Receipt:</span>
                          {(() => {
                            const slip = inspectReg.paymentSlipUrl || inspectReg.paymentProofUrl || inspectReg.slipUrl || inspectReg.receiptUrl;
                            return slip ? (
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 overflow-hidden flex flex-col items-center gap-2">
                                <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                                  <img src={slip} alt="Payment Receipt" className="w-full h-full object-contain cursor-pointer" onClick={() => window.open(slip, '_blank')} />
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
                    <button onClick={() => handleVerifyPayment(getRegId(inspectReg), 'approved')} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                      Approve
                    </button>
                    <button onClick={() => handleVerifyPayment(getRegId(inspectReg), 'rejected')} className="px-5 py-2.5 bg-[#E63946] text-white rounded-xl text-xs font-bold cursor-pointer">
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeNav === 'Payments' && (
            <PaymentsTab
              events={events}
              registrations={registrations}
              selectedPaymentEvent={selectedPaymentEvent}
              setSelectedPaymentEvent={setSelectedPaymentEvent}
              paymentFilterTab={paymentFilterTab}
              setPaymentFilterTab={setPaymentFilterTab}
              paymentPage={paymentPage}
              setPaymentPage={setPaymentPage}
              itemsPerPage={itemsPerPage}
              currentEventRegistrations={currentEventRegistrations}
              filteredPayments={filteredPayments}
              totalPaymentPages={totalPaymentPages}
              paginatedPayments={paginatedPayments}
              setSelectedPaymentProof={setSelectedPaymentProof}
            />
          )}

          {/* TAB 6: ONLINE VIDEOS */}
          {activeNav === 'Online Videos' && (
            <VideosTab
              onlineEvents={onlineEvents}
              categories={categories}
              registrations={registrations}
              selectedVideoEvent={selectedVideoEvent}
              setSelectedVideoEvent={setSelectedVideoEvent}
              selectedVideoCategory={selectedVideoCategory}
              setSelectedVideoCategory={setSelectedVideoCategory}
              selectedVideoSubcategory={selectedVideoSubcategory}
              setSelectedVideoSubcategory={setSelectedVideoSubcategory}
              setActiveVideoPlayer={setActiveVideoPlayer}
            />
          )}

          {/* TAB 7: OFFLINE REGISTRATIONS */}
          {activeNav === 'Offline Registrations' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-2xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Offline / Physical Tournaments</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Physical Tournaments &gt; Team Slips &gt; View, Download &amp; Print Stamped Passes.</p>
                </div>
                {selectedOfflineEvent && (
                  <button onClick={() => setSelectedOfflineEvent(null)} className="text-xs font-bold text-blue-600 cursor-pointer">
                    &larr; Back to Physical Events
                  </button>
                )}
              </div>

              {!selectedOfflineEvent ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {offlineEvents.map((ev) => (
                    <div key={ev._id} onClick={() => setSelectedOfflineEvent(ev)} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-600 transition cursor-pointer space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold"><MapPin className="w-6 h-6" /></div>
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
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                        <th className="py-3 px-5">#</th>
                        <th className="py-3 px-5">TEAM</th>
                        <th className="py-3 px-5">CONTACT</th>
                        <th className="py-3 px-5">ATHLETES</th>
                        <th className="py-3 px-5 text-right">OFFICIAL STAMPED PASS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                      {registrations.filter((r) => getEntityEventId(r) === String(selectedOfflineEvent._id || selectedOfflineEvent.id)).map((reg, idx) => (
                        <tr key={getRegId(reg) || idx} className="hover:bg-slate-50">
                          <td className="py-3.5 px-5 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3.5 px-5 font-black text-slate-900">{reg.teamName || reg.teamId?.teamName}</td>
                          <td className="py-3.5 px-5 font-mono">{reg.coachPhone || reg.phone || reg.teamId?.contactPhone || '—'}</td>
                          <td className="py-3.5 px-5 font-bold">{getAthletes(reg).length}</td>
                          <td className="py-3.5 px-5 text-right">
                            <button onClick={() => setPrintablePassReg(reg)} className="px-3.5 py-1.5 bg-[#0B132B] hover:bg-slate-900 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow cursor-pointer">
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
          )}

          {/* TAB 8: RESULTS */}
          {activeNav === 'Results' && (
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

              {/* LEVEL 1: ALL TOURNAMENTS */}
              {!selectedResultEvent && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((ev) => {
                    const evId = String(ev._id || ev.id);
                    const matchedCats = categories.filter((c) => getEntityEventId(c) === evId);
                    const evResults = results.filter((rs) => getEntityEventId(rs) === evId);
                    const pubCount = evResults.filter((rs) => rs.isPublished).length;
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

              {/* LEVEL 2: CATEGORIES OF SELECTED TOURNAMENT */}
              {selectedResultEvent && !selectedResultCategory && (
                <div className="space-y-4">
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Tournament Overview</span>
                      <h3 className="text-base font-black text-slate-900">{selectedResultEvent.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose a category folder below to manage podium results, or view the complete tournament roster.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const targetEvId = String(selectedResultEvent._id || selectedResultEvent.id);
                        const allEvAthletes = registrations
                          .filter((r) => getEntityEventId(r) === targetEvId)
                          .flatMap((r) => getAthletes(r).map((p: any) => ({ ...p, teamName: r.teamName || r.teamId?.teamName || 'Registered Team' })));
                        setSelectedCategoryRoster({
                          categoryName: selectedResultEvent.title,
                          subCategoryName: 'Tournament Master Roster',
                          athletes: allEvAthletes
                        });
                      }}
                      className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        Tournament Master Roster ({
                          registrations
                            .filter((r) => getEntityEventId(r) === String(selectedResultEvent._id || selectedResultEvent.id))
                            .flatMap((r) => getAthletes(r)).length
                        } Athletes)
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {categories
                    .filter((c) => getEntityEventId(c) === String(selectedResultEvent._id || selectedResultEvent.id))
                    .map((cat, idx) => {
                      const subList = Array.isArray(cat.subcategories)
                        ? cat.subcategories
                        : (cat.subcategories || '')
                            .split(',')
                            .map((s: string) => s.trim())
                            .filter(Boolean);
                      const enrolledCount = getCategoryAthletesCount(
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
                </div>
              )}

              {/* LEVEL 3: FOLDERS VIEW */}
              {selectedResultEvent && selectedResultCategory && !selectedResultSubcategory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* MASTER FOLDER */}
                  {(() => {
                    const targetEvId = String(selectedResultEvent._id || selectedResultEvent.id);
                    const eventRegs = registrations.filter((r) => getEntityEventId(r) === targetEvId);
                    const eventCatsCount = categories.filter((c) => getEntityEventId(c) === targetEvId).length;
                    const totalInCat = eventRegs.flatMap((r) =>
                      getAthletes(r).filter((p: any) =>
                        doesAthleteMatchCategory(p, selectedResultCategory._id, selectedResultCategory.name, eventCatsCount)
                      )
                    ).length;

                    return (
                      <div
                        onClick={() => setSelectedResultSubcategory('All Athletes')}
                        className="bg-white p-5 rounded-2xl border-2 border-dashed border-blue-300 hover:border-[#1E3A8A] shadow-2xs transition cursor-pointer space-y-3 group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
                            <Users className="w-5 h-5" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-blue-100 text-[#1E3A8A]">
                            {totalInCat} Players
                          </span>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">All Athletes</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Master roster &amp; unassigned players</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* SPECIFIC SUB-DIVISIONS */}
                  {(Array.isArray(selectedResultCategory.subcategories)
                    ? selectedResultCategory.subcategories
                    : (selectedResultCategory.subcategories || '').split(',').map((s: string) => s.trim()).filter(Boolean)
                  ).map((subItem: any, sIdx: number) => {
                    const subName = typeof subItem === 'string' ? subItem : subItem.name || subItem.title || 'Division';
                    const subAthleteCount = getSubcategoryAthletesCount(
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
                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <FolderOpen className="w-5 h-5" />
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black font-mono ${
                            subAthleteCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {subAthleteCount} Players
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm truncate capitalize">{subName}</h4>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* LEVEL 4: ROSTER TABLE */}
              {(() => {
                if (!selectedResultEvent || !selectedResultCategory || !selectedResultSubcategory) return null;
                const targetEvId = String(selectedResultEvent._id || selectedResultEvent.id);
                const eventCatsCount = categories.filter((c) => getEntityEventId(c) === targetEvId).length;
                const rawSubList: any[] = Array.isArray(selectedResultCategory.subcategories)
                  ? selectedResultCategory.subcategories
                  : (selectedResultCategory.subcategories || '').split(',').map((s: string) => s.trim()).filter(Boolean);
                const allSubs = rawSubList.map((s) => (typeof s === 'string' ? s : s.name || s.title || '').trim());

                const eventRegs = registrations.filter((r) => getEntityEventId(r) === targetEvId);
                const categoryAthletes = eventRegs.flatMap((r) =>
                  getAthletes(r)
                    .filter((p: any) => doesAthleteMatchCategory(p, selectedResultCategory._id, selectedResultCategory.name, eventCatsCount))
                    .map((p: any) => ({ ...p, teamName: r.teamName || r.teamId?.teamName || 'Registered Team' }))
                );

                const isAllAthletes = selectedResultSubcategory === 'All Athletes';
                const playersToDisplay = isAllAthletes
                  ? categoryAthletes
                  : categoryAthletes.filter((p: any) => doesAthleteMatchSubcategory(p, selectedResultSubcategory, allSubs));

                return (
                  <div className="space-y-4">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                          Scope: Category &quot;{selectedResultCategory.name}&quot; ({categoryAthletes.length} Athletes) | Tournament Total: {eventRegs.flatMap((r) => getAthletes(r)).length} Athletes
                        </span>
                        <h3 className="text-base font-black text-slate-900">
                          {selectedResultCategory.name} &mdash; <span className="text-[#E63946] capitalize">{selectedResultSubcategory}</span>
                          <span className="text-xs font-bold text-slate-500 ml-2">({playersToDisplay.length} Displayed)</span>
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleBulkPublishSubcategoryResults(false, playersToDisplay)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200"
                        >
                          🔒 Keep All Private (Draft)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkPublishSubcategoryResults(true, playersToDisplay)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                        >
                          🌐 Publish All Results Live
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                            <th className="py-3.5 px-5">#</th>
                            <th className="py-3.5 px-5">ATHLETE</th>
                            <th className="py-3.5 px-5">GENDER / AGE</th>
                            <th className="py-3.5 px-5">TEAM</th>
                            <th className="py-3.5 px-5">ASSIGNED POSITION</th>
                            <th className="py-3.5 px-5">VISIBILITY</th>
                            <th className="py-3.5 px-5 text-right">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-slate-700">
                          {playersToDisplay.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold space-y-1">
                                <p className="font-bold text-slate-600">Is sub-division ({selectedResultSubcategory}) mein abhi koi athlete matched nahi hai.</p>
                                <p className="text-[11px] text-slate-400">
                                  Aap peeche ja kar <strong className="text-blue-600 cursor-pointer" onClick={() => setSelectedResultSubcategory('All Athletes')}>&quot;All Athletes&quot;</strong> folder se kisi bhi player ko is division me medal assign kar sakte hain.
                                </p>
                              </td>
                            </tr>
                          ) : (
                            playersToDisplay.map((player: any, idx: number) => {
                              const resMatch = results.find(
                                (rs) =>
                                  getEntityEventId(rs) === String(selectedResultEvent._id || selectedResultEvent.id) &&
                                  rs.playerName === player.name
                              );
                              return (
                                <tr key={idx} className="hover:bg-slate-50 transition">
                                  <td className="py-3.5 px-5 font-bold text-slate-400">{idx + 1}</td>
                                  <td className="py-3.5 px-5 font-black text-slate-900">{player.name}</td>
                                  <td className="py-3.5 px-5 text-slate-500">
                                    {player.gender || 'Male'} {player.age ? `(${player.age} Yrs)` : ''}
                                  </td>
                                  <td className="py-3.5 px-5 font-bold text-slate-700">{player.teamName}</td>
                                  <td className="py-3.5 px-5">
                                    {resMatch ? (
                                      <div className="inline-flex items-center gap-1.5">
                                        <span className="px-3 py-1 bg-amber-400 text-slate-900 font-black text-xs rounded-full shadow-2xs">
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
                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer transition border ${
                                          resMatch.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}
                                      >
                                        {resMatch.isPublished ? '🌐 Published (Live)' : '🔒 Private (Draft)'}
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
                                          subCategory: isAllAthletes ? (resMatch?.subCategory || allSubs[0] || 'Open') : selectedResultSubcategory,
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
          )}

          {/* TAB 9: USERS */}
          {activeNav === 'Users' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border shadow-2xs">
                <h2 className="text-xl font-black text-slate-900">Coaches &amp; Users</h2>
                <p className="text-xs text-slate-500 mt-0.5">Accounts registered in tournament portal.</p>
              </div>
              <div className="bg-white rounded-2xl border shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b bg-slate-50 text-[11px] font-black text-slate-400 uppercase">
                      <th className="py-4 px-6">#</th>
                      <th className="py-4 px-6">NAME</th>
                      <th className="py-4 px-6">EMAIL</th>
                      <th className="py-4 px-6">ROLE</th>
                      <th className="py-4 px-6">CREATED DATE</th>
                      <th className="py-4 px-6">STATUS</th>
                      <th className="py-4 px-6 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u, idx) => {
                        const userId = u._id || u.id || String(idx);
                        const createdDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                        return (
                          <tr key={userId} className="hover:bg-slate-50 transition">
                            <td className="py-4 px-6 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-4 px-6 font-black text-slate-900">{u.name || 'Unnamed User'}</td>
                            <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">{u.email}</td>
                            <td className="py-4 px-6 font-bold capitalize">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                (u.role || '').toLowerCase() === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {u.role || 'Coach'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-600 font-medium">{createdDate}</td>
                            <td className="py-4 px-6">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => setInlineConfirmation({
                                  actionType: 'delete_user',
                                  id: userId,
                                  title: u.name || u.email || 'User Account'
                                })}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer border border-red-100"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
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
          )}

          {/* TAB 10: SETTINGS */}
          {activeNav === 'Settings' && (
            <div className="space-y-6 animate-in fade-in max-w-2xl">
              <div className="bg-white p-6 rounded-2xl border shadow-2xs">
                <h2 className="text-xl font-black text-slate-900">Platform Settings</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage communication numbers, title, address, and email addresses.</p>
              </div>

              {settingsSaved && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Settings updated successfully!
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl border shadow-2xs space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Website Title</label>
                  <input
                    type="text"
                    value={settingsForm.websiteName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, websiteName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={settingsForm.contactPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Headquarters Address</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <button type="submit" className="px-6 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl font-bold cursor-pointer transition">
                  Save Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 11: ACTIVITY LOGS */}
          {activeNav === 'Activity Logs' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border shadow-2xs">
                <h2 className="text-xl font-black text-slate-900">System Logs</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time audit trail of actions taken by administrators.</p>
              </div>
              <div className="bg-white rounded-2xl border shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b bg-slate-50 text-[11px] font-black text-slate-400 uppercase">
                      <th className="py-4 px-6">#</th>
                      <th className="py-4 px-6">ACTION</th>
                      <th className="py-4 px-6">USER</th>
                      <th className="py-4 px-6">DATE &amp; TIME</th>
                      <th className="py-4 px-6 text-right">IP ADDRESS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {logs.map((l: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-4 px-6 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-4 px-6 font-bold text-slate-900">{l.action}</td>
                        <td className="py-4 px-6">{l.user || 'Admin'}</td>
                        <td className="py-4 px-6 text-slate-500">{new Date(l.date || l.createdAt).toLocaleString()}</td>
                        <td className="py-4 px-6 text-right font-mono text-slate-400">{l.ipAddress || '105.128.36.1'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: NOTIFICATIONS */}
          {activeNav === 'Notifications' && (
            <div className="space-y-6 animate-in fade-in max-w-3xl">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Notifications</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time alerts, approvals, and team registrations.</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await api.patch('/admin/notifications/read-all');
                    } catch (e) {}
                    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                    fetchAdminData();
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>

              {(() => {
                let displayList = Array.isArray(notifications) && notifications.length > 0 ? [...notifications] : [];

                if (displayList.length === 0 && Array.isArray(registrations) && registrations.length > 0) {
                  displayList = registrations.map((r: any) => ({
                    _id: r._id,
                    title: 'New Team Registration',
                    message: `Team "${r.teamName || r.teamId?.teamName || 'New Team'}" submitted registration for ${r.eventTitle || 'Tournament'} (${getAthletes(r).length} athletes).`,
                    isRead: (r.registrationStatus || r.status || '').toLowerCase() === 'approved',
                    createdAt: r.createdAt || new Date(),
                  }));
                }

                if (displayList.length === 0) {
                  return (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-sm font-bold">
                        ✓
                      </div>
                      <h4 className="text-sm font-black text-slate-900">All caught up!</h4>
                      <p className="text-xs text-slate-500">There are no pending alerts or notifications at this moment.</p>
                    </div>
                  );
                }

                return (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                    {displayList.map((n: any, idx: number) => {
                      const isRead = n.isRead || n.read;
                      return (
                        <div
                          key={n._id || idx}
                          className={`p-4 sm:p-5 flex items-center justify-between gap-4 text-xs transition ${
                            isRead ? 'bg-white' : 'bg-red-50/20'
                          }`}
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <span
                              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                                isRead ? 'bg-slate-300' : 'bg-[#E63946] animate-pulse'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 truncate">
                                  {n.title || 'System Notification'}
                                </span>
                                {!isRead && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-700">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 text-xs mt-1 leading-relaxed">{n.message}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap self-start mt-1">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : 'Today'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 13: PROFILE */}
          {activeNav === 'Profile' && (
            <div className="space-y-6 animate-in fade-in max-w-2xl">
              <div className="bg-white rounded-3xl border p-8 shadow-2xs flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#0B132B] text-white flex items-center justify-center font-black text-2xl">A</div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Admin</h2>
                    <p className="text-xs text-slate-400">admin@eventportal.com</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Master Secret Key Active</span>
                  </div>
                </div>
                <button onClick={handleSignOut} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-red-100 transition">Sign Out</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE EVENT MODAL */}
      {showCreateEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100 max-h-[88vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-start pb-3 border-b">
              <div>
                <h3 className="text-xl font-black text-slate-900">Add New Event</h3>
                <p className="text-xs text-slate-500 mt-0.5">Attach Cover Banner, Rule Book, Bank Details, and Dual-Currency Categories.</p>
              </div>
              <button onClick={() => setShowCreateEventModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-5 text-xs font-semibold">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">COVER IMAGE BANNER</label>
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-500 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-[#1E3A8A] file:font-bold file:cursor-pointer" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">EVENT NAME *</label>
                  <input type="text" required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">TYPE</label>
                  <select value={eventForm.eventType} onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })} className="w-full px-3 py-2.5 text-xs border rounded-xl bg-white">
                    <option value="online">Online</option>
                    <option value="physical">Physical (Offline)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">EVENT DESCRIPTION</label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed tournament overview, venue, eligibility rules, and important notices..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tournament Date *</label>
                  <input type="date" required value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Standard Deadline *</label>
                  <input type="date" required value={eventForm.standardDeadline} onChange={(e) => setEventForm({ ...eventForm, standardDeadline: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-red-600 mb-1">Late Fee Start Date *</label>
                  <input type="date" required value={eventForm.lateFeeStartDate} onChange={(e) => setEventForm({ ...eventForm, lateFeeStartDate: e.target.value })} className="w-full px-3 py-2 text-xs border border-red-200 rounded-xl bg-white text-red-700" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-slate-700">RULE BOOK SPECIFICATION</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, ruleBookType: 'text' })}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        eventForm.ruleBookType === 'text' ? 'bg-[#0B132B] text-white' : 'bg-white border text-slate-600'
                      }`}
                    >
                      Text Rules
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, ruleBookType: 'pdf' })}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        eventForm.ruleBookType === 'pdf' ? 'bg-[#0B132B] text-white' : 'bg-white border text-slate-600'
                      }`}
                    >
                      Upload PDF File
                    </button>
                  </div>
                </div>
                {eventForm.ruleBookType === 'text' ? (
                  <textarea
                    rows={4}
                    placeholder="Paste tournament rules, weight limits, gear requirements, and scoring guide..."
                    value={eventForm.ruleBookText}
                    onChange={(e) => setEventForm({ ...eventForm, ruleBookText: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-white outline-none resize-none"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setRuleBookPdfFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-blue-50 file:text-[#1E3A8A] file:font-bold file:cursor-pointer"
                    />
                    {ruleBookPdfFile && (
                      <span className="text-[11px] text-emerald-600 font-bold mt-1 block">Selected: {ruleBookPdfFile.name}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-xs font-black uppercase text-slate-700 block">BANK PAYMENT CREDENTIALS</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Team Kabirians / Organizer Name"
                      value={eventForm.accountTitle}
                      onChange={(e) => setEventForm({ ...eventForm, accountTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Meezan Bank / HBL"
                      value={eventForm.bankName}
                      onChange={(e) => setEventForm({ ...eventForm, bankName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 010203040506"
                      value={eventForm.accountNumber}
                      onChange={(e) => setEventForm({ ...eventForm, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">IBAN</label>
                    <input
                      type="text"
                      placeholder="e.g. PK00MEZN00000000000000"
                      value={eventForm.iban}
                      onChange={(e) => setEventForm({ ...eventForm, iban: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-white outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-slate-700">EVENT CATEGORIES &amp; DUAL PRICING</label>
                  <span className="text-xs font-bold bg-blue-50 text-[#1E3A8A] px-2.5 py-0.5 rounded-full">{modalCategories.length} Categories Added</span>
                </div>

                {modalCategories.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">PKR Base/Late</th>
                          <th className="py-2.5 px-3">USD Base/Late</th>
                          <th className="py-2.5 px-3">Sub-Divisions</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {modalCategories.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                            <td className="py-2.5 px-3 font-mono font-bold">Rs {c.baseFee} / +{c.lateFee}</td>
                            <td className="py-2.5 px-3 font-mono text-blue-700 font-bold">${c.baseFeeUSD || 20} / +${c.lateFeeUSD || 5}</td>
                            <td className="py-2.5 px-3 text-slate-500 truncate max-w-[150px]">{c.subcategories}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setModalCategories(modalCategories.filter((_, i) => i !== idx))}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Remove category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-800 text-[11px] uppercase">Add New Category:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div className="sm:col-span-2">
                      <input type="text" placeholder="Category Name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl outline-none" />
                    </div>
                    <div>
                      <input type="number" placeholder="PKR Base" value={newCatFee || ''} onChange={(e) => setNewCatFee(Number(e.target.value))} className="w-full px-3 py-2 text-xs border rounded-xl outline-none font-mono" />
                    </div>
                    <div>
                      <input type="number" placeholder="PKR Late" value={newCatLateFee || ''} onChange={(e) => setNewCatLateFee(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-red-200 text-red-700 rounded-xl outline-none font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <input type="number" placeholder="$ USD" value={newCatFeeUSD || ''} onChange={(e) => setNewCatFeeUSD(Number(e.target.value))} className="w-full px-2 py-2 text-xs border border-blue-200 text-blue-800 rounded-xl outline-none font-mono" title="USD Base Fee" />
                      <input type="number" placeholder="+$ Late" value={newCatLateFeeUSD || ''} onChange={(e) => setNewCatLateFeeUSD(Number(e.target.value))} className="w-full px-2 py-2 text-xs border border-red-200 text-red-700 rounded-xl outline-none font-mono" title="USD Late Fee" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Subcategories (Comma separated)" value={newCatSubs} onChange={(e) => setNewCatSubs(e.target.value)} className="flex-1 px-3 py-2 text-xs border rounded-xl outline-none" />
                    <button type="button" onClick={handleAddCategoryToModal} className="px-4 py-2 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-900 transition shrink-0">+ Add Category</button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowCreateEventModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-600 cursor-pointer">Cancel</button>
                <button type="submit" disabled={eventPublishing} className="px-6 py-2.5 bg-[#0B132B] text-white font-bold text-xs rounded-xl shadow cursor-pointer">
                  {eventPublishing ? (publishStatusText || 'Publishing...') : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {showEditEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100 max-h-[88vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-start pb-3 border-b">
              <div>
                <h3 className="text-xl font-black text-slate-900">Edit Tournament</h3>
                <p className="text-xs text-slate-500 mt-0.5">Modify title, banner, rules, bank accounts, and dual-currency categories.</p>
              </div>
              <button onClick={() => setShowEditEventModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">COVER IMAGE BANNER</label>
                {editEventForm.existingCoverUrl && (
                  <div className="mb-2 h-32 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                    <img src={editEventForm.existingCoverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-[#1E3A8A] file:font-bold file:cursor-pointer"
                />
                {editCoverFile && <span className="text-[11px] text-emerald-600 font-bold block mt-1">New banner selected: {editCoverFile.name}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Event Name *</label>
                  <input type="text" required value={editEventForm.title} onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })} className="w-full px-4 py-2.5 text-xs border rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Status</label>
                  <select value={editEventForm.status} onChange={(e) => setEditEventForm({ ...editEventForm, status: e.target.value })} className="w-full px-3 py-2.5 text-xs border rounded-xl bg-white">
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="closed">Closed</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  value={editEventForm.description}
                  onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border rounded-xl outline-none resize-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tournament Date *</label>
                  <input type="date" required value={editEventForm.eventDate} onChange={(e) => setEditEventForm({ ...editEventForm, eventDate: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Standard Deadline *</label>
                  <input type="date" required value={editEventForm.standardDeadline} onChange={(e) => setEditEventForm({ ...editEventForm, standardDeadline: e.target.value })} className="w-full px-3 py-2 text-xs border rounded-xl bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-red-600 mb-1">Late Fee Start Date *</label>
                  <input type="date" required value={editEventForm.lateFeeStartDate} onChange={(e) => setEditEventForm({ ...editEventForm, lateFeeStartDate: e.target.value })} className="w-full px-3 py-2 text-xs border border-red-200 rounded-xl bg-white text-red-700" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-slate-700">RULE BOOK SPECIFICATION</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditEventForm({ ...editEventForm, ruleBookType: 'text' })}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        editEventForm.ruleBookType === 'text' ? 'bg-[#0B132B] text-white' : 'bg-white border text-slate-600'
                      }`}
                    >
                      Text Rules
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditEventForm({ ...editEventForm, ruleBookType: 'pdf' })}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        editEventForm.ruleBookType === 'pdf' ? 'bg-[#0B132B] text-white' : 'bg-white border text-slate-600'
                      }`}
                    >
                      Upload PDF File
                    </button>
                  </div>
                </div>
                {editEventForm.ruleBookType === 'text' ? (
                  <textarea
                    rows={4}
                    value={editEventForm.ruleBookText}
                    onChange={(e) => setEditEventForm({ ...editEventForm, ruleBookText: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-white outline-none resize-none"
                  />
                ) : (
                  <div className="space-y-2">
                    {editEventForm.existingPdfUrl && (
                      <div className="text-xs text-blue-700 font-bold flex items-center gap-2">
                        <span>Current Rulebook PDF:</span>
                        <a href={editEventForm.existingPdfUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                          View PDF <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setEditRuleBookPdfFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-blue-50 file:text-[#1E3A8A] file:font-bold file:cursor-pointer"
                    />
                    {editRuleBookPdfFile && (
                      <span className="text-[11px] text-emerald-600 font-bold block">New PDF selected: {editRuleBookPdfFile.name}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-xs font-black uppercase text-slate-700 block">BANK PAYMENT CREDENTIALS</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Title</label>
                    <input
                      type="text"
                      value={editEventForm.accountTitle}
                      onChange={(e) => setEditEventForm({ ...editEventForm, accountTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={editEventForm.bankName}
                      onChange={(e) => setEditEventForm({ ...editEventForm, bankName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Number</label>
                    <input
                      type="text"
                      value={editEventForm.accountNumber}
                      onChange={(e) => setEditEventForm({ ...editEventForm, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">IBAN</label>
                    <input
                      type="text"
                      value={editEventForm.iban}
                      onChange={(e) => setEditEventForm({ ...editEventForm, iban: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-white outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-slate-700">TOURNAMENT CATEGORIES ({editCategories.length})</label>
                </div>
                {editCategories.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">PKR Base/Late</th>
                          <th className="py-2.5 px-3">USD Base/Late</th>
                          <th className="py-2.5 px-3">Sub-Divisions</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {editCategories.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                            <td className="py-2.5 px-3 font-mono font-bold">Rs {c.baseFee} / +{c.lateFee}</td>
                            <td className="py-2.5 px-3 font-mono text-blue-700 font-bold">${c.baseFeeUSD || 20} / +${c.lateFeeUSD || 5}</td>
                            <td className="py-2.5 px-3 text-slate-500 truncate max-w-[150px]">{c.subcategories}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveCategoryInEditModal(idx)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Remove category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-800 text-[11px] uppercase">Add Category:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div className="sm:col-span-2">
                      <input type="text" placeholder="Category Name" value={newEditCatName} onChange={(e) => setNewEditCatName(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl outline-none" />
                    </div>
                    <div>
                      <input type="number" placeholder="PKR Base" value={newEditCatFee || ''} onChange={(e) => setNewEditCatFee(Number(e.target.value))} className="w-full px-3 py-2 text-xs border rounded-xl outline-none font-mono" />
                    </div>
                    <div>
                      <input type="number" placeholder="PKR Late" value={newEditCatLateFee || ''} onChange={(e) => setNewEditCatLateFee(Number(e.target.value))} className="w-full px-3 py-2 text-xs border border-red-200 text-red-700 rounded-xl outline-none font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <input type="number" placeholder="$ USD" value={newEditCatFeeUSD || ''} onChange={(e) => setNewEditCatFeeUSD(Number(e.target.value))} className="w-full px-2 py-2 text-xs border border-blue-200 text-blue-800 rounded-xl outline-none font-mono" title="USD Base Fee" />
                      <input type="number" placeholder="+$ Late" value={newEditCatLateFeeUSD || ''} onChange={(e) => setNewEditCatLateFeeUSD(Number(e.target.value))} className="w-full px-2 py-2 text-xs border border-red-200 text-red-700 rounded-xl outline-none font-mono" title="USD Late Fee" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Subcategories (Comma separated)" value={newEditCatSubs} onChange={(e) => setNewEditCatSubs(e.target.value)} className="flex-1 px-3 py-2 text-xs border rounded-xl outline-none" />
                    <button type="button" onClick={handleAddCategoryInEditModal} className="px-4 py-2 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-900 transition shrink-0">+ Add Category</button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowEditEventModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-600 cursor-pointer">Cancel</button>
                <button type="submit" disabled={editUpdating} className="px-6 py-2.5 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl shadow cursor-pointer">
                  {editUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SINGLE CATEGORY MODAL */}
      {showAddSingleCategoryModal && selectedCatEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-base font-black text-slate-900">Add Category to Tournament</h3>
              <button onClick={() => setShowAddSingleCategoryModal(false)} className="cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateSingleCategory} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 uppercase mb-1">Category Name *</label>
                <input type="text" required value={singleCatForm.name} onChange={(e) => setSingleCatForm({ ...singleCatForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Base Fee (PKR) *</label>
                  <input type="number" required value={singleCatForm.baseFee} onChange={(e) => setSingleCatForm({ ...singleCatForm, baseFee: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-xl outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-red-600 uppercase mb-1">Late Fee (PKR)</label>
                  <input type="number" value={singleCatForm.lateFee} onChange={(e) => setSingleCatForm({ ...singleCatForm, lateFee: Number(e.target.value) })} className="w-full px-3 py-2 border border-red-200 text-red-700 rounded-xl outline-none font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-blue-700 uppercase mb-1">Base Fee (USD $)</label>
                  <input type="number" value={singleCatForm.baseFeeUSD} onChange={(e) => setSingleCatForm({ ...singleCatForm, baseFeeUSD: Number(e.target.value) })} className="w-full px-3 py-2 border border-blue-200 text-blue-800 rounded-xl outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-red-700 uppercase mb-1">Late Fee (USD $)</label>
                  <input type="number" value={singleCatForm.lateFeeUSD} onChange={(e) => setSingleCatForm({ ...singleCatForm, lateFeeUSD: Number(e.target.value) })} className="w-full px-3 py-2 border border-red-200 text-red-700 rounded-xl outline-none font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 uppercase mb-1">Sub-Categories (Weight / Divisions)</label>
                <input type="text" value={singleCatForm.subcategories} onChange={(e) => setSingleCatForm({ ...singleCatForm, subcategories: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#1E3A8A] text-white rounded-xl font-bold mt-2 shadow-xs cursor-pointer hover:bg-blue-900 transition">Save Category</button>
            </form>
          </div>
        </div>
      )}

   {/* MODAL: EVENT STATS, STATUS CHANGE, EDIT & DELETE */}
{selectedEventStats && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in overflow-y-auto"
    onClick={() => setSelectedEventStats(null)}
  >
    <div
      className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 space-y-5 my-8"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center pb-3 border-b">
        <div>
          <span className="text-[10px] font-black uppercase text-red-600 tracking-wider block">
            Tournament Management &amp; Status Control
          </span>
          <h3 className="text-xl font-black text-slate-900">{selectedEventStats.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setSelectedEventStats(null)}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 text-xs font-semibold">
        {/* Status Changer */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <label className="block text-slate-700 uppercase font-black">Tournament Status (Live / Upcoming / Closed / Ended)</label>
          <div className="flex items-center gap-2 flex-wrap">
            {['upcoming', 'live', 'closed', 'ended'].map((st) => {
              const currentEvStatus = selectedEventStats.status || 'upcoming';
              const isSelected = currentEvStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={async () => {
                    try {
                      await api.put(`/events/${selectedEventStats._id}/status`, { status: st });
                      setSelectedEventStats({ ...selectedEventStats, status: st });
                      fetchAdminData();
                      showNotice(`Tournament status successfully changed to ${st.toUpperCase()}!`, 'success');
                    } catch (err: any) {
                      showNotice('Status update karne mein masla hua.', 'error');
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#E63946] text-white shadow-md'
                      : 'bg-white border text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Status change karne par Team Head portal aur User view par events ki availability foran update ho jayegi.
          </p>
        </div>

        {/* Quick Details View */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-slate-400 block uppercase text-[10px]">Event Type</span>
            <span className="font-black text-slate-900 uppercase mt-0.5 block">{selectedEventStats.eventType}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-slate-400 block uppercase text-[10px]">Tournament Date</span>
            <span className="font-black text-slate-900 mt-0.5 block">{new Date(selectedEventStats.eventDate).toLocaleDateString()}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-slate-400 block uppercase text-[10px]">Standard Deadline</span>
            <span className="font-black text-slate-900 mt-0.5 block">{new Date(selectedEventStats.standardDeadline || selectedEventStats.registrationDeadline).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t">
        {/* Delete Tournament Button */}
        <button
          type="button"
          onClick={() => {
            const evId = selectedEventStats._id;
            const evTitle = selectedEventStats.title;
            setSelectedEventStats(null);
            setInlineConfirmation({
              actionType: 'delete_event',
              id: evId,
              title: evTitle,
            });
          }}
          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs cursor-pointer transition flex items-center gap-1.5 border border-red-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Event</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const evToEdit = selectedEventStats;
              setSelectedEventStats(null);
              handleOpenEditEvent(evToEdit);
            }}
            className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-xs"
          >
            Open Full Edit Form
          </button>
          <button
            type="button"
            onClick={() => setSelectedEventStats(null)}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* MODAL: PAYMENT VERIFICATION & SLIPS WITH EDITABLE AMOUNT */}
      {selectedPaymentProof && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs p-4 sm:py-8 flex justify-center items-start animate-in fade-in" onClick={() => setSelectedPaymentProof(null)}>
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 space-y-6 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Payment Verification &amp; Slips</h3>
                <p className="text-xs text-slate-500 mt-0.5">Inspect deposit slip in high resolution, adjust verified amount, and approve.</p>
              </div>
              <button type="button" onClick={() => setSelectedPaymentProof(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 uppercase text-[11px]">Payment Proof Slip</span>
                    {(selectedPaymentProof.paymentSlipUrl || selectedPaymentProof.slipUrl) && (
                      <button
                        type="button"
                        onClick={() => setZoomedReceiptUrl(selectedPaymentProof.paymentSlipUrl || selectedPaymentProof.slipUrl)}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Zoom High-Res</span>
                      </button>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 h-64 flex items-center justify-center p-2 relative group">
                    {(selectedPaymentProof.paymentSlipUrl || selectedPaymentProof.slipUrl) ? (
                      <img
                        src={selectedPaymentProof.paymentSlipUrl || selectedPaymentProof.slipUrl}
                        alt="Payment Slip"
                        className="w-full h-full object-contain cursor-pointer transition group-hover:scale-102"
                        onClick={() => setZoomedReceiptUrl(selectedPaymentProof.paymentSlipUrl || selectedPaymentProof.slipUrl)}
                      />
                    ) : (
                      <p className="text-xs text-slate-400">No payment receipt attached</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-bold">Team Name:</span>
                      <span className="font-black text-slate-900">{selectedPaymentProof.teamName || selectedPaymentProof.teamId?.teamName || '—'}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-bold">Registered Currency:</span>
                      <span className="font-black text-slate-800">
                        {isInternationalReg(selectedPaymentProof) ? 'USD ($)' : 'PKR (Rs)'}
                      </span>
                    </div>

                    {/* EDITABLE CUSTOM AMOUNT SECTION */}
                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <span className="font-bold text-slate-700 block text-xs">Verified Amount:</span>
                        <span className="text-[10px] text-slate-400">Admin can manually edit amount</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-slate-600">
                          {isInternationalReg(selectedPaymentProof) ? '$' : 'Rs'}
                        </span>
                        <input
                          type="number"
                          value={editingPaymentAmount}
                          onChange={(e) => setEditingPaymentAmount(e.target.value)}
                          className="w-28 px-3 py-1.5 bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl font-mono font-black text-xs text-right outline-none shadow-2xs"
                        />
                        <span className="font-bold text-[11px] text-slate-500">
                          {isInternationalReg(selectedPaymentProof) ? 'USD' : 'PKR'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => handleVerifyPayment(getRegId(selectedPaymentProof), 'approved', Number(editingPaymentAmount))}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
                >
                  Approve Payment
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyPayment(getRegId(selectedPaymentProof), 'rejected')}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentProof(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIDEO PLAYER */}
      {activeVideoPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setActiveVideoPlayer(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative border border-slate-100 space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-3 border-b">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider block">
                  Athlete Video Inspection
                </span>
                <h3 className="text-xl font-black text-slate-900 capitalize">
                  {activeVideoPlayer.playerName}
                  {activeVideoPlayer.categoryName ? ` — ${activeVideoPlayer.categoryName}` : ''}
                  {activeVideoPlayer.subName ? ` — ${activeVideoPlayer.subName}` : ''}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Team: <span className="font-bold text-slate-700">{activeVideoPlayer.teamName || 'Registered Team'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoPlayer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              <video
                src={activeVideoPlayer.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Aapka browser video tag support nahi karta.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ZOOMED RECEIPT */}
      {zoomedReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in" onClick={() => setZoomedReceiptUrl(null)}>
          <div className="max-w-4xl max-h-[90vh] w-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center text-white pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">High-Resolution Payment Receipt Slip</span>
              <button type="button" onClick={() => setZoomedReceiptUrl(null)} className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full max-h-[82vh] overflow-auto rounded-2xl bg-black flex items-center justify-center p-2 border border-white/20">
              <img src={zoomedReceiptUrl} alt="High Res Receipt" className="max-w-full max-h-[78vh] object-contain cursor-zoom-in" />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY ATHLETE ROSTER */}
      {selectedCategoryRoster && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedCategoryRoster(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[88vh] overflow-y-auto space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-3 border-b">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Category Athlete Roster
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedCategoryRoster.categoryName}{' '}
                  {selectedCategoryRoster.subCategoryName
                    ? `— ${selectedCategoryRoster.subCategoryName}`
                    : ''}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedCategoryRoster.athletes.length} Athletes Registered in this division.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategoryRoster(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Athlete Name</th>
                    <th className="py-3 px-4">Team / Club</th>
                    <th className="py-3 px-4">Division / Weight / Belt</th>
                    <th className="py-3 px-4">Gender / Age</th>
                    <th className="py-3 px-4 text-right">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {selectedCategoryRoster.athletes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No athletes enrolled in this category/sub-division yet.
                      </td>
                    </tr>
                  ) : (
                    selectedCategoryRoster.athletes.map((ath: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-400">{i + 1}</td>
                        <td className="py-3 px-4 font-black text-slate-900">{ath.name}</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{ath.teamName}</td>
                        <td className="py-3 px-4 font-medium text-slate-600">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 font-mono text-[11px] font-bold">
                            {ath.subCategory ||
                              ath.division ||
                              ath.belt ||
                              ath.weightCategory ||
                              ath.selectedSubcategory ||
                              'Open Division'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {ath.gender || 'Male'} {ath.age ? `(${ath.age} Yrs)` : ''}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              ath.paymentStatus === 'Paid / Cleared'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {ath.paymentStatus || 'Cleared'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: ASSIGN MEDAL / RESULT */}
      {assigningPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setAssigningPlayer(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider block">
                  Podium Ranking &amp; Medals
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Assign Medal to {assigningPlayer.playerName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Team: {assigningPlayer.teamName}</p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningPlayer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignResult} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 uppercase mb-1">Medal / Position *</label>
                <select
                  value={assigningPlayer.position}
                  onChange={(e) => setAssigningPlayer({ ...assigningPlayer, position: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-white outline-none font-bold text-slate-800"
                >
                  <option value="1st (Gold 🥇)">1st Place (Gold 🥇)</option>
                  <option value="2nd (Silver 🥈)">2nd Place (Silver 🥈)</option>
                  <option value="3rd (Bronze 🥉)">3rd Place (Bronze 🥉)</option>
                  <option value="Participant">Participant / Finisher</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 uppercase mb-1">Performance Score (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 9.85 or 3-0"
                  value={assigningPlayer.score}
                  onChange={(e) => setAssigningPlayer({ ...assigningPlayer, score: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modalIsPublished"
                  checked={assigningPlayer.isPublished}
                  onChange={(e) => setAssigningPlayer({ ...assigningPlayer, isPublished: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="modalIsPublished" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Publish Live Immediately (Coach &amp; Public can view)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAssigningPlayer(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl font-bold cursor-pointer transition shadow-xs"
                >
                  Save &amp; Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}