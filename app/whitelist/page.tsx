'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Trash2, ShieldAlert } from 'lucide-react';

interface WhitelistDomain {
  id: number;
  domain: string;
  created_at: string;
}

export default function WhitelistPage() {
  const [domains, setDomains] = useState<WhitelistDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDomains = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${baseUrl}/whitelist/?strict=true`);
      if (res.ok) {
        const data = await res.json();
        setDomains(data);
      }
    } catch (e) {
      console.error("Failed to fetch whitelist", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${baseUrl}/whitelist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: newDomain.trim() })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Gagal menambahkan domain");
      }
      
      setNewDomain('');
      fetchDomains();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (domain: string) => {
    if (!confirm(`Hapus ${domain} dari whitelist?`)) return;
    
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
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Daftar Whitelist</h1>
          <p className="text-slate-400">Kelola situs-situs terpercaya yang akan dilewatkan dari pemindaian sistem keamanan.</p>
        </div>
      </div>

      {/* Add New Domain Card */}
      <div className="bg-[#10142b] border border-white/5 rounded-2xl shadow-xl shadow-black/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Tambahkan Domain Terpercaya</h3>
        <form onSubmit={handleAdd} className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="Contoh: google.com, portal.perusahaan.co.id"
              className="w-full bg-[#0b0f24] border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-600"
              disabled={isSubmitting}
            />
            {error && <div className="absolute -bottom-6 left-1 text-xs text-rose-400">{error}</div>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !newDomain.trim()}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Plus size={20} />
            )}
            Tambahkan
          </button>
        </form>
      </div>

      {/* Whitelist Table */}
      <div className="bg-[#10142b] border border-white/5 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#171f46]/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" size={20} />
            <h3 className="text-lg font-bold text-white">Domain yang Diizinkan</h3>
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
                <th className="px-6 py-4 font-medium">Tanggal Ditambahkan</th>
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
                      <p className="text-sm">Belum ada domain di dalam daftar Whitelist.</p>
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
                        {new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(d.domain)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Hapus dari Whitelist"
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
