/* Applies the SEO text saved in the admin dashboard ("SEO text" tab) to this browser.
   Static websites cannot change files on the server, so this is a live preview for demonstrations.
   To publish the text for everyone, download the updated index.html from the dashboard and upload it. */
(function () {
  try {
    var v = JSON.parse(localStorage.getItem('careline_seo_live') || 'null');
    if (!v) return;
    var head = document.head;
    function meta(selector, create, value) {
      if (!value) return;
      var el = document.querySelector(selector);
      if (!el && create) {
        el = document.createElement('meta');
        var m = /\[(name|property)="([^"]+)"\]/.exec(selector);
        el.setAttribute(m[1], m[2]);
        head.appendChild(el);
      }
      if (el) el.setAttribute('content', value);
    }
    if (v.title) document.title = v.title;
    meta('meta[name="description"]', true, v.description);
    meta('meta[name="keywords"]', true, v.keywords);
    meta('meta[property="og:title"]', false, v.ogTitle);
    meta('meta[name="twitter:title"]', false, v.ogTitle);
    meta('meta[property="og:description"]', false, v.ogDescription);
    meta('meta[name="twitter:description"]', false, v.ogDescription);
  } catch (e) {}
})();
