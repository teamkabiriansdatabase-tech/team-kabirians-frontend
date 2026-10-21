// Helper: Normalizer to avoid casing, spaces, punctuation and typo differences
const cleanStr = (val: any): string =>
  String(val || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export const getAthletes = (reg: any): any[] => {
  if (!reg) return [];
  if (Array.isArray(reg.athletes) && reg.athletes.length > 0) return reg.athletes;
  if (Array.isArray(reg.players) && reg.players.length > 0) return reg.players;
  if (Array.isArray(reg.participants) && reg.participants.length > 0) return reg.participants;
  if (Array.isArray(reg.registrationDetails?.athletes) && reg.registrationDetails.athletes.length > 0) return reg.registrationDetails.athletes;
  if (Array.isArray(reg.registrationDetails?.players) && reg.registrationDetails.players.length > 0) return reg.registrationDetails.players;
  if (Array.isArray(reg.offlineAthletes) && reg.offlineAthletes.length > 0) return reg.offlineAthletes;
  
  if (reg.name && (reg.categoryName || reg.subCategory || reg.division || reg.belt || reg.category)) {
    return [reg];
  }

  return [];
};

export const getRegId = (reg: any): string => {
  if (!reg) return '';
  if (typeof reg === 'string') return reg.trim();
  const raw = reg._id || reg.id || reg.registrationId;
  if (!raw) return '';
  if (typeof raw === 'object' && raw.$oid) return String(raw.$oid);
  return String(raw).trim();
};

export const getEntityEventId = (item: any): string => {
  if (!item) return '';
  const raw = item.eventId || item.event || item.tournamentId;
  if (!raw) return '';
  if (typeof raw === 'object') {
    return String(raw._id || raw.id || '');
  }
  return String(raw).trim();
};

export const isRegPending = (st: string) => {
  const s = (st || '').toLowerCase();
  return s === 'under_review' || s === 'pending_payment' || s === 'pending';
};

export const isRegApproved = (st: string) => (st || '').toLowerCase() === 'approved';
export const isRegRejected = (st: string) => (st || '').toLowerCase() === 'rejected';

export const isInternationalReg = (reg: any): boolean => {
  if (!reg) return false;
  const curr = String(
    reg.currency || reg.paymentCurrency || reg.regCurrency || ''
  ).trim().toUpperCase();

  if (curr === 'USD' || reg.isInternational === true || reg.isUSD === true) {
    return true;
  }

  const country = String(reg.country || reg.teamCountry || '').trim().toLowerCase();
  if (country === 'international' || (country && country !== 'pakistan' && country !== 'pk')) {
    return true;
  }

  const athletes = getAthletes(reg);
  if (athletes.some((a: any) => String(a.currency || '').toUpperCase() === 'USD' || a.isInternational === true)) {
    return true;
  }

  const amt = Number(reg.totalAmountPaid || reg.totalAmountDue || reg.totalAmount || 0);
  if (amt > 0 && amt <= 150) {
    return true;
  }

  return false;
};

export const getCleanAthleteDivision = (player: any, fallbackSub = 'Standard Open'): string => {
  if (!player) return fallbackSub;

  const rawCats = Array.isArray(player.selectedCategories) && player.selectedCategories.length > 0
    ? player.selectedCategories
    : Array.isArray(player.categories) && player.categories.length > 0
    ? player.categories
    : [];

  const firstCat = rawCats[0];
  const catName =
    (typeof firstCat === 'object' && firstCat !== null ? firstCat.categoryName || firstCat.name || firstCat.title : '') ||
    player.categoryName ||
    player.category ||
    '';

  const subName =
    (typeof firstCat === 'object' && firstCat !== null ? firstCat.subCategory || firstCat.selectedSubcategory || firstCat.division : '') ||
    player.subCategory ||
    player.selectedSubcategory ||
    player.subDivision ||
    player.division ||
    player.weightCategory ||
    player.weight ||
    player.belt ||
    '';

  if (catName && subName && !subName.toLowerCase().includes(catName.toLowerCase())) return `${catName} (${subName})`;
  if (subName) return subName;
  if (catName) return catName;

  return fallbackSub && fallbackSub !== 'All Athletes' ? fallbackSub : 'Standard Open';
};

export const getPlayerVideoUrl = (player: any, reg: any, athIdx?: number): string => {
  if (!player && !reg) return '';
  const regId = getRegId(reg);

  // 1. Database se aane wale URLs (Cloudinary direct)
  if (player?.videoUrl) return player.videoUrl;
  if (player?.submissionVideoUrl) return player.submissionVideoUrl;
  if (player?.videoSubmissionUrl) return player.videoSubmissionUrl;
  if (player?.youtubeUrl) return player.youtubeUrl;
  if (reg?.videoSubmissionUrl) return reg.videoSubmissionUrl;

  // 2. LocalStorage match jo Team Head portal se save hua
  if (typeof window !== 'undefined' && regId) {
    try {
      const stored = localStorage.getItem('portal_video_submissions') || localStorage.getItem('team_videos');
      if (stored) {
        const parsed = JSON.parse(stored);

        // Exact match with index: "6ad742e7d2c27b011338c6b0_0"
        if (athIdx !== undefined && parsed[`${regId}_${athIdx}`]) {
          return parsed[`${regId}_${athIdx}`];
        }

        // Direct registration ID fallback
        if (parsed[regId]) {
          return typeof parsed[regId] === 'string' ? parsed[regId] : parsed[regId]?.url || '';
        }

        // Key contains regId fallback
        const matchedKey = Object.keys(parsed).find((k) => k.startsWith(regId));
        if (matchedKey && parsed[matchedKey]) {
          return typeof parsed[matchedKey] === 'string' ? parsed[matchedKey] : parsed[matchedKey]?.url || '';
        }
      }
    } catch (e) {}
  }

  return '';
};
// Deep Scanner Category Matching
export const doesAthleteMatchCategory = (
  player: any,
  categoryId: string,
  categoryName: string,
  totalEventCatsCount: number,
  allEventCategories: any[] = []
): boolean => {
  if (!player) return false;

  const targetId = String(categoryId || '').trim().toLowerCase();
  const targetName = cleanStr(categoryName);

  // Direct check
  const pCatName = cleanStr(player.categoryName || player.category || player.catName);
  const pCatId = String(player.categoryId || player.category_id || player.catId || '').trim().toLowerCase();

  if (targetId && pCatId && pCatId === targetId) return true;
  if (targetName && pCatName && (pCatName.includes(targetName) || targetName.includes(pCatName))) {
    return true;
  }

  // Deep scan inside player object
  try {
    const rawString = cleanStr(JSON.stringify(player));
    if (targetId && rawString.includes(targetId)) return true;
    if (targetName && rawString.includes(targetName)) return true;
  } catch (e) {}

  if (totalEventCatsCount === 1) return true;

  return false;
};

// Deep Scanner Subcategory Matching
export const doesAthleteMatchSubcategory = (
  player: any,
  targetSubName: string,
  allCategorySubs: string[] = []
): boolean => {
  if (!targetSubName || targetSubName === 'All Athletes') return true;

  const cleanTarget = cleanStr(targetSubName);
  if (!cleanTarget) return true;

  const candidates: string[] = [
    player.subCategory,
    player.selectedSubcategory,
    player.division,
    player.subDivision,
    player.weightCategory,
    player.weight,
    player.belt,
    player.beltColor,
  ]
    .filter(Boolean)
    .map(cleanStr);

  const directMatch = candidates.some((val) => val === cleanTarget || val.includes(cleanTarget) || cleanTarget.includes(val));
  if (directMatch) return true;

  // Deep scan
  try {
    const rawString = cleanStr(JSON.stringify(player));
    if (rawString.includes(cleanTarget)) return true;
  } catch (e) {}

  return false;
};

export const getCategoryAthletesCount = (
  registrations: any[],
  categories: any[],
  eventId: string,
  categoryId: string,
  categoryName: string
): number => {
  const targetEvId = String(eventId || '');
  const eventRegs = registrations.filter((r) => getEntityEventId(r) === targetEvId);
  const eventCats = categories.filter((c) => getEntityEventId(c) === targetEvId);

  let count = 0;
  eventRegs.forEach((reg) => {
    const athleteList = getAthletes(reg);
    athleteList.forEach((player: any) => {
      if (doesAthleteMatchCategory(player, categoryId, categoryName, eventCats.length, eventCats)) {
        count++;
      }
    });
  });
  return count;
};

export const getSubcategoryAthletesCount = (
  registrations: any[],
  categories: any[],
  eventId: string,
  categoryId: string,
  categoryName: string,
  subName: string
): number => {
  const targetEvId = String(eventId || '');
  const eventRegs = registrations.filter((r) => getEntityEventId(r) === targetEvId);
  const eventCats = categories.filter((c) => getEntityEventId(c) === targetEvId);

  let count = 0;
  eventRegs.forEach((reg) => {
    const athleteList = getAthletes(reg);
    athleteList.forEach((player: any) => {
      if (
        doesAthleteMatchCategory(player, categoryId, categoryName, eventCats.length, eventCats) &&
        doesAthleteMatchSubcategory(player, subName)
      ) {
        count++;
      }
    });
  });

  return count;
};

export const downloadReceiptImage = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'Payment_Proof.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (e) {
    window.open(url, '_blank');
  }
};

export const exportCategoryWiseCSV = (targetEvent: any, eventRegs: any[]) => {
  const headers = [
    'Category Name', 'Subcategory / Division', 'Team Name', 'Team Head',
    'Contact Phone', 'Athlete Name', 'Weight Category', 'Currency',
    'Fee Due', 'Fee Paid', 'Status'
  ];
  const rows: string[][] = [];
  const flatAthletes: any[] = [];

  eventRegs.forEach((reg) => {
    const tName = reg.teamName || reg.teamId?.teamName || 'Team';
    const tHead = reg.coachName || reg.teamHead?.name || reg.teamId?.teamHeadName || 'Coach';
    const phone = reg.coachPhone || reg.phone || reg.teamId?.contactPhone || '—';
    const curr = isInternationalReg(reg) ? 'USD' : 'PKR';
    const due = reg.remainingBalance || 0;
    const paid = reg.totalAmountPaid || reg.totalAmountDue || 0;
    const st = reg.registrationStatus || 'under_review';
    const athleteList = getAthletes(reg);

    athleteList.forEach((player: any) => {
      const rawCats =
        player.selectedCategories && player.selectedCategories.length > 0
          ? player.selectedCategories
          : [{ categoryName: player.categoryName || 'General', selectedSubcategory: getCleanAthleteDivision(player) }];

      rawCats.forEach((cat: any) => {
        flatAthletes.push({
          catName: cat.categoryName || cat.name || player.categoryName || 'General',
          subName: cat.subCategory || cat.selectedSubcategory || getCleanAthleteDivision(player),
          tName, tHead, phone,
          playerName: player.name,
          weight: player.weightCategory || player.subCategory || '—',
          curr, due, paid, st
        });
      });
    });
  });

  flatAthletes.sort((a, b) => a.catName.localeCompare(b.catName) || a.subName.localeCompare(b.subName));
  flatAthletes.forEach((item) => {
    rows.push([
      `"${item.catName}"`, `"${item.subName}"`, `"${item.tName}"`, `"${item.tHead}"`,
      `"${item.phone}"`, `"${item.playerName}"`, `"${item.weight}"`, `"${item.curr}"`,
      `"${item.due}"`, `"${item.paid}"`, `"${item.st}"`
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${(targetEvent.title || 'Event').replace(/\s+/g, '_')}_Roster.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportSingleCategoryCSV = (
  registrations: any[],
  categories: any[],
  targetEvent: any,
  targetCategory: any
) => {
  const targetEvId = String(targetEvent._id || targetEvent.id || '');
  const eventRegs = registrations.filter((r) => getEntityEventId(r) === targetEvId);
  const eventCats = categories.filter((c) => getEntityEventId(c) === targetEvId);

  const headers = [
    'Category Name', 'Subcategory / Division', 'Athlete Name', 'Weight Category',
    'Team Name', 'Coach / Head', 'Phone Number', 'Payment Status', 'Currency', 'Amount Paid'
  ];
  const rows: string[][] = [];
  const flatAthletes: any[] = [];

  eventRegs.forEach((reg) => {
    const tName = reg.teamName || reg.teamId?.teamName || 'Team';
    const tHead = reg.coachName || reg.teamHead?.name || reg.teamId?.teamHeadName || 'Coach';
    const phone = reg.coachPhone || reg.phone || reg.teamId?.contactPhone || '—';
    const curr = isInternationalReg(reg) ? 'USD' : 'PKR';
    const paid = reg.totalAmountPaid || reg.totalAmountDue || 0;
    const st = reg.registrationStatus || 'under_review';
    const athleteList = getAthletes(reg);

    athleteList.forEach((player: any) => {
      if (doesAthleteMatchCategory(player, targetCategory._id, targetCategory.name, eventCats.length, eventCats)) {
        flatAthletes.push({
          catName: targetCategory.name,
          subName: getCleanAthleteDivision(player),
          playerName: player.name,
          weight: player.weightCategory || player.subCategory || '—',
          tName, tHead, phone, st, curr, paid,
        });
      }
    });
  });

  flatAthletes.sort((a, b) => a.subName.localeCompare(b.subName) || a.playerName.localeCompare(b.playerName));
  flatAthletes.forEach((item) => {
    rows.push([
      `"${item.catName}"`, `"${item.subName}"`, `"${item.playerName}"`, `"${item.weight}"`,
      `"${item.tName}"`, `"${item.tHead}"`, `"${item.phone}"`, `"${item.st}"`, `"${item.curr}"`, `"${item.paid}"`
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${(targetEvent.title || 'Event').replace(/\s+/g, '_')}_${targetCategory.name.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};