/**
 * Auth state management for sinhon.life.
 * Mirrors the NavCtx loggedIn/setLoggedIn logic from index.html.
 */

export function createAuthState() {
  let loggedIn = false;
  const listeners = [];

  function notify() {
    for (const fn of listeners) fn(loggedIn);
  }

  return {
    isLoggedIn() {
      return loggedIn;
    },

    login() {
      if (!loggedIn) {
        loggedIn = true;
        notify();
      }
    },

    logout() {
      if (loggedIn) {
        loggedIn = false;
        notify();
      }
    },

    subscribe(fn) {
      listeners.push(fn);
      return () => {
        const i = listeners.indexOf(fn);
        if (i !== -1) listeners.splice(i, 1);
      };
    },
  };
}

export function getDefaultTab(loggedIn) {
  return loggedIn ? 'ledger' : 'ledger-gate';
}
