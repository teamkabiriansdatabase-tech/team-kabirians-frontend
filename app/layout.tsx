import type { Metadata } from 'next';
import './globals.css'; // <-- Yeh line lazmi honi chahiye

export const metadata: Metadata = {
  title: 'Kabirians Event Portal',
  description: 'Competition & Event Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}