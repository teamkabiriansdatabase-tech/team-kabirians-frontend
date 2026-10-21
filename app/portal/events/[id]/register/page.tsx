'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { uploadDirectToCloudinary } from '@/lib/upload';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  Video, Trophy, User as UserIcon, ArrowRight, ArrowLeft,
  LogOut, Upload, Check, Plus, Trash2, AlertCircle, 
  Layers, X, CheckCircle2, Clock, AlertTriangle, Bell, CheckCheck, Menu
} from 'lucide-react';
import PortalSidebar from '@/components/PortalSidebar';

interface SelectedCategory {
  categoryId: string;
  categoryName: string;
  subCategory: string;
  fee: number;
  lateFee: number;
}

interface Athlete {
  name: string;
  age: string;
  gender: string;
  cnic: string;
  categoryName?: string;
  subCategory?: string;
  division?: string;
  belt?: string;
  selectedCategories: SelectedCategory[];
}

export default function EventRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id ? String(params.id) : '';

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [event, setEvent] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [registrationCurrency, setRegistrationCurrency] = useState<'PKR' | 'USD'>('PKR');

  const [athletes, setAthletes] = useState<Athlete[]>([
    { name: '', age: '', gender: 'Male', cnic: '', categoryName: '', subCategory: '', division: '', belt: '', selectedCategories: [] }
  ]);

  const [athletePicks, setAthletePicks] = useState<{ [key: number]: { catIndex: number; subCat: string } }>({
    0: { catIndex: 0, subCat: '' }
  });

  const [paymentOption, setPaymentOption] = useState<'full'>('full');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [userProfile, setUserProfile] = useState({ name: 'Team Head', role: 'Team Head' });

  // Notifications Popover Dropdown States
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [portalNotifications, setPortalNotifications] = useState<any[]>([]);

  // Safe category name
  const getCategoryName = (cat: any, index: number): string => {
    if (!cat) return `Category ${index + 1}`;
    if (typeof cat === 'object') {
      return cat.name || cat.title || cat.categoryName || cat.category || cat.label || `Category ${index + 1}`;
    }
    return String(cat);
  };

  // Safe category ID
  const getCategoryId = (cat: any, index: number): string => {
    if (typeof cat === 'object' && cat !== null) {
      return String(cat._id || cat.id || cat.name || `cat-${index}`);
    }
    return String(cat || `cat-${index}`);
  };

  // Safe base fee based on currency
  const getCategoryFee = (cat: any, currency: 'PKR' | 'USD' = registrationCurrency): number => {
    if (typeof cat === 'object' && cat !== null) {
      if (currency === 'USD') {
        const valUSD = cat.baseFeeUSD ?? cat.feeUSD ?? cat.priceUSD ?? cat.amountUSD;
        if (valUSD !== undefined && valUSD !== null && !isNaN(Number(valUSD)) && Number(valUSD) > 0) {
          return Number(valUSD);
        }
        return 20;
      } else {
        const val = cat.baseFee ?? cat.fee ?? cat.entryFee ?? cat.price ?? cat.amount;
        if (val !== undefined && val !== null && !isNaN(Number(val))) {
          return Number(val);
        }
      }
    }
    return currency === 'USD' ? 20 : 2000;
  };

  // Safe late fee extraction based on currency
  const getCategoryLateFee = (cat: any, currency: 'PKR' | 'USD' = registrationCurrency): number => {
    if (typeof cat === 'object' && cat !== null) {
      if (currency === 'USD') {
        const valUSD = cat.lateFeeUSD ?? cat.latePriceUSD ?? cat.lateAmountUSD;
        if (valUSD !== undefined && valUSD !== null && !isNaN(Number(valUSD))) {
          return Number(valUSD);
        }
      } else {
        const val = cat.lateFee ?? cat.latePrice ?? cat.lateFeeAmount ?? cat.lateEntryFee ?? cat.lateAmount;
        if (val !== undefined && val !== null && !isNaN(Number(val))) {
          return Number(val);
        }
      }
    }
    if (currency === 'USD') {
      const eventLateUSD = event?.lateFeeUSD ?? event?.lateRegistrationFeeUSD;
      if (eventLateUSD !== undefined && eventLateUSD !== null && !isNaN(Number(eventLateUSD))) {
        return Number(eventLateUSD);
      }
      return 5;
    } else {
      const eventLate = event?.lateFee ?? event?.lateRegistrationFee ?? event?.lateFeeAmount;
      if (eventLate !== undefined && eventLate !== null && !isNaN(Number(eventLate))) {
        return Number(eventLate);
      }
      return 0;
    }
  };

  const formatMoney = (amount: number): string => {
    if (registrationCurrency === 'USD') {
      return `$${amount.toLocaleString()} USD`;
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  const handleCurrencyChange = (newCurrency: 'PKR' | 'USD') => {
    setRegistrationCurrency(newCurrency);
    setAthletes((prev) =>
      prev.map((ath) => ({
        ...ath,
        selectedCategories: (ath.selectedCategories || []).map((sc) => {
          const origCat = categories.find(
            (c, idx) => getCategoryId(c, idx) === sc.categoryId || getCategoryName(c, idx) === sc.categoryName
          );
          const newFee = getCategoryFee(origCat, newCurrency);
          const origLate = getCategoryLateFee(origCat, newCurrency);
          const assignedLate = origLate > 0 ? origLate : (newCurrency === 'USD' ? 5 : 500);
          return {
            ...sc,
            fee: newFee,
            lateFee: assignedLate,
          };
        }),
      }))
    );
  };

  const getSubCategories = (cat: any): string[] => {
    if (!cat || typeof cat !== 'object') return ['Standard Open'];
    const raw = cat.subcategories ?? cat.subCategories ?? cat.sub_categories ?? cat.subCategory ?? cat.weightCategories ?? cat.weights ?? cat.divisions ?? cat.ageGroups ?? cat.options;
    if (!raw) return ['Standard Open'];
    if (Array.isArray(raw)) {
      if (raw.length === 0) return ['Standard Open'];
      return raw.map((item: any) => typeof item === 'string' ? item.trim() : (item.name || item.title || item.label || item.value || '')).filter(Boolean);
    }
    if (typeof raw === 'string') {
      const parts = raw.split(',').map((s: string) => s.trim()).filter(Boolean);
      return parts.length > 0 ? parts : [raw.trim()];
    }
    return ['Standard Open'];
  };

  const getStandardDeadlineDate = (): Date | null => {
    if (!event) return null;
    const deadlineStr =
      event.standardDeadline ||
      event.regularDeadline ||
      event.earlyBirdDeadline ||
      event.registrationDeadline ||
      event.earlyBirdEndDate ||
      event.deadline ||
      event.lastDate;

    if (!deadlineStr) return null;
    const d = new Date(deadlineStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const isLateRegistrationActive = (): boolean => {
    if (!event) return false;

    if (event.isLateRegistration === true || event.isLateFeeActive === true || event.isLate === true) {
      return true;
    }

    const lateStartDateStr = event.lateRegistrationStartDate || event.lateFeeStartDate || event.lateStartDate;
    if (lateStartDateStr) {
      const lateStart = new Date(lateStartDateStr);
      if (!isNaN(lateStart.getTime()) && new Date() >= lateStart) {
        return true;
      }
    }

    const standardDeadline = getStandardDeadlineDate();
    if (standardDeadline) {
      return new Date() > standardDeadline;
    }

    return false;
  };

  const formatDeadlineDate = (date: Date | null): string => {
    if (!date) return 'TBA';
    try {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'TBA';
    }
  };

  const getPerCategoryLateFeeRate = (): number => {
    for (const cat of categories) {
      const lFee = getCategoryLateFee(cat, registrationCurrency);
      if (lFee > 0) return lFee;
    }
    if (registrationCurrency === 'USD') {
      const eventLateUSD = Number(event?.lateFeeUSD ?? event?.lateRegistrationFeeUSD ?? 0);
      if (eventLateUSD > 0) return eventLateUSD;
      return 5;
    } else {
      const eventLate = Number(event?.lateFee ?? event?.lateRegistrationFee ?? event?.lateFeeAmount ?? 0);
      if (eventLate > 0) return eventLate;
      return 500;
    }
  };

  const isLate = isLateRegistrationActive();
  const perCategoryLateFeeRate = getPerCategoryLateFeeRate();

  const totalCategoriesCount = athletes.reduce(
    (sum, ath) => sum + (ath.selectedCategories?.length || 0),
    0
  );

  const baseTotalAmount = athletes.reduce((total, athlete) => {
    const athleteSum = (athlete.selectedCategories || []).reduce(
      (sum, cat) => sum + (Number(cat.fee) || 0),
      0
    );
    return total + athleteSum;
  }, 0);

  const calculateLateFeeAmount = (): number => {
    if (!isLate || totalCategoriesCount === 0) return 0;

    let totalLate = 0;
    athletes.forEach((ath) => {
      (ath.selectedCategories || []).forEach((cat) => {
        if (cat.lateFee && Number(cat.lateFee) > 0) {
          totalLate += Number(cat.lateFee);
        } else {
          const orig = categories.find(
            (c, idx) => getCategoryId(c, idx) === cat.categoryId || getCategoryName(c, idx) === cat.categoryName
          );
          const origLate = getCategoryLateFee(orig, registrationCurrency);
          totalLate += origLate > 0 ? origLate : perCategoryLateFeeRate;
        }
      });
    });

    return totalLate;
  };

  const lateFeeAmount = calculateLateFeeAmount();
  const totalAmountDue = baseTotalAmount + lateFeeAmount;
  const payableNow = totalAmountDue;
  const remainingBalance = 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.replace(`/login?redirect=/portal/events/${eventId}/register`);
      return;
    }

    try {
      const u = JSON.parse(storedUser);
      if (u.role !== 'team_head') {
        router.replace(`/login?redirect=/portal/events/${eventId}/register`);
        return;
      }
      setUserProfile({ name: u.name || 'Team Head', role: u.role || 'Team Head' });
    } catch {
      router.replace('/login');
      return;
    }

    if (eventId) {
      fetchEventDetails();
    } else {
      setLoading(false);
    }

    fetchHeaderNotifications();
    const interval = setInterval(() => {
      fetchHeaderNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [mounted, eventId, router]);

  const fetchHeaderNotifications = async () => {
    try {
      const res = await api.get('/portal/notifications');
      const list = res.data?.data || res.data?.notifications || res.data || [];
      if (Array.isArray(list)) setPortalNotifications(list);
    } catch (err) {
      try {
        const resFallback = await api.get('/api/v1/portal/notifications');
        const listFallback = resFallback.data?.data || [];
        if (Array.isArray(listFallback)) setPortalNotifications(listFallback);
      } catch (e) {}
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/portal/notifications/read-all');
    } catch (err) {
      try {
        await api.patch('/api/v1/portal/notifications/read-all');
      } catch (e) {}
    }
    setPortalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = portalNotifications.filter((n) => !n.isRead && !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'result':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'video_unlock':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActionLink = (type: string) => {
    switch (type) {
      case 'approval':
        return '/portal/slip';
      case 'result':
        return '/portal/results';
      case 'video_unlock':
        return '/portal/videos';
      case 'payment':
        return '/portal/payments';
      default:
        return '/portal/dashboard';
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      let foundEvent: any = null;

      try {
        const directRes = await api.get(`/events/${eventId}`);
        if (directRes.data?.success && directRes.data?.data) {
          foundEvent = directRes.data.data;
        }
      } catch (e) {
        console.warn('Direct event fetch fallback');
      }

      if (!foundEvent) {
        try {
          const res = await api.get('/portal/events');
          if (res.data?.success && Array.isArray(res.data.data)) {
            foundEvent = res.data.data.find(
              (ev: any) => String(ev._id || ev.id) === String(eventId)
            );
          }
        } catch (e) {
          console.warn('Portal events fallback fetch');
        }
      }

      const hasPopulated =
        foundEvent &&
        Array.isArray(foundEvent.categories) &&
        foundEvent.categories.length > 0 &&
        typeof foundEvent.categories[0] === 'object' &&
        Boolean(foundEvent.categories[0].name || foundEvent.categories[0].title);

      if (!hasPopulated) {
        try {
          const publicRes = await api.get('/events');
          const pList = publicRes.data?.data || publicRes.data || [];
          if (Array.isArray(pList)) {
            const pEvent = pList.find((ev: any) => String(ev._id || ev.id) === String(eventId));
            if (pEvent) {
              if (!foundEvent) foundEvent = pEvent;
              if (Array.isArray(pEvent.categories) && pEvent.categories.length > 0) {
                foundEvent.categories = pEvent.categories;
              }
              if (!foundEvent.bankName && pEvent.bankName) foundEvent.bankName = pEvent.bankName;
              if (!foundEvent.accountTitle && pEvent.accountTitle) foundEvent.accountTitle = pEvent.accountTitle;
              if (!foundEvent.accountNumber && pEvent.accountNumber) foundEvent.accountNumber = pEvent.accountNumber;
              if (!foundEvent.iban && pEvent.iban) foundEvent.iban = pEvent.iban;
              if (!foundEvent.bankDetails && pEvent.bankDetails) foundEvent.bankDetails = pEvent.bankDetails;
            }
          }
        } catch (e) {
          console.warn('Public events fallback fetch');
        }
      }

      setEvent(foundEvent || null);
      if (foundEvent && Array.isArray(foundEvent.categories)) {
        setCategories(foundEvent.categories);
        if (foundEvent.categories.length > 0) {
          const firstSubs = getSubCategories(foundEvent.categories[0]);
          setAthletePicks({
            0: { catIndex: 0, subCat: firstSubs[0] || 'Standard Open' }
          });
        }
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAthlete = () => {
    if (stepError) setStepError(null);
    const newIdx = athletes.length;
    setAthletes(prev => [
      ...prev,
      { name: '', age: '', gender: 'Male', cnic: '', categoryName: '', subCategory: '', division: '', belt: '', selectedCategories: [] }
    ]);
    const firstSubs = categories.length > 0 ? getSubCategories(categories[0]) : [];
    setAthletePicks(prev => ({
      ...prev,
      [newIdx]: { catIndex: 0, subCat: firstSubs[0] || 'Standard Open' }
    }));
  };

  const handleRemoveAthlete = (index: number) => {
    if (athletes.length === 1) return;
    if (stepError) setStepError(null);
    setAthletes(prev => prev.filter((_, i) => i !== index));
  };

  const handleAthleteChange = (index: number, field: string, value: any) => {
    if (stepError) setStepError(null);
    setAthletes(prev =>
      prev.map((ath, aIdx) => (aIdx === index ? { ...ath, [field]: value } : ath))
    );
  };

  const handlePickCategoryChange = (athleteIndex: number, newCatIndex: number) => {
    const selectedCat = categories[newCatIndex];
    const subOpts = getSubCategories(selectedCat);
    setAthletePicks(prev => ({
      ...prev,
      [athleteIndex]: {
        catIndex: newCatIndex,
        subCat: subOpts[0] || 'Standard Open'
      }
    }));
  };

  const handlePickSubCategoryChange = (athleteIndex: number, newSubVal: string) => {
    setAthletePicks(prev => ({
      ...prev,
      [athleteIndex]: {
        ...(prev[athleteIndex] || { catIndex: 0 }),
        subCat: newSubVal
      }
    }));
  };

  // Explicitly binds subCategory, division and categoryName directly to the athlete object[cite: 7]
  const handleAddCategoryToAthlete = (athleteIndex: number) => {
    if (stepError) setStepError(null);

    const pick = athletePicks[athleteIndex] || { catIndex: 0, subCat: '' };
    const selectedCat = categories[pick.catIndex];
    if (!selectedCat) return;

    const catId = getCategoryId(selectedCat, pick.catIndex);
    const catName = getCategoryName(selectedCat, pick.catIndex);
    const catFee = getCategoryFee(selectedCat, registrationCurrency);
    const catLate = getCategoryLateFee(selectedCat, registrationCurrency);
    const assignedLateFee = catLate > 0 ? catLate : perCategoryLateFeeRate;

    const subOptions = getSubCategories(selectedCat);
    const chosenSub = pick.subCat || subOptions[0] || 'Standard Open';

    setAthletes(prev =>
      prev.map((ath, aIdx) => {
        if (aIdx !== athleteIndex) return ath;
        const currentList = ath.selectedCategories || [];

        const alreadyExists = currentList.some(
          c => c.categoryId === catId && c.subCategory === chosenSub
        );

        if (alreadyExists) {
          alert(`"${catName} - ${chosenSub}" is athlete ke liye pehle se add hai.`);
          return ath;
        }

        return {
          ...ath,
          categoryName: catName,
          subCategory: chosenSub,
          division: chosenSub,
          belt: chosenSub,
          selectedCategories: [
            ...currentList,
            {
              categoryId: catId,
              categoryName: catName,
              subCategory: chosenSub,
              fee: catFee,
              lateFee: assignedLateFee,
            }
          ]
        };
      })
    );
  };

  const handleRemoveCategoryChip = (athleteIndex: number, categoryId: string, subCategory: string) => {
    if (stepError) setStepError(null);
    setAthletes(prev =>
      prev.map((ath, aIdx) => {
        if (aIdx !== athleteIndex) return ath;
        const updatedList = (ath.selectedCategories || []).filter(
          c => !(c.categoryId === categoryId && c.subCategory === subCategory)
        );
        const firstRemaining = updatedList[0];
        return {
          ...ath,
          categoryName: firstRemaining ? firstRemaining.categoryName : '',
          subCategory: firstRemaining ? firstRemaining.subCategory : '',
          division: firstRemaining ? firstRemaining.subCategory : '',
          belt: firstRemaining ? firstRemaining.subCategory : '',
          selectedCategories: updatedList
        };
      })
    );
  };

  const handleProceedToPayment = () => {
    setStepError(null);

    if (athletes.length === 0) {
      setStepError('Kripya kam se kam ek athlete add karein.');
      return;
    }

    for (let i = 0; i < athletes.length; i++) {
      const a = athletes[i];
      const athleteNum = i + 1;

      if (!a.name.trim()) {
        setStepError(`Athlete #${athleteNum} ka Full Name likhna lazmi hai.`);
        return;
      }

      if (!a.age.trim()) {
        setStepError(`Athlete #${athleteNum} (${a.name || 'Athlete'}) ki Age enter karein.`);
        return;
      }

      if (!a.cnic.trim()) {
        setStepError(`Athlete #${athleteNum} (${a.name || 'Athlete'}) ka CNIC / B-Form number enter karein.`);
        return;
      }

      if (!a.selectedCategories || a.selectedCategories.length === 0) {
        setStepError(`Athlete #${athleteNum} (${a.name || 'Athlete'}) ke liye kam se kam ek Category add karein.`);
        return;
      }
    }

    if (baseTotalAmount <= 0) {
      setStepError('Kripya categories add karein taake registration fee calculate ho sake.');
      return;
    }

    setStep(2);
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim() || !paymentDate) {
      alert('Kripya Transaction ID aur Payment Date enter karein.');
      return;
    }

    if (!slipFile) {
      alert('Kripya payment slip file select karein.');
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgress(10);

      const uploadResult: any = await uploadDirectToCloudinary({
        file: slipFile,
        uploadType: 'Payment',
        eventId: eventId || 'general',
        onProgress: (progress: number) => {
          setUploadProgress(progress);
        },
      });

      const slipUrl = uploadResult?.secure_url || uploadResult?.url;

      if (!slipUrl) {
        throw new Error('Cloudinary response se slip URL hasil nahi ho saka.');
      }

      const isInt = registrationCurrency === 'USD';

      const formattedAthletes = athletes.map((a) => {
        const catList = (a.selectedCategories || []).map((c) => ({
          categoryId: c.categoryId,
          categoryName: c.categoryName,
          name: c.categoryName,
          subCategory: c.subCategory,
          selectedSubcategory: c.subCategory,
          division: c.subCategory,
          fee: Number(c.fee) || 0,
          lateFee: Number(c.lateFee) || 0,
          currency: isInt ? 'USD' : 'PKR',
        }));

        const primaryCat = catList[0] || { 
          categoryName: a.categoryName || 'General', 
          subCategory: a.subCategory || 'Standard Open', 
          name: a.categoryName || 'General', 
          selectedSubcategory: a.subCategory || 'Standard Open' 
        };

        return {
          name: a.name.trim(),
          age: Number(a.age) || 0,
          gender: a.gender || 'Male',
          cnic: a.cnic.trim(),
          cnicOrBForm: a.cnic.trim(),
          categoryName: primaryCat.categoryName,
          subCategory: primaryCat.subCategory,
          selectedSubcategory: primaryCat.subCategory,
          subDivision: primaryCat.subCategory,
          division: primaryCat.subCategory,
          belt: primaryCat.subCategory,
          beltColor: primaryCat.subCategory,
          currency: isInt ? 'USD' : 'PKR',
          paymentCurrency: isInt ? 'USD' : 'PKR',
          isInternational: isInt,
          categories: catList,
          selectedCategories: catList,
        };
      });

      const payload = {
        event: eventId,
        eventId: eventId,
        athletes: formattedAthletes,
        paymentOption,
        currency: isInt ? 'USD' : 'PKR',
        paymentCurrency: isInt ? 'USD' : 'PKR',
        regCurrency: isInt ? 'USD' : 'PKR',
        isInternational: isInt,
        isUSD: isInt,
        country: isInt ? 'International' : 'Pakistan',
        isLateRegistration: isLate,
        baseAmount: Number(baseTotalAmount) || 0,
        lateFee: Number(lateFeeAmount) || 0,
        totalAmountDue: Number(totalAmountDue) || 0,
        totalAmount: Number(totalAmountDue) || 0,
        totalAmountPaid: Number(payableNow) || 0,
        paidAmount: Number(payableNow) || 0,
        remainingBalance: Number(remainingBalance) || 0,
        transactionId: transactionId.trim(),
        paymentDate,
        paymentSlipUrl: slipUrl,
        slipUrl: slipUrl,
        paymentSlip: slipUrl,
        registrationStatus: 'under_review',
        status: 'under_review',
      };

      const res = await api.post('/portal/registrations', payload);

      if (res.data?.success || res.status === 200 || res.status === 201) {
        setStep(3);
      }
    } catch (err: any) {
      console.error('Registration submission error:', err);
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration submit karne mein masla hua.';
      alert(backendMessage);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    router.replace('/login');
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Checking event details...</p>
        </div>
      </div>
    );
  }

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
            <Link href="/portal/events" prefetch={false} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider truncate">Athlete Registration &amp; Divisions</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63946] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifDropdown(false)}
                  />

                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          Notifications
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {unreadCount} unread alerts
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {portalNotifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 space-y-1">
                          <Bell className="w-6 h-6 mx-auto opacity-30" />
                          <p className="text-xs font-bold text-slate-700">No new notifications</p>
                          <p className="text-[10px]">Approvals, video unlock, and results will appear here.</p>
                        </div>
                      ) : (
                        portalNotifications.slice(0, 10).map((n: any, idx: number) => {
                          const isRead = n.isRead || n.read;
                          const actionHref = getActionLink(n.type);

                          return (
                            <Link
                              key={n._id || idx}
                              href={actionHref}
                              onClick={() => setShowNotifDropdown(false)}
                              className={`p-3.5 text-xs transition flex items-start gap-3 cursor-pointer ${
                                isRead ? 'bg-white hover:bg-slate-50' : 'bg-red-50/30 hover:bg-red-50/50'
                              }`}
                            >
                              <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                                {getNotificationIcon(n.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-black text-slate-900 truncate">
                                    {n.title}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap">
                                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                  {n.message}
                                </p>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-[#1E3A8A] text-white font-black text-xs flex items-center justify-center shadow-xs">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-slate-900 leading-tight">{userProfile.name}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{userProfile.role}</div>
              </div>
            </div>
            <button onClick={handleSignOut} title="Sign Out" className="p-2 text-slate-400 hover:text-red-600 rounded-xl transition cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-8 space-y-6 flex-1 overflow-y-auto max-w-5xl mx-auto w-full">
          {step !== 3 && (
            <div className="relative h-36 rounded-3xl bg-gradient-to-r from-slate-900 to-[#101b3b] overflow-hidden p-6 flex flex-col justify-between shadow-xs">
              {event?.coverImageUrl && (
                <img src={event.coverImageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
              )}
              <div className="relative z-10 flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white animate-pulse">
                  Registration Open
                </span>
                <span className="text-xs font-mono font-bold text-slate-300 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  {categories.length} Categories Available
                </span>
              </div>
              <div className="relative z-10">
                <h1 className="text-xl sm:text-2xl font-black text-white">{event?.title || 'Tournament Registration'}</h1>
              </div>
            </div>
          )}

          {isLate && step !== 3 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3.5 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 w-full">
                <div className="text-xs font-black text-amber-950 uppercase tracking-wide flex flex-wrap items-center gap-2">
                  <span>Late Registration Window Active</span>
                  <span className="bg-amber-200 text-amber-900 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold shadow-2xs">
                    +{formatMoney(perCategoryLateFeeRate)} Per Category Late Fee
                  </span>
                  {totalCategoriesCount > 0 && (
                    <span className="bg-amber-300/80 text-amber-950 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-black">
                      Total Surcharge: {formatMoney(lateFeeAmount)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Standard registration deadline (<strong>{formatDeadlineDate(getStandardDeadlineDate())}</strong>) guzar chuki hai. 
                  Har category registration par <strong>{formatMoney(perCategoryLateFeeRate)}</strong> late fee charge hogi.
                  {totalCategoriesCount > 0 ? (
                    <span className="font-semibold text-amber-950">
                      {' '}(Abhi aapne <strong>{totalCategoriesCount}</strong> {totalCategoriesCount === 1 ? 'category' : 'categories'} enroll ki hain = <strong>{formatMoney(lateFeeAmount)}</strong> late surcharge shamil hai).
                    </span>
                  ) : (
                    <span className="text-amber-800">
                      {' '}(Category add karne par automatically late fee jud jayegi).
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Enrolled Athletes &amp; Categories</h3>
                    <p className="text-xs text-slate-500">
                      Dropdown se category aur sub-category select karein aur <strong>+ Add Division</strong> click karein[cite: 7].
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAthlete}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Athlete</span>
                  </button>
                </div>

                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B132B] via-[#101b3b] to-[#1E3A8A] rounded-2xl text-white shadow-md border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-800/80">
                        Registration Origin &amp; Pricing Currency
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white">Select Registration Origin</h4>
                    <p className="text-xs text-slate-300 leading-snug">
                      Choose whether you are enrolling a local Pakistani team (PKR) or an International delegation (USD).
                    </p>
                  </div>

                  <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 shadow-inner shrink-0 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={() => handleCurrencyChange('PKR')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                        registrationCurrency === 'PKR'
                          ? 'bg-[#E63946] text-white shadow-md ring-2 ring-red-400/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-base">🇵🇰</span>
                      <span>Pakistani Team (PKR)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCurrencyChange('USD')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                        registrationCurrency === 'USD'
                          ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-base">🌐</span>
                      <span>International Team (USD)</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {athletes.map((athlete, aIdx) => {
                    const currentPick = athletePicks[aIdx] || { catIndex: 0, subCat: '' };
                    const activeCat = categories[currentPick.catIndex] || categories[0];
                    const activeSubs = activeCat ? getSubCategories(activeCat) : [];
                    const selectedList = athlete.selectedCategories || [];

                    return (
                      <div key={`athlete-${aIdx}`} className="p-6 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                              Athlete #{aIdx + 1}
                            </span>
                            {selectedList.length > 0 && (
                              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                                {selectedList.length} {selectedList.length === 1 ? 'Division' : 'Divisions'} Enrolled
                              </span>
                            )}
                          </div>
                          {athletes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAthlete(aIdx)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-xl transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Full Name</label>
                            <input
                              type="text"
                              placeholder="Athlete Name"
                              value={athlete.name}
                              onChange={(e) => handleAthleteChange(aIdx, 'name', e.target.value)}
                              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-white shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Gender</label>
                            <select
                              value={athlete.gender || 'Male'}
                              onChange={(e) => handleAthleteChange(aIdx, 'gender', e.target.value)}
                              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium shadow-2xs cursor-pointer"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Age</label>
                            <input
                              type="number"
                              placeholder="Age"
                              value={athlete.age}
                              onChange={(e) => handleAthleteChange(aIdx, 'age', e.target.value)}
                              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-white font-mono shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">CNIC / B-Form</label>
                            <input
                              type="text"
                              placeholder="XXXXX-XXXXXXX-X"
                              value={athlete.cnic}
                              onChange={(e) => handleAthleteChange(aIdx, 'cnic', e.target.value)}
                              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-white font-mono shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-700 uppercase tracking-wider">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            <span>Select &amp; Assign Categories</span>
                          </div>

                          {categories.length === 0 ? (
                            <div className="text-xs text-slate-400 py-2">
                              Is tournament ke liye categories mojud nahi hain.
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                              <div className="flex-1">
                                <select
                                  value={currentPick.catIndex}
                                  onChange={(e) => handlePickCategoryChange(aIdx, Number(e.target.value))}
                                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-bold outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                  {categories.map((c, cIdx) => {
                                    const fee = getCategoryFee(c, registrationCurrency);
                                    const late = getCategoryLateFee(c, registrationCurrency) || perCategoryLateFeeRate;
                                    const label =
                                      registrationCurrency === 'USD'
                                        ? `${getCategoryName(c, cIdx)} — $${fee} USD ${isLate ? `(+$${late} USD Late)` : ''}`
                                        : `${getCategoryName(c, cIdx)} — PKR ${fee.toLocaleString()} ${isLate ? `(+PKR ${late.toLocaleString()} Late)` : ''}`;
                                    return (
                                      <option key={cIdx} value={cIdx}>
                                        {label}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>

                              <div className="flex-1">
                                <select
                                  value={currentPick.subCat || activeSubs[0] || ''}
                                  onChange={(e) => handlePickSubCategoryChange(aIdx, e.target.value)}
                                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-bold outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                  {activeSubs.map((sub, sIdx) => (
                                    <option key={sIdx} value={sub}>
                                      {sub}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddCategoryToAthlete(aIdx)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer flex-shrink-0"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Add Division</span>
                              </button>
                            </div>
                          )}

                          <div className="pt-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                              Enrolled Divisions ({selectedList.length}):
                            </div>

                            {selectedList.length === 0 ? (
                              <div className="p-3 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
                                Abhi tak koi category add nahi hui. Upar se select karke <strong>Add Division</strong> dabayein[cite: 7].
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {selectedList.map((item, itemIdx) => (
                                  <div
                                    key={itemIdx}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs shadow-2xs group"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                    <span className="font-bold">{item.categoryName}</span>
                                    <span className="text-[10px] font-semibold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-blue-100">
                                      {item.subCategory}
                                    </span>
                                    <span className="font-mono font-black text-emerald-600 text-[11px]">
                                      {registrationCurrency === 'USD' ? `$${item.fee} USD` : `PKR ${item.fee}`}
                                    </span>
                                    {isLate && (
                                      <span className="font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                                        +{registrationCurrency === 'USD' ? `$${item.lateFee || perCategoryLateFeeRate} USD` : `PKR ${item.lateFee || perCategoryLateFeeRate}`} Late
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCategoryChip(aIdx, item.categoryId, item.subCategory)}
                                      className="text-slate-400 hover:text-red-600 p-0.5 rounded-md hover:bg-red-50 transition cursor-pointer ml-1"
                                      title="Remove"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  {stepError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span>{stepError}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
                        <span>Base Fee: <strong className="font-mono text-slate-900">{formatMoney(baseTotalAmount)}</strong></span>
                        {isLate && (
                          <span className="text-amber-700 font-bold flex items-center gap-1">
                            + Late Surcharge: <strong className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">{formatMoney(lateFeeAmount)}</strong>
                            <span className="text-[10px] text-amber-600">(@ {formatMoney(perCategoryLateFeeRate)}/category)</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-slate-500 font-bold">Total Due:</span>
                        <span className="text-2xl font-black text-blue-600 font-mono">{formatMoney(totalAmountDue)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="w-full sm:w-auto px-6 py-3 bg-[#E63946] hover:bg-red-700 text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-900 mb-1">Payment Information</h3>
                <p className="text-xs text-slate-500">Transfer total fee to the official bank account below.</p>
              </div>

              {/* Dynamic Bank Credentials Display - Real Event Data without Static Dummy Fallbacks */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                  <div className="text-[11px] font-black uppercase tracking-wider text-blue-900">
                    Official Event Bank Credentials
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {registrationCurrency === 'USD' ? '🌐 International USD Wire' : '🇵🇰 Local PKR Account'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex justify-between sm:flex-col sm:justify-start gap-0.5 bg-white/70 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Bank Name</span>
                    <strong className="text-slate-900 text-xs">
                      {event?.bankDetails?.bankName || event?.bankName || 'Organizer Bank'}
                    </strong>
                  </div>

                  <div className="flex justify-between sm:flex-col sm:justify-start gap-0.5 bg-white/70 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Account Title</span>
                    <strong className="text-slate-900 text-xs">
                      {event?.bankDetails?.accountTitle || event?.accountTitle || 'Event Organizer'}
                    </strong>
                  </div>

                  <div className="flex justify-between sm:flex-col sm:justify-start gap-0.5 bg-white/70 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Account Number</span>
                    <strong className="text-slate-900 font-mono text-xs">
                      {event?.bankDetails?.accountNumber || event?.accountNumber || '—'}
                    </strong>
                  </div>

                  <div className="flex justify-between sm:flex-col sm:justify-start gap-0.5 bg-white/70 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400">IBAN / Swift</span>
                    <strong className="text-slate-900 font-mono text-xs">
                      {event?.bankDetails?.iban || event?.iban || '—'}
                    </strong>
                  </div>
                </div>

                {registrationCurrency === 'USD' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                    💡 <strong>International Teams Note:</strong> Please ensure your international wire transfer or remittance slip matches the total <strong>{formatMoney(totalAmountDue)}</strong>. Upload the wire confirmation or remittance receipt below.
                  </div>
                )}

                <div className="pt-3 border-t border-blue-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Base Registration Fee:</span>
                    <strong className="font-mono text-slate-900 text-xs">{formatMoney(baseTotalAmount)}</strong>
                  </div>

                  {isLate && (
                    <div className="flex justify-between items-center text-amber-800">
                      <span className="font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Late Registration Surcharge ({totalCategoriesCount} × {formatMoney(perCategoryLateFeeRate)}):</span>
                      </span>
                      <strong className="font-mono text-amber-800 text-xs bg-amber-100 px-2 py-0.5 rounded-md">
                        + {formatMoney(lateFeeAmount)}
                      </strong>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-blue-200/50">
                    <span className="font-black text-slate-800">Total Calculated Amount:</span>
                    <strong className="font-mono text-slate-950 text-sm font-black">{formatMoney(totalAmountDue)}</strong>
                  </div>

                  <div className="flex justify-between items-center bg-white/80 p-2.5 rounded-xl border border-blue-200 shadow-2xs">
                    <span className="font-black text-blue-950">
                      Payable Now (100% Full Payment):
                    </span>
                    <strong className="font-mono text-emerald-600 text-base font-black">
                      {formatMoney(payableNow)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900">Payment Type</label>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    100% Full Payment
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Transaction ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 7231107800"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Upload Payment Slip</label>
                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition bg-slate-50">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">
                    {slipFile ? slipFile.name : 'Click to browse or drag file here'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files && setSlipFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleRegistrationSubmit}
                  className="px-6 py-2.5 bg-[#E63946] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {submitting
                      ? uploadProgress > 0 && uploadProgress < 100
                        ? `Uploading Slip (${uploadProgress}%)...`
                        : 'Submitting Details...'
                      : 'Confirm & Submit'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-10 sm:p-14 rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto shadow-sm animate-in fade-in my-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Thank you for registration!</h2>
              <p className="text-sm font-semibold text-slate-600">
                Please wait for the verification.
              </p>
              <p className="text-xs text-slate-400">
                Aapki team aur athletes ki details review mein hain. Admin team slip verify karne ke baad status approve kar degi.
              </p>
              <div className="pt-4">
                <Link
                  href="/portal/team"
                  prefetch={false}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0A1128] hover:bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-md transition"
                >
                  <Users className="w-4 h-4" />
                  <span>Go to My Team</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}