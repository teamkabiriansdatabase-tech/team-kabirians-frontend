'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Layers3 } from 'lucide-react';
import PublicFrame from '@/components/PublicFrame';
import PublicPageHero from '@/components/PublicPageHero';
import publicApi from '@/lib/publicApi';

type PublicEvent = {
  _id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  ruleBookPdfUrl?: string;
  ruleBookText?: string;
  eventDate?: string;
  standardDeadline?: string;
  lateFeeStartDate?: string;
  registrationDeadline?: string;
  status?: 'upcoming' | 'live' | 'closed' | 'ended';
  eventType?: string;
  categoriesCount?: number;
  eventEnded?: boolean;
  registrationOpen?: boolean;
};

const eventArchiveImages: Array<[string, string]> = [
  ['Unity Cup Taekwondo Lovers 2026', '/assets/Unity Cup Taekwondo Lovers 2026/a.jpeg'],
  ['New Jersey Taekwondo Cup 2025', '/assets/New Jersey Taekwondo Cup 2025/WhatsApp Image 2026-10-25 at 2.22.50 PM.jpeg'],
  ['8th Heroes Cup Thailand', '/assets/8th Heroes Cup Thailand/a.jpeg'],
  ['10th Taekwondo Lovers All Punjab Championship 2021', '/assets/10th Taekwondo Lovers All Punjab Championship 2021/WhatsApp Image 2026-10-25 at 2.45.03 PM.jpeg'],
];

function formatDate(value?: string) {
  if (!value) return 'Not listed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not listed';
  return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function eventButtonState(event: PublicEvent) {
  const eventEnded = Boolean(event.eventEnded || event.status === 'ended');
  if (eventEnded) return { label: 'EVENT ENDED', enabled: false, state: 'ended' as const };
  if (event.status === 'closed') return { label: 'REGISTRATION CLOSED', enabled: false, state: 'closed' as const };
  if (event.status === 'live') {
    return event.registrationOpen !== false
      ? { label: 'REGISTER NOW', enabled: true, state: 'open' as const }
      : { label: 'REGISTRATION CLOSED', enabled: false, state: 'closed' as const };
  }
  return { label: 'COMING SOON', enabled: false, state: 'upcoming' as const };
}

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const response = await publicApi.get('/events/public');
      setEvents(Array.isArray(response.data?.data) ? response.data.data : []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void loadEvents(), 0);
    const timer = window.setInterval(() => void loadEvents(), 60_000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [loadEvents]);

  const ordered = [...events].sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    const aDate = new Date(a.eventDate || 0).getTime();
    const bDate = new Date(b.eventDate || 0).getTime();
    return (a.eventEnded ? 1 : 0) - (b.eventEnded ? 1 : 0) || (a.eventEnded ? bDate - aDate : aDate - bDate);
  });

  return <PublicFrame>
    <PublicPageHero eyebrow="Team Kabirians Taekwondo" title="Events & competitions" description="Find upcoming competitions, event dates, registration details, and rules in one place." image="/assets/Unity Cup Taekwondo Lovers 2026/a.jpeg" imageAlt="Athletes at a Taekwondo competition" />
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
      {loading ? <p role="status" className="rounded-xl border border-black/10 bg-white p-6 text-sm">Loading events…</p>
        : error ? <div role="alert" className="rounded-xl border border-red-200 bg-white p-6 text-sm">Events couldn’t be loaded. Please refresh to try again.</div>
        : ordered.length === 0 ? <div className="rounded-2xl border border-black/10 bg-white p-10 text-center"><h2 className="text-xl font-bold">No public events yet</h2><p className="mt-2 text-sm text-black/60">Published events will appear here.</p></div>
        : <div className="grid items-stretch justify-center gap-6 sm:grid-cols-2 xl:grid-cols-3">{ordered.map((event) => {
          const matchedImage = eventArchiveImages.find(([name]) => event.title.toLocaleLowerCase().includes(name.toLocaleLowerCase()))?.[1];
          const imageSrc = event.coverImageUrl || matchedImage;
          const action = eventButtonState(event);
          const categories = event.categoriesCount === undefined ? 'Not listed' : `${event.categoriesCount} Listed`;
          const details = [
            ['Date', formatDate(event.eventDate)],
            ['Standard deadline', formatDate(event.standardDeadline)],
            ['Late fee starts', formatDate(event.lateFeeStartDate)],
          ];
          return <article key={event._id} className={`flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${ordered.length === 1 ? 'sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-xl xl:col-span-1 xl:col-start-2' : ''}`}>
            <div className="relative aspect-[16/9] bg-slate-100">
              {imageSrc ? <Image src={imageSrc} alt={event.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover object-[center_25%]" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-700 text-white/40"><CalendarDays className="h-12 w-12" /></div>}
              {event.status === 'live' && action.state === 'open' && <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow">Live now</span>}
              {event.status === 'live' && action.state === 'closed' && <span className="absolute right-4 top-4 rounded-full bg-slate-800/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow">Registration closed</span>}
              {event.eventType && <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur"><span aria-hidden="true">◉</span>{event.eventType}</span>}
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-h-14 text-xl font-black leading-snug text-slate-950">{event.title}</h2>
              </div>
              {event.description?.trim() && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{event.description}</p>}
              <div className="mb-5 mt-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4 text-sm">
                <span className="inline-flex items-center gap-2 font-semibold text-slate-600"><Layers3 className="h-4 w-4 text-red-600" />Categories</span>
                <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-900">{categories}</span>
              </div>
              <dl className="mb-5 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm">
                {details.map(([label, value], index) => <div key={label} className="flex items-start justify-between gap-3"><dt className={index === 2 ? 'text-red-600' : 'text-slate-500'}>{label}:</dt><dd className={`text-right font-extrabold ${index === 2 ? 'text-red-600' : 'text-slate-900'}`}>{value}</dd></div>)}
                {event.registrationDeadline && <div className="flex items-start justify-between gap-3"><dt className="text-slate-500">Registration closes:</dt><dd className="text-right font-bold text-slate-900">{formatDate(event.registrationDeadline)}</dd></div>}
              </dl>
              {event.ruleBookText?.trim() && <p className="mb-4 whitespace-pre-line text-sm leading-6 text-slate-600">{event.ruleBookText}</p>}
              {event.ruleBookPdfUrl && <a href={event.ruleBookPdfUrl} target="_blank" rel="noreferrer" className="mb-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-700">View event rules (PDF)</a>}
              {action.enabled ? <Link href="/login" className="mt-auto inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#e5232b] px-5 py-4 text-sm font-black tracking-wide text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200">REGISTER NOW</Link>
                : <button type="button" disabled className="mt-auto min-h-14 w-full cursor-not-allowed rounded-2xl bg-slate-200 px-5 py-4 text-sm font-black tracking-wide text-slate-500" aria-disabled="true">{action.label}</button>}
            </div>
          </article>;
        })}</div>}
    </section>
  </PublicFrame>;
}
