import {
  MAX_DOMAIN_LENGTH,
  MAX_IDEMPOTENCY_KEY_LENGTH,
  type ScanRequest,
} from "./contracts.ts";
import { ScanApiError } from "./errors.ts";

const DOMAIN_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const TOP_LEVEL_DOMAIN = /^[a-z0-9-]{2,63}$/i;

export function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

export function isValidDomain(value: string): boolean {
  const domain = normalizeDomain(value);
  if (domain.length === 0 || domain.length > MAX_DOMAIN_LENGTH || domain.includes("/") || domain.includes(":")) {
    return false;
  }

  const labels = domain.split(".");
  return labels.length >= 2 && labels.every((label) => label.length <= 63 && DOMAIN_LABEL.test(label)) && TOP_LEVEL_DOMAIN.test(labels.at(-1) ?? "");
}

export function parseScanRequest(input: unknown): ScanRequest {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ScanApiError("INVALID_REQUEST", "The scan request is invalid.", 400);
  }

  const body = input as Record<string, unknown>;
  if (typeof body.domain !== "string") {
    throw new ScanApiError("INVALID_DOMAIN", "The scan request is invalid.", 400);
  }

  const domain = normalizeDomain(body.domain);
  if (!isValidDomain(domain)) {
    throw new ScanApiError("INVALID_DOMAIN", "The scan request is invalid.", 400);
  }

  if (typeof body.authorizationConfirmed !== "boolean") {
    throw new ScanApiError("AUTHORIZATION_REQUIRED", "Authorization is required before an assessment can be requested.", 403);
  }

  if (!body.authorizationConfirmed) {
    throw new ScanApiError("AUTHORIZATION_REQUIRED", "Authorization is required before an assessment can be requested.", 403);
  }

  if (body.idempotencyKey !== undefined && (typeof body.idempotencyKey !== "string" || body.idempotencyKey.length > MAX_IDEMPOTENCY_KEY_LENGTH)) {
    throw new ScanApiError("INVALID_REQUEST", "The scan request is invalid.", 400);
  }

  return {
    domain,
    authorizationConfirmed: true,
    ...(typeof body.idempotencyKey === "string" ? { idempotencyKey: body.idempotencyKey } : {}),
  };
}
