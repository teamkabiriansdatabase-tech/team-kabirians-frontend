'use client';

import { useState } from 'react';
import Image from 'next/image';
import PublicFrame from '@/components/PublicFrame';
import PublicPageHero from '@/components/PublicPageHero';

interface TeamMember {
  name: string;
  image: string;
  role: string;
  category: 'Leadership' | 'Coaches' | 'Trainers & Staff';
  qualification: string;
  bio: string;
  highlight?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Muhammad Asif Ali Nadir',
    image: '/assets/Team/Muhammad Asif Ali Nadir.jpeg',
    role: 'Founder & Master',
    category: 'Leadership',
    qualification: 'Senior Taekwondo Master · 5th Dan (Kukkiwon / TLP)',
    bio: 'Founded Team Kabirians in Kabirwala in 1995. A visionary leader dedicated to youth empowerment, character-building, Olympic martial arts excellence, and national championship pathways.',
    highlight: 'Founder · 5th Dan Master · TLP General Secretary',
  },
  {
    name: 'Muhammad Akif Ali',
    image: '/assets/Team/Muhammad Akif Ali.jpeg',
    role: 'Head Coach',
    category: 'Coaches',
    qualification: 'Head Coach · Master Instructor · USA Open Silver Medalist',
    bio: 'Leads tactical sparring, modern electronic scoring preparation, and championship training. Holds multiple national gold medals, an intervarsity silver medal, and two intercollegiate titles.',
    highlight: 'Head Coach · USA Open Silver · National Champion',
  },
  {
    name: 'Bilawal Shehzad',
    image: '/assets/Team/Bilawal Shahzad.png',
    role: 'Poomsae Coach & International Referee',
    category: 'Coaches',
    qualification: 'International Referee · 6-Time Punjab Champion · National Player',
    bio: 'Oversees tournament administration, official Kukkiwon poomsae forms synchronization, electronic scoring oversight, and national referee clinics across Pakistan.',
    highlight: 'International Referee · 6x Punjab Champion',
  },
  {
    name: 'Muhammad Atik Ali',
    image: '/assets/Team/Muhammad Atik Ali.jpeg',
    role: 'International Player & Coach',
    category: 'Coaches',
    qualification: 'Black Belt · 2nd Poom · 2x USA State Champion',
    bio: '15-time Punjab champion, Showtime Rumble Series New York champion, and international competitor dedicated to developing the next generation of champions.',
    highlight: '2x USA State Champion · Showtime Rumble NY Champion',
  },
  {
    name: 'Muhammad Meesam Mirali',
    image: '/assets/Team/Meesam mirali.jpeg',
    role: 'Trainer',
    category: 'Trainers & Staff',
    qualification: 'Physical Conditioning & Martial Arts Trainer',
    bio: 'Specializes in explosive footwork, agility drills, core conditioning, speed stamina, and youth cadet fitness development for competitive sparring bouts.',
    highlight: 'Fitness & Conditioning · Agility Drills Lead',
  },
  {
    name: 'Bakhtawar Hur',
    image: '/assets/Team/Bakhtawar Hur.jpeg',
    role: 'Female Trainer & Coach',
    category: 'Trainers & Staff',
    qualification: 'Certified Martial Arts Instructor & Cadet Lead',
    bio: 'Dedicated instructor empowering young female athletes and cadets with foundational martial arts discipline, flexibility, self-defense, and competition sparring.',
    highlight: 'Women & Youth Tigers Development Lead',
  },
  {
    name: 'Irfan Ijaz',
    image: '/assets/Team/irfan ijaz.png',
    role: 'Trainer & Assistant Coach',
    category: 'Trainers & Staff',
    qualification: 'Conditioning Specialist & Sparring Assistant',
    bio: 'Focuses on athlete physical endurance, sparring drills, tournament preparation, and assisting head coaches in high-intensity training camps.',
    highlight: 'Sparring Regimens · Strength & Conditioning',
  },
  {
    name: 'Ahsan Iqbal',
    image: '/assets/Team/Ahsan Iqbal.png',
    role: 'Trainer & Athlete Coach',
    category: 'Trainers & Staff',
    qualification: 'Black Belt Instructor · Agility Coach',
    bio: 'Specializes in kicking precision, poomsae fundamentals, and junior athlete mentoring, guiding students through belt gradings and tournaments.',
    highlight: 'Forms Precision · Belt Grading Mentor',
  },
  {
    name: 'Tahleel Bashi',
    image: '/assets/Team/Tahleel bashi.jpeg',
    role: 'Senior Competitor & Trainer',
    category: 'Trainers & Staff',
    qualification: 'International Dallas Open Gold Medalist · AAU USA National Silver Medalist',
    bio: 'Elite international competitor with four inter-university championship titles, two national silver medals, and championship honours, assisting in sparring clinics.',
    highlight: 'Dallas Open Gold Medalist · AAU USA Silver',
  },
  {
    name: 'Muhammad Irfan Noor Hiral',
    image: '/assets/Team/Muhammad irfan noor hiral.jpeg',
    role: 'Team Staff & Operations',
    category: 'Trainers & Staff',
    qualification: 'Logistics & Administrative Support',
    bio: 'Manages team administration, event logistics, athlete welfare, championship arrangements, and day-to-day training center coordination.',
    highlight: 'Team Operations · Event Coordination Lead',
  },
];

const categories = ['All', 'Leadership', 'Coaches', 'Trainers & Staff'] as const;

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<(typeof categories)[number]>('All');

  const visibleMembers = activeTab === 'All'
    ? teamMembers
    : teamMembers.filter((m) => m.category === activeTab);

  return (
    <PublicFrame>
      {/* Hero Header with high-impact archive photograph */}
      <PublicPageHero
        eyebrow="Leadership & Coaching Staff"
        title="Meet Team Kabirians"
        description="Get to know the founder, master, coaches, trainers, and athletes who guide our martial arts community to character excellence and podium success."
        image="/assets/Welcome Ceremony of Our champs after Getting achievement in 8th heroes cup Thailand and Mbw cup Malaysia/WhatsApp Image 2026-10-25 at 2.20.04 PM.jpeg"
        imageAlt="Team Kabirians championship team and coaching staff"
      />

      {/* Category Filter Tabs */}
      <section className="border-b border-black/5 bg-[#f1efeb] sticky top-20 z-20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-5 py-3 sm:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-black/50 mr-2 shrink-0">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveTab(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === cat
                  ? 'bg-[#d51e2b] text-white shadow-xs'
                  : 'border border-black/15 bg-white text-slate-700 hover:border-black/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Team Cards Grid (Titles strictly below image, clean look) */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleMembers.map((person) => (
            <article
              key={person.name}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xs hover:shadow-xl hover:border-red-200 transition-all duration-300"
            >
              {/* Clean Image Container (No overlay badges on top of image) */}
              <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                <Image
                  src={person.image}
                  alt={`${person.name}, ${person.role}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover object-top transition duration-500 group-hover:scale-105"
                  priority={person.role.includes('Founder') || person.role.includes('Head Coach')}
                />
              </div>

              {/* Information Body Below Image */}
              <div className="flex flex-1 flex-col p-5 justify-between space-y-3">
                <div className="space-y-1.5">
                  {/* Role Title below image */}
                  <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#d51e2b]">
                    {person.role}
                  </p>
                  
                  {/* Name */}
                  <h2 className="break-words text-lg font-black leading-snug text-slate-900 group-hover:text-[#d51e2b] transition-colors">
                    {person.name}
                  </h2>
                  
                  {/* Qualification / Designation */}
                  {person.qualification && (
                    <p className="text-xs font-semibold leading-5 text-slate-700">
                      {person.qualification}
                    </p>
                  )}
                  
                  {/* Bio */}
                  {person.bio && (
                    <p className="text-xs leading-5 text-slate-600 pt-1 line-clamp-4">
                      {person.bio}
                    </p>
                  )}
                </div>

                {/* Clean Highlight Tag (No medal emoji) */}
                {person.highlight && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-600 truncate block">
                      {person.highlight}
                    </span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Impact & Values Strip */}
      <section className="border-t border-black/5 bg-[#f1efeb] py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-4 sm:px-8 text-center">
          <div className="flex flex-col items-center justify-center rounded-xl bg-white/80 p-4 shadow-2xs">
            <span className="text-2xl font-black text-slate-900">1995</span>
            <span className="text-xs font-semibold text-black/55 mt-0.5">Founded in Kabirwala</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-white/80 p-4 shadow-2xs">
            <span className="text-2xl font-black text-[#d51e2b]">500+</span>
            <span className="text-xs font-semibold text-black/55 mt-0.5">Athletes Mentored</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-white/80 p-4 shadow-2xs">
            <span className="text-2xl font-black text-slate-900">50+</span>
            <span className="text-xs font-semibold text-black/55 mt-0.5">Championship Medals</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-white/80 p-4 shadow-2xs">
            <span className="text-2xl font-black text-emerald-600">100%</span>
            <span className="text-xs font-semibold text-black/55 mt-0.5">Certified with TLP Pakistan</span>
          </div>
        </div>
      </section>
    </PublicFrame>
  );
}
