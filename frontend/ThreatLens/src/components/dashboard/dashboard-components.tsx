import Link from "next/link";
import type { Finding, FindingStatus, ScanRecord, Severity } from "@/data/dashboard-demo";
import { ArrowUpIcon, CheckIcon, ChevronIcon, DashboardIcon, FindingsIcon, HistoryIcon, PlusIcon, SettingsIcon } from "./dashboard-icons";

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

export function DemoBadge() {
  return <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">DEMO</span>;
}

export function DashboardPageHeader({ eyebrow, title, description, action, demo = true }: { eyebrow: string; title: string; description: string; action?: React.ReactNode; demo?: boolean }) {
  return <header className="flex flex-col gap-5 border-b border-[#252C40] pb-8 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">{eyebrow}</p>{demo ? <DemoBadge /> : null}</div><h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p></div>{action ? <div className="shrink-0">{action}</div> : null}</header>;
}

export function DemoNotice({ children = "Illustrative demo data only. No live security assessment has been performed." }: { children?: React.ReactNode }) {
  return <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-violet-300/15 bg-violet-300/[0.05] px-4 py-3.5 text-xs leading-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-5"><span>{children}</span><span className="shrink-0 font-semibold uppercase tracking-[0.14em] text-violet-200">Demo mode</span></div>;
}

export function DashboardSidebar({ activeSection = "overview" }: { activeSection?: "overview" | "findings" | "history" }) {
  const navItems = [
    { label: "Overview", href: "/dashboard", icon: DashboardIcon, section: "overview" as const },
    { label: "Findings", href: "/findings", icon: FindingsIcon, section: "findings" as const },
    { label: "Scan history", href: "/scan-history", icon: HistoryIcon, section: "history" as const },
    { label: "Settings", icon: SettingsIcon },
  ];

  return <aside className="hidden border-r border-[#252C40] bg-[#0c0f19] lg:flex lg:w-64 lg:shrink-0 lg:flex-col" aria-label="Dashboard navigation">
    <div className="flex h-20 items-center border-b border-[#252C40] px-6"><Link href="/" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"><span className="text-[15px] font-semibold tracking-[-0.02em] text-white">Threat<span className="text-violet-300">Lens</span></span></Link></div>
    <div className="flex flex-1 flex-col justify-between p-4">
      <nav aria-label="Primary dashboard navigation" className="space-y-1">{navItems.map(({ label, href, icon: Icon, section }) => { const active = section === activeSection; const className = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 ${active ? "bg-violet-300/10 text-violet-200" : "text-slate-500 hover:bg-[#171827] hover:text-slate-200"}`; return href ? <Link key={label} href={href} aria-current={active ? "page" : undefined} className={className}><Icon />{label}</Link> : <span key={label} aria-disabled="true" title="Settings will be available in a future release" className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700"><Icon />{label}<span className="ml-auto text-[9px] uppercase tracking-[0.12em]">Soon</span></span>; })}</nav>
      <div className="rounded-2xl border border-[#252C40] bg-[#111522] p-4"><p className="text-xs font-medium text-slate-300">Need a fresh assessment?</p><p className="mt-2 text-xs leading-5 text-slate-500">Start with a domain you own or have permission to test.</p><Link href="/#scan" className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-violet-300 hover:text-violet-200"><PlusIcon /> New scan</Link></div>
    </div>
  </aside>;
}

export function MobileDashboardNav({ activeSection = "overview", demo = true }: { activeSection?: "overview" | "findings" | "history"; demo?: boolean }) {
  const itemClass = (active: boolean) => `shrink-0 rounded-lg px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 ${active ? "bg-violet-300/10 font-medium text-violet-200" : "text-slate-500 hover:bg-[#171827] hover:text-slate-200"}`;
  return <div className="border-b border-[#252C40] bg-[#0c0f19] px-5 py-4 lg:hidden"><div className="flex items-center justify-between gap-3"><Link href="/" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"><span className="text-[15px] font-semibold tracking-[-0.02em] text-white">Threat<span className="text-violet-300">Lens</span></span></Link><div className="flex items-center gap-2">{demo ? <DemoBadge /> : null}<Link href="/#scan" className="rounded-lg bg-violet-500 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">New scan</Link></div></div><nav className="mt-4 flex gap-2 overflow-x-auto" aria-label="Mobile dashboard navigation"><Link href="/dashboard" aria-current={activeSection === "overview" ? "page" : undefined} className={itemClass(activeSection === "overview")}>Overview</Link><Link href="/findings" aria-current={activeSection === "findings" ? "page" : undefined} className={itemClass(activeSection === "findings")}>Findings</Link><Link href="/scan-history" aria-current={activeSection === "history" ? "page" : undefined} className={itemClass(activeSection === "history")}>Scan history</Link></nav></div>;
}

type SummaryCardProps = { label: string; value: string | number; helper: React.ReactNode; tone: "violet" | "red" | "teal" | "amber"; icon: React.ReactNode };
export function SummaryCard({ label, value, helper, tone, icon }: SummaryCardProps) {
  const tones = { violet: "text-violet-300 bg-violet-300/10", red: "text-red-300 bg-red-300/10", teal: "text-teal-300 bg-teal-300/10", amber: "text-amber-300 bg-amber-300/10" };
  return <article className="rounded-2xl border border-[#252C40] bg-[#111522] p-5"><div className="flex items-start justify-between gap-4"><p className="text-xs font-medium text-slate-500">{label}</p><span className={`grid size-8 place-items-center rounded-lg ${tones[tone]}`}>{icon}</span></div><p className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white">{value}</p><p className="mt-2 text-xs text-slate-500">{helper}</p></article>;
}

export function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 47;
  const offset = circumference - (score / 100) * circumference;
  return <div className="relative grid size-48 place-items-center" role="img" aria-label={`Demo security score: ${score} out of 100`}><svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 108 108" aria-hidden="true"><circle cx="54" cy="54" r="47" fill="none" stroke="#252C40" strokeWidth="7" /><circle cx="54" cy="54" r="47" fill="none" stroke="#2DD4BF" strokeLinecap="round" strokeWidth="7" strokeDasharray={circumference} strokeDashoffset={offset} /></svg><div className="text-center"><p className="text-5xl font-semibold tracking-[-0.07em] text-white">{score}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">out of 100</p></div></div>;
}

export function SeverityDistribution({ distribution }: { distribution: ReadonlyArray<{ label: string; count: number; color: string }> }) {
  const total = distribution.reduce((sum, item) => sum + item.count, 0);
  return <section className="rounded-2xl border border-[#252C40] bg-[#111522] p-6" aria-labelledby="severity-title"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Severity</p><h2 id="severity-title" className="mt-3 text-xl font-medium text-white">Finding distribution</h2></div><span className="text-xs text-slate-600">{total} total</span></div><div className="mt-8 flex h-3 overflow-hidden rounded-full bg-[#252C40]" aria-hidden="true">{distribution.map((item) => <span key={item.label} style={{ backgroundColor: item.color, width: `${(item.count / total) * 100}%` }} />)}</div><div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4">{distribution.map((item) => <div key={item.label} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 text-slate-400"><span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span><span className="font-medium text-white">{item.count}</span></div>)}</div></section>;
}

export function FindingsList({ findings }: { findings: ReadonlyArray<Finding> }) {
  return <section id="findings" className="rounded-2xl border border-[#252C40] bg-[#111522]" aria-labelledby="findings-title"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252C40] p-6"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Prioritize</p><h2 id="findings-title" className="mt-3 text-xl font-medium text-white">Recent findings</h2></div><Link href="/findings" className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">View all <ChevronIcon /></Link></div><div className="divide-y divide-[#252C40]">{findings.map((finding) => <article key={finding.id} className="p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${severityClasses[finding.severity]}`}>{finding.severity}</span><span className={`text-xs ${statusClasses[finding.status]}`}><span aria-hidden="true">•</span> {finding.status}</span></div><h3 className="mt-3 text-sm font-medium text-white">{finding.title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{finding.evidence}</p></div><div className="shrink-0 text-left text-xs text-slate-600 sm:text-right"><p>{finding.domain}</p><p className="mt-1">{finding.detected}</p></div></div></article>)}</div></section>;
}

export function ScanHistory({ scans }: { scans: ReadonlyArray<ScanRecord> }) {
  return <section id="history" className="rounded-2xl border border-[#252C40] bg-[#111522]" aria-labelledby="history-title"><div className="flex items-center justify-between gap-4 border-b border-[#252C40] p-6"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Activity</p><h2 id="history-title" className="mt-3 text-xl font-medium text-white">Recent scan history</h2></div><HistoryIcon className="size-5 text-slate-600" /></div><div className="divide-y divide-[#252C40]">{scans.map((scan) => <div key={scan.id} className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"><div><p className="text-sm font-medium text-white">{scan.domain}</p><p className="mt-1 text-xs text-slate-600">{scan.completedAt} <span aria-hidden="true">·</span> {scan.findings} findings</p></div><div className="flex items-center gap-4"><span className="text-right"><span className="block text-lg font-semibold text-teal-300">{scan.score}</span><span className="block text-[10px] uppercase tracking-[0.12em] text-slate-600">score</span></span><ChevronIcon className="size-4 text-slate-600" /></div></div>)}</div></section>;
}

export function EmptyState() {
  return <section className="rounded-2xl border border-dashed border-[#303953] bg-[#111522]/60 p-6" aria-labelledby="empty-state-title"><div className="grid size-10 place-items-center rounded-xl bg-[#171827] text-slate-500"><CheckIcon /></div><h2 id="empty-state-title" className="mt-5 text-base font-medium text-white">No scheduled scans</h2><p className="mt-2 text-sm leading-6 text-slate-500">There are no recurring assessments configured. Scheduled scans will appear here when available.</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-600"><PlusIcon /> Scheduling unavailable in demo</span></section>;
}

export function NewScanButton() { return <Link href="/#scan" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(139,92,246,0.18)] transition-colors hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"><PlusIcon /> New scan</Link>; }
export function ScoreChange() { return <span className="inline-flex items-center gap-1 text-xs text-teal-300"><ArrowUpIcon /> +6 points</span>; }
