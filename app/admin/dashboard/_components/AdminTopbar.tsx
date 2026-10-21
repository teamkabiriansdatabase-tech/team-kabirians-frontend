'use client';

import { Search, Activity, Bell, LogOut, Menu } from 'lucide-react';

interface AdminTopbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setActiveNav: (nav: any) => void;
  pendingApprovals: number;
  handleSignOut: () => void;
  setIsSidebarOpen?: (open: boolean) => void;
}

export default function AdminTopbar({
  searchQuery,
  setSearchQuery,
  setActiveNav,
  pendingApprovals,
  handleSignOut,
  setIsSidebarOpen,
}: AdminTopbarProps) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-3 sm:px-8 flex items-center justify-between sticky top-0 z-30 print:hidden">
      <div className="flex items-center gap-2 sm:gap-3">
        {setIsSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="relative w-40 sm:w-64 md:w-80 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 sm:pr-9 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-slate-50/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => setActiveNav('Activity Logs')}
          className="text-xs font-bold text-slate-600 hover:text-[#1E3A8A] flex items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer"
        >
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">System Logs</span>
        </button>

        <button
          onClick={() => setActiveNav('Notifications')}
          className="relative p-2.5 rounded-xl bg-slate-50 border text-slate-600 cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {pendingApprovals > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63946] text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {pendingApprovals}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveNav('Profile')}
          className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0B132B] text-white font-black text-sm flex items-center justify-center">
            A
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-900">Admin</div>
            <div className="text-[10px] text-slate-400">Master Console</div>
          </div>
        </button>
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="text-slate-400 hover:text-red-600 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}