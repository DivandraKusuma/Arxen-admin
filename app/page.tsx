'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import ScanBarChart from '@/components/ScanBarChart';
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

interface Stats {
  total_scans: number;
  total_blocked: number;
  pending_quarantine: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total_scans: 0, total_blocked: 0, pending_quarantine: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const res = await fetch(`${baseUrl}/stats/`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to fetch summary stats", e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400 text-sm">Monitor system activity and active threats.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Total URL Scanned"
          value={loading ? '...' : stats.total_scans.toLocaleString()}
          icon={ShieldCheck}
        />
        <StatCard
          title="Threats Blocked"
          value={loading ? '...' : stats.total_blocked.toLocaleString()}
          icon={ShieldAlert}
          trend={stats.total_blocked > 0 ? "Action required" : "All safe"}
          trendUp={stats.total_blocked === 0}
        />
      </div>

      {/* Main Content Area */}
      <div className="w-full mb-8">
        <ScanBarChart />
      </div>
    </div>
  );
}
