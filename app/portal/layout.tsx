'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/app/styles/portal-responsive.css';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // 1. Agar login nahi hai -> seedha login page par redirect karein
    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      // 2. Role check (case-insensitive taake 'team_head' ya 'TEAM_HEAD' dono chal sakein)
      const userRole = String(user.role || '').toLowerCase();
      if (userRole !== 'team_head') {
        router.replace('/login');
        return;
      }

      // 3. Agar authorized hai toh allow karein
      setAuthorized(true);
    } catch (err) {
      router.replace('/login');
    }
  }, [router]);

  // Auth checking loader
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center font-sans">
        <div className="w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="portal-wrapper min-h-screen w-full bg-[#F4F6F9] relative">
      {children}

      {/* Gliding WhatsApp Button across all portal views */}
      <FloatingWhatsApp phoneNumber="923001234567" />
    </div>
  );
}