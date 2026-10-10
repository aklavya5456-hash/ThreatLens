import type { AuthenticatedPrincipal } from "./contracts.ts";

export type ClerkSessionIdentity = {
  userId: string | null;
  orgId?: string | null;
};

/** Maps only verified Clerk session claims to the application's principal. */
export function mapClerkIdentity(identity: ClerkSessionIdentity): AuthenticatedPrincipal | null {
  if (!identity.userId) {
    return null;
  }

  return {
    subject: identity.userId,
    accountId: identity.userId,
  };
}

