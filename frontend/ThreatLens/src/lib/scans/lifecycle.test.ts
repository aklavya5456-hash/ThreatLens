import assert from "node:assert/strict";
import test from "node:test";
import { assertTransition, canTransition } from "./lifecycle.ts";

test("allows only forward scan lifecycle transitions", () => {
  assert.equal(canTransition("queued", "running"), true);
  assert.equal(canTransition("running", "completed"), true);
  assert.equal(canTransition("running", "failed"), true);
  assert.equal(canTransition("completed", "running"), false);
  assert.throws(() => assertTransition("failed", "queued"), /lifecycle transition is invalid/);
});
