'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Mail, Lock, Eye, EyeOff, Calendar, Trophy,
  Award, AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      if (res.data?.success) {
        const token = res.data.token || res.data.data?.token;
        const user = res.data.user || res.data.data?.user;

        if (token) {
          localStorage.setItem('token', token);
          document.cookie = `token=${token}; path=/; max-age=604800`;
        }

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          document.cookie = `role=${user.role || 'team_head'}; path=/; max-age=604800`;
        }

        // Redirects straight to the Team Head Portal Dashboard
        router.push('/portal/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans antialiased bg-white">
      
      {/* ------------------------------------------------------------- */}
      {/* LEFT COLUMN: HERO BRANDING                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[#060D1E] via-[#0B1536] to-[#0A1026] text-white p-8 sm:p-14 lg:p-20 flex flex-col justify-between relative overflow-hidden select-none">
        
        {/* Subtle Decorative Background Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center font-black text-white text-lg shadow-md">
            K
          </div>
          <div>
            <div className="text-xl font-black tracking-tight leading-none">
              Event<span className="text-[#E63946]">Portal</span>
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Team Head Portal
            </div>
          </div>
        </div>

        {/* Middle Typography Banner */}
        <div className="my-16 md:my-auto max-w-lg space-y-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Together <br />
            We Build <br />
            <span className="text-white">Bigger Dreams</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal pt-2">
            Register your team, participate in events and showcase your talent.
          </p>
        </div>

        {/* Bottom Quick Feature Highlights */}
        <div className="flex items-center gap-8 text-xs font-bold text-slate-300 pt-6 border-t border-slate-800/80 relative z-10">
          <Link href="/events" className="flex items-center gap-2 hover:text-white transition">
            <Calendar className="w-4 h-4 text-[#E63946]" />
            <span>Events</span>
          </Link>
          <div className="flex items-center gap-2 hover:text-white transition">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Competitions</span>
          </div>
          <Link href="/results" className="flex items-center gap-2 hover:text-white transition">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Results</span>
          </Link>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT COLUMN: LOGIN FORM                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-14 lg:p-20 bg-slate-50/50">
        <div className="w-full max-w-md space-y-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs">
          
          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Team Head Login
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Welcome back! Please login to your account.
            </p>
          </div>

          {/* In-Page Notification Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] transition font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#E63946] focus:ring-[#E63946] cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <span className="text-slate-400 text-xs cursor-not-allowed">
                Forgot password?
              </span>
            </div>

            {/* Red Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#E63946] hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs transition duration-200 shadow-sm shadow-red-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Login</span>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Register Redirect */}
          <div className="text-center pt-2 text-xs text-slate-500 font-medium">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition"
            >
              Register here
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}