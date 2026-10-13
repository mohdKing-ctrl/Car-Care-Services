(function () {
  'use strict';
  const S = Auth.session();
  if (!S || S.role !== 'admin') return;

  const D = Dash, esc = D.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const SEO_KEY = 'careline_seo_live';

  $('#who').textContent = S.name;
  $('#logout').addEventListener('click', Auth.logout);

  /* ---------- tabs ---------- */
  function showTab(name) {
    if (!$('#tab-' + name)) name = 'overview';
    $$('.tabpanel').forEach((p) => (p.hidden = p.id !== 'tab-' + name));
    $$('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
    try { history.replaceState(null, '', '#' + name); } catch (e) {}
    if (name === 'overview') renderOverview();
    if (name === 'seo') initSeo();
  }
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });

  /* ---------- overview ---------- */
  const KPI = [
    { key: 'visit', label: 'Website visits' },
    { key: 'imp', label: 'Company views', hint: 'Times a company card was shown' },
    { key: 'open', label: 'Profile opens', hint: '"View prices" clicks' },
    { key: 'call', label: 'Calls' },
    { key: 'wa', label: 'WhatsApp clicks' },
    { key: 'order', label: 'UTAS orders' }
  ];
  function renderOverview() {
    const days = +$('#period').value, sample = $('#useSample').checked;
    const cur = D.stats({ days, sample }), prev = D.stats({ days, offset: days, sample });
    $('#kpis').innerHTML = D.kpiRow(cur.total, prev.total, KPI);
    const live = Track.events().length;
    $('#sampleNote').innerHTML = sample
      ? 'Sample history is <b>simulated</b> for the demonstration. Live events recorded on this browser: <b>' + live + '</b>.'
      : 'Showing only live events recorded on this browser: <b>' + live + '</b>.';

    D.line($('#mainChart'), {
      title: 'Views and contact actions',
      sub: 'Company cards shown to visitors, and calls + WhatsApp clicks they made, per day',
      labels: cur.keys,
      series: [
        { name: 'Company views', color: D.C1, values: cur.daily.map((d) => d.imp) },
        { name: 'Contact actions', color: D.C2, values: cur.daily.map((d) => d.call + d.wa) }
      ]
    });

    const top = PROVIDERS.map((p) => ({ label: p.name, sub: p.govs.length > 2 ? p.govs.length + ' governorates' : p.govs.map(D.govName).join(', '), value: cur.byCompany[p.id].call + cur.byCompany[p.id].wa }))
      .sort((a, b) => b.value - a.value).slice(0, 8);
    D.bars($('#topCompanies'), { title: 'Top companies', sub: 'By calls + WhatsApp clicks', items: top });

    const svc = Object.keys(cur.bySvc).map((k) => ({ label: D.svcName(k), value: cur.bySvc[k] })).sort((a, b) => b.value - a.value);
    D.bars($('#topServices'), { title: 'Most clicked services', sub: 'Service "Book" clicks across all companies', items: svc });
  }
  $('#period').addEventListener('change', renderOverview);
  $('#useSample').addEventListener('change', () => { renderOverview(); renderCompanies(); renderOrders(); });

  /* ---------- companies ---------- */
  function renderCompanies() {
    const days = +$('#coPeriod').value, q = $('#coSearch').value.trim().toLowerCase();
    const st = D.stats({ days, sample: $('#useSample').checked });
    const rows = PROVIDERS.filter((p) => !q || (p.name + ' ' + p.nameAr + ' ' + p.govs.map(D.govName).join(' ')).toLowerCase().includes(q))
      .sort((a, b) => st.byCompany[b.id].imp - st.byCompany[a.id].imp);
    $('#coTable').innerHTML = '<div class="tbl-scroll"><table class="dt"><thead><tr><th>Company</th><th>Governorates</th><th class="num">Services</th><th class="num">Rating</th>' +
      '<th class="num">Views</th><th class="num">Opens</th><th class="num">Calls</th><th class="num">WhatsApp</th><th class="num">Service clicks</th><th class="num">Orders</th><th>Login</th></tr></thead><tbody>' +
      rows.map((p) => {
        const t = st.byCompany[p.id];
        return '<tr data-co="' + p.id + '" style="cursor:pointer"><td><div class="who"><div class="avatar' + (p.logo ? ' logo-av' : '') + '" style="' + (p.logo ? '' : 'background:' + p.color) + '">' +
          (p.logo ? '<img src="' + p.logo + '" alt="">' : p.initials) + '</div>' + esc(p.name) + (p.utas ? ' <span class="tag-s">UTAS partner</span>' : '') + '</div></td>' +
          '<td>' + esc(p.govs.map(D.govName).join(', ')) + '</td><td class="num">' + Object.keys(p.services).length + '</td><td class="num">★ ' + p.rating.toFixed(1) + '</td>' +
          '<td class="num">' + D.fmt(t.imp) + '</td><td class="num">' + D.fmt(t.open) + '</td><td class="num">' + D.fmt(t.call) + '</td><td class="num">' + D.fmt(t.wa) +
          '</td><td class="num">' + D.fmt(t.svc) + '</td><td class="num">' + D.fmt(t.order) + '</td><td><code>' + esc(p.id) + '</code></td></tr>';
      }).join('') + '</tbody></table></div>';
    renderCompanies.rows = rows; renderCompanies.st = st;
  }
  $('#coSearch').addEventListener('input', renderCompanies);
  $('#coPeriod').addEventListener('change', renderCompanies);
  $('#coCsv').addEventListener('click', () => {
    const st = renderCompanies.st, head = ['Company', 'Arabic name', 'Governorates', 'Phone', 'Rating', 'Reviews', 'Services', 'Views', 'Profile opens', 'Calls', 'WhatsApp', 'Service clicks', 'Orders', 'Login username'];
    D.csv([head].concat(renderCompanies.rows.map((p) => { const t = st.byCompany[p.id];
      return [p.name, p.nameAr, p.govs.map(D.govName).join('; '), D.fmtPhone(p.wa), p.rating, p.reviews, Object.keys(p.services).map(D.svcName).join('; '), t.imp, t.open, t.call, t.wa, t.svc, t.order, p.id]; })), 'care-line-companies.csv');
  });
  $('#coTable').addEventListener('click', (e) => { const tr = e.target.closest('[data-co]'); if (tr) openCompany(tr.dataset.co); });

  function openCompany(id) {
    const p = D.prov(id); if (!p) return;
    const sample = $('#useSample').checked;
    const st = D.stats({ days: 30, sample, company: id }), prev = D.stats({ days: 30, offset: 30, sample, company: id });
    const ords = D.orders({ company: id, sample, days: 90 }).slice(0, 8);
    const last = Auth.lastLogins()[p.id];
    $('#dBody').innerHTML =
      '<div class="card-top"><div class="avatar' + (p.logo ? ' logo-av' : '') + '" style="' + (p.logo ? '' : 'background:' + p.color) + '">' + (p.logo ? '<img src="' + p.logo + '" alt="">' : p.initials) + '</div>' +
      '<div><h3 id="dTitle">' + esc(p.name) + '</h3><div class="meta"><span>' + esc(p.nameAr) + '</span><span class="rate"><i>★</i> ' + p.rating.toFixed(1) + '</span><span>(' + p.reviews + ' reviews)</span>' + (p.utas ? '<span class="pill utas-pill">UTAS Partner</span>' : '') + '</div></div></div>' +
      '<div class="dgrid">' +
        '<div><span>Login username</span><code>' + esc(p.id) + '</code></div>' +
        '<div><span>Last login on this browser</span>' + (last ? D.when(last) : 'Never') + '</div>' +
        '<div><span>Phone / WhatsApp</span><a href="tel:+' + p.wa + '">' + D.fmtPhone(p.wa) + '</a></div>' +
        '<div><span>Working hours</span>' + (p.hours[0] === 0 && p.hours[1] === 24 ? '24 hours' : p.hours[0] + ':00 – ' + p.hours[1] + ':00') + ' · replies in ~' + p.reply + ' min</div>' +
        '<div><span>Governorates</span>' + esc(p.govs.map(D.govName).join(', ')) + '</div>' +
        '<div><span>Areas served</span>' + esc(p.areas.map((a) => a[0]).join(', ')) + '</div>' +
        '<div><span>Years in business</span>' + p.years + '</div>' +
        '<div><span>Description</span>' + esc(p.desc) + '</div>' +
      '</div>' +
      '<div class="mini-k">' + ['imp:Views', 'open:Profile opens', 'call:Calls', 'wa:WhatsApp', 'svc:Service clicks', 'order:Orders'].map((x) => { const [k, l] = x.split(':'); return '<div><b>' + D.fmt(st.total[k]) + '</b><span>' + l + ' · 30 days</span></div>'; }).join('') + '</div>' +
      '<div id="dChart"></div>' +
      '<h4 style="margin:18px 0 8px">Prices</h4><div class="tbl-scroll" style="max-height:220px"><table class="dt"><tbody>' +
        Object.keys(p.services).map((k) => '<tr><td>' + esc(D.svcName(k)) + '</td><td class="num">' + p.services[k].toFixed(3) + ' OMR</td><td class="num">' + D.fmt(st.bySvc[k] || 0) + ' clicks</td></tr>').join('') + '</tbody></table></div>' +
      '<h4 style="margin:18px 0 8px">Latest customers (UTAS orders)</h4>' + D.ordersTable(ords) +
      '<div class="row-d" style="margin-top:18px"><a class="btn btn-primary" href="portal.html?company=' + p.id + '">Open this company\'s dashboard</a>' +
      '<a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/' + p.wa + '">WhatsApp</a></div>';
    $('#dModal').hidden = false; document.body.style.overflow = 'hidden';
    D.line($('#dChart'), {
      title: 'Last 30 days', sub: 'Views and contact actions for this company', height: 200, labels: st.keys,
      series: [{ name: 'Views', color: D.C1, values: st.daily.map((d) => d.imp) }, { name: 'Contact actions', color: D.C2, values: st.daily.map((d) => d.call + d.wa) }]
    });
    $('#dClose').focus();
  }
  function closeModal() { $('#dModal').hidden = true; document.body.style.overflow = ''; }
  $('#dClose').addEventListener('click', closeModal);
  $('#dModal').addEventListener('click', (e) => { if (e.target === $('#dModal')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ---------- orders ---------- */
  $('#orCompany').innerHTML = '<option value="">All companies</option>' + PROVIDERS.map((p) => '<option value="' + p.id + '">' + esc(p.name) + '</option>').join('');
  function filteredOrders() {
    const q = $('#orSearch').value.trim().toLowerCase();
    return D.orders({ company: $('#orCompany').value || null, days: +$('#orPeriod').value, sample: $('#useSample').checked })
      .filter((o) => !q || (o.name + ' ' + o.phone).toLowerCase().includes(q));
  }
  function renderOrders() {
    const list = filteredOrders();
    $('#orTable').innerHTML = '<p class="note-s" style="margin-bottom:8px"><b>' + list.length + '</b> orders · est. value <b>' +
      list.reduce((s, o) => s + Number(o.total || 0), 0).toFixed(3) + ' OMR</b></p>' + D.ordersTable(list.slice(0, 300), { company: true });
  }
  ['orSearch', 'orCompany', 'orPeriod'].forEach((id) => $('#' + id).addEventListener(id === 'orSearch' ? 'input' : 'change', renderOrders));
  $('#orCsv').addEventListener('click', () => {
    D.csv([['Date', 'Customer', 'Phone', 'Role', 'UTAS branch', 'Services', 'Car brand', 'Company', 'Estimated price (OMR)', 'Source']].concat(filteredOrders().map((o) =>
      [new Date(o.t).toISOString().slice(0, 16).replace('T', ' '), o.name, o.phone, o.role, D.branchName(o.branch), (o.services || []).map(D.svcName).join('; '), o.brand || '', (D.prov(o.company) || {}).name || o.company, Number(o.total || 0).toFixed(3), o.sample ? 'sample' : 'live'])), 'care-line-orders.csv');
  });

  /* ---------- SEO text ---------- */
  const FALLBACK = {
    title: 'Care Line كير لاين | Car Wash & Car Service in Oman',
    description: 'Compare trusted car wash, oil change and car service companies in Oman that come to your home, office or campus. Book by call or WhatsApp.',
    keywords: 'car wash, oil change, car service, car care, UTAS students, WhatsApp',
    ogTitle: 'Care Line | Car wash & car service at your door in Oman',
    ogDescription: 'Compare trusted car wash and car service companies in Oman. They come to you. Book on WhatsApp.'
  };
  let seoSource = null, seoHtml = null, seoReady = false;
  const getSaved = () => { try { return JSON.parse(localStorage.getItem(SEO_KEY) || 'null'); } catch (e) { return null; } };

  async function loadSeoSource() {
    try {
      const r = await fetch('index.html', { cache: 'no-store' });
      if (!r.ok) throw new Error('x');
      seoHtml = await r.text();
      const doc = new DOMParser().parseFromString(seoHtml, 'text/html');
      const m = (sel) => { const el = doc.querySelector(sel); return el ? (el.getAttribute('content') || '') : ''; };
      seoSource = { title: (doc.title || '').trim(), description: m('meta[name="description"]'), keywords: m('meta[name="keywords"]'), ogTitle: m('meta[property="og:title"]'), ogDescription: m('meta[property="og:description"]') };
    } catch (e) { seoHtml = null; seoSource = Object.assign({}, FALLBACK); }
  }
  const FIELDS = [['sTitle', 'title', 'cTitle', 30, 60], ['sDesc', 'description', 'cDesc', 70, 160], ['sKeys', 'keywords', null], ['sOgTitle', 'ogTitle', 'cOgT', 0, 70], ['sOgDesc', 'ogDescription', 'cOgD', 0, 200]];

  function fillSeo(values) { FIELDS.forEach(([id, k]) => ($('#' + id).value = values[k] || '')); seoRefresh(); }
  function seoValues() { const v = {}; FIELDS.forEach(([id, k]) => (v[k] = $('#' + id).value.trim())); return v; }
  function seoRefresh() {
    const v = seoValues();
    FIELDS.forEach(([id, k, cid, min, max]) => {
      if (!cid) return;
      const n = v[k].length, c = $('#' + cid);
      c.textContent = n + ' / ' + max; c.className = 'cnt ' + (n >= min && n <= max && n > 0 ? 'ok' : 'bad');
    });
    const t = v.title.length > 60 ? v.title.slice(0, 59).trim() + '…' : v.title;
    const d = v.description.length > 160 ? v.description.slice(0, 159).trim() + '…' : v.description;
    $('#serp').innerHTML = '<div class="u">Care Line<small>yourname.github.io › careline</small></div><div class="t">' + esc(t || 'Page title') + '</div><div class="d">' + esc(d || 'Meta description') + '</div>';
    const saved = getSaved();
    const rows = [['Page title', 'title'], ['Meta description', 'description'], ['Keywords', 'keywords'], ['Share title (og:title)', 'ogTitle'], ['Share description (og:description)', 'ogDescription']];
    $('#liveTags').innerHTML = rows.map(([l, k]) => {
      const val = (saved && saved[k]) || seoSource[k] || '';
      return '<div><b>' + l + (saved && saved[k] ? ' · your saved text' : ' · from index.html') + '</b>' + (val ? esc(val) : '<i style="color:var(--muted)">not set</i>') + '</div>';
    }).join('');
  }
  async function initSeo() {
    if (!seoReady) {
      seoReady = true;
      await loadSeoSource();
      fillSeo(Object.assign({}, seoSource, getSaved() || {}));
      if (!seoHtml) { $('#seoMsg').hidden = false; $('#seoMsg').className = 'warnmsg'; $('#seoMsg').textContent = 'index.html could not be read here (open the dashboard from your website or a local server). Editing and saving still work.'; }
    }
  }
  FIELDS.forEach(([id]) => $('#' + id).addEventListener('input', () => { if (seoReady) seoRefresh(); }));
  $('#seoSave').addEventListener('click', () => {
    const v = seoValues();
    try { localStorage.setItem(SEO_KEY, JSON.stringify(v)); } catch (e) {}
    seoRefresh();
    const m = $('#seoMsg'); m.hidden = false; m.className = 'okmsg';
    m.textContent = 'Saved. Open the website: the tab title and the meta tags now use your text on this browser.';
  });
  $('#seoReset').addEventListener('click', () => {
    try { localStorage.removeItem(SEO_KEY); } catch (e) {}
    fillSeo(seoSource);
    const m = $('#seoMsg'); m.hidden = false; m.className = 'okmsg'; m.textContent = 'Reset. The website text from index.html is used again.';
  });

  function patchHead(html, v) {
    const q = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const setAttr = (re, val) => { html = html.replace(re, (m, a, b) => a + q(val) + b); };
    if (v.title) html = html.replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + q(v.title).replace(/&quot;/g, '"') + '</title>');
    if (v.description) setAttr(/(<meta name="description" content=")[^"]*(")/, v.description);
    if (v.keywords) {
      if (/<meta name="keywords"/.test(html)) setAttr(/(<meta name="keywords" content=")[^"]*(")/, v.keywords);
      else html = html.replace(/(<meta name="description"[^>]*>)/, (m) => m + '\n  <meta name="keywords" content="' + q(v.keywords) + '">');
    }
    if (v.ogTitle) { setAttr(/(<meta property="og:title" content=")[^"]*(")/, v.ogTitle); setAttr(/(<meta name="twitter:title" content=")[^"]*(")/, v.ogTitle); }
    if (v.ogDescription) { setAttr(/(<meta property="og:description" content=")[^"]*(")/, v.ogDescription); setAttr(/(<meta name="twitter:description" content=")[^"]*(")/, v.ogDescription); }
    return html;
  }
  $('#seoDl').addEventListener('click', () => {
    const m = $('#seoMsg'); m.hidden = false;
    if (!seoHtml) { m.className = 'warnmsg'; m.textContent = 'Could not read index.html here. Open the dashboard from your website or a local server.'; return; }
    const out = patchHead(seoHtml, seoValues());
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([out], { type: 'text/html;charset=utf-8' }));
    a.download = 'index.html'; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    m.className = 'okmsg'; m.textContent = 'Downloaded index.html with your text. Upload it to GitHub to replace the old file.';
  });

  /* ---------- accounts ---------- */
  function renderAccounts() {
    const last = Auth.lastLogins();
    $('#acTable').innerHTML = '<div class="tbl-scroll"><table class="dt"><thead><tr><th>Username</th><th>Role</th><th>Company</th><th>Last login on this browser</th></tr></thead><tbody>' +
      ACCOUNTS.map((a) => '<tr><td><code>' + esc(a.user) + '</code></td><td>' + esc(a.role) + '</td><td>' + esc(a.role === 'admin' ? 'All companies' : a.name) + '</td><td>' + (last[a.user] ? D.when(last[a.user]) : '–') + '</td></tr>').join('') + '</tbody></table></div>';
    $('#pwUser').innerHTML = ACCOUNTS.map((a) => '<option value="' + esc(a.user) + '">' + esc(a.user) + ' (' + esc(a.role) + ')</option>').join('');
  }
  $('#pwGo').addEventListener('click', async () => {
    const pw = $('#pwNew').value, out = $('#pwOut');
    out.hidden = false;
    if (pw.length < 8) { out.textContent = 'Please type a password with at least 8 characters.'; $('#pwCopy').hidden = true; return; }
    const acc = ACCOUNTS.find((a) => a.user === $('#pwUser').value);
    const salt = Auth.hex(crypto.getRandomValues(new Uint8Array(8)));
    const hash = await Auth.sha(salt, pw);
    out.textContent = JSON.stringify({ user: acc.user, role: acc.role, company: acc.company, name: acc.name, salt, hash }, null, 2);
    $('#pwCopy').hidden = false; $('#pwNew').value = '';
  });
  $('#pwCopy').addEventListener('click', async (e) => {
    try { await navigator.clipboard.writeText($('#pwOut').textContent); e.target.textContent = 'Copied ✓'; setTimeout(() => (e.target.textContent = 'Copy'), 1400); } catch (err) {}
  });
  $('#clearLive').addEventListener('click', () => {
    if (!confirm('Delete the visits, clicks and orders recorded on this browser?')) return;
    Track.clear(); renderOverview(); renderCompanies(); renderOrders();
  });

  /* ---------- start ---------- */
  renderCompanies(); renderOrders(); renderAccounts();
  showTab((location.hash || '#overview').slice(1));
})();
