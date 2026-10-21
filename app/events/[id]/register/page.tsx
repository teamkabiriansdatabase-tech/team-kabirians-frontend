'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EventsRegisterRedirect() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  useEffect(() => {
    if (eventId) {
      router.replace(`/portal/events/${eventId}/register`);
    } else {
      router.replace('/events');
    }
  }, [router, eventId]);

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center font-sans space-y-3">
      <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-500">Opening Registration Form...</p>
    </div>
  );
}