import assert from "node:assert/strict";
import test from "node:test";
import { parseScanRequest, isValidDomain, normalizeDomain } from "./validation.ts";
import { ScanApiError, serializeApiError } from "./errors.ts";

test("normalizes valid domains and removes one trailing dot", () => {
  assert.equal(normalizeDomain("  Example.COM. "), "example.com");
  assert.equal(isValidDomain("example.com"), true);
  assert.equal(isValidDomain("https://example.com"), false);
});

test("requires an authorization attestation in the request shape", () => {
  assert.throws(() => parseScanRequest({ domain: "example.com" }), (error: unknown) => error instanceof ScanApiError && error.code === "AUTHORIZATION_REQUIRED");
  assert.throws(() => parseScanRequest({ domain: "example.com", authorizationConfirmed: false }), (error: unknown) => error instanceof ScanApiError && error.code === "AUTHORIZATION_REQUIRED");
});

test("serializes stable public API errors without internal details", () => {
  const body = serializeApiError(new ScanApiError("INVALID_DOMAIN", "The scan request is invalid.", 400), "req-1");
  assert.deepEqual(body, { error: { code: "INVALID_DOMAIN", message: "The scan request is invalid." }, requestId: "req-1" });
});
