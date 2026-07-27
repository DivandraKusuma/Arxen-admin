'use client';

import { useEffect, useState } from 'react';
import { FileText, Trash2, ShieldAlert } from 'lucide-react';

interface WhitelistDomain {
  id: number;
  domain: string;
  created_at: string;
}

export default function LogsPage() {
  const [domains, setDomains] = useState<WhitelistDomain[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDomains = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${baseUrl}/whitelist/?strict=false`);
      if (res.ok) {
        const data = await res.json();
        setDomains(data);
      }
    } catch (e) {
      console.error("Failed to fetch logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleDelete = async (domain: string) => {
    if (!confirm(`Hapus ${domain} dari Smart Whitelist? Ini akan mengembalikannya ke pemindaian ketat.`)) return;
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${baseUrl}/whitelist/${domain}/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDomains();
      }
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Quarantine Logs (Smart Whitelist)</h1>
          <p className="text-slate-400">Daftar situs yang diampuni dari Karantina dan dipantau otomatis melalui sidik jari DOM.</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#10142b] border border-white/5 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#171f46]/30">
          <div className="flex items-center gap-2">
            <FileText className="text-emerald-400" size={20} />
            <h3 className="text-lg font-bold text-white">Domain Terpantau</h3>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">
            {domains.length} Domain
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0b0f24]/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Nama Domain</th>
                <th className="px-6 py-4 font-medium">Tanggal Persetujuan</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                // Skeleton
                Array(2).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-48 bg-white/5 rounded animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-8 bg-white/5 rounded animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : domains.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <ShieldAlert className="w-12 h-12 text-slate-600 mb-3 opacity-50" />
                      <p className="text-sm">Belum ada domain di dalam daftar Quarantine Logs.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data
                domains.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-200">{d.domain}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-400">
                        {new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(d.domain)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Cabut Persetujuan"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
