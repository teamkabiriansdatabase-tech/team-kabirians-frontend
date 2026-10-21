import Link from 'next/link';
import { ArrowRight, Trophy, Video, FileCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import FreeClassModal from '@/components/FreeClassModal';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* 1. Free Trial Class Modal */}
      <FreeClassModal />

      {/* 2. Navigation Header */}
      <Navbar />

      {/* 3. Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-white py-20 lg:py-28 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold tracking-wide uppercase border border-red-100">
                Official Competition Platform
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-[#1E3A8A] tracking-tight leading-tight">
                Empowering Teams. <br />
                <span className="text-[#DC2626]">Recognizing Excellence.</span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Register your team, select competition categories, upload verified payment proofs, 
                and participate in both online video challenges and offline events seamlessly.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/events"
                  prefetch={false}
                  className="inline-flex items-center px-6 py-3.5 rounded-lg bg-[#1E3A8A] text-white font-semibold hover:bg-blue-900 transition-all shadow-md gap-2"
                >
                  Browse Current Events <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/portal/dashboard"
                  prefetch={false}
                  className="inline-flex items-center px-6 py-3.5 rounded-lg bg-white border-2 border-[#DC2626] text-[#DC2626] font-semibold hover:bg-red-50 transition-all cursor-pointer"
                >
                  Team Head Portal
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Feature Highlights */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center mb-4 font-bold">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Category Selection</h3>
              <p className="text-sm text-slate-600">
                Admin-curated competitive categories with transparent base pricing and automated deadline adjustments.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center mb-4 font-bold">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Online Video Submissions</h3>
              <p className="text-sm text-slate-600">
                Approved teams get instant access to submit competition performances directly to Cloudinary storage.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-4 font-bold">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Offline Registration Slips</h3>
              <p className="text-sm text-slate-600">
                Offline competitors receive verification passes and downloadable entry documentation instantly.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="bg-[#0F172A] text-white border-t border-slate-800 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Team Kabirians. All rights reserved.</p>
          <p className="mt-1 text-xs">Event Management & Competition Portal System</p>
        </div>
      </footer>
    </div>
  );
}