'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Medal } from 'lucide-react';
import PublicFrame from '@/components/PublicFrame';
import publicApi from '@/lib/publicApi';

type ResultRow = { _id: string; playerName: string; teamName?: string; position?: string; score?: string; subCategory?: string };
type ResultCategory = { id: string; name: string; results: ResultRow[] };
type EventResults = { event: { _id: string; title: string; coverImageUrl?: string; eventDate?: string; eventType?: string }; categories: ResultCategory[] };

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default function EventResultsPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [data, setData] = useState<EventResults | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    try {
      const response = await publicApi.get(`/public/results/${encodeURIComponent(eventId)}`);
      const resultData = response.data?.data as EventResults;
      setData(resultData);
      setSelectedCategory((current) => current && resultData.categories.some((category) => category.id === current) ? current : resultData.categories[0]?.id || '');
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [eventId]);
  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 60_000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [load]);

  const category = data?.categories.find((item) => item.id === selectedCategory);

  return <PublicFrame>
    <section className="bg-[#111214] text-white"><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><Link href="/results" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white"><ArrowLeft className="h-4 w-4" />All results</Link><p className="mt-7 text-xs font-bold uppercase tracking-[.2em] text-red-400">Published competition results</p><h1 className="mt-3 text-3xl font-black sm:text-5xl">{data?.event.title || (loading ? 'Loading…' : 'Event results')}</h1>{data?.event.eventDate && <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/65"><CalendarDays className="h-4 w-4" />{formatDate(data.event.eventDate)}</p>}</div></section>
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      {loading ? <p role="status" className="rounded-xl border border-black/10 bg-white p-6 text-sm">Loading published results…</p>
        : error || !data ? <div role="alert" className="rounded-xl border border-red-200 bg-white p-6 text-sm">This event’s published results couldn’t be loaded.</div>
        : data.categories.length === 0 ? <div className="rounded-2xl border border-black/10 bg-white p-10 text-center"><Medal className="mx-auto h-9 w-9 text-red-600" /><h2 className="mt-4 text-xl font-bold">No published results available</h2><p className="mt-2 text-sm text-black/60">Results may have been unpublished or removed.</p></div>
        : <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(15rem,.8fr)_minmax(0,1.2fr)] lg:gap-8">{data.event.coverImageUrl && <div className="relative h-44 max-h-80 overflow-hidden rounded-2xl bg-slate-100 sm:h-64 lg:col-span-2 lg:h-80"><Image src={data.event.coverImageUrl} alt={data.event.title} fill sizes="(max-width: 640px) 100vw, 80vw" className="object-cover" /></div>}<div className="min-w-0"><h2 className="text-xl font-black">Published categories</h2><div className="mt-4 grid gap-2">{data.categories.map((item) => <button type="button" key={item.id} onClick={() => setSelectedCategory(item.id)} aria-pressed={selectedCategory === item.id} className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${selectedCategory === item.id ? 'border-red-600 bg-red-50 text-red-800' : 'border-black/10 bg-white hover:border-black/30'}`}><span className="min-w-0 break-words">{item.name}</span><span className="shrink-0 text-xs font-semibold text-black/45">{item.results.length} results</span></button>)}</div></div><div className="min-w-0"><h2 className="break-words text-xl font-black">{category?.name || 'Results'}</h2>{category?.results.length ? <ul className="mt-4 divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-white">{category.results.map((result) => <li key={result._id} className="flex min-w-0 flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"><div className="min-w-0"><p className="break-words font-extrabold">{result.playerName}</p>{result.teamName && <p className="mt-1 break-words text-xs text-black/55">{result.teamName}</p>}{result.subCategory && <p className="mt-1 break-words text-xs text-black/55">{result.subCategory}</p>}</div><div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end"><div>{result.position && <span className="inline-flex rounded-full bg-[#fff2d8] px-3 py-1.5 text-xs font-bold text-[#78510c]">{result.position}</span>}</div>{result.score && <p className="text-xs text-black/55">Score: {result.score}</p>}</div></li>)}</ul> : <p className="mt-4 rounded-xl bg-white p-5 text-sm text-black/60">No results are published in this category.</p>}</div></div>}
    </section>
  </PublicFrame>;
}
