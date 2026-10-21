'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Agar koi /dashboard khole toh direct Team Head Portal par bhej de
    router.replace('/portal/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <p className="text-sm font-semibold text-slate-500 animate-pulse">
        Redirecting to Portal Dashboard...
      </p>
    </div>
  );
}