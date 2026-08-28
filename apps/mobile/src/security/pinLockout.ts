/**
 * Rate limiting for the caregiver PIN.
 *
 * The PIN is a barrier against a confused or curious patient wandering
 * into settings, not a secret store — a four-digit code with a fixed salt
 * is one of ten thousand precomputable hashes and should never be
 * described as security. What it does need is to make repeated guessing
 * tedious without ever destroying data or permanently locking the
 * caregiver out of their own device.
 *
 * State is deliberately in-memory. Persisting it would mean a stuck
 * lockout could survive a restart, which turns an annoyance into a bricked
 * bedside device; a relaunch clearing the delay is the right trade for a
 * barrier of this kind.
 */
export interface PinLockout {
  failedAttempts: number;
  /** Epoch ms at which entry is allowed again. */
  lockedUntil: number;
}

/** Mistakes allowed before any delay applies. */
const FREE_ATTEMPTS = 2;
const BASE_DELAY_MS = 15_000;
const MAX_DELAY_MS = 15 * 60_000;

export function emptyLockout(): PinLockout {
  return { failedAttempts: 0, lockedUntil: 0 };
}

/** Delay applied after `failedAttempts` wrong entries. */
function delayFor(failedAttempts: number): number {
  const over = failedAttempts - FREE_ATTEMPTS;
  if (over <= 0) return 0;
  // 15s, 30s, 60s, 2m, 4m … capped, so it always expires.
  return Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** (over - 1));
}

export function registerFailure(state: PinLockout, now: number): PinLockout {
  const failedAttempts = state.failedAttempts + 1;
  return {
    failedAttempts,
    lockedUntil: now + delayFor(failedAttempts),
  };
}

export function lockoutRemainingMs(state: PinLockout, now: number): number {
  return Math.max(0, state.lockedUntil - now);
}
