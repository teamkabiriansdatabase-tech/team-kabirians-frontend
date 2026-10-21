'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Mail, Lock, Eye, EyeOff, User, Shield,
  Phone, Calendar, Trophy, Award, AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    teamName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and try again.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name: formData.name.trim(),
        teamName: formData.teamName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'team_head',
      });

      if (res.data?.success) {
        setSuccessMessage('Account registered successfully! Redirecting to portal...');

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

        setTimeout(() => {
          router.push('/portal/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Registration failed. Please check your details and try again.'
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

        {/* Middle Typography */}
        <div className="my-12 md:my-auto max-w-lg space-y-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Together <br />
            We Build <br />
            <span className="text-white">Bigger Dreams</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal pt-2">
            Register your team, manage competitor rosters, submit performance videos, and track tournament accreditations.
          </p>
        </div>

        {/* Bottom Highlights */}
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
      {/* RIGHT COLUMN: REGISTRATION FORM                               */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-slate-50/50 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs my-auto">
          
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Create Team Account
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Register as a Team Head or Coach to participate in championships.
            </p>
          </div>

          {/* In-Page Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* In-Page Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5 text-xs font-semibold">
            
            {/* Team / Club Name */}
            <div className="space-y-1">
              <label className="block text-slate-700">Team / Club Name *</label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  name="teamName"
                  required
                  placeholder="e.g. Shaheen Taekwondo Club"
                  value={formData.teamName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] transition font-medium"
                />
              </div>
            </div>

            {/* Coach / Team Head Name */}
            <div className="space-y-1">
              <label className="block text-slate-700">Head Coach / Team Head Name *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Master Ali Raza"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] transition font-medium"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-slate-700">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="coach@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] transition font-medium"
                />
              </div>
            </div>

            {/* Phone / WhatsApp */}
            <div className="space-y-1">
              <label className="block text-slate-700">Phone / WhatsApp Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] transition font-medium font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-slate-700">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-slate-700">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#E63946] hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs transition duration-200 shadow-sm shadow-red-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Register Team</span>
                )}
              </button>
            </div>
          </form>

          {/* Login Redirect */}
          <div className="text-center pt-1 text-xs text-slate-500 font-medium">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition"
            >
              Login here
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}