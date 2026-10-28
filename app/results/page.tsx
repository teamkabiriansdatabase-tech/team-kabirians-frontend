'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Layers3, Medal } from 'lucide-react';
import PublicFrame from '@/components/PublicFrame';
import publicApi from '@/lib/publicApi';
import PublicPageHero from '@/components/PublicPageHero';

type ResultEvent = {
  _id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  eventDate?: string;
  eventType?: string;
  status?: string;
  categoriesCount: number;
  hasPublishedResults: boolean;
  eventEnded: boolean;
};

const eventArchiveImages: Array<[string, string]> = [
  ['Unity Cup Taekwondo Lovers 2026', '/assets/Unity Cup Taekwondo Lovers 2026/a.jpeg'],
  ['New Jersey Taekwondo Cup 2025', '/assets/New Jersey Taekwondo Cup 2025/WhatsApp Image 2026-10-25 at 2.22.50 PM.jpeg'],
  ['8th Heroes Cup Thailand', '/assets/8th Heroes Cup Thailand/a.jpeg'],
  ['10th Taekwondo Lovers All Punjab Championship 2021', '/assets/10th Taekwondo Lovers All Punjab Championship 2021/WhatsApp Image 2026-10-25 at 2.45.03 PM.jpeg'],
];

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default function ResultsPage() {
  const [events, setEvents] = useState<ResultEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    try {
      const response = await publicApi.get('/public/results/events');
      setEvents(Array.isArray(response.data?.data) ? response.data.data : []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 60_000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [load]);

  return <PublicFrame>
    <PublicPageHero eyebrow="Competition record" title="Results & achievements" description="Explore published standings and celebrate the athletes who have represented Team Kabirians." image="/assets/Welcome Ceremony after winning Three Golds Medal from United States Of America/WhatsApp Image 2026-10-25 at 2.24.18 PM.jpeg" imageAlt="Team celebrating an international Taekwondo achievement" />
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-10 lg:py-14">
      {loading ? <p role="status" className="rounded-xl border border-black/10 bg-white p-6 text-sm">Loading results…</p>
        : error ? <div role="alert" className="rounded-xl border border-red-200 bg-white p-6 text-sm">Results couldn’t be loaded. Please refresh to try again.</div>
        : events.length === 0 ? <div className="rounded-2xl border border-black/10 bg-white p-10 text-center"><Medal className="mx-auto h-9 w-9 text-red-600" /><h2 className="mt-4 text-xl font-bold">No results to display yet</h2><p className="mt-2 text-sm text-black/60">Completed events will appear here when the results list is available.</p></div>
        : <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">{events.map((event) => {
          const archiveImage = eventArchiveImages.find(([name]) => event.title.toLocaleLowerCase().includes(name.toLocaleLowerCase()))?.[1];
          const imageSrc = event.coverImageUrl || archiveImage;
          const date = formatDate(event.eventDate);
          return <article key={event._id} className="flex min-w-0 h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative aspect-[16/9] bg-slate-100">{imageSrc ? <Image src={imageSrc} alt={event.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover object-[center_25%]" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-700 text-white/40"><Medal className="h-12 w-12" /></div>}{event.eventType && <span className="absolute bottom-4 left-4 rounded-full bg-black/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">{event.eventType}</span>}</div>
            <div className="flex flex-1 flex-col p-4 sm:p-6"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-600">Competition results</p><h2 className="mt-2 min-h-14 break-words text-xl font-black leading-snug text-slate-950">{event.title}</h2>{date && <p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="h-4 w-4 shrink-0 text-red-600" />{date}</p>}<div className="mb-5 mt-4 flex flex-col items-start gap-2 border-y border-slate-100 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"><span className="inline-flex min-w-0 items-center gap-2 font-semibold text-slate-600"><Layers3 className="h-4 w-4 shrink-0 text-red-600" /><span>Published categories</span></span><span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-900">{event.categoriesCount} Listed</span></div>{event.hasPublishedResults ? <Link href={`/results/${event._id}`} className="mt-auto inline-flex min-h-14 w-full items-center justify-center whitespace-nowrap rounded-2xl bg-[#e5232b] px-4 py-4 text-sm font-black tracking-wide text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200">VIEW RESULTS <span className="ml-2" aria-hidden="true">→</span></Link> : <button type="button" disabled aria-disabled="true" className="mt-auto min-h-14 w-full cursor-not-allowed rounded-2xl bg-slate-200 px-4 py-4 text-sm font-black tracking-wide text-slate-500">RESULTS NOT PUBLISHED</button>}</div>
          </article>;
        })}</div>}
    </section>
  </PublicFrame>;
}
