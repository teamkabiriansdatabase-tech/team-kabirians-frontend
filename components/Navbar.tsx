'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, User, Shield, LogOut, LayoutDashboard 
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Read localStorage strictly ONCE on initial mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserRole(parsed?.role || null);
      }
    } catch {
      setUserRole(null);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#DC2626] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-red-500/20">
            K
          </div>
          <div>
            <div className="text-slate-900 font-black text-xl tracking-tight leading-none">
              KABIRIANS
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#DC2626] mt-1 leading-none">
              EVENT SYSTEM
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
          <Link href="/" className="hover:text-[#1E3A8A] transition">Home</Link>
          <Link href="/events" className="hover:text-[#1E3A8A] transition">Events</Link>
          <Link href="/results" className="hover:text-[#1E3A8A] transition">Results</Link>
          <Link href="/about" className="hover:text-[#1E3A8A] transition">About Us</Link>
          <Link href="/contact" className="hover:text-[#1E3A8A] transition">Contact Us</Link>
        </nav>

        {/* Right Action / Portals Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <span>Portals</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-xs">
                
                <Link
                  href="/portal/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-slate-800 font-bold border-b border-slate-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div>Team Head Portal</div>
                    <div className="text-[10px] text-slate-400 font-normal">Manage athletes & passes</div>
                  </div>
                </Link>

                <Link
                  href="/admin/login"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-slate-800 font-bold"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div>Admin Portal</div>
                    <div className="text-[10px] text-slate-400 font-normal">Organizer controls</div>
                  </div>
                </Link>

                {userRole && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition font-bold border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}