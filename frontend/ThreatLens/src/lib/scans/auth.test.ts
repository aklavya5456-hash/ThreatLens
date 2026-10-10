import assert from "node:assert/strict";
import test from "node:test";
import { isAuthenticatedPrincipal, requireAuthenticatedPrincipal } from "./auth.ts";
import { ScanApiError } from "./errors.ts";

const request = new Request("https://threatlens.test/api/scans");

test("rejects missing identity with a consistent 401 error", async () => {
  await assert.rejects(() => requireAuthenticatedPrincipal(async () => null, request), (error: unknown) => error instanceof ScanApiError && error.code === "AUTHENTICATION_REQUIRED" && error.status === 401);
});

test("rejects invalid provider identity with a consistent 401 error", async () => {
  await assert.rejects(() => requireAuthenticatedPrincipal(async () => ({ subject: "" }), request), (error: unknown) => error instanceof ScanApiError && error.code === "AUTHENTICATION_INVALID" && error.status === 401);
  assert.equal(isAuthenticatedPrincipal({ subject: "user-1", accountId: "account-1" }), true);
  assert.equal(isAuthenticatedPrincipal({ subject: "user-1" }), false);
});

