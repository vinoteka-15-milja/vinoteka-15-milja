(function () {
  // Mobilna navigacija
  var toggle = document.getElementById('mobile-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
})();

/* ---- Katalog filteri: AJAX (bez reload-a) + drawer + dropdown UX ----
   Sve je delegirano na document da preživi AJAX zamenu .wines-section. */
(function () {
  var SECTION = '.wines-section';
  // Linkovi koji filtriraju/straniče → presreći i učitaj AJAX-om (NE diramo kartice/korpu)
  var FILTER_LINK = '.filter-term, .filter-btn, .price-btn, .active-chip, .woocommerce-pagination a';
  var drawerOpen = false;

  function qs(sel) { return document.querySelector(sel); }
  function closeDropdowns() {
    document.querySelectorAll('.filter-dropdown[open]').forEach(function (d) { d.open = false; });
  }

  // ---- Mobilni drawer ----
  function openDrawer() {
    var p = qs('#filters-panel'), o = qs('#filters-overlay'), b = qs('#mobile-filter-toggle');
    if (!p) return;
    drawerOpen = true;
    p.classList.add('open'); if (o) o.classList.add('open');
    if (b) b.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    var p = qs('#filters-panel'), o = qs('#filters-overlay'), b = qs('#mobile-filter-toggle');
    drawerOpen = false;
    if (p) p.classList.remove('open'); if (o) o.classList.remove('open');
    if (b) b.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // ---- AJAX: učitaj URL i zameni samo .wines-section (bez reload-a) ----
  function sameOrigin(href) {
    try { return new URL(href, location.href).origin === location.origin; } catch (e) { return false; }
  }
  function ajaxGo(url, push) {
    var section = qs(SECTION);
    if (!section || !window.fetch || !window.history || !window.DOMParser) { window.location.href = url; return; }
    // zapamti koji je dropdown otvoren da ga vratimo posle zamene (multi-izbor bez zatvaranja)
    var openDd = document.querySelector('.filter-dropdown[open]');
    var openKey = openDd ? openDd.getAttribute('data-filter') : null;
    section.classList.add('v15-loading');
    fetch(url, { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var fresh = doc.querySelector(SECTION);
        if (!fresh) { window.location.href = url; return; }
        section.innerHTML = fresh.innerHTML;
        if (doc.title) document.title = doc.title;
        if (push) history.pushState({ v15: true }, '', url);
        if (drawerOpen) openDrawer();          // zadrži drawer otvoren na mobilnom
        if (openKey) {                          // ponovo otvori isti dropdown (multi-izbor)
          var nd = document.querySelector('.filter-dropdown[data-filter="' + openKey + '"]');
          if (nd) nd.open = true;
        }
        section.classList.remove('v15-loading');
      })
      .catch(function () { window.location.href = url; }); // mreža/parsiranje padne → običan reload
  }

  function formUrl(form) {
    var params = new URLSearchParams(new FormData(form));
    var action = form.getAttribute('action') || location.pathname;
    return action + '?' + params.toString();
  }

  // ---- Delegirani klik ----
  document.addEventListener('click', function (e) {
    if (e.target.closest('.mobile-filter-toggle')) { e.preventDefault(); openDrawer(); return; }
    if (e.target.closest('#filters-close') || e.target.closest('#filters-overlay') || e.target.closest('.filters-apply')) {
      e.preventDefault(); closeDrawer(); return;
    }
    var link = e.target.closest(FILTER_LINK);
    if (link && link.tagName === 'A' && sameOrigin(link.href)) {
      e.preventDefault(); ajaxGo(link.href, true); return;
    }
    if (!e.target.closest('.filter-dropdown')) closeDropdowns(); // klik van dropdowna
  });

  // ---- Pretraga (submit) i sortiranje (change) → AJAX ----
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('.wine-search');
    if (!form) return;
    e.preventDefault(); ajaxGo(formUrl(form), true);
  });
  document.addEventListener('change', function (e) {
    var sel = e.target.closest('.woocommerce-ordering select');
    if (!sel) return;
    var form = sel.closest('form');
    if (form) { e.preventDefault(); ajaxGo(formUrl(form), true); }
  });

  // ---- Samo jedan dropdown otvoren (capture: toggle ne bubbluje) ----
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (!d.classList || !d.classList.contains('filter-dropdown') || !d.open) return;
    document.querySelectorAll('.filter-dropdown[open]').forEach(function (o) { if (o !== d) o.open = false; });
  }, true);

  // ---- Esc zatvara dropdownove i drawer ----
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeDropdowns();
    if (drawerOpen) closeDrawer();
  });

  // ---- „Pretraži u listi" (delegirano) ----
  document.addEventListener('input', function (e) {
    var input = e.target.closest('.filter-list-search');
    if (!input) return;
    var q = input.value.trim().toLowerCase();
    var list = input.parentNode.querySelector('.filter-term-list');
    if (!list) return;
    list.querySelectorAll('.filter-term').forEach(function (a) {
      var name = a.getAttribute('data-name') || '';
      a.classList.toggle('hidden', q !== '' && name.indexOf(q) === -1);
    });
  });

  // ---- Back/forward dugme ----
  window.addEventListener('popstate', function () { ajaxGo(location.href, false); });
})();
