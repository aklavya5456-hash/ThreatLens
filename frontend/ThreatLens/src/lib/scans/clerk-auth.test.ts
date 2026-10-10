import assert from "node:assert/strict";
import test from "node:test";
import { mapClerkIdentity } from "./clerk-principal.ts";

test("maps a verified individual Clerk user to a provisional principal", () => {
  assert.deepEqual(mapClerkIdentity({ userId: "user_123", orgId: null }), {
    subject: "user_123",
    accountId: "user_123",
  });
});

test("does not create a principal when Clerk has no authenticated user", () => {
  assert.equal(mapClerkIdentity({ userId: null, orgId: null }), null);
});
