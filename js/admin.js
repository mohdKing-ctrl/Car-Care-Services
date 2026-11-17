(function () {
  'use strict';
  const S = Auth.session();
  if (!S || S.role !== 'admin') return;

  const D = Dash, esc = D.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const SEO_KEY = 'careline_seo_live';
  const rating = (p) => (p.reviews ? '★ ' + p.rating.toFixed(1) : 'New');
  const avatar = (p) => '<div class="avatar' + (p.logo ? ' logo-av' : '') + '" style="' + (p.logo ? '' : 'background:' + p.color) + '">' + (p.logo ? '<img src="' + p.logo + '" alt="">' : esc(p.initials)) + '</div>';

  $('#who').textContent = S.name;
  $('#logout').addEventListener('click', Auth.logout);

  /* ---------- tabs ---------- */
  function showTab(name) {
    if (!$('#tab-' + name)) name = 'overview';
    $$('.tabpanel').forEach((p) => (p.hidden = p.id !== 'tab-' + name));
    $$('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
    try { history.replaceState(null, '', '#' + name); } catch (e) {}
    if (name === 'overview') renderOverview();
    if (name === 'companies') renderCompanies();
    if (name === 'orders') renderOrders();
    if (name === 'accounts') renderAccounts();
    window.scrollTo(0, 0);
  }
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });
  document.addEventListener('click', (e) => { const g = e.target.closest('[data-goto]'); if (g) { e.preventDefault(); closeModal(); showTab(g.dataset.goto); } });

  /* =========================================================
     META DESCRIPTION & SEO
     ========================================================= */
  const FALLBACK = {
    title: 'Care Line كير لاين | Car Wash & Car Service in Oman',
    description: 'Compare trusted car wash, oil change and car service companies in Oman that come to your home, office or campus. Book by call or WhatsApp.',
    keywords: 'car wash, oil change, car service, car care, UTAS students, WhatsApp',
    ogTitle: 'Care Line | Car wash & car service at your door in Oman',
    ogDescription: 'Compare trusted car wash and car service companies in Oman. They come to you. Book on WhatsApp.'
  };
  let seoSource = Object.assign({}, FALLBACK), seoHtml = null;
  const getSaved = () => { try { return JSON.parse(localStorage.getItem(SEO_KEY) || 'null') || {}; } catch (e) { return {}; } };
  const current = () => Object.assign({}, seoSource, getSaved());
  function saveSeo(part) {
    const v = Object.assign(getSaved(), part);
    try { localStorage.setItem(SEO_KEY, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function counter(el, n, min, max) {
    el.textContent = n + ' / ' + max + ' characters';
    el.className = 'cnt ' + (n >= min && n <= max ? 'ok' : 'bad');
  }

  async function loadSeoSource() {
    try {
      const r = await fetch('index.html', { cache: 'no-store' });
      if (!r.ok) throw new Error('x');
      seoHtml = await r.text();
      const doc = new DOMParser().parseFromString(seoHtml, 'text/html');
      const m = (sel) => { const el = doc.querySelector(sel); return el ? (el.getAttribute('content') || '') : ''; };
      seoSource = { title: (doc.title || '').trim(), description: m('meta[name="description"]'), keywords: m('meta[name="keywords"]'), ogTitle: m('meta[property="og:title"]'), ogDescription: m('meta[property="og:description"]') };
    } catch (e) { seoHtml = null; }
  }

  // quick box on the overview
  function fillQuick() { $('#qDesc').value = current().description || ''; quickCount(); }
  function quickCount() { counter($('#qCnt'), $('#qDesc').value.trim().length, 70, 160); }
  $('#qDesc').addEventListener('input', () => { quickCount(); $('#qMsg').hidden = true; });
  $('#qSave').addEventListener('click', () => {
    const v = $('#qDesc').value.trim();
    const m = $('#qMsg');
    if (!v) { m.hidden = false; m.className = 'login-err'; m.textContent = 'Please type a meta description first.'; return; }
    saveSeo({ description: v });
    $('#sDesc').value = v; seoRefresh();
    m.hidden = false; m.className = 'okmsg'; m.textContent = 'Saved ✓ The website now uses this meta description.';
  });

  // full SEO tab
  const FIELDS = [['sTitle', 'title', 'cTitle', 30, 60], ['sDesc', 'description', 'cDesc', 70, 160], ['sKeys', 'keywords', null], ['sOgTitle', 'ogTitle', 'cOgT', 1, 70], ['sOgDesc', 'ogDescription', 'cOgD', 1, 200]];
  function fillSeo(values) { FIELDS.forEach(([id, k]) => ($('#' + id).value = values[k] || '')); seoRefresh(); }
  function seoValues() { const v = {}; FIELDS.forEach(([id, k]) => (v[k] = $('#' + id).value.trim())); return v; }
  function seoRefresh() {
    const v = seoValues();
    FIELDS.forEach(([id, k, cid, min, max]) => { if (cid) counter($('#' + cid), v[k].length, min, max); });
    const t = v.title.length > 60 ? v.title.slice(0, 59).trim() + '…' : v.title;
    const d = v.description.length > 160 ? v.description.slice(0, 159).trim() + '…' : v.description;
    $('#serp').innerHTML = '<div class="u">Care Line<small>careline.om › home</small></div><div class="t">' + esc(t || 'Page title') + '</div><div class="d">' + esc(d || 'Meta description') + '</div>';
    const saved = getSaved();
    const rows = [['Meta description', 'description'], ['Page title', 'title'], ['Keywords', 'keywords'], ['Share title (og:title)', 'ogTitle'], ['Share description (og:description)', 'ogDescription']];
    $('#liveTags').innerHTML = rows.map(([l, k]) => {
      const val = saved[k] || seoSource[k] || '';
      return '<div><b>' + l + (saved[k] ? ' · your saved text' : ' · from index.html') + '</b>' + (val ? esc(val) : '<i style="color:var(--muted)">not set</i>') + '</div>';
    }).join('');
  }
  FIELDS.forEach(([id]) => $('#' + id).addEventListener('input', seoRefresh));
  $('#seoSave').addEventListener('click', () => {
    const v = seoValues();
    saveSeo(v);
    $('#qDesc').value = v.description; quickCount();
    seoRefresh();
    const m = $('#seoMsg'); m.hidden = false; m.className = 'okmsg';
    m.textContent = 'Saved ✓ Open the website: the tab title and meta tags now use your text.';
  });
  $('#seoReset').addEventListener('click', () => {
    try { localStorage.removeItem(SEO_KEY); } catch (e) {}
    fillSeo(seoSource); fillQuick();
    const m = $('#seoMsg'); m.hidden = false; m.className = 'okmsg'; m.textContent = 'Reset. The text from index.html is used again.';
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
    if (!seoHtml) { m.className = 'login-err'; m.textContent = 'index.html could not be read. Open the dashboard from the website address (not from a file on the computer).'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([patchHead(seoHtml, seoValues())], { type: 'text/html;charset=utf-8' }));
    a.download = 'index.html'; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    m.className = 'okmsg'; m.textContent = 'Downloaded index.html with your text. Upload it to GitHub to replace the old file.';
  });

  /* =========================================================
     OVERVIEW
     ========================================================= */
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
    $('#sampleNote').innerHTML = 'Activity recorded on this device: <b>' + Track.events().length + '</b>';
    D.line($('#mainChart'), {
      title: 'Views and contact actions',
      sub: 'Company cards shown to visitors, and the calls + WhatsApp clicks they made, per day',
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

  /* =========================================================
     COMPANIES
     ========================================================= */
  function renderCompanies() {
    const days = +$('#coPeriod').value, q = $('#coSearch').value.trim().toLowerCase();
    const st = D.stats({ days, sample: $('#useSample').checked });
    const rows = PROVIDERS.filter((p) => !q || (p.name + ' ' + p.nameAr + ' ' + p.govs.map(D.govName).join(' ')).toLowerCase().includes(q))
      .sort((a, b) => (b.custom ? 1 : 0) - (a.custom ? 1 : 0) || st.byCompany[b.id].imp - st.byCompany[a.id].imp);
    $('#coTable').innerHTML = '<p class="note-s" style="margin-bottom:8px"><b>' + PROVIDERS.length + '</b> companies on the website</p>' +
      '<div class="tbl-scroll"><table class="dt"><thead><tr><th>Company</th><th>Governorates</th><th class="num">Services</th><th class="num">Rating</th>' +
      '<th class="num">Views</th><th class="num">Opens</th><th class="num">Calls</th><th class="num">WhatsApp</th><th class="num">Service clicks</th><th class="num">Orders</th><th>Username</th></tr></thead><tbody>' +
      rows.map((p) => {
        const t = st.byCompany[p.id];
        return '<tr data-co="' + esc(p.id) + '" style="cursor:pointer"><td><div class="who">' + avatar(p) + esc(p.name) +
          (p.utas ? ' <span class="tag-s">UTAS partner</span>' : '') + (p.custom ? ' <span class="tag-s tag-live">new</span>' : '') + '</div></td>' +
          '<td>' + esc(p.govs.length > 2 ? p.govs.length + ' governorates' : p.govs.map(D.govName).join(', ')) + '</td><td class="num">' + Object.keys(p.services).length + '</td><td class="num">' + rating(p) + '</td>' +
          '<td class="num">' + D.fmt(t.imp) + '</td><td class="num">' + D.fmt(t.open) + '</td><td class="num">' + D.fmt(t.call) + '</td><td class="num">' + D.fmt(t.wa) +
          '</td><td class="num">' + D.fmt(t.svc) + '</td><td class="num">' + D.fmt(t.order) + '</td><td><code>' + esc(p.id) + '</code></td></tr>';
      }).join('') + '</tbody></table></div>';
    renderCompanies.rows = rows; renderCompanies.st = st;
  }
  $('#coSearch').addEventListener('input', renderCompanies);
  $('#coPeriod').addEventListener('change', renderCompanies);
  $('#coCsv').addEventListener('click', () => {
    const st = renderCompanies.st, head = ['Company', 'Arabic name', 'Governorates', 'Phone', 'Rating', 'Reviews', 'Services', 'Views', 'Profile opens', 'Calls', 'WhatsApp', 'Service clicks', 'Orders', 'Username'];
    D.csv([head].concat(renderCompanies.rows.map((p) => { const t = st.byCompany[p.id];
      return [p.name, p.nameAr, p.govs.map(D.govName).join('; '), D.fmtPhone(p.wa), p.reviews ? p.rating : 'New', p.reviews, Object.keys(p.services).map(D.svcName).join('; '), t.imp, t.open, t.call, t.wa, t.svc, t.order, p.id]; })), 'care-line-companies.csv');
  });
  $('#coTable').addEventListener('click', (e) => { const tr = e.target.closest('[data-co]'); if (tr) openCompany(tr.dataset.co); });

  function openCompany(id) {
    const p = D.prov(id); if (!p) return;
    const sample = $('#useSample').checked;
    const st = D.stats({ days: 30, sample, company: id });
    const ords = D.orders({ company: id, sample, days: 90 }).slice(0, 8);
    const acc = ACCOUNTS.find((a) => a.user === p.id);
    const last = Auth.lastLogins()[p.id];
    $('#dBody').innerHTML =
      '<div class="card-top">' + avatar(p) +
      '<div><h3 id="dTitle">' + esc(p.name) + '</h3><div class="meta"><span>' + esc(p.nameAr) + '</span><span class="rate">' + rating(p) + '</span>' + (p.reviews ? '<span>(' + p.reviews + ' reviews)</span>' : '') +
      (p.utas ? '<span class="pill utas-pill">UTAS Partner</span>' : '') + '</div></div></div>' +
      '<div class="dgrid">' +
        '<div><span>Username</span><code>' + esc(p.id) + '</code></div>' +
        '<div><span>Password</span><code>' + esc(acc ? acc.pw : '–') + '</code></div>' +
        '<div><span>Phone / WhatsApp</span><a href="tel:+' + p.wa + '">' + D.fmtPhone(p.wa) + '</a></div>' +
        '<div><span>Last login</span>' + (last ? D.when(last) : 'Not yet') + '</div>' +
        '<div><span>Working hours</span>' + (p.hours[0] === 0 && p.hours[1] === 24 ? '24 hours' : p.hours[0] + ':00 – ' + p.hours[1] + ':00') + '</div>' +
        '<div><span>Governorates</span>' + esc(p.govs.map(D.govName).join(', ')) + '</div>' +
        '<div><span>Areas served</span>' + esc(p.areas.map((a) => a[0]).join(', ')) + '</div>' +
        '<div><span>Years in business</span>' + (p.years || 'New') + '</div>' +
        '<div style="grid-column:1/-1"><span>Description</span>' + esc(p.desc) + '</div>' +
      '</div>' +
      '<div class="mini-k">' + ['imp:Views', 'open:Profile opens', 'call:Calls', 'wa:WhatsApp', 'svc:Service clicks', 'order:Orders'].map((x) => { const [k, l] = x.split(':'); return '<div><b>' + D.fmt(st.total[k]) + '</b><span>' + l + ' · 30 days</span></div>'; }).join('') + '</div>' +
      '<div id="dChart"></div>' +
      '<h4 style="margin:18px 0 8px">Services and prices</h4><div class="tbl-scroll" style="max-height:240px"><table class="dt"><tbody>' +
        Object.keys(p.services).map((k) => '<tr><td>' + esc(D.svcName(k)) + '</td><td class="num">' + p.services[k].toFixed(3) + ' OMR</td><td class="num">' + D.fmt(st.bySvc[k] || 0) + ' clicks</td></tr>').join('') + '</tbody></table></div>' +
      '<h4 style="margin:18px 0 8px">Latest customers (UTAS orders)</h4>' + D.ordersTable(ords) +
      '<div class="row-d" style="margin-top:18px"><a class="btn btn-primary" href="portal.html?company=' + encodeURIComponent(p.id) + '">Open this company\'s dashboard</a>' +
      '<a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/' + p.wa + '">WhatsApp</a>' +
      (p.custom ? '<button class="btn btn-ghost" type="button" id="delCo" style="color:var(--brand-d);margin-inline-start:auto">Remove company</button>' : '') + '</div>';
    $('#dModal').hidden = false; document.body.style.overflow = 'hidden';
    D.line($('#dChart'), {
      title: 'Last 30 days', sub: 'Views and contact actions for this company', height: 200, labels: st.keys,
      series: [{ name: 'Views', color: D.C1, values: st.daily.map((d) => d.imp) }, { name: 'Contact actions', color: D.C2, values: st.daily.map((d) => d.call + d.wa) }]
    });
    const del = $('#delCo');
    if (del) del.addEventListener('click', () => {
      if (!confirm('Remove ' + p.name + ' from the website? Its login will stop working.')) return;
      Store.removeCompany(p.id);
      closeModal(); fillCompanySelect(); renderCompanies(); renderAccounts();
    });
    $('#dClose').focus();
  }
  function closeModal() { $('#dModal').hidden = true; document.body.style.overflow = ''; }
  $('#dClose').addEventListener('click', closeModal);
  $('#dModal').addEventListener('click', (e) => { if (e.target === $('#dModal')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* =========================================================
     ADD COMPANY
     ========================================================= */
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const genPw = () => { const b = crypto.getRandomValues(new Uint8Array(10)); let s = ''; b.forEach((x) => (s += ALPHA[x % ALPHA.length])); return s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8); };
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 30);
  const clean = (s) => String(s || '').replace(/[<>]/g, '').trim();
  const COLORS = ['#0E7C86', '#B45309', '#6D28D9', '#15803D', '#0369A1', '#BE123C', '#9A3412', '#0F766E', '#4338CA', '#A21CAF', '#0891B2', '#475569'];
  const TYPICAL = { wash: 3, interior: 7, detail: 18, oil: 13, battery: 27, tyre: 3, ac: 16, brakes: 22 };
  let userTouched = false;

  function buildAddForm() {
    $('#aGovs').innerHTML = GOVERNORATES.map((g) => '<label class="chk-chip"><input type="checkbox" value="' + g.key + '"><span>' + esc(g.en) + '</span></label>').join('');
    $('#aSvcs').innerHTML = SERVICES.map((s) => '<div class="svc-row"><label class="chk-chip"><input type="checkbox" value="' + s.key + '"><span>' + s.icon + ' ' + esc(s.en) + '</span></label>' +
      '<input type="text" inputmode="decimal" class="svc-price" data-svc="' + s.key + '" placeholder="' + TYPICAL[s.key].toFixed(3) + '" aria-label="' + esc(s.en) + ' price in OMR" disabled></div>').join('');
    const hours = (from, to, sel) => { let o = ''; for (let h = from; h <= to; h++) o += '<option value="' + h + '"' + (h === sel ? ' selected' : '') + '>' + (h === 24 ? '24:00 (midnight)' : String(h).padStart(2, '0') + ':00') + '</option>'; return o; };
    $('#aFrom').innerHTML = hours(0, 23, 8);
    $('#aTo').innerHTML = hours(1, 24, 21);
    $('#aPass').value = genPw();
    userTouched = false;
  }
  $('#aSvcs').addEventListener('change', (e) => {
    if (e.target.type !== 'checkbox') return;
    const price = $('.svc-price[data-svc="' + e.target.value + '"]');
    price.disabled = !e.target.checked;
    if (e.target.checked && !price.value) price.value = TYPICAL[e.target.value].toFixed(3);
    if (e.target.checked) price.focus();
  });
  $('#aName').addEventListener('input', () => { if (!userTouched) $('#aUser').value = slug($('#aName').value); });
  $('#aUser').addEventListener('input', () => { userTouched = true; });
  $('#aGen').addEventListener('click', () => { $('#aPass').value = genPw(); });

  function addError(msg, el) {
    const e = $('#aErr'); e.textContent = msg; e.hidden = false;
    if (el) el.focus();
    return false;
  }
  $('#addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('#aErr').hidden = true;
    const name = clean($('#aName').value), nameAr = clean($('#aNameAr').value);
    const phone = $('#aPhone').value.replace(/[\s\-+]/g, '').replace(/^968/, '');
    const govs = $$('#aGovs input:checked').map((i) => i.value);
    const services = {};
    let badPrice = null;
    $$('#aSvcs input[type=checkbox]:checked').forEach((c) => {
      const pi = $('.svc-price[data-svc="' + c.value + '"]');
      const v = parseFloat(pi.value);
      if (!(v > 0 && v < 1000)) badPrice = badPrice || pi; else services[c.value] = Math.round(v * 1000) / 1000;
    });
    const user = $('#aUser').value.trim().toLowerCase();
    const pass = $('#aPass').value.trim();
    const from = +$('#aFrom').value, to = +$('#aTo').value;
    const taken = ACCOUNTS.some((a) => a.user === user) || PROVIDERS.some((p) => p.id === user);

    if (!name) return addError('Please type the company name.', $('#aName'));
    if (!/^[79]\d{7}$/.test(phone)) return addError('Please type a valid Omani phone number (8 digits, starting with 7 or 9).', $('#aPhone'));
    if (!govs.length) return addError('Please choose at least one governorate.');
    if (badPrice) return addError('Please type a price in OMR for every selected service.', badPrice);
    if (!Object.keys(services).length) return addError('Please choose at least one service and its price.');
    if (from >= to) return addError('The closing time must be after the opening time.', $('#aTo'));
    if (!/^[a-z0-9][a-z0-9-]{2,29}$/.test(user)) return addError('The username needs 3 to 30 small letters, numbers or dashes.', $('#aUser'));
    if (taken) return addError('This username is already used. Please choose another one.', $('#aUser'));
    if (pass.length < 8) return addError('The password needs at least 8 characters.', $('#aPass'));

    const areas = clean($('#aAreas').value).split(',').map((s) => s.trim()).filter(Boolean);
    const words = name.replace(/\(.*?\)/g, '').trim().split(/\s+/);
    const provider = {
      id: user, name, nameAr: nameAr || name,
      initials: (words[0][0] + (words[1] ? words[1][0] : (words[0][1] || ''))).toUpperCase(),
      color: COLORS[(PROVIDERS.length + Store.companies().length) % COLORS.length],
      govs, areas: (areas.length ? areas : govs.map(D.govName)).map((a) => [a, a]),
      services, rating: 0, reviews: 0, years: Math.min(99, parseInt($('#aYears').value, 10) || 0),
      hours: [from, to], reply: 30, wa: '968' + phone,
      desc: clean($('#aDesc').value) || name + ' brings car care to your door.',
      descAr: clean($('#aDescAr').value) || clean($('#aDesc').value) || name,
      custom: true
    };
    const salt = Auth.hex(crypto.getRandomValues(new Uint8Array(8)));
    const account = { user, role: 'company', company: user, name, salt, hash: await Auth.sha(salt, pass), pw: pass };
    if (!Store.addCompany(provider, account)) return addError('Could not save. The browser storage may be full or blocked.');

    $('#addForm').hidden = true;
    $('#addDone').hidden = false;
    $('#addDone').innerHTML =
      '<div class="okmsg" style="font-size:1rem">✓ ' + esc(name) + ' was added to the website.</div>' +
      '<div class="dgrid" style="margin-top:16px"><div><span>Username</span><code>' + esc(user) + '</code></div><div><span>Password</span><code>' + esc(pass) + '</code></div></div>' +
      '<p class="note-s">Give these to the company. They can sign in from the <b>Login</b> button on the website, and they also appear in the quick-login list.</p>' +
      '<div class="row-d" style="margin-top:16px">' +
      '<a class="btn btn-primary" href="portal.html?company=' + encodeURIComponent(user) + '">Open their dashboard</a>' +
      '<a class="btn btn-ghost" href="index.html#providers" target="_blank" rel="noopener">See it on the website</a>' +
      '<button class="btn btn-ghost" type="button" id="addAnother">Add another company</button></div>';
    $('#addAnother').addEventListener('click', () => {
      $('#addForm').reset(); buildAddForm(); $('#addForm').hidden = false; $('#addDone').hidden = true; $('#aName').focus();
    });
    fillCompanySelect(); renderAccounts();
  });

  /* =========================================================
     CUSTOMERS & ORDERS
     ========================================================= */
  function fillCompanySelect() {
    const cur = $('#orCompany').value;
    $('#orCompany').innerHTML = '<option value="">All companies</option>' + PROVIDERS.map((p) => '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>').join('');
    $('#orCompany').value = PROVIDERS.some((p) => p.id === cur) ? cur : '';
    $('#pwUser').innerHTML = ACCOUNTS.map((a) => '<option value="' + esc(a.user) + '">' + esc(a.role === 'admin' ? 'Administrator (' + a.user + ')' : a.name + ' (' + a.user + ')') + '</option>').join('');
  }
  function filteredOrders() {
    const q = $('#orSearch').value.trim().toLowerCase();
    return D.orders({ company: $('#orCompany').value || null, days: +$('#orPeriod').value, sample: $('#useSample').checked })
      .filter((o) => !q || (o.name + ' ' + o.phone).toLowerCase().includes(q));
  }
  function renderOrders() {
    const list = filteredOrders();
    $('#orTable').innerHTML = '<p class="note-s" style="margin-bottom:8px"><b>' + list.length + '</b> orders · estimated value <b>' +
      list.reduce((s, o) => s + Number(o.total || 0), 0).toFixed(3) + ' OMR</b></p>' + D.ordersTable(list.slice(0, 300), { company: true });
  }
  ['orSearch', 'orCompany', 'orPeriod'].forEach((id) => $('#' + id).addEventListener(id === 'orSearch' ? 'input' : 'change', renderOrders));
  $('#orCsv').addEventListener('click', () => {
    D.csv([['Date', 'Customer', 'Phone', 'Role', 'UTAS branch', 'Services', 'Car brand', 'Company', 'Estimated price (OMR)']].concat(filteredOrders().map((o) =>
      [new Date(o.t).toISOString().slice(0, 16).replace('T', ' '), o.name, o.phone, o.role, D.branchName(o.branch), (o.services || []).map(D.svcName).join('; '), o.brand || '', (D.prov(o.company) || {}).name || o.company, Number(o.total || 0).toFixed(3)])), 'care-line-orders.csv');
  });

  /* =========================================================
     USERNAMES & PASSWORDS
     ========================================================= */
  function renderAccounts() {
    const last = Auth.lastLogins(), show = $('#showPw').checked;
    $('#acTable').innerHTML = '<div class="tbl-scroll"><table class="dt"><thead><tr><th>Account</th><th>Username</th><th>Password</th><th>Role</th><th>Last login</th></tr></thead><tbody>' +
      ACCOUNTS.map((a) => '<tr><td><b>' + esc(a.role === 'admin' ? 'Administrator' : a.name) + '</b></td><td><code>' + esc(a.user) + '</code></td>' +
        '<td><code>' + (show ? esc(a.pw || '–') : '••••••••') + '</code></td><td>' + (a.role === 'admin' ? 'Admin' : 'Company') + '</td><td>' + (last[a.user] ? D.when(last[a.user]) : '–') + '</td></tr>').join('') +
      '</tbody></table></div>';
  }
  $('#showPw').addEventListener('change', renderAccounts);
  $('#pwGo').addEventListener('click', async () => {
    const m = $('#pwMsg'), pw = $('#pwNew').value.trim(), user = $('#pwUser').value;
    m.hidden = false;
    if (pw.length < 8) { m.className = 'login-err'; m.textContent = 'Please type a password with at least 8 characters.'; return; }
    const salt = Auth.hex(crypto.getRandomValues(new Uint8Array(8)));
    Store.setPassword(user, salt, await Auth.sha(salt, pw), pw);
    $('#pwNew').value = '';
    m.className = 'okmsg'; m.textContent = 'Password changed for ' + user + '. It works from now on.';
    renderAccounts();
  });
  $('#clearLive').addEventListener('click', () => {
    if (!confirm('Delete the visits, clicks and orders recorded on this device?')) return;
    Track.clear(); renderOverview(); renderCompanies(); renderOrders();
  });

  /* ---------- start ---------- */
  buildAddForm();
  fillCompanySelect();
  fillQuick();
  fillSeo(current());
  loadSeoSource().then(() => { fillQuick(); fillSeo(current()); });
  showTab((location.hash || '#overview').slice(1));
})();
