/* Dashboard engine: statistics (live events + simulated sample history), orders, and small SVG/HTML charts.
   Chart colours: series 1 blue #2a78d6, series 2 orange #eb6834 (validated palette, light surface). */
const Dash = (function () {
  const DAY = 864e5;
  const C1 = '#2a78d6';
  const C2 = '#eb6834';
  const METRICS = ['visit', 'imp', 'open', 'call', 'wa', 'svc', 'order'];

  /* ---------- small helpers ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const dkey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmt = (n) => (n >= 100000 ? Math.round(n / 1000) + 'K' : Number(n).toLocaleString('en-US'));
  const noon = (d) => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; };
  const prov = (id) => PROVIDERS.find((p) => p.id === id);
  const svcName = (k) => { const s = SERVICES.find((x) => x.key === k); return s ? s.en : k; };
  const branchName = (k) => { const b = UTAS_BRANCHES.find((x) => x.key === k); return b ? b.en : k; };
  const govName = (k) => { const g = GOVERNORATES.find((x) => x.key === k); return g ? g.en : k; };
  const fmtPhone = (wa) => '+' + wa.slice(0, 3) + ' ' + wa.slice(3, 7) + ' ' + wa.slice(7);
  const shortDate = (k) => { const d = new Date(k + 'T12:00:00'); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); };
  const when = (t) => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- simulated sample history (clearly labelled in the UI) ---------- */
  const FIRST = ['Salim', 'Khalid', 'Mohammed', 'Ahmed', 'Said', 'Hamad', 'Aisha', 'Fatma', 'Maryam', 'Muna', 'Zainab', 'Huda', 'Yousuf', 'Rashid'];
  const LAST = ['Al Balushi', 'Al Harthy', 'Al Rawahi', 'Al Busaidi', 'Al Hinai', 'Al Kindi', 'Al Amri', 'Al Siyabi', 'Al Maamari', 'Al Shukaili'];
  const BRANDS = ['Toyota', 'Nissan', 'Hyundai', 'Kia', 'Honda', 'Ford', 'Mitsubishi', 'Mazda'];
  let _sample = null;

  function sample() {
    if (_sample) return _sample;
    const today = noon(new Date());
    const days = [];
    for (let i = 89; i >= 0; i--) days.push(dkey(new Date(today.getTime() - i * DAY)));
    const rows = {};
    const orders = [];
    PROVIDERS.forEach((p) => {
      rows[p.id] = {};
      const keys = Object.keys(p.services);
      const serves = p.govs.filter((g) => UTAS_BRANCHES.some((b) => b.gov === g));
      const pop = Math.max(6, p.reviews / 7 + (p.rating - 4) * 18 + (p.utas ? 30 : 0));
      days.forEach((d, idx) => {
        const r = rng(hashStr(p.id + d));
        const dow = new Date(d + 'T12:00:00').getDay(); // Friday and Saturday are the Omani weekend
        const wk = dow === 5 || dow === 6 ? 0.75 : 1;
        const growth = 0.85 + 0.3 * (idx / days.length);
        const imp = Math.round(pop * wk * growth * (0.7 + r() * 0.6));
        const open = Math.round(imp * (0.16 + r() * 0.1));
        const call = Math.round(open * (0.22 + r() * 0.15));
        const svc = Math.round(open * (0.2 + r() * 0.15));
        const order = p.utas ? Math.round(open * (0.08 + r() * 0.06)) : (serves.length && r() < 0.12 ? 1 : 0);
        const wa = Math.max(Math.round(open * (0.38 + r() * 0.2)), svc + order);
        const bySvc = {};
        for (let i = 0; i < svc; i++) { const k = keys[Math.floor(Math.pow(r(), 1.6) * keys.length)]; bySvc[k] = (bySvc[k] || 0) + 1; }
        rows[p.id][d] = { imp, open, call, wa, svc, order, bySvc };
        for (let i = 0; i < order; i++) {
          const o = rng(hashStr(p.id + d + 'o' + i));
          const branches = UTAS_BRANCHES.filter((b) => p.govs.includes(b.gov));
          const b = branches[Math.floor(o() * branches.length)];
          const n = 1 + Math.floor(o() * 2);
          const sv = []; while (sv.length < Math.min(n, keys.length)) { const k = keys[Math.floor(o() * keys.length)]; if (!sv.includes(k)) sv.push(k); }
          const stamp = new Date(d + 'T12:00:00').getTime() - 4 * 3600000 + Math.floor(o() * 7 * 3600000);
          orders.push({
            t: stamp > Date.now() ? stamp - 12 * 3600000 : stamp, // never in the future
            company: p.id, sample: true,
            name: FIRST[Math.floor(o() * FIRST.length)] + ' ' + LAST[Math.floor(o() * LAST.length)],
            phone: '9••• ••' + pad(Math.floor(o() * 100)),
            role: o() < 0.78 ? 'student' : 'staff', branch: b.key, services: sv,
            brand: BRANDS[Math.floor(o() * BRANDS.length)],
            total: sv.reduce((s, k) => s + p.services[k], 0)
          });
        }
      });
    });
    const visits = {};
    days.forEach((d) => {
      let s = 0; PROVIDERS.forEach((p) => (s += rows[p.id][d].imp));
      visits[d] = Math.round((s / 7) * (0.9 + rng(hashStr('v' + d))() * 0.2));
    });
    orders.sort((a, b) => b.t - a.t);
    _sample = { days, rows, visits, orders };
    return _sample;
  }

  /* ---------- statistics ---------- */
  // opt: { days, offset (days back from today, for the previous period), company, sample }
  function stats(opt) {
    opt = opt || {};
    const days = opt.days || 30, offset = opt.offset || 0, company = opt.company || null, useSample = opt.sample !== false;
    const today = noon(new Date());
    const keys = [];
    for (let i = days - 1 + offset; i >= offset; i--) keys.push(dkey(new Date(today.getTime() - i * DAY)));
    const idx = {}; keys.forEach((k, i) => (idx[k] = i));
    const zero = () => ({ visit: 0, imp: 0, open: 0, call: 0, wa: 0, svc: 0, order: 0 });
    const daily = keys.map((k) => Object.assign({ date: k }, zero()));
    const total = zero();
    const bySvc = {}, search = {}, byCompany = {};
    PROVIDERS.forEach((p) => (byCompany[p.id] = zero()));

    const add = (i, pid, m, n, svc) => {
      if (pid && byCompany[pid]) byCompany[pid][m] += n;
      if (company && pid !== company) return;
      daily[i][m] += n; total[m] += n;
      if (svc) bySvc[svc] = (bySvc[svc] || 0) + n;
    };

    if (useSample) {
      const S = sample();
      keys.forEach((k, i) => {
        if (!company) { daily[i].visit += S.visits[k] || 0; total.visit += S.visits[k] || 0; }
        PROVIDERS.forEach((p) => {
          const r = S.rows[p.id][k]; if (!r) return;
          ['imp', 'open', 'call', 'wa', 'svc', 'order'].forEach((m) => add(i, p.id, m, r[m]));
          Object.keys(r.bySvc).forEach((sk) => { if (!company || company === p.id) bySvc[sk] = (bySvc[sk] || 0) + r.bySvc[sk]; });
        });
      });
    }
    Track.events().forEach((e) => {
      const i = idx[dkey(new Date(e.t))];
      if (i === undefined) return;
      if (e.k === 'visit') { if (!company) add(i, null, 'visit', 1); }
      else if (e.k === 'imp') add(i, e.c, 'imp', 1);
      else if (e.k === 'open') add(i, e.c, 'open', 1);
      else if (e.k === 'call') add(i, e.c, 'call', 1);
      else if (e.k === 'wa') add(i, e.c, 'wa', 1);
      else if (e.k === 'svc') { add(i, e.c, 'wa', 1); add(i, e.c, 'svc', 1, e.s); }
      else if (e.k === 'order') { add(i, e.c, 'wa', 1); add(i, e.c, 'order', 1); }
      else if (e.k === 'svcfilter' && e.s) search[e.s] = (search[e.s] || 0) + 1;
    });
    return { keys, daily, total, bySvc, search, byCompany };
  }

  // orders from the order form on this browser + sample orders (newest first)
  function orders(opt) {
    opt = opt || {};
    let list = Track.orders().map((o) => Object.assign({}, o, { sample: false }));
    if (opt.sample !== false) list = list.concat(sample().orders);
    if (opt.company) list = list.filter((o) => o.company === opt.company);
    if (opt.days) { const min = Date.now() - opt.days * DAY; list = list.filter((o) => o.t >= min); }
    return list.sort((a, b) => b.t - a.t);
  }

  const delta = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);

  /* ---------- UI pieces ---------- */
  function tile(label, value, d, hint) {
    const dl = d === null || d === undefined ? '' :
      '<span class="dl ' + (d >= 0 ? 'up' : 'down') + '">' + (d >= 0 ? '▲ ' : '▼ ') + Math.abs(d) + '% <i>vs previous period</i></span>';
    return '<div class="tile"><span class="tl">' + esc(label) + '</span><b>' + fmt(value) + '</b>' + dl + (hint ? '<small>' + esc(hint) + '</small>' : '') + '</div>';
  }

  function niceMax(v) {
    if (v <= 4) return 4;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    for (const m of [1, 2, 2.5, 4, 5, 10]) if (m * p >= v) return m * p;
    return 10 * p;
  }

  /* Line chart with legend, crosshair tooltip, end labels and a table-view twin.
     cfg: { title, sub, labels:[date keys], series:[{name,color,values}], height } */
  function line(host, cfg) {
    host._cfg = cfg;
    if (!host._built) {
      host._built = true;
      host.classList.add('chart');
      host.innerHTML =
        '<div class="chart-head"><div><h3></h3><p class="sub"></p></div><div class="chart-tools"><div class="legend"></div>' +
        '<button type="button" class="btn btn-ghost btn-sm tbl-btn">Table view</button></div></div>' +
        '<div class="chart-body"></div><div class="chart-table" hidden></div>';
      host.querySelector('.tbl-btn').addEventListener('click', (e) => {
        const t = host.querySelector('.chart-table'), b = host.querySelector('.chart-body');
        const show = t.hidden; t.hidden = !show; b.hidden = show;
        e.target.textContent = show ? 'Chart view' : 'Table view';
      });
      if (window.ResizeObserver) {
        let tm; new ResizeObserver(() => { clearTimeout(tm); tm = setTimeout(() => draw(host), 120); }).observe(host);
      }
    }
    host.querySelector('h3').textContent = cfg.title || '';
    host.querySelector('.sub').textContent = cfg.sub || '';
    host.querySelector('.legend').innerHTML = cfg.series.length > 1
      ? cfg.series.map((s) => '<span><i style="background:' + s.color + '"></i>' + esc(s.name) + '</span>').join('') : '';
    draw(host);
    // table twin
    host.querySelector('.chart-table').innerHTML =
      '<div class="tbl-scroll"><table class="dt"><thead><tr><th>Date</th>' + cfg.series.map((s) => '<th class="num">' + esc(s.name) + '</th>').join('') + '</tr></thead><tbody>' +
      cfg.labels.map((l, i) => '<tr><td>' + shortDate(l) + '</td>' + cfg.series.map((s) => '<td class="num">' + fmt(s.values[i]) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
  }

  function draw(host) {
    const cfg = host._cfg; if (!cfg) return;
    const body = host.querySelector('.chart-body');
    const W = Math.max(280, body.clientWidth || host.clientWidth || 600), H = cfg.height || 240;
    const m = { l: 40, r: 44, t: 14, b: 26 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b, n = cfg.labels.length;
    const all = [].concat.apply([], cfg.series.map((s) => s.values));
    const max = niceMax(Math.max(1, Math.max.apply(null, all)));
    const x = (i) => m.l + (n === 1 ? iw / 2 : (i * iw) / (n - 1));
    const y = (v) => m.t + ih - (v / max) * ih;
    let g = '';
    for (let t = 0; t <= 4; t++) {
      const v = (max / 4) * t, yy = y(v);
      g += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + yy + '" y2="' + yy + '" stroke="' + (t === 0 ? '#c3c2b7' : '#e1e0d9') + '" stroke-width="1"/>' +
        '<text x="' + (m.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end" font-size="11" fill="#898781">' + fmt(Math.round(v * 10) / 10) + '</text>';
    }
    const step = Math.max(1, Math.round(n / 6));
    for (let i = 0; i < n; i += step) g += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="11" fill="#898781">' + shortDate(cfg.labels[i]) + '</text>';
    let marks = '';
    cfg.series.forEach((s, si) => {
      const pts = s.values.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1));
      if (si === 0 && n > 1) marks += '<path d="M' + x(0).toFixed(1) + ',' + y(0) + ' L' + pts.join(' L') + ' L' + x(n - 1).toFixed(1) + ',' + y(0) + ' Z" fill="' + s.color + '" fill-opacity=".10"/>';
      marks += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + s.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    });
    // end markers (surface ring) + value labels, skipping a label that would collide
    let lastY = -99;
    cfg.series.map((s, si) => ({ s, yy: y(s.values[n - 1]) })).sort((a, b) => a.yy - b.yy).forEach((o) => {
      marks += '<circle cx="' + x(n - 1) + '" cy="' + o.yy + '" r="4" fill="' + o.s.color + '" stroke="#fcfcfb" stroke-width="2"/>';
      if (Math.abs(o.yy - lastY) >= 14) { marks += '<text x="' + (x(n - 1) + 9) + '" y="' + (o.yy + 4) + '" font-size="11" font-weight="700" fill="#52514e">' + fmt(o.s.values[n - 1]) + '</text>'; lastY = o.yy; }
    });
    body.innerHTML =
      '<div class="svgwrap" tabindex="0" role="img" aria-label="' + esc(cfg.title) + '. Use the table view for exact values.">' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' + g + marks +
      '<line class="xh" y1="' + m.t + '" y2="' + (m.t + ih) + '" stroke="#898781" stroke-width="1" style="display:none"/>' +
      '<g class="dots"></g></svg><div class="tip" hidden></div></div>';
    const wrap = body.querySelector('.svgwrap'), svg = wrap.querySelector('svg'), xh = svg.querySelector('.xh'), dots = svg.querySelector('.dots'), tip = wrap.querySelector('.tip');
    let cur = -1;
    function show(i) {
      i = Math.max(0, Math.min(n - 1, i)); cur = i;
      xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.style.display = '';
      dots.innerHTML = cfg.series.map((s) => '<circle cx="' + x(i) + '" cy="' + y(s.values[i]) + '" r="5" fill="' + s.color + '" stroke="#fcfcfb" stroke-width="2"/>').join('');
      tip.innerHTML = '<b>' + shortDate(cfg.labels[i]) + '</b>' + cfg.series.map((s) => '<span><i style="background:' + s.color + '"></i>' + esc(s.name) + ' <strong>' + fmt(s.values[i]) + '</strong></span>').join('');
      tip.hidden = false;
      const left = x(i) > W / 2 ? x(i) - tip.offsetWidth - 12 : x(i) + 12;
      tip.style.left = Math.max(4, left) + 'px'; tip.style.top = m.t + 'px';
    }
    function hide() { xh.style.display = 'none'; dots.innerHTML = ''; tip.hidden = true; cur = -1; }
    wrap.addEventListener('mousemove', (e) => { const r = svg.getBoundingClientRect(); show(Math.round(((e.clientX - r.left) / r.width * W - m.l) / (iw / Math.max(1, n - 1)))); });
    wrap.addEventListener('touchmove', (e) => { const r = svg.getBoundingClientRect(); show(Math.round(((e.touches[0].clientX - r.left) / r.width * W - m.l) / (iw / Math.max(1, n - 1)))); }, { passive: true });
    wrap.addEventListener('mouseleave', hide);
    wrap.addEventListener('blur', hide);
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur < 0 ? n - 1 : cur - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(cur < 0 ? 0 : cur + 1); }
      else if (e.key === 'Escape') hide();
    });
  }

  /* Horizontal bars (single series = one colour). items: [{label, value, sub}] */
  function bars(host, cfg) {
    const items = cfg.items || [];
    const max = Math.max(1, ...items.map((i) => i.value));
    host.classList.add('chart');
    host.innerHTML = '<div class="chart-head"><div><h3>' + esc(cfg.title) + '</h3>' + (cfg.sub ? '<p class="sub">' + esc(cfg.sub) + '</p>' : '') + '</div></div>' +
      (items.length && items.some((i) => i.value > 0)
        ? '<ul class="bars">' + items.map((i) =>
          '<li title="' + esc(i.label + ': ' + i.value) + '"><span class="bl">' + esc(i.label) + (i.sub ? '<small>' + esc(i.sub) + '</small>' : '') + '</span>' +
          '<span class="bt"><span class="bb" style="width:' + Math.max(1.5, (i.value / max) * 100) + '%"></span><b>' + fmt(i.value) + '</b></span></li>').join('') + '</ul>'
        : '<p class="empty-note">No activity yet for this period.</p>');
  }

  function csv(rows, name) {
    const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const text = '﻿' + rows.map((r) => r.map(q).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* shared sections used by both the admin and the company dashboards */
  function kpiRow(cur, prev, labels) {
    return labels.map((l) => tile(l.label, cur[l.key], delta(cur[l.key], prev[l.key]), l.hint)).join('');
  }
  function ordersTable(list, opts) {
    opts = opts || {};
    if (!list.length) return '<p class="empty-note">No orders in this period yet.</p>';
    return '<div class="tbl-scroll"><table class="dt"><thead><tr><th>Date</th><th>Customer</th><th>Phone</th><th>Role</th><th>UTAS branch</th><th>Services</th>' +
      (opts.company ? '<th>Company</th>' : '') + '<th class="num">Est. price</th></tr></thead><tbody>' +
      list.map((o) => '<tr><td>' + when(o.t) + '</td><td>' + esc(o.name) + (o.sample ? ' <span class="tag-s">sample</span>' : '') + '</td><td>' + esc(o.phone) + '</td><td>' + esc(o.role) +
        '</td><td>' + esc(branchName(o.branch)) + '</td><td>' + esc((o.services || []).map(svcName).join(', ')) + '</td>' +
        (opts.company ? '<td>' + esc((prov(o.company) || {}).name || o.company) + '</td>' : '') +
        '<td class="num">' + Number(o.total || 0).toFixed(3) + ' OMR</td></tr>').join('') + '</tbody></table></div>';
  }

  return { stats, orders, delta, tile, line, bars, csv, kpiRow, ordersTable, esc, fmt, prov, svcName, branchName, govName, fmtPhone, when, shortDate, dkey, C1, C2 };
})();
