import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Hestia — Community Emergency Response',
  description: 'Connect your community during emergencies. Real-time coordination, help matching, and emergency alerts.',
  keywords: ['emergency', 'community', 'disaster response', 'mutual aid'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-navy-950 text-white min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
