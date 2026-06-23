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

/* ---- Katalog filteri: mobilni drawer + pretraga u listi ---- */
(function () {
  // Mobilni drawer
  var panel = document.getElementById('filters-panel');
  var overlay = document.getElementById('filters-overlay');
  var openBtn = document.getElementById('mobile-filter-toggle');
  var closeBtn = document.getElementById('filters-close');
  var applyBtn = document.getElementById('filters-apply');

  function openPanel() {
    if (!panel) return;
    panel.classList.add('open');
    if (overlay) overlay.classList.add('open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closePanel() {
    if (!panel) return;
    panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (openBtn) openBtn.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (overlay) overlay.addEventListener('click', closePanel);
  if (applyBtn) applyBtn.addEventListener('click', closePanel); // izbor već reloaduje; ovo samo zatvori sheet

  // „Pretraži u listi" — sakrij nepodudarne termine u dropdownu
  document.querySelectorAll('.filter-list-search').forEach(function (input) {
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var list = input.parentNode.querySelector('.filter-term-list');
      if (!list) return;
      list.querySelectorAll('.filter-term').forEach(function (a) {
        var name = a.getAttribute('data-name') || '';
        a.classList.toggle('hidden', q !== '' && name.indexOf(q) === -1);
      });
    });
  });

  // Samo jedan dropdown otvoren u isto vreme + zatvaranje klikom van / Esc
  var dropdowns = document.querySelectorAll('.filter-dropdown');
  dropdowns.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      dropdowns.forEach(function (o) { if (o !== d && o.open) o.open = false; });
    });
  });
  if (dropdowns.length) {
    document.addEventListener('click', function (e) {
      var inside = false;
      dropdowns.forEach(function (d) { if (d.contains(e.target)) inside = true; });
      if (!inside) dropdowns.forEach(function (d) { if (d.open) d.open = false; });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') dropdowns.forEach(function (d) { if (d.open) d.open = false; });
    });
  }
})();
