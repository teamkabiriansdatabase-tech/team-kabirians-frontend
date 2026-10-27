import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FreeClassModal from '@/components/FreeClassModal';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

export default function PublicFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f6f3] text-[#171717]">
      <Navbar />
      <FreeClassModal />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
