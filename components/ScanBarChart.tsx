'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DailyStat {
  date: string;
  safe: number;
  phishing: number;
  quarantine: number;
}

export default function ScanBarChart() {
  const [data, setData] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDailyStats() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const res = await fetch(`${baseUrl}/stats/daily`);
        if (res.ok) {
          const rawData = await res.json();
          // Format date for display (e.g. "Jul 15")
          const formattedData = rawData.map((d: any) => {
            const dateObj = new Date(d.date);
            return {
              ...d,
              displayDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            };
          });
          setData(formattedData);
        }
      } catch (e) {
        console.error("Failed to fetch daily stats", e);
      } finally {
        setLoading(false);
      }
    }

    fetchDailyStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#10142b] border border-white/5 rounded-2xl p-6 h-[400px] flex items-center justify-center shadow-xl shadow-black/10">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm">Loading chart data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#10142b] border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/10">
      <h3 className="text-lg font-bold text-white mb-6">Scan Activity (Last 10 Days)</h3>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="displayDate" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              cursor={{ fill: '#ffffff05' }}
              contentStyle={{ 
                backgroundColor: '#0f1535', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              itemStyle={{ fontSize: '13px', fontWeight: 500 }}
              labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px' }}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} 
            />
            <Bar dataKey="safe" name="Safe" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={32} />
            <Bar dataKey="phishing" name="Phishing" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
            <Bar dataKey="quarantine" name="Quarantine" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
