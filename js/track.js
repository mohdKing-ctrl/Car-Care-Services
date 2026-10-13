/* Visit and click tracker for the public website.
   A static site has no server database, so events are stored in this browser (localStorage).
   The dashboards read them back and add sample history so the charts are not empty in a demo. */
const Track = (function () {
  const EV = 'careline_events';
  const OR = 'careline_orders';
  const MAX = 6000;

  const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  // k = visit | imp | open | call | wa | svc | order | svcfilter ; c = company id ; s = service key
  function log(k, c, s) {
    const list = read(EV);
    list.push({ t: Date.now(), k: k, c: c || null, s: s || null });
    if (list.length > MAX) list.splice(0, list.length - MAX);
    write(EV, list);
  }
  function order(o) {
    const list = read(OR);
    list.push(Object.assign({ t: Date.now() }, o));
    write(OR, list.slice(-1000));
    log('order', o.company, null);
  }
  function visit() {
    try {
      if (sessionStorage.getItem('careline_visited')) return;
      sessionStorage.setItem('careline_visited', '1');
    } catch (e) {}
    log('visit');
  }
  function clear() { try { localStorage.removeItem(EV); localStorage.removeItem(OR); } catch (e) {} }

  return { log, order, visit, clear, events: () => read(EV), orders: () => read(OR) };
})();
