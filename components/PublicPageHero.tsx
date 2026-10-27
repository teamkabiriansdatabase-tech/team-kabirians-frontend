import Image from 'next/image';

type PublicPageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export default function PublicPageHero({ eyebrow, title, description, image, imageAlt }: PublicPageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[#111214] text-white">
      <Image src={image} alt={imageAlt} fill sizes="100vw" className="-z-20 object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-black/35" />
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-[4.5rem]">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-red-300 backdrop-blur-sm">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">{description}</p>
          <div className="mt-6 h-1 w-16 rounded-full bg-[#e5232b]" />
        </div>
      </div>
    </section>
  );
}
