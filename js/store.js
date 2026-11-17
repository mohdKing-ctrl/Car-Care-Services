/* Companies added by the admin, and password changes.
   Saved in this browser (localStorage) and merged into PROVIDERS (js/data.js) and ACCOUNTS (js/accounts.js)
   on every page that loads this file, so a new company appears on the website, can log in, and gets its own dashboard. */
const Store = (function () {
  const CO = 'careline_custom_companies';
  const PW = 'careline_pw_overrides';

  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

  function companies() { return read(CO, []); }

  function apply() {
    const list = companies();
    if (typeof PROVIDERS !== 'undefined') {
      list.forEach((c) => { if (!PROVIDERS.some((p) => p.id === c.provider.id)) PROVIDERS.push(c.provider); });
    }
    if (typeof ACCOUNTS !== 'undefined') {
      list.forEach((c) => { if (!ACCOUNTS.some((a) => a.user === c.account.user)) ACCOUNTS.push(c.account); });
      const ov = read(PW, {});
      ACCOUNTS.forEach((a) => { if (ov[a.user]) Object.assign(a, ov[a.user]); });
    }
  }

  function addCompany(provider, account) {
    const list = companies();
    list.push({ provider, account, created: Date.now() });
    const ok = write(CO, list);
    apply();
    return ok;
  }

  function removeCompany(id) {
    write(CO, companies().filter((c) => c.provider.id !== id));
    const ov = read(PW, {}); delete ov[id]; write(PW, ov);
    if (typeof PROVIDERS !== 'undefined') { const i = PROVIDERS.findIndex((p) => p.id === id); if (i > -1) PROVIDERS.splice(i, 1); }
    if (typeof ACCOUNTS !== 'undefined') { const i = ACCOUNTS.findIndex((a) => a.user === id); if (i > -1) ACCOUNTS.splice(i, 1); }
  }

  function setPassword(user, salt, hash, pw) {
    const ov = read(PW, {});
    ov[user] = { salt, hash, pw };
    write(PW, ov);
    apply();
  }

  const isCustom = (id) => companies().some((c) => c.provider.id === id);

  apply();
  return { companies, addCompany, removeCompany, setPassword, isCustom, apply };
})();
