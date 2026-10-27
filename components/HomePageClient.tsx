'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarDays, Medal, Shield, Heart, Target } from 'lucide-react';
import PublicFrame from '@/components/PublicFrame';
import publicApi from '@/lib/publicApi';

type EventItem = { _id?: string; title: string; description?: string; eventDate?: string; status?: string; coverImageUrl?: string };
type ResultItem = { _id?: string; playerName?: string; position?: string; score?: string; categoryName?: string; teamName?: string; eventId?: { title?: string; eventDate?: string } };

export default function HomePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const [eventResponse, resultResponse] = await Promise.all([publicApi.get('/events/public'), publicApi.get('/public/results')]);
      setEvents(eventResponse.data?.data || []);
      setResults(resultResponse.data?.data || []);
      setCurrentTime(Date.now());
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 60_000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [load]);

  const now = currentTime;
  const eventPreview = [...events].sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    const aDate = new Date(a.eventDate || 0).getTime();
    const bDate = new Date(b.eventDate || 0).getTime();
    const aPast = a.status === 'ended' || aDate < now;
    const bPast = b.status === 'ended' || bDate < now;
    if (aPast !== bPast) return aPast ? 1 : -1;
    return aPast ? bDate - aDate : aDate - bDate;
  }).slice(0, 3);
  const resultPreview = results.slice(0, 3);

  return (
    <PublicFrame>
      <section className="relative isolate min-h-[610px] overflow-hidden bg-[#101113] text-white sm:min-h-[680px]">
        <Image src="/assets/New Jersey Taekwondo Cup 2025/WhatsApp Image 2026-10-25 at 2.22.50 PM.jpeg" alt="Taekwondo athletes competing at the New Jersey Taekwondo Cup" fill priority sizes="100vw" className="-z-20 object-cover object-[center_20%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/75 to-black/20" />
        <div className="mx-auto flex min-h-[610px] max-w-7xl items-center px-5 py-20 sm:min-h-[680px] sm:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.2em] text-white/85">Proudly associated with Pakistan Taekwondo Lovers</p>
            <h1 className="text-5xl font-black uppercase leading-[.98] tracking-tight sm:text-7xl lg:text-8xl">Team<br /><span className="text-[#e52b35]">Kabirians</span><br />Taekwondo</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">A home for Taekwondo practice, team spirit, and competition. Explore the archive, meet the people featured in it, and follow public events and results.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/about" className="inline-flex items-center gap-2 rounded-full bg-[#d51e2b] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700">Discover the team <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/events" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">Public events</Link>
            </div>
            <div className="mt-10 flex items-center gap-5">
              <Image src="/assets/team kabirians.png" alt="Team Kabirians logo" width={56} height={56} className="h-14 w-14 rounded-full bg-white object-contain p-1.5" />
              <span className="h-9 w-px bg-white/25" />
              <Image src="/assets/logo tlp.png" alt="Pakistan Taekwondo Lovers logo" width={56} height={56} className="h-14 w-14 rounded-full bg-white object-contain p-1.5" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-16 sm:px-8 md:grid-cols-3 lg:py-20">
        {[
          { icon: Shield, title: 'Discipline', text: 'Build focus through consistent practice.' },
          { icon: Heart, title: 'Respect', text: 'Treat teammates, coaches, and opponents with care.' },
          { icon: Target, title: 'Sportsmanship', text: 'Meet every challenge with effort and integrity.' },
        ].map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-black/10 bg-white p-7"><Icon className="h-6 w-6 text-[#d51e2b]" /><h2 className="mt-5 text-xl font-extrabold">{title}</h2><p className="mt-2 text-sm leading-6 text-black/60">{text}</p></article>)}
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d51e2b]">From the archive</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Moments on the mat</h2></div><Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-bold hover:text-[#d51e2b]">View portfolio <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Team Kabirians Belt Tests', '/assets/Team Kabirians Belt Tests/WhatsApp Image 2026-10-25 at 2.15.23 PM (1).jpeg'],
              ['Team Kabirians Since 1992 archive', '/assets/Team Kabirians Since 1992/WhatsApp Image 2026-10-25 at 2.30.41 PM.jpeg'],
              ['Unity Cup Taekwondo Lovers 2026', '/assets/Unity Cup Taekwondo Lovers 2026/a.jpeg'],
            ].map(([title, src]) => <Link href="/portfolio" key={title} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-200"><Image src={src} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-16 text-sm font-bold text-white">{title}</span></Link>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-20">
        <div><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d51e2b]">What’s next</p><h2 className="mt-2 text-3xl font-black">Events</h2></div><Link href="/events" className="text-sm font-bold">All events →</Link></div>
          {loading ? <p className="mt-6 text-sm text-black/55">Loading events…</p> : failed ? <p className="mt-6 rounded-xl bg-white p-5 text-sm text-black/60">Events are temporarily unavailable. Please try again shortly.</p> : eventPreview.length ? <ul className="mt-5 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white px-5">{eventPreview.map((item, i) => <li key={item._id || `${item.title}-${i}`} className="flex gap-4 py-4"><CalendarDays className="mt-1 h-5 w-5 shrink-0 text-[#d51e2b]" /><div><h3 className="font-bold">{item.title}</h3><p className="mt-1 text-xs text-black/55">{item.eventDate ? new Date(item.eventDate).toLocaleDateString() : 'Date to be announced'} · {item.status || 'Event'}</p></div></li>)}</ul> : <p className="mt-6 rounded-xl bg-white p-5 text-sm text-black/60">No public events are listed yet.</p>}
        </div>
        <div><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d51e2b]">Published standings</p><h2 className="mt-2 text-3xl font-black">Latest results</h2></div><Link href="/results" className="text-sm font-bold">All results →</Link></div>
          {loading ? <p className="mt-6 text-sm text-black/55">Loading results…</p> : failed ? <p className="mt-6 rounded-xl bg-white p-5 text-sm text-black/60">Results are temporarily unavailable. Please try again shortly.</p> : resultPreview.length ? <ul className="mt-5 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white px-5">{resultPreview.map((item, i) => <li key={item._id || `${item.playerName}-${i}`} className="flex gap-4 py-4"><Medal className="mt-1 h-5 w-5 shrink-0 text-[#d51e2b]" /><div><h3 className="font-bold">{item.playerName || 'Published result'}</h3><p className="mt-1 text-xs text-black/55">{[item.position, item.categoryName, item.eventId?.title].filter(Boolean).join(' · ')}</p></div></li>)}</ul> : <p className="mt-6 rounded-xl bg-white p-5 text-sm text-black/60">No published results are available yet.</p>}
        </div>
      </section>
    </PublicFrame>
  );
}
