"use client";
import { useEffect, useState } from 'react';

interface QuarantineItem {
  quarantine_id: number;
  url: string;
  cnn_score: number;
  bert_score: number;
  created_at: string;
}

interface ClusterGroup {
  cluster_name: string;
  count: number;
  items: QuarantineItem[];
}

export default function QuarantinePage() {
  const [clusters, setClusters] = useState<ClusterGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);
  const [viewMode, setViewMode] = useState<'cluster' | 'individual'>('cluster');
  const [clusteringMessage, setClusteringMessage] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/quarantine/clusters`);
      if (res.ok) {
        const data = await res.json();
        setClusters(data);
      }
    } catch (e) {
      console.error("Gagal mengambil data cluster:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const handleRunClustering = async () => {
    setClusteringMessage("Jalankan algoritma clustering...");
    try {
      const res = await fetch(`${API_BASE}/quarantine/run-clustering`, { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        setClusteringMessage(result.message);
        fetchClusters();
      }
    } catch (e) {
      console.error(e);
      setClusteringMessage("Gagal menjalankan clustering");
    }
    setTimeout(() => setClusteringMessage(null), 4000);
  };

  const handleValidateIndividual = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/quarantine/${id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, validated_by: 'admin_dashboard' })
      });
      if (res.ok) {
        alert("Validasi individu berhasil disimpan.");
      } else {
        alert("Gagal memvalidasi individu.");
      }
      fetchClusters();
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan jaringan");
    } finally {
      setActionLoading(null);
    }
  };

  const handleValidateCluster = async (clusterName: string, status: string) => {
    setActionLoading(clusterName);
    const clusterIdMatch = clusterName.match(/#(\d+)/);
    if (!clusterIdMatch) return;

    const clusterId = parseInt(clusterIdMatch[1]);
    try {
      const res = await fetch(`${API_BASE}/quarantine/cluster/${clusterId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, validated_by: 'admin_dashboard' })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
      } else {
        alert("Gagal memvalidasi cluster");
      }
      fetchClusters();
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan jaringan");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportDataset = async () => {
    try {
      const res = await fetch(`${API_BASE}/quarantine/export-dataset`);
      if (res.ok) {
        const data = await res.json();
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", jsonString);
        downloadAnchor.setAttribute("download", `arxen_retraining_dataset_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (e) {
      console.error("Export dataset gagal:", e);
    }
  };

  const totalPending = clusters.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Human-in-the-Loop Quarantine</h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              HITL Active
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Tinjau dan validasi kelompok kasus ambigu AI. Pola tervalidasi digunakan untuk Batch Retraining.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunClustering}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
          >
            <span>Run Auto-Clustering</span>
          </button>

          <button
            onClick={handleExportDataset}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
          >
            <span>Export Dataset Retraining</span>
          </button>

          <button
            onClick={fetchClusters}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
             Refresh List
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {clusteringMessage && (
        <div className="mb-6 px-4 py-3 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl text-sm flex items-center justify-between animate-in fade-in">
          <span>{clusteringMessage}</span>
        </div>
      )}

      {/* Stats Summary Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Pending URL</div>
            <div className="text-xl font-bold text-slate-100">{totalPending}</div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Cluster Pola</div>
            <div className="text-xl font-bold text-purple-400">{clusters.length}</div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('cluster')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'cluster'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tampilan Cluster (HITL)
          </button>
          <button
            onClick={() => setViewMode('individual')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'individual'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tampilan Individual
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mb-3"></div>
          <div>Memuat data karantina & cluster...</div>
        </div>
      )}

      {!loading && clusters.length === 0 && (
        <div className="p-12 text-center bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="text-3xl mb-2"></div>
          <div className="text-slate-300 font-semibold mb-1">Tidak Ada Kasus Pending di Karantina</div>
          <div className="text-slate-500 text-sm">Semua situs aman atau sudah divalidasi oleh sistem AI.</div>
        </div>
      )}

      {/* CLUSTER VIEW */}
      {!loading && viewMode === 'cluster' && clusters.length > 0 && (
        <div className="space-y-6">
          {clusters.map((cluster) => {
            const isClusterValidating = actionLoading === cluster.cluster_name;
            const isNamedCluster = cluster.cluster_name.includes('#');

            return (
              <div
                key={cluster.cluster_name}
                className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg shadow-black/20"
              >
                {/* Cluster Header & 1-Click Action */}
                <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm">
                      
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-100 flex items-center gap-2">
                        {cluster.cluster_name}
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {cluster.count} URL Serupa
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Pola ancaman dikelompokkan oleh algoritma Embedding Similarity.
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Cluster Validation Buttons */}
                  {isNamedCluster && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleValidateCluster(cluster.cluster_name, 'validated_safe')}
                        disabled={isClusterValidating}
                        className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <span>Validasi Cluster (Aman)</span>
                      </button>
                      <button
                        onClick={() => handleValidateCluster(cluster.cluster_name, 'validated_phishing')}
                        disabled={isClusterValidating}
                        className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <span>Validasi Cluster (Phishing)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Table of URLs in this Cluster */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs font-medium border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-3">URL</th>
                        <th className="px-6 py-3">CNN Score</th>
                        <th className="px-6 py-3">BERT Score</th>
                        <th className="px-6 py-3 text-right">Aksi Individu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {cluster.items.map((item) => (
                        <tr key={item.quarantine_id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="text-slate-200 font-mono text-xs max-w-lg truncate" title={item.url}>
                              {item.url}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {new Date(item.created_at).toLocaleString('id-ID')}
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {item.cnn_score.toFixed(3)}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {item.bert_score.toFixed(3)}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => handleValidateIndividual(item.quarantine_id, 'validated_safe')}
                                disabled={actionLoading === item.quarantine_id}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 rounded text-xs transition-colors border border-slate-700 disabled:opacity-50"
                              >
                                Mark Safe
                              </button>
                              <button
                                onClick={() => handleValidateIndividual(item.quarantine_id, 'validated_phishing')}
                                disabled={actionLoading === item.quarantine_id}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 rounded text-xs transition-colors border border-slate-700 disabled:opacity-50"
                              >
                                Block
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INDIVIDUAL VIEW */}
      {!loading && viewMode === 'individual' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 border-b border-slate-800 text-xs text-slate-400 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">URL</th>
                  <th className="px-6 py-4">CNN Score</th>
                  <th className="px-6 py-4">BERT Score</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {clusters.flatMap(c => c.items).map((item) => (
                  <tr key={item.quarantine_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-slate-200 font-mono text-xs max-w-md truncate" title={item.url}>
                        {item.url}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(item.created_at).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.cnn_score.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {item.bert_score.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleValidateIndividual(item.quarantine_id, 'validated_safe')}
                          disabled={actionLoading === item.quarantine_id}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          ✅ Mark Safe
                        </button>
                        <button
                          onClick={() => handleValidateIndividual(item.quarantine_id, 'validated_phishing')}
                          disabled={actionLoading === item.quarantine_id}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          🛑 Block
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
