import assert from "node:assert/strict";
import test from "node:test";
import { ScanApiError } from "./errors.ts";
import { requestScan } from "./service.ts";

const principal = { subject: "user-1", accountId: "account-1" };

test("does not enqueue when authorization cannot be verified", async () => {
  let enqueueCalled = false;
  await assert.rejects(() => requestScan({ domain: "example.com", authorizationConfirmed: true }, principal, {
    verifyAuthorization: async () => false,
    resolveDns: async () => ["93.184.216.34"],
    enqueue: async () => { enqueueCalled = true; throw new Error("must not run"); },
  }), { code: "AUTHORIZATION_UNVERIFIED" });
  assert.equal(enqueueCalled, false);
});

test("passes normalized, DNS-safe requests to an injected scanner boundary", async () => {
  const scan = await requestScan({ domain: " Example.COM ", authorizationConfirmed: true }, principal, {
    verifyAuthorization: async (verifiedPrincipal) => { assert.deepEqual(verifiedPrincipal, principal); return true; },
    resolveDns: async (domain) => { assert.equal(domain, "example.com"); return ["93.184.216.34"]; },
    enqueue: async (request) => ({ id: "scan-1", domain: request.domain, status: "queued", createdAt: "2026-10-09T00:00:00.000Z" }),
  });
  assert.equal(scan.status, "queued");
  assert.equal(scan.domain, "example.com");
});

test("fails closed before validation or enqueue when identity is missing", async () => {
  let enqueueCalled = false;
  await assert.rejects(() => requestScan({ domain: "example.com", authorizationConfirmed: true, userId: "forged-user" }, null, {
    verifyAuthorization: async () => true,
    resolveDns: async () => ["93.184.216.34"],
    enqueue: async () => { enqueueCalled = true; throw new Error("must not run"); },
  }), (error: unknown) => error instanceof ScanApiError && error.code === "AUTHENTICATION_REQUIRED" && error.status === 401);
  assert.equal(enqueueCalled, false);
});

test("rejects an existing unauthorized scan request for an authenticated principal", async () => {
  await assert.rejects(() => requestScan({ domain: "example.com", authorizationConfirmed: false }, principal, {
    verifyAuthorization: async () => true,
    resolveDns: async () => ["93.184.216.34"],
    enqueue: async () => { throw new Error("must not run"); },
  }), (error: unknown) => error instanceof ScanApiError && error.code === "AUTHORIZATION_REQUIRED" && error.status === 403);
});
