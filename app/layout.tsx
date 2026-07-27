import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Arxen Dashboard',
  description: 'Hybrid AI Anti-Phishing Monitor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0b0f24] text-slate-100 min-h-screen flex`}>
        <Sidebar />
        <main className="flex-1 ml-64 p-8 bg-[#0b0f24] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
