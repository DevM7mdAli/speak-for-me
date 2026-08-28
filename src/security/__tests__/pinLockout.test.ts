import { emptyLockout, lockoutRemainingMs, registerFailure } from '../pinLockout';

/**
 * The PIN keeps a confused or curious patient out of caregiver settings.
 * It is not protecting secrets, so the response to repeated failures is a
 * delay that costs a guesser time — never a wipe, which would destroy the
 * patient's own phrases, and never a permanent lock, which would strand
 * the caregiver.
 */
describe('pin lockout', () => {
  const t0 = 1_000_000;

  it('does not delay the first couple of mistakes', () => {
    let state = emptyLockout();
    state = registerFailure(state, t0);
    expect(lockoutRemainingMs(state, t0)).toBe(0);

    state = registerFailure(state, t0);
    expect(lockoutRemainingMs(state, t0)).toBe(0);
  });

  it('starts delaying once mistakes look like guessing', () => {
    let state = emptyLockout();
    for (let i = 0; i < 3; i++) state = registerFailure(state, t0);
    expect(lockoutRemainingMs(state, t0)).toBeGreaterThan(0);
  });

  it('escalates the delay as attempts continue', () => {
    let state = emptyLockout();
    for (let i = 0; i < 3; i++) state = registerFailure(state, t0);
    const shortDelay = lockoutRemainingMs(state, t0);

    for (let i = 0; i < 3; i++) state = registerFailure(state, t0);
    expect(lockoutRemainingMs(state, t0)).toBeGreaterThan(shortDelay);
  });

  it('always expires, so a caregiver is never permanently locked out', () => {
    let state = emptyLockout();
    for (let i = 0; i < 20; i++) state = registerFailure(state, t0);

    const remaining = lockoutRemainingMs(state, t0);
    expect(remaining).toBeGreaterThan(0);
    expect(lockoutRemainingMs(state, t0 + remaining)).toBe(0);
  });

  it('counts down as real time passes', () => {
    let state = emptyLockout();
    for (let i = 0; i < 3; i++) state = registerFailure(state, t0);

    const full = lockoutRemainingMs(state, t0);
    expect(lockoutRemainingMs(state, t0 + 1_000)).toBe(full - 1_000);
  });

  it('clears completely on a correct entry', () => {
    let state = emptyLockout();
    for (let i = 0; i < 5; i++) state = registerFailure(state, t0);
    expect(lockoutRemainingMs(emptyLockout(), t0)).toBe(0);
  });
});
