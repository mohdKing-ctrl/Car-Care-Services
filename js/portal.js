(function () {
  'use strict';
  const S = Auth.session();
  if (!S) return;

  const D = Dash, esc = D.esc;
  const $ = (s) => document.querySelector(s);

  // a company sees only its own data; the admin may open any company with ?company=id
  let id = S.company;
  if (S.role === 'admin') {
    id = new URLSearchParams(location.search).get('company');
    if (!id || !D.prov(id)) { location.replace('admin.html#companies'); return; }
    $('#adminBanner').hidden = false;
    $('#backAdmin').hidden = false;
  }
  const p = D.prov(id);
  if (!p) { document.body.innerHTML = '<p style="padding:40px">This account is not linked to a company.</p>'; return; }

  $('#who').textContent = S.role === 'admin' ? 'admin' : S.user;
  $('#hTitle').firstChild.textContent = p.name;
  $('#hSub').textContent = 'Company dashboard · Care Line partner';
  $('#logout').addEventListener('click', Auth.logout);

  const avatar = '<div class="avatar' + (p.logo ? ' logo-av' : '') + '" style="' + (p.logo ? '' : 'background:' + p.color) + '">' + (p.logo ? '<img src="' + p.logo + '" alt="">' : p.initials) + '</div>';
  $('#profile').innerHTML = '<div class="card-top">' + avatar + '<div><h2 style="margin:0">Welcome, ' + esc(p.name) + '</h2>' +
    '<div class="meta"><span>' + esc(p.nameAr) + '</span><span class="rate"><i>★</i> ' + p.rating.toFixed(1) + '</span><span>(' + p.reviews + ' reviews)</span>' +
    (p.utas ? '<span class="pill utas-pill">UTAS Partner</span>' : '') + '</div></div></div>';

  const KPI = [
    { key: 'imp', label: 'Times your card was shown', hint: 'Visitors who saw your company' },
    { key: 'open', label: 'Profile opens', hint: '"View prices" clicks' },
    { key: 'call', label: 'Calls' },
    { key: 'wa', label: 'WhatsApp clicks' },
    { key: 'svc', label: 'Service clicks', hint: 'Customers who picked a service' },
    { key: 'order', label: 'UTAS orders' }
  ];

  function render() {
    const days = +$('#period').value, sample = $('#useSample').checked;
    const cur = D.stats({ days, sample, company: id }), prev = D.stats({ days, offset: days, sample, company: id });
    $('#kpis').innerHTML = D.kpiRow(cur.total, prev.total, KPI);
    const live = Track.events().filter((e) => e.c === id).length;
    $('#sampleNote').innerHTML = sample
      ? 'Sample history is <b>simulated</b> for the demonstration. Live events for you on this browser: <b>' + live + '</b>.'
      : 'Showing only live events recorded on this browser: <b>' + live + '</b>.';

    D.line($('#mainChart'), {
      title: 'Views and contact actions',
      sub: 'How often your card was shown, and how many calls + WhatsApp clicks you received, per day',
      labels: cur.keys,
      series: [
        { name: 'Card views', color: D.C1, values: cur.daily.map((d) => d.imp) },
        { name: 'Contact actions', color: D.C2, values: cur.daily.map((d) => d.call + d.wa) }
      ]
    });

    const svc = Object.keys(p.services).map((k) => ({ label: D.svcName(k), value: cur.bySvc[k] || 0 })).sort((a, b) => b.value - a.value);
    D.bars($('#svcBars'), { title: 'Clicks on your services', sub: 'Customers who pressed "Book" on a service', items: svc });

    D.bars($('#howBars'), {
      title: 'How customers reach you', sub: 'Contact actions in this period',
      items: [
        { label: 'WhatsApp clicks', value: cur.total.wa },
        { label: 'Calls', value: cur.total.call },
        { label: 'Service clicks', value: cur.total.svc },
        { label: 'UTAS orders', value: cur.total.order }
      ]
    });

    $('#orders').innerHTML = D.ordersTable(D.orders({ company: id, days, sample }).slice(0, 100));
  }

  $('#listing').innerHTML =
    '<div class="dgrid">' +
    '<div><span>Phone / WhatsApp</span>' + D.fmtPhone(p.wa) + '</div>' +
    '<div><span>Working hours</span>' + (p.hours[0] === 0 && p.hours[1] === 24 ? '24 hours' : p.hours[0] + ':00 – ' + p.hours[1] + ':00') + ' · replies in ~' + p.reply + ' min</div>' +
    '<div><span>Governorates</span>' + esc(p.govs.map(D.govName).join(', ')) + '</div>' +
    '<div><span>Areas served</span>' + esc(p.areas.map((a) => a[0]).join(', ')) + '</div>' +
    '<div style="grid-column:1/-1"><span>Description</span>' + esc(p.desc) + '</div></div>' +
    '<div class="tbl-scroll" style="max-height:260px"><table class="dt"><thead><tr><th>Service</th><th class="num">Starting price</th></tr></thead><tbody>' +
    Object.keys(p.services).map((k) => '<tr><td>' + esc(D.svcName(k)) + '</td><td class="num">' + p.services[k].toFixed(3) + ' OMR</td></tr>').join('') + '</tbody></table></div>';

  $('#period').addEventListener('change', render);
  $('#useSample').addEventListener('change', render);
  render();
})();
