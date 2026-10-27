import Link from 'next/link';
import Image from 'next/image';

const links = [
  ['Home', '/'],
  ['About', '/about'],
  ['Team', '/team'],
  ['Portfolio', '/portfolio'],
  ['Events', '/events'],
  ['Results', '/results'],
  ['Contact Us', '/contact'],
] as const;

export default function Footer() {
  return (
    <footer className="bg-[#0b0d10] text-white border-t border-white/10">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-4">
            <Image src="/assets/team kabirians.png" alt="Team Kabirians logo" width={52} height={52} className="h-13 w-13 object-contain rounded bg-white p-1" />
            <div>
              <p className="font-black tracking-wide">TEAM KABIRIANS TAEKWONDO</p>
              <p className="mt-1 text-xs text-white/60">Proudly associated with Pakistan Taekwondo Lovers</p>
            </div>
            <Image src="/assets/logo tlp.png" alt="Pakistan Taekwondo Lovers logo" width={44} height={44} className="ml-auto h-11 w-11 object-contain rounded bg-white p-1" />
          </div>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/60">Explore the team archive, public events and published competition results.</p>
        </div>
        <nav aria-label="Footer navigation">
          <h2 className="text-xs font-bold uppercase tracking-[.2em] text-white/50">Explore</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {links.map(([label, href]) => <li key={href}><Link href={href} className="text-white/75 transition hover:text-white">{label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[.2em] text-white/50">Get in touch</h2>
          <p className="mt-4 text-sm leading-6 text-white/70">For enquiries, use the public contact form.</p>
          <Link href="/contact" className="mt-4 inline-flex rounded-full bg-[#d51e2b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700">Contact Us</Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/45">© {new Date().getFullYear()} Team Kabirians Taekwondo</div>
    </footer>
  );
}
