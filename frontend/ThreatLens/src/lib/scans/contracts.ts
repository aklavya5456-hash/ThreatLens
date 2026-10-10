export const SCAN_REQUEST_BODY_LIMIT_BYTES = 4_096;
export const MAX_DOMAIN_LENGTH = 253;
export const MAX_IDEMPOTENCY_KEY_LENGTH = 128;

export type ScanStatus = "queued" | "running" | "completed" | "failed";
export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";
export type FindingConfidence = "low" | "medium" | "high";

export type ScanRequest = {
  domain: string;
  authorizationConfirmed: boolean;
  idempotencyKey?: string;
};

export type AuthenticatedPrincipal = {
  subject: string;
  accountId: string;
};

export type ScanFailure = {
  code: string;
  message: string;
};

export type Finding = {
  id: string;
  scanId: string;
  severity: FindingSeverity;
  title: string;
  evidence: string;
  confidence?: FindingConfidence;
  remediation?: string;
  detectedAt: string;
};

export type ScanSummary = {
  score: number;
  findingCount: number;
  criticalFindingCount: number;
};

export type ScanRecord = {
  id: string;
  domain: string;
  status: ScanStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  failure?: ScanFailure;
  resultSummary?: ScanSummary;
};

export type ScanResult = {
  scanId: string;
  domain: string;
  completedAt: string;
  score: number;
  findings: ReadonlyArray<Finding>;
};

export type ApiErrorCode =
  | "MALFORMED_JSON"
  | "REQUEST_TOO_LARGE"
  | "INVALID_REQUEST"
  | "INVALID_DOMAIN"
  | "AUTHENTICATION_REQUIRED"
  | "AUTHENTICATION_INVALID"
  | "AUTHORIZATION_REQUIRED"
  | "AUTHORIZATION_UNVERIFIED"
  | "UNSAFE_TARGET"
  | "SCANNER_UNAVAILABLE"
  | "INVALID_SCAN_TRANSITION"
  | "INTERNAL_ERROR";

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
  requestId: string;
};

export type ApiSuccess<T> = {
  data: T;
  requestId: string;
};
