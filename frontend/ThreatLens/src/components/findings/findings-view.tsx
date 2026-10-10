"use client";

import { useMemo, useState } from "react";
import type { DetailedFinding, FindingStatus, Severity } from "@/data/dashboard-demo";
import { ChevronIcon, FindingsIcon } from "@/components/dashboard/dashboard-icons";
import { DemoBadge } from "@/components/dashboard/dashboard-components";

const severities: Array<Severity | "All severities"> = ["All severities", "Critical", "High", "Medium", "Low"];
const statuses: Array<FindingStatus | "All statuses"> = ["All statuses", "Open", "In review", "Resolved"];

const severityClasses: Record<Severity, string> = {
  Critical: "border-red-400/20 bg-red-400/10 text-red-300",
  High: "border-orange-300/20 bg-orange-300/10 text-orange-300",
  Medium: "border-amber-300/20 bg-amber-300/10 text-amber-300",
  Low: "border-teal-300/20 bg-teal-300/10 text-teal-300",
};

const statusClasses: Record<FindingStatus, string> = {
  Open: "text-red-300",
  "In review": "text-amber-300",
  Resolved: "text-teal-300",
};

const confidenceScores: Record<string, number> = {
  High: 84,
  Medium: 62,
  Low: 35,
};

export function FindingsView({ findings }: { findings: ReadonlyArray<DetailedFinding> }) {
  const [severity, setSeverity] = useState<Severity | "All severities">("All severities");
  const [status, setStatus] = useState<FindingStatus | "All statuses">("All statuses");
  const [selectedId, setSelectedId] = useState(findings[0]?.id ?? "");

  const filteredFindings = useMemo(
    () => findings.filter((finding) => (severity === "All severities" || finding.severity === severity) && (status === "All statuses" || finding.status === status)),
    [findings, severity, status],
  );
  const selectedFinding = filteredFindings.find((finding) => finding.id === selectedId) ?? filteredFindings[0];

  function selectFinding(id: string) {
    setSelectedId(id);
  }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
    <section className="min-w-0 rounded-2xl border border-[#252C40] bg-[#111522]" aria-labelledby="findings-list-title">
      <div className="border-b border-[#252C40] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Prioritize</p><h2 id="findings-list-title" className="mt-3 text-xl font-medium text-white">All findings</h2><p className="mt-2 text-sm text-slate-500">{filteredFindings.length} of {findings.length} demo findings shown</p></div>
          <DemoBadge />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-slate-400">Severity<select value={severity} onChange={(event) => setSeverity(event.target.value as Severity | "All severities")} className="mt-2 block w-full rounded-xl border border-[#303953] bg-[#171827] px-3 py-2.5 text-sm font-normal text-slate-200 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20">{severities.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label className="text-xs font-medium text-slate-400">Status<select value={status} onChange={(event) => setStatus(event.target.value as FindingStatus | "All statuses")} className="mt-2 block w-full rounded-xl border border-[#303953] bg-[#171827] px-3 py-2.5 text-sm font-normal text-slate-200 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20">{statuses.map((option) => <option key={option}>{option}</option>)}</select></label>
        </div>
      </div>
      <div className="divide-y divide-[#252C40]">
        {filteredFindings.length > 0 ? filteredFindings.map((finding) => <button key={finding.id} type="button" onClick={() => selectFinding(finding.id)} className={`block w-full text-left transition-colors hover:bg-[#171827] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-300 ${selectedFinding?.id === finding.id ? "bg-violet-300/[0.06]" : ""}`} aria-pressed={selectedFinding?.id === finding.id}>
          <div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${severityClasses[finding.severity]}`}>{finding.severity}</span><span className={`text-xs ${statusClasses[finding.status]}`}><span aria-hidden="true">•</span> {finding.status}</span></div><h3 className="mt-3 text-sm font-medium text-white">{finding.title}</h3></div><ChevronIcon className={`mt-1 size-4 shrink-0 ${selectedFinding?.id === finding.id ? "text-violet-300" : "text-slate-600"}`} /></div><div className="mt-4 grid gap-2 text-xs sm:grid-cols-2"><span className="text-slate-400">Domain <strong className="font-medium text-slate-200">{finding.domain}</strong></span><span className="text-slate-500 sm:text-right">Detected {finding.detected}</span></div><p className="mt-3 text-sm leading-6 text-slate-400">{finding.evidence}</p></div>
        </button>) : <div className="p-8 text-center"><p className="text-sm font-medium text-white">No demo findings match these filters.</p><p className="mt-2 text-sm text-slate-500">Try a different severity or status.</p></div>}
      </div>
    </section>

    {selectedFinding ? <FindingDetail finding={selectedFinding} /> : <section className="rounded-2xl border border-dashed border-[#303953] bg-[#111522]/60 p-8"><FindingsIcon className="size-6 text-slate-600" /><p className="mt-4 text-sm text-slate-400">Select a finding to view its demo analysis.</p></section>}
  </div>;
}

function FindingDetail({ finding }: { finding: DetailedFinding }) {
  const confidenceWidth = Math.min(100, Math.max(0, confidenceScores[finding.confidence] ?? 0));

  return <aside className="h-fit rounded-2xl border border-[#252C40] bg-[#111522] xl:sticky xl:top-6" aria-labelledby="finding-detail-title">
    <div className="border-b border-[#252C40] p-6"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${severityClasses[finding.severity]}`}>{finding.severity}</span><span className={`text-xs ${statusClasses[finding.status]}`}><span aria-hidden="true">•</span> {finding.status}</span></div><h2 id="finding-detail-title" className="mt-4 text-xl font-medium leading-7 text-white">{finding.title}</h2><p className="mt-3 text-xs text-slate-500">{finding.domain} · {finding.detected} · <span className="text-violet-300">DEMO</span></p></div>
    <div className="space-y-6 p-6">
      <DetailSection title="Evidence"><p>{finding.evidence}</p></DetailSection>
      <DetailSection title="Likely cause"><p>{finding.likelyCause}</p></DetailSection>
      <DetailSection title="Confidence"><div className="flex items-center gap-3"><span className="h-2 flex-1 overflow-hidden rounded-full bg-[#252C40]"><span className="block h-full rounded-full bg-teal-300" style={{ width: `${confidenceWidth}%` }} /></span><span className="text-sm font-medium text-teal-300">{finding.confidence}</span></div><p className="mt-2 text-xs text-slate-600">Confidence reflects this illustrative demo record, not a live scan.</p></DetailSection>
      <DetailSection title="Recommended remediation"><p>{finding.remediation}</p></DetailSection>
      <DetailSection title="Verification steps"><ol className="space-y-3">{finding.verificationSteps.map((step, index) => <li key={step} className="flex gap-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-violet-300/10 text-[10px] font-semibold text-violet-200">{index + 1}</span><span>{step}</span></li>)}</ol></DetailSection>
    </div>
  </aside>;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">{title}</h3><div className="mt-3 text-sm leading-6 text-slate-400">{children}</div></section>;
}
