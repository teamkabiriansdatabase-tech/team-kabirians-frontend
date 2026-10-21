'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Shield, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import '@/app/styles/admin-responsive.css'; 
export default function AdminLoginPage() {
  const [secretKey, setSecretKey] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/admin-login', {
        secretKey: secretKey.trim(),
      });

      if (res.data?.success) {
        const token = res.data.token;
        const adminUser = res.data.user || { name: 'Admin', role: 'admin', email: 'admin@eventportal.com' };

        // 1. Purani Team Head session ko bilkul saaf (wipe) karein
        localStorage.clear();
        sessionStorage.clear();

        // 2. Admin credentials ko localStorage mein save karein
        localStorage.setItem('token', token);
        localStorage.setItem('role', 'admin');
        localStorage.setItem('user', JSON.stringify(adminUser));

        // 3. Cookies set karein (Next.js middleware ke liye lazmi)
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `role=admin; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(adminUser))}; path=/; max-age=604800; SameSite=Lax`;

        // 4. Hard Redirect to Admin Dashboard (Bypasses Next.js cache)
        window.location.href = '/admin/dashboard';
      } else {
        setError(res.data?.message || 'Access Denied: Invalid Master Secret Key');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Access Denied: Invalid Master Secret Key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-slate-800">
      
      {/* Central Split Container */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Side: Dark Navy Branding Banner */}
        <div className="md:w-1/2 bg-[#0B132B] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-rose-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
              K
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-white">
                Event<span className="text-[#E63946]">Portal</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Admin Portal
              </div>
            </div>
          </div>

          <div className="space-y-4 my-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-[#E63946] text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Restricted Console
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Manage Events. Review Registrations. Create Opportunities.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official command hub for championship schedules, payment approvals, and live podium rankings.
            </p>
          </div>

          <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase z-10 border-t border-slate-800/80 pt-4">
            Secured Infrastructure • Team Kabirians
          </div>
        </div>

        {/* Right Side: Clean White Login Card */}
        <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto space-y-6">
            
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Login</h1>
              <p className="text-xs text-slate-500 mt-1">
                Please enter your master admin secret key to continue.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-xs font-bold text-[#DC2626] rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Admin Secret Key
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-red-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="Enter Master Secret Key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#DC2626] bg-slate-50/50 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex items-center text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#E63946]"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#E63946] hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating Key...' : 'Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Secure Access Only</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}