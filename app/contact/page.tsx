'use client';

import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import axios from 'axios';
import PublicFrame from '@/components/PublicFrame';
import publicApi from '@/lib/publicApi';
import PublicPageHero from '@/components/PublicPageHero';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setSubmitting(true);
    try {
      await publicApi.post('/leads/contact', values);
      setSubmitted(true);
      form.reset();
    } catch (requestError: unknown) {
      const responseMessage = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(responseMessage || 'Your message could not be sent. Please try again.');
    } finally { setSubmitting(false); }
  }

  return <PublicFrame>
    <PublicPageHero eyebrow="Get in touch" title="Contact Team Kabirians" description="Have a question about the team, events, or published results? Send us a message and we’ll be glad to hear from you." image="/assets/Team Kabirians Belt Tests/WhatsApp Image 2026-10-25 at 2.15.30 PM.jpeg" imageAlt="Taekwondo students during a belt test" />
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-16"><div><h2 className="text-2xl font-black">We’d like to hear from you</h2><p className="mt-3 max-w-md text-sm leading-6 text-black/60">Use this form for general questions or enquiries about the public events and results listed on this site.</p><div className="mt-7 rounded-2xl border border-black/10 bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.15em] text-black/45">Organization</p><p className="mt-2 font-bold">Team Kabirians Taekwondo</p><p className="mt-1 text-sm text-black/60">Associated with Pakistan Taekwondo Lovers</p></div></div>
      <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">{submitted ? <div role="status" className="py-8 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-green-600" /><h2 className="mt-4 text-xl font-extrabold">Message received</h2><p className="mt-2 text-sm text-black/60">Thank you for contacting Team Kabirians.</p><button type="button" onClick={() => setSubmitted(false)} className="mt-5 text-sm font-bold text-[#d51e2b]">Send another message</button></div> : <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Name<input name="name" required maxLength={100} autoComplete="name" className="rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-[#d51e2b] focus:ring-2 focus:ring-red-100" /></label><label className="grid gap-2 text-sm font-semibold">Email<input name="email" type="email" required maxLength={254} autoComplete="email" className="rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-[#d51e2b] focus:ring-2 focus:ring-red-100" /></label><label className="grid gap-2 text-sm font-semibold sm:col-span-2">Subject<input name="subject" required maxLength={160} className="rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-[#d51e2b] focus:ring-2 focus:ring-red-100" /></label><label className="grid gap-2 text-sm font-semibold sm:col-span-2">Message<textarea name="message" required minLength={5} maxLength={5000} rows={6} className="resize-y rounded-xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-[#d51e2b] focus:ring-2 focus:ring-red-100" /></label>{error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}<div className="sm:col-span-2"><button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-[#d51e2b] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Sending…' : 'Send message'}<Send className="h-4 w-4" /></button></div></form>}</div>
    </section>
  </PublicFrame>;
}
