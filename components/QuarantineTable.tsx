'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuarantineCase {
  quarantine_id: number;
  url: string;
  cnn_score: number;
  bert_score: number | null;
  status: string;
}

export default function QuarantineTable() {
  const [cases, setCases] = useState<QuarantineCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchCases = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${baseUrl}/quarantine/`);
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (e) {
      console.error("Failed to fetch quarantine cases", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleAction = async (id: number, action: 'safe' | 'phishing') => {
    setActionLoading(id);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${baseUrl}/quarantine/${id}/validate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        // Remove from list or refresh
        fetchCases();
      }
    } catch (e) {
      console.error("Failed to perform action", e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-[#10142b] border border-white/5 rounded-2xl shadow-xl shadow-black/10 overflow-hidden mt-8">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#171f46]/30">
        <h3 className="text-lg font-bold text-white">Pending Quarantine Review</h3>
        <span className="bg-violet-600/20 text-violet-400 text-xs font-bold px-3 py-1 rounded-full">
          {cases.length} pending
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0b0f24]/50 text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">URL</th>
              <th className="px-6 py-4 font-medium text-center">CNN Score</th>
              <th className="px-6 py-4 font-medium text-center">BERT Score</th>
              <th className="px-6 py-4 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              // Skeleton rows
              Array(3).fill(0).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-6 py-4"><div className="h-4 w-64 bg-white/5 rounded animate-pulse"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-12 bg-white/5 rounded animate-pulse mx-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-12 bg-white/5 rounded animate-pulse mx-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-8 w-32 bg-white/5 rounded animate-pulse mx-auto"></div></td>
                </tr>
              ))
            ) : cases.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500/30 mb-3" />
                    <p className="text-sm">Tidak ada kasus yang perlu direview saat ini.</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Actual data
              cases.map((c) => (
                <tr key={c.quarantine_id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="max-w-md truncate text-sm font-medium text-slate-200" title={c.url}>
                      {c.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                      c.cnn_score > 0.5 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {c.cnn_score.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {c.bert_score !== null ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                        c.bert_score > 0.5 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {c.bert_score.toFixed(3)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleAction(c.quarantine_id, 'safe')}
                        disabled={actionLoading === c.quarantine_id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg transition-colors border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === c.quarantine_id ? <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div> : <CheckCircle size={14} />}
                        Safe
                      </button>
                      <button
                        onClick={() => handleAction(c.quarantine_id, 'phishing')}
                        disabled={actionLoading === c.quarantine_id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg transition-colors border border-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === c.quarantine_id ? <div className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div> : <XCircle size={14} />}
                        Phish
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
