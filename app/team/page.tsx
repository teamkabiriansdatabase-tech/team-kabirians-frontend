import Image from 'next/image';
import PublicFrame from '@/components/PublicFrame';
import PublicPageHero from '@/components/PublicPageHero';

const portraits = [
  {
    name: 'Muhammad Asif Ali Nadir',
    image: '/assets/Team/Muhammad Asif Ali Nadir.jpeg',
    role: 'Founder & Master',
    qualification: 'Senior Taekwondo Master · 5th Dan',
    bio: 'Founded Team Kabirians in Kabirwala and mentors students in Taekwondo, discipline, character, and leadership.',
  },
  {
    name: 'Bilawal Shahzad',
    image: '/assets/Team/Bilawal Shahzad.png',
    role: 'Poomsae Coach',
    qualification: 'International Referee · National Player',
    bio: 'The team notes also recognize him as a six-time Punjab champion.',
  },
  {
    name: 'Muhammad Akif Ali',
    image: '/assets/Team/Muhammad Akif Ali .jpeg',
    role: 'Athlete',
    qualification: 'USA Open Silver Medalist',
    bio: 'The notes list multiple national medals, an intervarsity silver medal, and two intercollegiate titles.',
  },
  {
    name: 'Muhammad Atik Ali',
    image: '/assets/Team/Muhammad Atik Ali.jpeg',
    role: 'International Player',
    qualification: 'Black Belt · 2nd Poom',
    bio: 'The notes list two USA state titles, a Showtime Rumble Series championship, and 15 Punjab titles.',
  },
  {
    name: 'Tahleel Bashi',
    image: '/assets/Team/Tahleel bashi.jpeg',
    role: 'Athlete',
    qualification: 'International Dallas Open Gold Medalist',
    bio: 'The notes list an AAU USA National silver medal, two national silver medals, and four inter-university titles.',
  },
  { name: 'Meesam Mirali', image: '/assets/Team/Meesam mirali.jpeg', role: 'Team Member' },
  { name: 'Muhammad Irfan Noor Hiral', image: '/assets/Team/Muhammad irfan noor hiral.jpeg', role: 'Team Member' },
];

export default function TeamPage() {
  return <PublicFrame>
    <PublicPageHero eyebrow="People behind the practice" title="Meet Team Kabirians" description="Get to know the founder, coach, athletes, and team members who make up the Team Kabirians community." image="/assets/Team Kabirians Since 1992/WhatsApp Image 2026-10-25 at 2.30.42 P.jpeg" imageAlt="Team Kabirians athletes together" />
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16"><div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{portraits.map((person) => <article key={person.name} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"><div className="relative aspect-[4/5] bg-neutral-100"><Image src={person.image} alt={`${person.name}, ${person.role}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw" className="object-cover" /></div><div className="flex flex-1 flex-col p-4 sm:p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-red-600">{person.role}</p><h2 className="mt-1 break-words text-lg font-extrabold leading-snug">{person.name}</h2>{person.qualification && <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{person.qualification}</p>}{person.bio && <p className="mt-3 text-sm leading-6 text-slate-600">{person.bio}</p>}</div></article>)}</div></section>
  </PublicFrame>;
}
