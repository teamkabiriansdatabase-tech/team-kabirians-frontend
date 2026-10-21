'use client';

import React from 'react';
import '@/app/styles/admin-responsive.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-portal-wrapper min-h-screen w-full bg-[#F4F6F9]">
      {children}
    </div>
  );
}

