'use client';

import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';
import PublicFrame from '@/components/PublicFrame';
import PublicPageHero from '@/components/PublicPageHero';

const collection = [
  // Competitions
  { title: 'Unity Cup Taekwondo Lovers 2026 - Main Arena Action', category: 'Competitions', src: '/assets/Unity Cup Taekwondo Lovers 2026/a.jpeg' },
  { title: 'Unity Cup 2026 - Sparring Bout Preparation', category: 'Competitions', src: '/assets/Unity Cup Taekwondo Lovers 2026/WhatsApp Image 2026-10-25 at 2.28.05 PM.jpeg' },
  { title: 'Unity Cup 2026 - Official Scoring & Match Ring', category: 'Competitions', src: '/assets/Unity Cup Taekwondo Lovers 2026/WhatsApp Image 2026-10-25 at 2.28.06 PM.jpeg' },
  { title: '10th Taekwondo Lovers All Punjab Championship 2021', category: 'Competitions', src: '/assets/10th Taekwondo Lovers All Punjab Championship 2021/WhatsApp Image 2026-10-25 at 2.45.03 PM.jpeg' },
  { title: '10th All Punjab Championship - Junior Cadet Bout', category: 'Competitions', src: '/assets/10th Taekwondo Lovers All Punjab Championship 2021/WhatsApp Image 2026-10-25 at 2.45.04 PM.jpeg' },
  { title: 'National Taekwondo Lovers Championship', category: 'Competitions', src: '/assets/National Taekwondo Lovers Championship/WhatsApp Image 2026-10-25 at 2.44.38 PM.jpeg' },
  { title: 'Showtime Rumble Series New York 2024', category: 'Competitions', src: '/assets/Showtime Rumble Series New York 2024/lk.jpeg' },
  { title: 'Showtime Rumble NY 2024 - Gold Medal Victory', category: 'Competitions', src: '/assets/Showtime Rumble Series New York 2024/WhatsApp Image 2026-10-25 at 2.25.34 PM.jpeg' },
  { title: 'New Jersey Taekwondo State Championship', category: 'Competitions', src: '/assets/NEW JERSEY TAEKWONDO STATE CHAMPIONSHIP/WhatsApp Image 2026-10-25 at 2.26.27 PM.jpeg' },

  // International Events
  { title: 'New Jersey Taekwondo Cup 2025 - Tournament Action', category: 'International Events', src: '/assets/New Jersey Taekwondo Cup 2025/WhatsApp Image 2026-10-25 at 2.22.50 PM.jpeg' },
  { title: 'New Jersey Taekwondo Cup - Team Kabirians Contingent', category: 'International Events', src: '/assets/New Jersey Taekwondo Cup 2025/WhatsApp Image 2026-10-25 at 2.22.51 PM.jpeg' },
  { title: '8th Heroes Cup Thailand - International Tournament Arena', category: 'International Events', src: '/assets/8th Heroes Cup Thailand/a.jpeg' },
  { title: '8th Heroes Cup Thailand - Athletes & Coaching Delegation', category: 'International Events', src: '/assets/8th Heroes Cup Thailand/WhatsApp Image 2026-10-25 at 2.20.51 PM.jpeg' },
  { title: '8th Heroes Cup Thailand - World Stage Victory', category: 'International Events', src: '/assets/8th Heroes Cup Thailand/WhatsApp Image 2026-10-25 at 2.20.58 PM.jpeg' },
  { title: 'International Martial Arts Delegation & Champions', category: 'International Events', src: '/assets/Other International Events/WhatsApp Image 2026-10-25 at 2.18.32 PM.jpeg' },

  // Ceremonies & Awards
  { title: 'Crown Ceremony of Rab Nawaz - South Asian Games Gold', category: 'Ceremonies & Awards', src: '/assets/Crown Ceremony of Rab Nawaz after winning gold medal in south asian games/WhatsApp Image 2026-10-25 at 2.24.56 PM.jpeg' },
  { title: 'Rab Nawaz Historic Gold Medal Reception Gala', category: 'Ceremonies & Awards', src: '/assets/Crown Ceremony of Rab Nawaz after winning gold medal in south asian games/WhatsApp Image 2026-10-25 at 2.24.58 PM.jpeg' },
  { title: 'Welcome Ceremony - Three Gold Medals from USA', category: 'Ceremonies & Awards', src: '/assets/Welcome Ceremony after winning Three Golds Medal from United States Of America/WhatsApp Image 2026-10-25 at 2.24.18 PM.jpeg' },
  { title: 'USA Championship Medalists Honor Ceremony', category: 'Ceremonies & Awards', src: '/assets/Welcome Ceremony after winning Three Golds Medal from United States Of America/WhatsApp Image 2026-10-25 at 2.24.19 PM.jpeg' },
  { title: 'Welcome Ceremony - 8th Heroes Cup Thailand & MBW Cup Malaysia', category: 'Ceremonies & Awards', src: '/assets/Welcome Ceremony of Our champs after Getting achievement in 8th heroes cup Thailand and Mbw cup Malaysia/WhatsApp Image 2026-10-25 at 2.20.04 PM.jpeg' },
  { title: 'Thailand & Malaysia International Medalists Banquet', category: 'Ceremonies & Awards', src: '/assets/Welcome Ceremony of Our champs after Getting achievement in 8th heroes cup Thailand and Mbw cup Malaysia/WhatsApp Image 2026-10-25 at 2.20.07 PM.jpeg' },
  { title: '1st Online International Taekwondo Lovers Medal Ceremony', category: 'Ceremonies & Awards', src: '/assets/1st Online International Taekwondo Lovers Medals Ceremony/WhatsApp Image 2026-10-25 at 2.27.01 PM.jpeg' },
  { title: '2nd Online International Medal Ceremony - Master Presentation', category: 'Ceremonies & Awards', src: '/assets/2nd Online International Taekwondo Lovers Championship Medal Ceremony/WhatsApp Image 2026-10-25 at 2.21.50 PM.jpeg' },
  { title: '2nd Online International Medal Ceremony - Podium Athletes', category: 'Ceremonies & Awards', src: '/assets/2nd Online International Taekwondo Lovers Championship Medal Ceremony/WhatsApp Image 2026-10-25 at 2.21.55 PM.jpeg' },
  { title: '3rd Online International Taekwondo Lovers Medal Ceremony', category: 'Ceremonies & Awards', src: '/assets/3rd Online International Taekwondo Lovers Championship Medal ceremony/WhatsApp Image 2026-10-25 at 2.19.09 PM.jpeg' },

  // Training & Belt Tests
  { title: 'Team Kabirians Official Belt Promotion Test', category: 'Training & Belt Tests', src: '/assets/Team Kabirians Belt Tests/WhatsApp Image 2026-10-25 at 2.15.23 PM (1).jpeg' },
  { title: 'Black & Color Belt Demonstration & Sparring Exam', category: 'Training & Belt Tests', src: '/assets/Team Kabirians Belt Tests/WhatsApp Image 2026-10-25 at 2.15.26 PM.jpeg' },
  { title: 'Cadet Tigers & Junior Grading Assembly', category: 'Training & Belt Tests', src: '/assets/Team Kabirians Belt Tests/WhatsApp Image 2026-10-25 at 2.15.30 PM.jpeg' },
  { title: 'Muhammad Ali Shehki Performing in Belt Test', category: 'Training & Belt Tests', src: '/assets/Muhammad Ali Shehki Performing in Our Belt Test/WhatsApp Image 2026-10-25 at 2.42.51 PM.jpeg' },
  { title: 'World Taekwondo Partnership Coaching Course', category: 'Training & Belt Tests', src: '/assets/World Taekwondo Partnership Taekwondo Courses/s.jpeg' },
  { title: 'World Taekwondo Technical Standards Seminar', category: 'Training & Belt Tests', src: '/assets/World Taekwondo Partnership Taekwondo Courses/WhatsApp Image 2026-10-25 at 2.23.37 PM.jpeg' },
  { title: 'ICECP Taekwondo Refresher Coaching Course Level 2', category: 'Training & Belt Tests', src: '/assets/ICECP Taekwondo Refresher Coaching Course Level 2 2018/WhatsApp Image 2026-10-25 at 2.45.39 PM.jpeg' },
  { title: 'Team Kabirian Motivation & Mindset Training System', category: 'Training & Belt Tests', src: '/assets/Team Kabirian Motivation System/WhatsApp Image 2026-10-25 at 2.14.07 PM.jpeg' },

  // Community & History
  { title: 'Team Kabirians Since 1992 - Foundation Archive', category: 'Community & History', src: '/assets/Team Kabirians Since 1992/WhatsApp Image 2026-10-25 at 2.30.41 PM.jpeg' },
  { title: 'Pioneer Black Belts & Masters Gathering', category: 'Community & History', src: '/assets/Team Kabirians Since 1992/WhatsApp Image 2026-10-25 at 2.30.43 PM.jpeg' },
  { title: 'Green Pakistan Environmental Tree Planting Drive', category: 'Community & History', src: '/assets/Tree Planting/WhatsApp Image 2026-10-25 at 2.30.09 PM.jpeg' },
  { title: 'Youth Athletes Tree Planting & Community Service', category: 'Community & History', src: '/assets/Tree Planting/WhatsApp Image 2026-10-25 at 2.30.12 PM.jpeg' },
  { title: 'Pakistan Independence Day Celebration with Dojang Athletes', category: 'Community & History', src: '/assets/Independence Days/WhatsApp Image 2026-10-25 at 2.44.01 PM.jpeg' },
  { title: 'Team Kabirians Family Eid Milan & Social Gala', category: 'Community & History', src: '/assets/Birthday Parties, Eid Milan’s & Other Activities/WhatsApp Image 2026-10-25 at 2.29.07 PM.jpeg' },
];

export default function PortfolioPage() {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<(typeof collection)[number] | null>(null);
  const categories = ['All', ...Array.from(new Set(collection.map((item) => item.category)))];
  const visible = category === 'All' ? collection : collection.filter((item) => item.category === category);

  return (
    <PublicFrame>
      <PublicPageHero
        eyebrow="The archive"
        title="Moments from the journey"
        description="Explore competitions, international milestones, medal ceremonies, belt tests, and community moments from the official Team Kabirians photo archive."
        image="/assets/New Jersey Taekwondo Cup 2025/WhatsApp Image 2026-10-25 at 2.22.50 PM.jpeg"
        imageAlt="Taekwondo athletes competing at the New Jersey Taekwondo Cup"
      />

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 sticky top-20 z-10 bg-white/80 backdrop-blur-md pt-2" aria-label="Filter portfolio by category">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                category === item
                  ? 'bg-[#d51e2b] text-white shadow-xs'
                  : 'border border-black/15 bg-white text-slate-700 hover:border-black/40'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <button
              type="button"
              key={item.src}
              onClick={() => setSelected(item)}
              className="group text-left cursor-pointer flex flex-col rounded-2xl border border-black/10 bg-white p-3 shadow-xs hover:shadow-xl hover:border-red-200 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-200">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="pt-3 pb-1 px-1">
                <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#d51e2b]">
                  {item.category}
                </p>
                <h2 className="mt-1 font-bold text-slate-900 group-hover:text-[#d51e2b] transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h2>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Close image"
            className="absolute right-5 top-5 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative flex flex-col items-center justify-center h-full max-h-[90vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative w-full h-[76vh]">
              <Image
                src={selected.src}
                alt={selected.title}
                fill
                sizes="95vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-4 text-center px-4">
              <span className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#d51e2b]">
                {selected.category}
              </span>
              <p className="mt-1 text-base font-bold text-white sm:text-lg">
                {selected.title}
              </p>
            </div>
          </div>
        </div>
      )}
    </PublicFrame>
  );
}
