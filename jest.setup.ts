/**
 * Global test setup.
 *
 * Deliberately minimal: these tests exist to exercise the app's own
 * reliability logic, so native modules are stubbed per-test by the suite
 * that cares about them rather than globally here. A global mock would
 * hide exactly the failures these tests are meant to catch.
 */
export {};
