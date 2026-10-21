'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Users, FileText, CreditCard,
  Video, Trophy, User as UserIcon, X
} from 'lucide-react';

interface PortalSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function PortalSidebar({ isOpen: controlledIsOpen, setIsOpen: controlledSetIsOpen }: PortalSidebarProps) {
  const pathname = usePathname();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Support both controlled props and global event trigger
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen !== undefined ? controlledSetIsOpen : setInternalIsOpen;

  useEffect(() => {
    const handleToggle = () => setIsOpen(!isOpen);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('portal:toggle-sidebar', handleToggle);
    window.addEventListener('portal:open-sidebar', handleOpen);
    window.addEventListener('portal:close-sidebar', handleClose);

    return () => {
      window.removeEventListener('portal:toggle-sidebar', handleToggle);
      window.removeEventListener('portal:open-sidebar', handleOpen);
      window.removeEventListener('portal:close-sidebar', handleClose);
    };
  }, [isOpen, setIsOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const navItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard', link: '/portal/dashboard' },
    { id: 'Events', icon: Calendar, label: 'Events & Registration', link: '/portal/events' },
    { id: 'My Team', icon: Users, label: 'My Team', link: '/portal/team' },
    { id: 'Registrations', icon: FileText, label: 'Registrations', link: '/portal/slip' },
    { id: 'Payments', icon: CreditCard, label: 'Payments', link: '/portal/payments' },
    { id: 'Video Submissions', icon: Video, label: 'Video Submissions', link: '/portal/videos' },
    { id: 'Results', icon: Trophy, label: 'Results', link: '/portal/results' },
    { id: 'Profile', icon: UserIcon, label: 'Profile', link: '/portal/profile' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 h-screen w-64 bg-[#0A1128] text-slate-300 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out select-none print:hidden ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header Logo */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-red-600 to-rose-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
                K
              </div>
              <div>
                <div className="text-white font-black text-lg tracking-tight leading-none">
                  Event<span className="text-[#E63946]">Portal</span>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                  Team Head Portal
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 text-xs font-bold overflow-y-auto flex-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = pathname === item.link || (item.link !== '/portal/dashboard' && pathname.startsWith(item.link));
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  prefetch={true}
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${
                    isActive
                      ? 'bg-[#E63946] text-white shadow-md font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info box */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0e1938] border border-slate-800 text-center shrink-0">
          <div className="text-[11px] font-bold text-white">Better Teams</div>
          <div className="text-[9px] text-slate-400 mt-0.5 font-medium">Brighter Future</div>
        </div>
      </aside>
    </>
  );
}

