'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, User, Shield, Menu, X, 
  Trophy, Calendar, Phone, Info, Users, Image as ImageIcon, Home
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMobileMenuOpen(false);
      setDropdownOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'About Us', href: '/about', icon: Info },
    { label: 'Team', href: '/team', icon: Users },
    { label: 'Portfolio', href: '/portfolio', icon: ImageIcon },
    { label: 'Events', href: '/events', icon: Calendar },
    { label: 'Results', href: '/results', icon: Trophy },
    { label: 'Contact', href: '/contact', icon: Phone },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 relative rounded-xl overflow-hidden bg-white flex items-center justify-center p-0.5 border border-slate-200 shadow-md">
            <Image
              src="/assets/team kabirians.png"
              alt="Team Kabirians"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="text-slate-900 font-black text-sm sm:text-base tracking-tight leading-none group-hover:text-[#1E3A8A] transition-colors">
              TEAM KABIRIANS
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#DC2626] mt-1 leading-none">
              TAEKWONDO
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:ml-3 sm:pl-4" aria-label="Associated organization">
          <Image src="/assets/logo tlp.png" alt="Pakistan Taekwondo Lovers logo" width={34} height={34} className="h-8 w-8 object-contain" />
          <span className="hidden max-w-28 text-[9px] leading-tight font-bold uppercase tracking-wide text-slate-500 xl:block">Associated with Pakistan Taekwondo Lovers</span>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-5 2xl:gap-7 text-xs font-bold text-slate-600">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-1 transition relative ${
                  active 
                    ? 'text-[#1E3A8A] font-black' 
                    : 'hover:text-[#1E3A8A]'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DC2626] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action / Portals Dropdown & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          
          {/* Portals Dropdown (Desktop) */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
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
                    href="/login"
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

                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    active 
                      ? 'bg-blue-50 text-[#1E3A8A]' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#DC2626]' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Portal Buttons */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Portal Access
            </div>
            
            <Link
              href="/login"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[#1E3A8A] text-xs font-bold"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#1E3A8A]" />
                <span>Team Head Portal</span>
              </div>
              <span className="text-[10px] text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                Login
              </span>
            </Link>

            <Link
              href="/admin/login"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-red-50/70 border border-red-100 text-[#DC2626] text-xs font-bold"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#DC2626]" />
                <span>Admin Portal</span>
              </div>
              <span className="text-[10px] text-red-600 bg-white px-2 py-0.5 rounded-full border border-red-200">
                Staff
              </span>
            </Link>

          </div>
        </div>
      )}
    </header>
  );
}
