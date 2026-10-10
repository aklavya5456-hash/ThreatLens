export type Severity = "Critical" | "High" | "Medium" | "Low";
export type FindingStatus = "Open" | "In review" | "Resolved";
export type ScanStatus = "Completed" | "Running" | "Failed";

export type Finding = {
  id: string;
  severity: Severity;
  title: string;
  evidence: string;
  status: FindingStatus;
  domain: string;
  detected: string;
};

export type DetailedFinding = Finding & {
  likelyCause: string;
  confidence: string;
  remediation: string;
  verificationSteps: ReadonlyArray<string>;
};

export type ScanRecord = {
  id: string;
  domain: string;
  score: number;
  findings: number;
  criticalFindings: number;
  status: ScanStatus;
  scannedAt: string;
  completedAt: string;
};

export const demoDashboard = {
  score: 78,
  scoreChange: "+6",
  criticalFindings: 1,
  activeScans: 0,
  totalFindings: 8,
  severityDistribution: [
    { label: "Critical", count: 1, color: "#F87171" },
    { label: "High", count: 2, color: "#FB923C" },
    { label: "Medium", count: 3, color: "#FBBF24" },
    { label: "Low", count: 2, color: "#2DD4BF" },
  ],
  findings: [
    {
      id: "finding-1",
      severity: "Critical",
      title: "Admin panel exposed without additional protection",
      evidence: "The /admin route responds publicly and does not show an additional access control layer.",
      status: "Open",
      domain: "acme-workshop.com",
      detected: "2 hours ago",
      likelyCause: "The administrative route was deployed without a separate access control layer or network restriction.",
      confidence: "High",
      remediation: "Restrict the admin surface to authorized users through your application authentication and, where appropriate, an additional network or identity-provider policy.",
      verificationSteps: [
        "Confirm unauthenticated requests receive a redirect or 401/403 response.",
        "Verify authorized users can still reach the admin route.",
        "Run a follow-up assessment after the access policy is deployed.",
      ],
    },
    {
      id: "finding-2",
      severity: "High",
      title: "Content security policy is not configured",
      evidence: "Responses do not include a Content-Security-Policy header.",
      status: "In review",
      domain: "acme-workshop.com",
      detected: "2 hours ago",
      likelyCause: "The application response configuration does not include a Content-Security-Policy header.",
      confidence: "High",
      remediation: "Start with a reporting policy, review required scripts and connections, then enforce a least-privilege Content-Security-Policy at the edge or application server.",
      verificationSteps: [
        "Deploy the policy in report-only mode and review violations.",
        "Move approved sources into an enforcing policy.",
        "Confirm the header is present on representative HTML responses.",
      ],
    },
    {
      id: "finding-3",
      severity: "Medium",
      title: "Strict transport security header is missing",
      evidence: "The Strict-Transport-Security response header was not observed on the homepage.",
      status: "Open",
      domain: "acme-workshop.com",
      detected: "2 hours ago",
      likelyCause: "The HTTPS response configuration does not send a Strict-Transport-Security header.",
      confidence: "Medium",
      remediation: "After confirming HTTPS works across the domain and subdomains, add Strict-Transport-Security with an appropriate max-age and consider includeSubDomains.",
      verificationSteps: [
        "Confirm every relevant hostname is available over HTTPS.",
        "Add the header with a cautious max-age first.",
        "Check the header on the homepage and authenticated routes.",
      ],
    },
    {
      id: "finding-4",
      severity: "Low",
      title: "Server version is disclosed in response headers",
      evidence: "The Server header includes a version string that could help fingerprint the stack.",
      status: "Resolved",
      domain: "store.acme-workshop.com",
      detected: "Yesterday",
      likelyCause: "The web server is returning its product and version in the Server response header.",
      confidence: "High",
      remediation: "Configure the web server or reverse proxy to minimize identifying response headers and keep the underlying software patched.",
      verificationSteps: [
        "Update the server or proxy header configuration.",
        "Inspect responses from each public entry point.",
        "Confirm patching and version management remain in place.",
      ],
    },
  ] satisfies DetailedFinding[],
  scanHistory: [
    { id: "scan-1", domain: "acme-workshop.com", score: 78, findings: 8, criticalFindings: 1, status: "Completed", scannedAt: "Jun 18, 2026 · 09:42", completedAt: "Today, 09:42" },
    { id: "scan-2", domain: "acme-workshop.com", score: 72, findings: 10, criticalFindings: 2, status: "Completed", scannedAt: "Jun 12, 2026 · 14:18", completedAt: "Jun 12, 2026" },
    { id: "scan-3", domain: "store.acme-workshop.com", score: 84, findings: 3, criticalFindings: 0, status: "Completed", scannedAt: "Jun 05, 2026 · 11:06", completedAt: "Jun 05, 2026" },
  ] satisfies ScanRecord[],
} as const;

export const demoFindings = demoDashboard.findings satisfies ReadonlyArray<DetailedFinding>;

export const demoScanHistory = [
  ...demoDashboard.scanHistory,
  { id: "scan-4", domain: "checkout.acme-workshop.com", score: 0, findings: 0, criticalFindings: 0, status: "Running", scannedAt: "Jun 18, 2026 · 10:12", completedAt: "In progress" },
  { id: "scan-5", domain: "legacy.acme-workshop.com", score: 0, findings: 0, criticalFindings: 0, status: "Failed", scannedAt: "Jun 03, 2026 · 16:27", completedAt: "Scan failed" },
] satisfies ReadonlyArray<ScanRecord>;
