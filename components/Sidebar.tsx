'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldAlert, FileText, ShieldCheck, List, Bell } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const res = await fetch(`${baseUrl}/stats/`);
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.pending_quarantine);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchStats();
    // Optional: poll every 15s
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Quarantine', href: '/quarantine', icon: ShieldAlert },
    { name: 'Logs', href: '/logs', icon: FileText },
    { name: 'Whitelist', href: '/whitelist', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 h-screen bg-[#0f1535] border-r border-white/5 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/30">
          A
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Arxen Admin</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20 shadow-sm' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={isActive ? 'text-violet-400' : 'text-slate-400'} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              
              {item.name === 'Quarantine' && pendingCount > 0 && (
                <div className="flex items-center justify-center relative w-6 h-6">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-20 animate-ping"></span>
                  <Bell size={16} className="text-rose-400 animate-pulse relative z-10" />
                </div>
              )}
            </Link>
          );
        })}

      </nav>

      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-[#171f46] to-[#0f1535] border border-white/5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-violet-600/20 blur-2xl rounded-full"></div>
        <h4 className="text-sm font-semibold text-white mb-1">Arxen Shield</h4>
        <p className="text-xs text-slate-400 mb-3">System is running optimally and securing the network.</p>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Active
        </div>
      </div>
    </aside>
  );
}
