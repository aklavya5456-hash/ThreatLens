"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBackendHistory, type BackendHistoryItem } from "@/lib/backend-api";

export function LiveHistoryView() {
  const [items, setItems] = useState<BackendHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getBackendHistory().then((result) => setItems(result.items)).catch((reason) => setError(reason instanceof Error ? reason.message : "Scan history could not be loaded.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <State message="Loading persisted scan history…" />;
  if (error) return <State message={error} error />;
  if (items.length === 0) return <State message="No scans have been persisted yet. Start an authorized assessment from the home page." />;

  return <section className="overflow-hidden rounded-2xl border border-[#252C40] bg-[#111522]" aria-labelledby="live-history-title"><div className="border-b border-[#252C40] p-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Activity log</p><h2 id="live-history-title" className="mt-3 text-xl font-medium text-white">Persisted scans</h2><p className="mt-2 text-sm text-slate-500">Loaded from the ThreatLens backend database.</p></div><div className="divide-y divide-[#252C40]">{items.map((scan) => <article key={scan.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-sm font-medium text-white">{scan.hostname}</p><p className="mt-1 text-xs text-slate-600">{scan.id} · {new Date(scan.created_at).toLocaleString()}</p></div><div className="flex flex-wrap items-center gap-4"><div><p className="text-xs text-slate-600">Score</p><p className="mt-1 text-sm font-semibold text-teal-300">{scan.status === "completed" && scan.score !== null ? `${scan.score}/100` : "—"}</p></div><span className="rounded-full border border-[#303953] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300">{scan.status}</span><Link href={`/findings?scanId=${encodeURIComponent(scan.id)}`} className="rounded-lg text-xs font-medium text-violet-300 hover:text-violet-200">View details</Link></div></article>)}</div></section>;
}

function State({ message, error = false }: { message: string; error?: boolean }) { return <div className={`rounded-2xl border p-8 text-sm leading-6 ${error ? "border-red-300/20 bg-red-300/5 text-red-200" : "border-dashed border-[#303953] bg-[#111522] text-slate-400"}`} role={error ? "alert" : undefined}>{message}</div>; }
