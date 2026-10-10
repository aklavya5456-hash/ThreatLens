import type { AuthenticatedPrincipal } from "./contracts.ts";
import { ScanApiError } from "./errors.ts";

export type AuthenticationProvider = (request: Request) => Promise<unknown>;

export function isAuthenticatedPrincipal(value: unknown): value is AuthenticatedPrincipal {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const principal = value as Record<string, unknown>;
  return typeof principal.subject === "string" && principal.subject.length > 0 && principal.subject.length <= 256 && typeof principal.accountId === "string" && principal.accountId.length > 0 && principal.accountId.length <= 256;
}

export async function requireAuthenticatedPrincipal(provider: AuthenticationProvider, request: Request): Promise<AuthenticatedPrincipal> {
  let identity: unknown;
  try {
    identity = await provider(request);
  } catch {
    throw new ScanApiError("AUTHENTICATION_INVALID", "Authentication could not be verified.", 401);
  }

  if (identity === null || identity === undefined) {
    throw new ScanApiError("AUTHENTICATION_REQUIRED", "Authentication is required.", 401);
  }

  if (!isAuthenticatedPrincipal(identity)) {
    throw new ScanApiError("AUTHENTICATION_INVALID", "Authentication could not be verified.", 401);
  }

  return identity;
}

export const unavailableAuthenticationProvider: AuthenticationProvider = async () => null;

