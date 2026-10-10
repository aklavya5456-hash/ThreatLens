import { auth } from "@clerk/nextjs/server";
import type { AuthenticationProvider } from "./auth.ts";
import { mapClerkIdentity } from "./clerk-principal.ts";

export const clerkAuthenticationProvider: AuthenticationProvider = async () => {
  const session = await auth();
  return mapClerkIdentity({ userId: session.userId, orgId: session.orgId });
};
