import { createAuthState, getDefaultTab } from '../../src/auth.js';

describe('createAuthState', () => {
  test('starts logged out', () => {
    const auth = createAuthState();
    expect(auth.isLoggedIn()).toBe(false);
  });

  test('login sets state to true', () => {
    const auth = createAuthState();
    auth.login();
    expect(auth.isLoggedIn()).toBe(true);
  });

  test('logout sets state to false', () => {
    const auth = createAuthState();
    auth.login();
    auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
  });

  test('login is idempotent', () => {
    const auth = createAuthState();
    auth.login();
    auth.login();
    expect(auth.isLoggedIn()).toBe(true);
  });

  test('logout is idempotent', () => {
    const auth = createAuthState();
    auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
  });

  test('subscribe fires on login', () => {
    const auth = createAuthState();
    const calls = [];
    auth.subscribe((v) => calls.push(v));
    auth.login();
    expect(calls).toEqual([true]);
  });

  test('subscribe fires on logout', () => {
    const auth = createAuthState();
    const calls = [];
    auth.login();
    auth.subscribe((v) => calls.push(v));
    auth.logout();
    expect(calls).toEqual([false]);
  });

  test('subscribe does not fire when state unchanged', () => {
    const auth = createAuthState();
    const calls = [];
    auth.subscribe((v) => calls.push(v));
    auth.logout(); // already logged out
    expect(calls).toHaveLength(0);
  });

  test('unsubscribe stops notifications', () => {
    const auth = createAuthState();
    const calls = [];
    const unsub = auth.subscribe((v) => calls.push(v));
    unsub();
    auth.login();
    expect(calls).toHaveLength(0);
  });

  test('multiple subscribers all notified', () => {
    const auth = createAuthState();
    const a = [];
    const b = [];
    auth.subscribe((v) => a.push(v));
    auth.subscribe((v) => b.push(v));
    auth.login();
    expect(a).toEqual([true]);
    expect(b).toEqual([true]);
  });
});

describe('getDefaultTab', () => {
  test('returns ledger when logged in', () => {
    expect(getDefaultTab(true)).toBe('ledger');
  });

  test('returns ledger-gate when logged out', () => {
    expect(getDefaultTab(false)).toBe('ledger-gate');
  });
});
