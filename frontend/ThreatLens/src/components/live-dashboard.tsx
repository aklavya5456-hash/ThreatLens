"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBackendHistory, getBackendScan, type BackendHistoryItem, type BackendScan } from "@/lib/backend-api";

export function LiveDashboard() {
  const [history, setHistory] = useState<BackendHistoryItem[]>([]);
  const [latest, setLatest] = useState<BackendScan | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const result = await getBackendHistory();
        setHistory(result.items);
        if (result.items[0]) setLatest(await getBackendScan(result.items[0].id));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "The dashboard could not be loaded.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <State message="Loading persisted ThreatLens assessments…" />;
  if (error) return <State message={error} error />;
  const failures = latest?.findings.filter((finding) => finding.status === "FAIL").length ?? 0;
  const active = history.filter((scan) => scan.status === "queued" || scan.status === "running").length;
  const latestIsComplete = latest?.status === "completed";

  return <div className="space-y-6"><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Latest score" value={!latestIsComplete || latest?.score === null || latest?.score === undefined ? "—" : `${latest.score}/100`} /><Metric label="Risk" value={!latestIsComplete ? "Unavailable" : latest?.risk ?? "—"} /><Metric label="Confirmed failures" value={String(failures)} /><Metric label="Active scans" value={String(active)} /></section>{latest ? <section className="rounded-2xl border border-[#252C40] bg-[#111522] p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Latest persisted assessment</p><h2 className="mt-3 text-2xl font-medium text-white">{latest.hostname}</h2><p className="mt-2 text-xs text-slate-500">{latest.id} · {latest.status}</p></div><Link href={`/findings?scanId=${encodeURIComponent(latest.id)}`} className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-400">View findings</Link></div><div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric label="Score" value={!latestIsComplete || latest.score === null ? "—" : `${latest.score}/100`} /><Metric label="Risk classification" value={!latestIsComplete ? "Unavailable" : latest.risk ?? "Unavailable"} /><Metric label="Persisted findings" value={String(latest.findings.length)} /></div></section> : <State message="No persisted scans yet. Start an authorized scan to populate the dashboard." />}<section className="rounded-2xl border border-[#252C40] bg-[#111522]" aria-labelledby="recent-scans-title"><div className="flex items-center justify-between border-b border-[#252C40] p-6"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Activity</p><h2 id="recent-scans-title" className="mt-3 text-xl font-medium text-white">Recent scans</h2></div><Link href="/scan-history" className="text-xs font-medium text-violet-300">View history</Link></div>{history.slice(0, 5).map((scan) => <div key={scan.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-[#252C40] p-5 last:border-0"><div><p className="text-sm font-medium text-white">{scan.hostname}</p><p className="mt-1 text-xs text-slate-600">{new Date(scan.created_at).toLocaleString()}</p></div><div className="flex items-center gap-4 text-xs"><span className="text-slate-400">{scan.status === "completed" && scan.score !== null ? `${scan.score}/100` : "—"}</span><span className="text-slate-500">{scan.status}</span><Link href={`/findings?scanId=${encodeURIComponent(scan.id)}`} className="text-violet-300">Open</Link></div></div>)}</section></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-[#252C40] bg-[#171827] p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>; }
function State({ message, error = false }: { message: string; error?: boolean }) { return <div className={`rounded-2xl border p-8 text-sm leading-6 ${error ? "border-red-300/20 bg-red-300/5 text-red-200" : "border-dashed border-[#303953] bg-[#111522] text-slate-400"}`} role={error ? "alert" : undefined}>{message}</div>; }
