import Link from 'next/link';
import { ArrowRight, Trophy, Video, FileCheck, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section (White, Red, Blue Theme) */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28 border-b border-brand-gray-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-brand-red text-xs font-bold tracking-wide uppercase">
              Official Competition Platform
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-brand-blue tracking-tight leading-tight">
              Empowering Teams. <br />
              <span className="text-brand-red">Recognizing Excellence.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              Register your team, select competition categories, upload verified payment proofs, 
              and participate in both online video challenges and offline events seamlessly.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/events"
                className="inline-flex items-center px-6 py-3.5 rounded-lg bg-brand-blue text-white font-semibold hover:bg-brand-blue-dark transition-all shadow-md gap-2"
              >
                Browse Current Events <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/portal/dashboard"
                className="inline-flex items-center px-6 py-3.5 rounded-lg bg-white border-2 border-brand-red text-brand-red font-semibold hover:bg-red-50 transition-all"
              >
                Team Head Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-xl bg-white border border-brand-gray-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Category Selection</h3>
            <p className="text-sm text-slate-600">
              Admin-curated competitive categories with transparent base pricing and automated deadline adjustments.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-brand-gray-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-red-50 text-brand-red flex items-center justify-center mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Online Video Submissions</h3>
            <p className="text-sm text-slate-600">
              Approved teams get instant access to submit competition performances directly to Cloudinary storage.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-brand-gray-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-slate-50 text-slate-800 flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Offline Registration Slips</h3>
            <p className="text-sm text-slate-600">
              Offline competitors receive verification passes and downloadable entry documentation instantly.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}