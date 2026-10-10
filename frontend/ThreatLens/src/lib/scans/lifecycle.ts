import type { ScanStatus } from "./contracts.ts";
import { ScanApiError } from "./errors.ts";

const transitions: Record<ScanStatus, ReadonlyArray<ScanStatus>> = {
  queued: ["running", "failed"],
  running: ["completed", "failed"],
  completed: [],
  failed: [],
};

export function canTransition(from: ScanStatus, to: ScanStatus): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(from: ScanStatus, to: ScanStatus): void {
  if (!canTransition(from, to)) {
    throw new ScanApiError("INVALID_SCAN_TRANSITION", "The scan lifecycle transition is invalid.", 409);
  }
}
