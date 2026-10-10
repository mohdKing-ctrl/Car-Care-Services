(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Change this to your own number (country code 968 + 8 digits) for the "Join" button
  const TEAM_WHATSAPP = '96891000000';

  let lang = 'en';
  try { lang = localStorage.getItem('carcare_lang') || 'en'; } catch (e) {}
  if (!I18N[lang]) lang = 'en';

  const state = { service: '', gov: '', q: '', sort: 'rating', openOnly: false };

  /* ---------- helpers ---------- */
  const t = (key, vars) => {
    let s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  };
  const isAr = () => lang === 'ar';
  const pick = (en, ar) => (isAr() && ar ? ar : en);
  const svcName = (s) => pick(s.en, s.ar);
  const svcByKey = (k) => SERVICES.find((s) => s.key === k);
  const govName = (g) => pick(g.en, g.ar);
  const price = (n) => n.toFixed(3) + ' ' + t('cur');
  const fmtPhone = (wa) => '+' + wa.slice(0, 3) + ' ' + wa.slice(3, 7) + ' ' + wa.slice(7);
  const waLink = (num, text) => 'https://wa.me/' + num + '?text=' + encodeURIComponent(text);
  const nameOf = (p) => pick(p.name, p.nameAr);
  // Company avatar: the UTAS partner shows the UTAS logo, others show coloured initials
  const avatarHTML = (p) => p.logo
    ? '<div class="avatar logo-av"><img src="' + p.logo + '" alt="UTAS"></div>'
    : '<div class="avatar" style="background:' + p.color + '">' + p.initials + '</div>';
  const partnerPill = (p) => (p.utas ? '<span class="pill utas-pill">' + t('utas.partner') + '</span>' : '');
  const minPrice = (p, key) => (key && p.services[key] != null ? p.services[key] : Math.min(...Object.values(p.services)));

  // Opening hours are evaluated in Oman time (UTC+4)
  const isOpen = (p) => {
    const d = new Date();
    const h = ((d.getUTCHours() + 4) % 24) + d.getUTCMinutes() / 60;
    return h >= p.hours[0] && h < p.hours[1];
  };
  const hoursText = (p) => {
    if (p.hours[0] === 0 && p.hours[1] === 24) return isAr() ? 'على مدار الساعة' : '24 hours';
    const f = (h) => { const am = h < 12; const x = h % 12 || 12; return x + (isAr() ? (am ? ' ص' : ' م') : (am ? ' AM' : ' PM')); };
    return f(p.hours[0]) + ' – ' + f(p.hours[1]);
  };
  const waIcon = '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1a7.7 7.7 0 0 1-3.8-3.3c-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"/></svg>';
  const phoneIcon = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>';

  const bookMsg = (p, serviceKey) => {
    const name = nameOf(p);
    if (serviceKey) return t('msg.service', { name, service: svcName(svcByKey(serviceKey)) });
    return t('msg.general', { name });
  };

  /* ---------- static text ---------- */
  function applyI18n() {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr() ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$('[data-i18n-html]').forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
    $$('[data-i18n-placeholder]').forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
    $('#joinBtn').href = waLink(TEAM_WHATSAPP, t('msg.join'));
  }

  /* ---------- selects ---------- */
  function fillSelect(sel, options, current) {
    sel.innerHTML = options.map((o) => '<option value="' + o.v + '">' + o.l + '</option>').join('');
    sel.value = current;
  }
  function renderSelects() {
    const svcOpts = [{ v: '', l: t('search.all') }].concat(SERVICES.map((s) => ({ v: s.key, l: s.icon + ' ' + svcName(s) })));
    const govOpts = [{ v: '', l: t('search.all') }].concat(GOVERNORATES.map((g) => ({ v: g.key, l: govName(g) })));
    fillSelect($('#heroService'), svcOpts, state.service);
    fillSelect($('#fService'), svcOpts, state.service);
    fillSelect($('#heroGov'), govOpts, state.gov);
    fillSelect($('#fGov'), govOpts, state.gov);
    fillSelect($('#fSort'), [
      { v: 'rating', l: t('filter.sort') + ': ' + t('sort.rating') },
      { v: 'price', l: t('filter.sort') + ': ' + t('sort.price') },
      { v: 'reviews', l: t('filter.sort') + ': ' + t('sort.reviews') }
    ], state.sort);
  }

  /* ---------- services grid ---------- */
  function renderServices() {
    $('#servicesGrid').innerHTML = SERVICES.map((s) =>
      '<button type="button" class="svc" data-service="' + s.key + '">' +
        '<div class="e">' + s.icon + '</div><b>' + svcName(s) + '</b><span>' + pick(s.dEn, s.dAr) + '</span>' +
      '</button>').join('');
  }

  /* ---------- providers ---------- */
  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = PROVIDERS.filter((p) => {
      if (state.service && p.services[state.service] == null) return false;
      if (state.gov && !p.govs.includes(state.gov)) return false;
      if (state.openOnly && !isOpen(p)) return false;
      if (q) {
        const hay = [p.name, p.nameAr].concat(p.areas.map((a) => a[0] + ' ' + a[1])).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      if (state.sort === 'price') return minPrice(a, state.service) - minPrice(b, state.service);
      if (state.sort === 'reviews') return b.reviews - a.reviews;
      return b.rating - a.rating || b.reviews - a.reviews;
    });
    return list;
  }

  function cardHTML(p) {
    const open = isOpen(p);
    const keys = Object.keys(p.services);
    const shown = keys.slice(0, 4);
    const more = keys.length - shown.length;
    const tags = shown.map((k) => '<span class="tag' + (k === state.service ? ' hit' : '') + '">' + svcByKey(k).icon + ' ' + svcName(svcByKey(k)) + '</span>').join('') +
      (more > 0 ? '<span class="tag">+' + more + '</span>' : '');
    const areas = p.areas.slice(0, 3).map((a) => pick(a[0], a[1])).join(isAr() ? '، ' : ', ');
    const from = minPrice(p, state.service);
    return '<article class="card">' +
      '<div class="card-top">' +
        '' + avatarHTML(p) + '' +
        '<div><h3>' + nameOf(p) + '</h3>' +
        '<div class="meta"><span class="rate"><i>★</i> ' + p.rating.toFixed(1) + '</span><span>(' + p.reviews + ')</span><span>· ' + t('card.yrs', { n: p.years }) + '</span></div></div>' +
      '</div>' +
      '<div class="pills"><span class="pill ' + (open ? 'on' : 'off') + '">' + (open ? t('card.open') : t('card.closed')) + '</span>' + partnerPill(p) + '</div>' +
      '<div class="tags">' + tags + '</div>' +
      '<div class="serves"><b>' + t('card.serves') + ':</b> ' + areas + '</div>' +
      '<div class="price"><div><small>' + t('card.from') + '</small> <b>' + from.toFixed(3) + ' <small>' + t('cur') + '</small></b></div>' +
        '<button type="button" class="link" data-details="' + p.id + '">' + t('card.prices') + '</button></div>' +
      '<div class="actions">' +
        '<a class="btn btn-call" href="tel:+' + p.wa + '">' + phoneIcon + t('card.call') + '</a>' +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waLink(p.wa, bookMsg(p, state.service)) + '">' + waIcon + t('card.wa') + '</a>' +
      '</div>' +
    '</article>';
  }

  function renderProviders() {
    const list = filtered();
    $('#count').textContent = list.length === 1 ? t('results.one') : t('results', { n: list.length });
    $('#providersGrid').innerHTML = list.map(cardHTML).join('');
    $('#empty').hidden = list.length > 0;
    $('#providersGrid').hidden = list.length === 0;
  }

  /* ---------- modal ---------- */
  function openDetails(id) {
    const p = PROVIDERS.find((x) => x.id === id);
    if (!p) return;
    const rows = Object.keys(p.services).map((k) => {
      const s = svcByKey(k);
      return '<div class="prow"><span>' + s.icon + '</span><span class="n">' + svcName(s) + '</span>' +
        '<span class="p">' + p.services[k].toFixed(3) + ' <small>' + t('cur') + '</small></span>' +
        '<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="' + waLink(p.wa, bookMsg(p, k)) + '">' + t('modal.book') + '</a></div>';
    }).join('');
    $('#mBody').innerHTML =
      '<div class="card-top">' + avatarHTML(p) + '' +
      '<div><h3 id="mTitle">' + nameOf(p) + '</h3><div class="meta"><span class="rate"><i>★</i> ' + p.rating.toFixed(1) + '</span><span>(' + p.reviews + ')</span>' +
      '<span class="pill ' + (isOpen(p) ? 'on' : 'off') + '">' + (isOpen(p) ? t('card.open') : t('card.closed')) + '</span>' + partnerPill(p) + '</div></div></div>' +
      '<p class="m-desc">' + pick(p.desc, p.descAr) + '</p>' +
      '<div class="m-h">' + t('modal.hours') + '</div><div>' + hoursText(p) + ' · ' + t('card.reply', { n: p.reply }) + '</div>' +
      '<div class="m-h">' + t('card.serves') + '</div><div class="tags">' + p.areas.map((a) => '<span class="tag">' + pick(a[0], a[1]) + '</span>').join('') + '</div>' +
      '<div class="m-h">' + t('modal.services') + '</div><div class="plist">' + rows + '</div>' +
      '<div class="m-actions"><a class="btn btn-call" href="tel:+' + p.wa + '">' + phoneIcon + fmtPhone(p.wa) + '</a>' +
      '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waLink(p.wa, bookMsg(p, state.service)) + '">' + waIcon + t('card.wa') + '</a></div>';
    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
    $('#mClose').focus();
  }
  function closeModal() {
    $('#modal').hidden = true;
    document.body.style.overflow = '';
  }

  /* ---------- UTAS students & staff order ---------- */
  const utas = { branch: '', services: new Set(), brand: '', time: '', company: '' };
  const listSep = () => (isAr() ? '، ' : ', ');

  // Companies that serve the selected branch's governorate AND offer every selected service
  function utasMatches() {
    const b = UTAS_BRANCHES.find((x) => x.key === utas.branch);
    if (!b || utas.services.size === 0) return null;
    return PROVIDERS
      .filter((p) => p.govs.includes(b.gov) && Array.from(utas.services).every((k) => p.services[k] != null))
      .sort((a, c) => (c.utas ? 1 : 0) - (a.utas ? 1 : 0) || c.rating - a.rating || c.reviews - a.reviews);
  }
  const utasTotal = (p) => Array.from(utas.services).reduce((sum, k) => sum + p.services[k], 0);

  function renderUtasCompanies() {
    const list = utasMatches();
    const box = $('#uCompanies');
    if (list === null || list.length === 0) {
      utas.company = '';
      box.innerHTML = '<div class="co-note">' + t(list === null ? 'utas.pickFirst' : 'utas.none') + '</div>';
    } else {
      if (!list.some((p) => p.id === utas.company)) utas.company = list[0].id;
      box.innerHTML = list.map((p) =>
        '<label class="co"><input type="radio" name="uCo" value="' + p.id + '"' + (p.id === utas.company ? ' checked' : '') + '>' +
          '' + avatarHTML(p) + '' +
          '<div class="info"><b>' + nameOf(p) + '</b>' + (p.utas ? '<span class="pill utas-pill">' + t('utas.partner') + '</span> ' : '') + '<small>★ ' + p.rating.toFixed(1) + ' (' + p.reviews + ') · ' + (isOpen(p) ? t('card.open') : t('card.closed')) + '</small></div>' +
          '<div class="cp">' + utasTotal(p).toFixed(3) + ' <small>' + t('cur') + '</small></div>' +
          '<span class="tick">✓</span></label>').join('');
    }
    updateUtasTotal();
  }
  function updateUtasTotal() {
    const chosen = PROVIDERS.find((p) => p.id === utas.company);
    $('#uTotal').hidden = !chosen;
    if (chosen) $('#uTotalVal').textContent = price(utasTotal(chosen));
  }

  function renderUtas() {
    fillSelect($('#uBranch'), [{ v: '', l: t('utas.branchPh') }].concat(UTAS_BRANCHES.map((b) => ({ v: b.key, l: pick(b.en, b.ar) }))), utas.branch);
    fillSelect($('#uBrand'), [{ v: '', l: t('utas.brandPh') }].concat(CAR_BRANDS.map((b) => ({ v: b[0], l: pick(b[0], b[1]) }))), utas.brand);
    fillSelect($('#uTime'), [{ v: '', l: t('utas.timePh') }].concat(TIME_SLOTS.map((s) => ({ v: s.v, l: pick(s.en, s.ar) }))), utas.time);
    $('#uServices').innerHTML = SERVICES.map((s) =>
      '<label><input type="checkbox" value="' + s.key + '"' + (utas.services.has(s.key) ? ' checked' : '') + '><span>' + s.icon + ' ' + svcName(s) + '</span></label>').join('');
    $('#uSendIcon').innerHTML = waIcon;
    // earliest date = today in Oman time (UTC+4)
    $('#uDate').min = new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 10);
    renderUtasCompanies();
  }

  function utasMessage(p) {
    const brand = CAR_BRANDS.find((b) => b[0] === utas.brand);
    const plate = $('#uPlate').value.trim();
    const slot = TIME_SLOTS.find((s) => s.v === utas.time);
    const role = $('input[name="uRole"]:checked').value === 'staff' ? t('utas.staff') : t('utas.student');
    const branch = UTAS_BRANCHES.find((b) => b.key === utas.branch);
    return t('msg.utas', {
      company: nameOf(p),
      name: $('#uName').value.trim(),
      role: role,
      branch: 'UTAS ' + pick(branch.en, branch.ar),
      services: Array.from(utas.services).map((k) => svcName(svcByKey(k))).join(listSep()),
      car: pick(brand[0], brand[1]) + (plate ? ' (' + plate + ')' : ''),
      parking: $('#uParking').value.trim(),
      when: $('#uDate').value + ', ' + pick(slot.en, slot.ar),
      total: price(utasTotal(p)),
      phone: '+968 ' + utasPhone()
    });
  }
  const utasPhone = () => $('#uPhone').value.replace(/[\s\-+]/g, '').replace(/^968/, '');

  function utasError(key, el) {
    $$('.utas-form .bad').forEach((x) => x.classList.remove('bad'));
    const box = $('#uErr');
    box.className = 'u-err';
    box.textContent = t(key);
    box.hidden = false;
    if (el) { el.classList.add('bad'); el.focus(); }
    return false;
  }

  function utasSubmit(e) {
    e.preventDefault();
    const company = PROVIDERS.find((p) => p.id === utas.company);
    const ok =
      (utas.branch || utasError('utas.e.branch', $('#uBranch'))) &&
      (utas.services.size || utasError('utas.e.services')) &&
      (company || utasError('utas.e.company')) &&
      (utas.brand || utasError('utas.e.brand', $('#uBrand'))) &&
      ($('#uParking').value.trim() || utasError('utas.e.parking', $('#uParking'))) &&
      ($('#uDate').value || utasError('utas.e.date', $('#uDate'))) &&
      (utas.time || utasError('utas.e.date', $('#uTime'))) &&
      ($('#uName').value.trim() || utasError('utas.e.name', $('#uName'))) &&
      (/^[79]\d{7}$/.test(utasPhone()) || utasError('utas.e.phone', $('#uPhone')));
    if (!ok) return;
    $$('.utas-form .bad').forEach((x) => x.classList.remove('bad'));
    const box = $('#uErr');
    box.className = 'u-err ok';
    box.textContent = t('utas.ok');
    box.hidden = false;
    const url = waLink(company.wa, utasMessage(company));
    const w = window.open(url, '_blank');
    if (w) w.opener = null; else window.location.href = url;
  }

  /* ---------- sync + render everything ---------- */
  function syncControls() {
    $('#heroService').value = $('#fService').value = state.service;
    $('#heroGov').value = $('#fGov').value = state.gov;
    $('#fSearch').value = state.q;
    $('#fSort').value = state.sort;
    $('#fOpen').checked = state.openOnly;
  }
  function renderAll() {
    applyI18n();
    renderSelects();
    renderServices();
    renderProviders();
    renderUtas();
    $('#stProviders').textContent = PROVIDERS.length;
    $('#stGovs').textContent = new Set(PROVIDERS.flatMap((p) => p.govs)).size;
    $('#stServices').textContent = SERVICES.length;
    syncControls();
  }
  const goToProviders = () => $('#providers').scrollIntoView({ behavior: 'smooth' });

  /* ---------- events ---------- */
  $('#heroSearch').addEventListener('submit', (e) => {
    e.preventDefault();
    state.service = $('#heroService').value;
    state.gov = $('#heroGov').value;
    syncControls();
    renderProviders();
    goToProviders();
  });
  $('#fService').addEventListener('change', (e) => { state.service = e.target.value; syncControls(); renderProviders(); });
  $('#fGov').addEventListener('change', (e) => { state.gov = e.target.value; syncControls(); renderProviders(); });
  $('#fSort').addEventListener('change', (e) => { state.sort = e.target.value; renderProviders(); });
  $('#fOpen').addEventListener('change', (e) => { state.openOnly = e.target.checked; renderProviders(); });
  $('#fSearch').addEventListener('input', (e) => { state.q = e.target.value; renderProviders(); });
  $('#resetBtn').addEventListener('click', () => {
    Object.assign(state, { service: '', gov: '', q: '', sort: 'rating', openOnly: false });
    syncControls();
    renderProviders();
  });

  $('#uBranch').addEventListener('change', (e) => { utas.branch = e.target.value; renderUtasCompanies(); });
  $('#uBrand').addEventListener('change', (e) => { utas.brand = e.target.value; });
  $('#uTime').addEventListener('change', (e) => { utas.time = e.target.value; });
  $('#uServices').addEventListener('change', (e) => {
    if (e.target.checked) utas.services.add(e.target.value); else utas.services.delete(e.target.value);
    renderUtasCompanies();
  });
  $('#uCompanies').addEventListener('change', (e) => {
    if (e.target.name === 'uCo') { utas.company = e.target.value; updateUtasTotal(); }
  });
  $('#utasForm').addEventListener('submit', utasSubmit);
  $('#utasForm').addEventListener('input', (e) => { e.target.classList.remove('bad'); });

  document.addEventListener('click', (e) => {
    const svc = e.target.closest('[data-service]');
    if (svc) { state.service = svc.dataset.service; syncControls(); renderProviders(); goToProviders(); return; }
    const det = e.target.closest('[data-details]');
    if (det) { openDetails(det.dataset.details); return; }
    if (e.target === $('#modal')) closeModal();
    if (e.target.closest('#nav a')) closeMenu();
  });
  $('#mClose').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  $('#langBtn').addEventListener('click', () => {
    lang = isAr() ? 'en' : 'ar';
    try { localStorage.setItem('carcare_lang', lang); } catch (e) {}
    closeModal();
    renderAll();
  });

  const burger = $('#burger');
  function closeMenu() { $('#nav').classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', () => {
    const open = $('#nav').classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  renderAll();
})();
