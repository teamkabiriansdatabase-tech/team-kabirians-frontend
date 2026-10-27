import Navbar from '@/components/Navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-gray-bg text-slate-900">
      {/* Global Public Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-brand-blue-dark text-white border-t border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Team Kabirians. All rights reserved.</p>
          <p className="mt-1 text-xs">Event Management & Competition Portal System</p>
        </div>
      </footer>
    </div>
  );
}
