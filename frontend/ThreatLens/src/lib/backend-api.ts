export type BackendFinding = {
  check_name: string;
  status: "PASS" | "FAIL" | "ERROR" | "UNKNOWN" | string;
  severity: "info" | "low" | "medium" | "high" | "critical" | string;
  evidence: Record<string, unknown>;
  created_at: string;
};

export type BackendScan = {
  id: string;
  hostname: string;
  status: "queued" | "running" | "completed" | "error";
  authorization_confirmed: boolean;
  created_at: string;
  findings: BackendFinding[];
  score: number | null;
  risk: "low" | "moderate" | "high" | "critical" | null;
};

export type BackendHistoryItem = Pick<BackendScan, "id" | "hostname" | "status" | "created_at" | "score" | "risk">;

export type FindingAnalysis = {
  finding_reference: string;
  check_name: string;
  status: string;
  severity: string;
  analysis_available: boolean;
  title: string;
  observed_evidence: Record<string, unknown>;
  establishes: string;
  why_it_matters: string;
  likely_cause: string;
  cause_is_hypothesis: boolean;
  confidence: "high" | "medium" | "low" | "none";
  remediation: string[];
  verification: string[];
  limitations: string[];
  unavailable_reason: string | null;
  explanation_en: string;
  explanation_hi: string;
  remediation_en: string[];
  remediation_hi: string[];
  verification_en: string[];
  verification_hi: string[];
};

export type AnalysisResponse = {
  scan_id: string;
  generated_at: string;
  analyses: FindingAnalysis[];
};

export type HistoryResponse = {
  items: BackendHistoryItem[];
  limit: number;
  offset: number;
  total: number;
};

const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${backendBaseUrl}${path}`, {
      ...init,
      headers: { ...(init?.body ? { "content-type": "application/json" } : {}), ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new Error("The ThreatLens backend is unavailable. Start the backend and try again.");
  }

  if (!response.ok) {
    let message = `The backend request failed (${response.status}).`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // Keep the status-based message when the error body is not JSON.
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export function checkBackendHealth(): Promise<{ status: string; service: string }> {
  return request("/api/health");
}

export function createBackendScan(hostname: string): Promise<BackendScan> {
  return request("/api/scans", {
    method: "POST",
    body: JSON.stringify({ hostname, authorization_confirmed: true }),
  });
}

export function runBackendScan(scanId: string): Promise<BackendScan> {
  return request(`/api/scans/${encodeURIComponent(scanId)}/run`, { method: "POST" });
}

export function getBackendScan(scanId: string): Promise<BackendScan> {
  return request(`/api/scans/${encodeURIComponent(scanId)}`);
}

export function getBackendAnalysis(scanId: string): Promise<AnalysisResponse> {
  return request(`/api/scans/${encodeURIComponent(scanId)}/analysis`);
}

export function getBackendHistory(limit = 20, offset = 0): Promise<HistoryResponse> {
  return request(`/api/scans?limit=${limit}&offset=${offset}`);
}

export async function downloadBackendReport(scanId: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${backendBaseUrl}/api/scans/${encodeURIComponent(scanId)}/report`, { cache: "no-store" });
  } catch {
    throw new Error("The report service is unavailable. Try again later.");
  }
  if (!response.ok) {
    let message = `The report request failed (${response.status}).`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // Keep the status-based message when the error body is not JSON.
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `threatlens-report-${scanId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

