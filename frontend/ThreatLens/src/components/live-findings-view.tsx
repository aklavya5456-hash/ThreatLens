"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  downloadBackendReport,
  getBackendAnalysis,
  getBackendHistory,
  getBackendScan,
  type BackendScan,
  type FindingAnalysis,
} from "@/lib/backend-api";

const severityClasses: Record<string, string> = {
  critical: "border-red-400/20 bg-red-400/10 text-red-300",
  high: "border-orange-300/20 bg-orange-300/10 text-orange-300",
  medium: "border-amber-300/20 bg-amber-300/10 text-amber-300",
  low: "border-teal-300/20 bg-teal-300/10 text-teal-300",
  info: "border-slate-400/20 bg-slate-400/10 text-slate-300",
};

function evidenceText(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2) || "No evidence was recorded.";
}

export function LiveFindingsView() {
  const searchParams = useSearchParams();
  const requestedScanId = searchParams.get("scanId");
  const [scan, setScan] = useState<BackendScan | null>(null);
  const [analyses, setAnalyses] = useState<FindingAnalysis[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setLoading(true);
        setError("");
        const scanId = requestedScanId ?? (await getBackendHistory(1)).items[0]?.id;
        if (!scanId) {
          if (active) setScan(null);
          return;
        }
        const currentScan = await getBackendScan(scanId);
        const analysis = await getBackendAnalysis(scanId);
        if (active) {
          setScan(currentScan);
          setAnalyses(analysis.analyses);
          setSelectedIndex(0);
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "The scan results could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [requestedScanId]);

  const selected = analyses[selectedIndex];
  const findingCount = scan?.findings.length ?? 0;
  const failureCount = scan?.findings.filter((finding) => finding.status === "FAIL").length ?? 0;
  const assessmentComplete = scan?.status === "completed";

  async function downloadReport() {
    if (!scan) return;
    try {
      setDownloading(true);
      await downloadBackendReport(scan.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The report could not be downloaded.");
    } finally {
      setDownloading(false);
    }
  }

  const content = useMemo(() => {
    if (!selected) return null;
    const hindi = language === "hi";
    return {
      explanation: hindi ? selected.explanation_hi : selected.explanation_en,
      remediation: hindi ? selected.remediation_hi : selected.remediation_en,
      verification: hindi ? selected.verification_hi : selected.verification_en,
    };
  }, [language, selected]);

  if (loading) return <StatusCard message="Loading the latest persisted assessment…" />;
  if (error) return <StatusCard message={error} tone="error" />;
  if (!scan) return <StatusCard message="No persisted scans are available yet. Start an authorized scan from the home page." />;

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#252C40] bg-[#111522] p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Live assessment</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{scan.hostname}</h1><p className="mt-2 text-xs text-slate-500">Scan {scan.id} · {new Date(scan.created_at).toLocaleString()}</p></div>
        <div className="flex flex-wrap gap-2"><span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-medium text-teal-200">{scan.status}</span>{scan.risk ? <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-medium text-violet-200">{scan.risk} risk</span> : null}<button type="button" onClick={() => void downloadReport()} disabled={downloading} className="rounded-xl bg-violet-500 px-3 py-2 text-xs font-medium text-white hover:bg-violet-400 disabled:opacity-60">{downloading ? "Preparing PDF…" : "Download PDF"}</button></div>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric label="Security score" value={!assessmentComplete || scan.score === null ? "—" : `${scan.score}/100`} /><Metric label="Findings" value={String(findingCount)} /><Metric label="Confirmed failures" value={String(failureCount)} /></div>
    </section>

    {scan.status !== "completed" ? <StatusCard message={`This scan is ${scan.status}; its score is not a completed assessment.`} /> : null}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <section className="rounded-2xl border border-[#252C40] bg-[#111522]" aria-labelledby="live-findings-title"><div className="border-b border-[#252C40] p-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Evidence</p><h2 id="live-findings-title" className="mt-3 text-xl font-medium text-white">Assessment findings</h2><p className="mt-2 text-sm text-slate-500">{findingCount} persisted finding{findingCount === 1 ? "" : "s"} from this assessment.</p></div>{scan.findings.length ? <div className="divide-y divide-[#252C40]">{scan.findings.map((finding, index) => { const item = analyses[index]; return <button type="button" key={`${finding.check_name}-${index}`} onClick={() => setSelectedIndex(index)} className={`block w-full p-5 text-left hover:bg-[#171827] ${selectedIndex === index ? "bg-violet-300/[0.06]" : ""}`}><div className="flex items-start justify-between gap-4"><div><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${severityClasses[finding.severity] ?? severityClasses.info}`}>{finding.severity}</span><h3 className="mt-3 text-sm font-medium text-white">{item?.title ?? finding.check_name}</h3></div><span className="text-xs text-slate-500">{finding.status}</span></div><p className="mt-3 text-xs leading-5 text-slate-400">{item?.establishes ?? "No analysis is available for this finding."}</p></button>; })}</div> : <div className="p-8 text-sm text-slate-400">No findings were persisted for this scan.</div>}</section>
      {selected && content ? <FindingDetail analysis={selected} content={content} language={language} onLanguageChange={setLanguage} /> : <StatusCard message="Select a finding to view its analysis." />}
    </div>
  </div>;
}

function FindingDetail({ analysis, content, language, onLanguageChange }: { analysis: FindingAnalysis; content: { explanation: string; remediation: string[]; verification: string[] }; language: "en" | "hi"; onLanguageChange: (value: "en" | "hi") => void }) {
  return <aside className="h-fit rounded-2xl border border-[#252C40] bg-[#111522] p-6 xl:sticky xl:top-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">{analysis.confidence} confidence</p><h2 className="mt-3 text-xl font-medium text-white">{analysis.title}</h2></div><select aria-label="Analysis language" value={language} onChange={(event) => onLanguageChange(event.target.value as "en" | "hi")} className="rounded-lg border border-[#303953] bg-[#171827] px-2 py-1.5 text-xs text-slate-200"><option value="en">English</option><option value="hi">हिन्दी</option></select></div><div className="mt-6 space-y-6"><DetailSection title="Observed evidence"><pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-[#0c0f19] p-3 text-xs leading-5 text-slate-300">{evidenceText(analysis.observed_evidence)}</pre></DetailSection><DetailSection title={language === "hi" ? "यह क्यों महत्वपूर्ण है" : "Why it matters"}><p>{content.explanation}</p></DetailSection><DetailSection title={analysis.cause_is_hypothesis ? (language === "hi" ? "संभावित कारण (परिकल्पना)" : "Likely cause (hypothesis)") : (language === "hi" ? "कारण" : "Cause")}><p>{analysis.likely_cause}</p></DetailSection><DetailSection title={language === "hi" ? "सुधार" : "Remediation"}><ul className="list-disc space-y-2 pl-5">{content.remediation.map((item) => <li key={item}>{item}</li>)}</ul></DetailSection><DetailSection title={language === "hi" ? "सत्यापन" : "Verification"}><ol className="list-decimal space-y-2 pl-5">{content.verification.map((item) => <li key={item}>{item}</li>)}</ol></DetailSection>{analysis.limitations.length ? <DetailSection title={language === "hi" ? "सीमाएँ" : "Limitations"}><ul className="list-disc space-y-2 pl-5">{analysis.limitations.map((item) => <li key={item}>{item}</li>)}</ul></DetailSection> : null}</div></aside>;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) { return <section><h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">{title}</h3><div className="mt-3 text-sm leading-6 text-slate-400">{children}</div></section>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-[#252C40] bg-[#171827] p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>; }
function StatusCard({ message, tone = "normal" }: { message: string; tone?: "normal" | "error" }) { return <div className={`rounded-2xl border p-8 text-sm leading-6 ${tone === "error" ? "border-red-300/20 bg-red-300/5 text-red-200" : "border-dashed border-[#303953] bg-[#111522] text-slate-400"}`} role={tone === "error" ? "alert" : undefined}>{message}</div>; }
