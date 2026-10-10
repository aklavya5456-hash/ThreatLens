import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

test("the unused legacy scan route is removed", () => {
  assert.equal(existsSync(resolve(process.cwd(), "src/app/api/scans/route.ts")), false);
});
