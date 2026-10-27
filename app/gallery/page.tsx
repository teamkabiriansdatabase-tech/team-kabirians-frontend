'use client';

import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';
import PublicFrame from '@/components/PublicFrame';
import PublicPageHero from '@/components/PublicPageHero';

const collection = [
  { title: '10th Taekwondo Lovers All Punjab Championship 2021', category: 'Competitions', src: '/assets/10th Taekwondo Lovers All Punjab Championship 2021/WhatsApp Image 2026-10-25 at 2.45.03 PM.jpeg' },
  { title: '8th Heroes Cup Thailand', category: 'International events', src: '/assets/8th Heroes Cup Thailand/a.jpeg' },
  { title: 'Team Kabirians Belt Tests', category: 'Training', src: '/assets/Team Kabirians Belt Tests/WhatsApp Image 2026-10-25 at 2.15.23 PM (1).jpeg' },
  { title: 'Team Kabirians Since 1992 archive', category: 'Team activities', src: '/assets/Team Kabirians Since 1992/WhatsApp Image 2026-10-25 at 2.30.41 PM.jpeg' },
  { title: 'Unity Cup Taekwondo Lovers 2026', category: 'Competitions', src: '/assets/Unity Cup Taekwondo Lovers 2026/a.jpeg' },
  { title: 'New Jersey Taekwondo Cup 2025', category: 'International events', src: '/assets/New Jersey Taekwondo Cup 2025/WhatsApp Image 2026-10-25 at 2.22.50 PM.jpeg' },
  { title: 'Crown ceremony of Rab Nawaz', category: 'Ceremonies', src: '/assets/Crown Ceremony of Rab Nawaz after winning gold medal in south asian games/WhatsApp Image 2026-10-25 at 2.24.56 PM.jpeg' },
  { title: 'Tree Planting', category: 'Community', src: '/assets/Tree Planting/WhatsApp Image 2026-10-25 at 2.30.09 PM.jpeg' },
  { title: 'World Taekwondo Partnership Taekwondo Courses', category: 'Courses', src: '/assets/World Taekwondo Partnership Taekwondo Courses/s.jpeg' },
  { title: 'Welcome ceremony after the United States achievement', category: 'Ceremonies', src: '/assets/Welcome Ceremony after winning Three Golds Medal from United States Of America/WhatsApp Image 2026-10-25 at 2.24.18 .jpeg' },
];

export default function PortfolioPage() {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<(typeof collection)[number] | null>(null);
  const categories = ['All', ...Array.from(new Set(collection.map((item) => item.category)))];
  const visible = category === 'All' ? collection : collection.filter((item) => item.category === category);

  return <PublicFrame>
    <PublicPageHero eyebrow="The archive" title="Moments from the journey" description="Explore training, competitions, ceremonies, and community moments from the Team Kabirians photo archive." image="/assets/New Jersey Taekwondo Cup 2025/WhatsApp Image 2026-10-25 at 2.22.50 PM.jpeg" imageAlt="Taekwondo athletes competing at the New Jersey Taekwondo Cup" />
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14"><div className="flex gap-2 overflow-x-auto pb-3" aria-label="Filter portfolio by category">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${category === item ? 'bg-[#d51e2b] text-white' : 'border border-black/15 bg-white hover:border-black/40'}`}>{item}</button>)}</div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map((item) => <button type="button" key={item.src} onClick={() => setSelected(item)} className="group text-left"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-200"><Image src={item.src} alt={item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /></div><div className="px-1 py-3"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#d51e2b]">{item.category}</p><h2 className="mt-1 font-bold">{item.title}</h2></div></button>)}</div></section>
    {selected && <div role="dialog" aria-modal="true" aria-label={selected.title} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelected(null)}><button type="button" onClick={() => setSelected(null)} aria-label="Close image" className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><X className="h-5 w-5" /></button><div className="relative h-[80vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}><Image src={selected.src} alt={selected.title} fill sizes="90vw" className="object-contain" /><p className="absolute -bottom-8 left-0 text-sm text-white">{selected.title}</p></div></div>}
  </PublicFrame>;
}
