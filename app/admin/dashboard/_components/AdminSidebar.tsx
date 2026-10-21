'use client';

import {
  LayoutDashboard, Calendar, Layers, Users, CreditCard,
  Video, MapPin, Trophy, User as UserIcon, Settings, X
} from 'lucide-react';

interface AdminSidebarProps {
  activeNav: string;
  onSelectNav: (navId: any) => void;
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
}

export default function AdminSidebar({
  activeNav,
  onSelectNav,
  isOpen = false,
  setIsOpen,
}: AdminSidebarProps) {
  const navItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Events', icon: Calendar, label: 'Events' },
    { id: 'Categories', icon: Layers, label: 'Categories' },
    { id: 'Team Registrations', icon: Users, label: 'Team Registrations' },
    { id: 'Payments', icon: CreditCard, label: 'Payments' },
    { id: 'Online Videos', icon: Video, label: 'Online Video Submissions' },
    { id: 'Offline Registrations', icon: MapPin, label: 'Offline Registrations' },
    { id: 'Results', icon: Trophy, label: 'Results' },
    { id: 'Users', icon: UserIcon, label: 'Users' },
    { id: 'Settings', icon: Settings, label: 'Settings' },
  ];

  const handleSelect = (navId: any) => {
    onSelectNav(navId);
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen && setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 h-screen w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out select-none print:hidden ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-red-600 to-rose-600 rounded-xl flex items-center justify-center text-white font-black">
                K
              </div>
              <div>
                <div className="text-white font-black text-lg leading-none">
                  Event<span className="text-[#E63946]">Portal</span>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Admin Portal</div>
              </div>
            </div>

            {setIsOpen && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <nav className="p-4 space-y-1 text-xs font-bold overflow-y-auto flex-1 scrollbar-none">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${
                  activeNav === item.id
                    ? 'bg-[#E63946] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#101b3d] border border-slate-800 text-center flex-shrink-0">
          <div className="text-[11px] font-bold text-white">Organize • Manage • Inspire</div>
          <div className="text-[9px] text-slate-400 mt-0.5">Team Kabirians Championship</div>
        </div>
      </aside>
    </>
  );
}