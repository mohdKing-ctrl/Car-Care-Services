/* Demo login for the Care Line dashboards.
   Passwords are checked in the browser against salted SHA-256 hashes (js/accounts.js).
   This is fine for a college demo but it is NOT real security: a static website has no server to protect pages. */
const Auth = (function () {
  const KEY = 'careline_session';
  const LAST = 'careline_lastlogin';
  const TTL = 2 * 60 * 60 * 1000; // 2 hours

  const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');

  async function sha(salt, password) {
    if (!(window.crypto && crypto.subtle)) throw new Error('secure-context');
    const data = new TextEncoder().encode(salt + ':' + password);
    return hex(await crypto.subtle.digest('SHA-256', data));
  }

  // simple cosmetic brute-force slow-down: 5 wrong tries = 30 second pause
  function lockLeft() {
    try {
      const until = Number(sessionStorage.getItem('careline_lock') || 0);
      return Math.max(0, Math.ceil((until - Date.now()) / 1000));
    } catch (e) { return 0; }
  }
  function fail() {
    try {
      const n = Number(sessionStorage.getItem('careline_fails') || 0) + 1;
      sessionStorage.setItem('careline_fails', String(n));
      if (n >= 5) { sessionStorage.setItem('careline_lock', String(Date.now() + 30000)); sessionStorage.setItem('careline_fails', '0'); }
    } catch (e) {}
  }

  async function login(username, password) {
    const u = (username || '').trim().toLowerCase();
    const acc = ACCOUNTS.find((a) => a.user.toLowerCase() === u);
    const h = await sha(acc ? acc.salt : 'none', password || '');
    if (!acc || h !== acc.hash) { fail(); return null; }
    const s = { user: acc.user, role: acc.role, company: acc.company, name: acc.name, exp: Date.now() + TTL };
    try {
      sessionStorage.setItem(KEY, JSON.stringify(s));
      sessionStorage.setItem('careline_fails', '0');
      const last = JSON.parse(localStorage.getItem(LAST) || '{}');
      last[acc.user] = Date.now();
      localStorage.setItem(LAST, JSON.stringify(last));
    } catch (e) {}
    return s;
  }

  function session() {
    try {
      const s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (s && s.exp > Date.now()) return s;
    } catch (e) {}
    return null;
  }

  // Page guard: call at the top of a protected page. `roles` = 'admin' | 'company' | ['admin','company']
  function require(roles) {
    const list = [].concat(roles || []);
    const s = session();
    if (!s || (list.length && !list.includes(s.role))) {
      const here = location.pathname.split('/').pop() + location.search + location.hash;
      location.replace('login.html?next=' + encodeURIComponent(here));
      return null;
    }
    const gate = document.getElementById('gate');
    if (gate) gate.remove();
    return s;
  }

  function logout() {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    location.href = 'login.html';
  }

  function lastLogins() {
    try { return JSON.parse(localStorage.getItem(LAST) || '{}'); } catch (e) { return {}; }
  }

  return { login, session, require, logout, sha, hex, lockLeft, lastLogins };
})();
