import type { AuthenticatedPrincipal, ScanRecord, ScanRequest } from "./contracts.ts";
import { isAuthenticatedPrincipal } from "./auth.ts";
import { ScanApiError } from "./errors.ts";
import { assertSafeTarget, type DnsResolver } from "./ssrf-policy.ts";
import { parseScanRequest } from "./validation.ts";

export type AuthorizationVerifier = (principal: AuthenticatedPrincipal, request: ScanRequest) => Promise<boolean>;

export type ScanEnqueuer = (request: ScanRequest) => Promise<ScanRecord>;

export type ScanServiceDependencies = {
  verifyAuthorization: AuthorizationVerifier;
  resolveDns: DnsResolver;
  enqueue: ScanEnqueuer;
};

export async function requestScan(input: unknown, principal: AuthenticatedPrincipal | null | undefined, dependencies: ScanServiceDependencies): Promise<ScanRecord> {
  if (principal === null || principal === undefined) {
    throw new ScanApiError("AUTHENTICATION_REQUIRED", "Authentication is required.", 401);
  }
  if (!isAuthenticatedPrincipal(principal)) {
    throw new ScanApiError("AUTHENTICATION_INVALID", "Authentication could not be verified.", 401);
  }

  const request = parseScanRequest(input);
  if (!(await dependencies.verifyAuthorization(principal, request))) {
    throw new ScanApiError("AUTHORIZATION_UNVERIFIED", "Authorization could not be verified for this assessment.", 403);
  }

  await assertSafeTarget(request.domain, dependencies.resolveDns);
  return dependencies.enqueue(request);
}

export function unavailableScanService(): ScanServiceDependencies {
  return {
    verifyAuthorization: async () => false,
    resolveDns: async () => [],
    enqueue: async () => {
      throw new ScanApiError("SCANNER_UNAVAILABLE", "Scanning is not connected yet. No scan was started.", 503);
    },
  };
}
