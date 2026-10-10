"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ScanRecord, ScanStatus } from "@/data/dashboard-demo";

const statuses: Array<ScanStatus | "All statuses"> = ["All statuses", "Completed", "Running", "Failed"];

const statusClasses: Record<ScanStatus, string> = {
  Completed: "border-teal-300/20 bg-teal-300/10 text-teal-300",
  Running: "border-violet-300/20 bg-violet-300/10 text-violet-200",
  Failed: "border-red-400/20 bg-red-400/10 text-red-300",
};

export function ScanHistoryView({ scans }: { scans: ReadonlyArray<ScanRecord> }) {
  const [status, setStatus] = useState<ScanStatus | "All statuses">("All statuses");
  const [domainQuery, setDomainQuery] = useState("");
  const filteredScans = useMemo(() => {
    const normalizedQuery = domainQuery.trim().toLowerCase();
    return scans.filter((scan) => {
      const matchesStatus = status === "All statuses" || scan.status === status;
      const matchesDomain = normalizedQuery.length === 0 || scan.domain.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesDomain;
    });
  }, [domainQuery, scans, status]);

  return <section className="rounded-2xl border border-[#252C40] bg-[#111522]" aria-labelledby="scan-history-list-title">
    <div className="border-b border-[#252C40] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Activity log</p><h2 id="scan-history-list-title" className="mt-3 text-xl font-medium text-white">Previous scans</h2><p className="mt-2 text-sm text-slate-500">{filteredScans.length} of {scans.length} demo scans shown</p></div>
        <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">DEMO</span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="text-xs font-medium text-slate-400">Search by domain<input type="search" value={domainQuery} onChange={(event) => setDomainQuery(event.target.value)} placeholder="e.g. acme-workshop.com" className="mt-2 block w-full rounded-xl border border-[#303953] bg-[#171827] px-3 py-2.5 text-sm font-normal text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20" /></label>
        <label className="text-xs font-medium text-slate-400">Status<select value={status} onChange={(event) => setStatus(event.target.value as ScanStatus | "All statuses")} className="mt-2 block w-full rounded-xl border border-[#303953] bg-[#171827] px-3 py-2.5 text-sm font-normal text-slate-200 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20">{statuses.map((option) => <option key={option}>{option}</option>)}</select></label>
      </div>
    </div>
    {filteredScans.length > 0 ? <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm"><caption className="sr-only">ThreatLens demo scan history</caption><thead className="border-b border-[#252C40] text-xs uppercase tracking-[0.12em] text-slate-600"><tr><th scope="col" className="px-6 py-4 font-medium">Domain</th><th scope="col" className="px-4 py-4 font-medium">Scanned</th><th scope="col" className="px-4 py-4 font-medium">Score</th><th scope="col" className="px-4 py-4 font-medium">Findings</th><th scope="col" className="px-4 py-4 font-medium">Status</th><th scope="col" className="px-6 py-4 text-right font-medium">Action</th></tr></thead><tbody className="divide-y divide-[#252C40]">{filteredScans.map((scan) => <ScanTableRow key={scan.id} scan={scan} />)}</tbody></table>
      </div>
      <div className="divide-y divide-[#252C40] md:hidden">{filteredScans.map((scan) => <ScanMobileCard key={scan.id} scan={scan} />)}</div>
    </> : <div className="p-8 text-center sm:p-12"><p className="text-sm font-medium text-white">No demo scans match these filters.</p><p className="mt-2 text-sm text-slate-500">Try another domain or status.</p></div>}
  </section>;
}

function ScanTableRow({ scan }: { scan: ScanRecord }) {
  return <tr><th scope="row" className="px-6 py-5 font-medium text-white">{scan.domain}<span className="mt-1 block text-xs font-normal text-slate-600">{scan.id}</span></th><td className="whitespace-nowrap px-4 py-5 text-slate-400">{scan.scannedAt}</td><td className="px-4 py-5">{scan.status === "Completed" ? <span className="font-semibold text-teal-300">{scan.score}<span className="ml-1 text-xs font-normal text-slate-600">/100</span></span> : <span className="text-slate-600">—</span>}</td><td className="px-4 py-5 text-slate-400">{scan.status === "Completed" ? <><span className="text-slate-200">{scan.findings}</span><span className="ml-2 text-xs text-slate-600">{scan.criticalFindings} critical</span></> : <span className="text-slate-600">Not available</span>}</td><td className="px-4 py-5"><StatusBadge status={scan.status} /></td><td className="px-6 py-5 text-right"><Link href="/findings" className="whitespace-nowrap rounded-lg text-xs font-medium text-violet-300 hover:text-violet-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">View Details</Link></td></tr>;
}

function ScanMobileCard({ scan }: { scan: ScanRecord }) {
  return <article className="p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="text-sm font-medium text-white">{scan.domain}</h3><p className="mt-1 text-xs text-slate-600">{scan.id} · {scan.scannedAt}</p></div><StatusBadge status={scan.status} /></div><dl className="mt-5 grid grid-cols-2 gap-4"><div><dt className="text-xs text-slate-600">Security score</dt><dd className="mt-1 text-sm font-semibold text-teal-300">{scan.status === "Completed" ? `${scan.score}/100` : "—"}</dd></div><div><dt className="text-xs text-slate-600">Findings</dt><dd className="mt-1 text-sm text-slate-300">{scan.status === "Completed" ? <>{scan.findings} <span className="text-xs text-slate-600">({scan.criticalFindings} critical)</span></> : "Not available"}</dd></div></dl><Link href="/findings" className="mt-5 inline-flex rounded-lg text-xs font-medium text-violet-300 hover:text-violet-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">View Details</Link></article>;
}

function StatusBadge({ status }: { status: ScanStatus }) {
  return <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusClasses[status]}`}>{status}</span>;
}
