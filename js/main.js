/* ============================================
   VINOTEKA 15 MILJA - Main JavaScript
   Dynamic card generation from wines-data.js
   + navigation, filtering, search, animations
   ============================================ */

(function () {
  'use strict';

  /* ============================================
     AGE GATE (18+ Verification)
     ============================================ */
  function initAgeGate() {
    var overlay = document.getElementById('age-gate');
    var yesBtn = document.getElementById('age-gate-yes');
    var noBtn = document.getElementById('age-gate-no');

    if (!overlay) return;

    /* Check if already verified (session-based) */
    if (sessionStorage.getItem('ageVerified') === 'true') {
      overlay.style.display = 'none';
      return;
    }

    /* Lock scrolling */
    document.body.classList.add('age-locked');

    yesBtn.addEventListener('click', function () {
      sessionStorage.setItem('ageVerified', 'true');
      overlay.classList.add('dismissed');
      document.body.classList.remove('age-locked');
      setTimeout(function () { overlay.style.display = 'none'; }, 500);
    });

    noBtn.addEventListener('click', function () {
      var denied = document.getElementById('age-gate-denied');
      var title = overlay.querySelector('.age-gate-title');
      var text = overlay.querySelector('.age-gate-text');
      if (title) title.textContent = 'Pristup odbijen';
      if (text) text.style.display = 'none';
      if (denied) denied.style.display = 'block';
    });
  }


  /* ============================================
     DIACRITICS NORMALIZATION FOR SEARCH
     Maps Latin characters to their base equivalents
     ============================================ */
  var DIACRITICS_MAP = {
    'ć': 'c', 'č': 'c', 'ş': 's', 'š': 's',
    'đ': 'dj', 'ž': 'z', 'á': 'a', 'à': 'a',
    'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
    'ñ': 'n', 'ý': 'y', 'ÿ': 'y', 'ß': 'ss',
    'ø': 'o', 'æ': 'ae', 'œ': 'oe',
    'á': 'a', 'ą': 'a', 'ę': 'e', 'ł': 'l',
    'ź': 'z', 'ż': 'z', 'ń': 'n',
    'ř': 'r', 'ť': 't', 'ď': 'd', 'ň': 'n',
    'ů': 'u', 'ě': 'e'
  };

  function removeDiacritics(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      result += DIACRITICS_MAP[ch] || ch;
    }
    return result;
  }


  /* ---- DOM References ---- */
  var header = document.getElementById('site-header');
  var mobileToggle = document.getElementById('mobile-toggle');
  var mainNav = document.getElementById('main-nav');
  var navLinks = document.querySelectorAll('.nav-link');
  var backToTop = document.getElementById('back-to-top');
  var noResults = document.getElementById('no-results');
  var winesGrid = document.getElementById('wines-grid');
  var featuredGrid = document.getElementById('featured-grid');
  var searchInput = document.getElementById('wine-search');
  var resultsCount = document.getElementById('results-count');

  /* Current filter state */
  var activeCategory = 'all';
  var activeOrigin = 'all';
  var activePrice = 'all';
  var searchQuery = '';

  /* Cenovni rangovi: cena 0 ("Na upit") prolazi samo kroz "all" i "inquiry" */
  var PRICE_RANGES = {
    '0-1500': function (p) { return p > 0 && p <= 1500; },
    '1500-3000': function (p) { return p > 1500 && p <= 3000; },
    '3000+': function (p) { return p > 3000; },
    'inquiry': function (p) { return !p || p === 0; }
  };

  /* Lazy loading state */
  var BATCH_SIZE = 24;
  var displayedCount = 0;
  var filteredProducts = [];
  var sentinel = null;
  var lazyObserver = null;

  /* Icons per type */
  var TYPE_ICONS = {
    red: '&#127863;', white: '&#127863;', rose: '&#127863;',
    sparkling: '&#127870;', special: '&#127863;',
    rakija: '&#127862;', spirits: '&#129347;', delicacy: '&#127858;'
  };

  /* Featured products - hand-picked names from data */
  var FEATURED_NAMES = [
    'Aleksandrović Rodoslov',
    'ZENATO Amarone DOCG',
    'Kovačević Chardonnay',
    'Moët & Chandon Brut Impérial',
    'San Marzano Sessantanni',
    'Zarić Magija Sa Kutijom'
  ];

  var FEATURED_BADGES = ['Vrhunsko', 'Italija', 'Fruška Gora', 'Champagne', 'Puglia', 'Premium'];


  /* ============================================
     FORMAT PRICE
     ============================================ */
  function formatPrice(price) {
    if (!price || price === 0) return 'Na upit';
    return price.toLocaleString('sr-RS') + ' RSD';
  }


  /* ============================================
     CREATE A WINE CARD HTML STRING
     ============================================ */
  function createCardHTML(product, badge) {
    var typeInfo = TYPES[product.type] || { label: product.type, css: 'red-wine' };
    var countryInfo = COUNTRIES[product.country] || { name: '', flag: '' };
    var icon = TYPE_ICONS[product.type] || '&#127863;';
    var origin = product.country === 'rs' ? 'serbian' : 'international';

    var badgeHTML = badge ? '<span class="wine-badge">' + escapeHTML(badge) + '</span>' : '';
    var originBadge = countryInfo.flag + ' ' + escapeHTML(countryInfo.name);

    /* Image: real photo if available, otherwise gradient placeholder */
    var imageInner;
    if (product.image) {
      imageInner =
        '<div class="wine-image-real ' + typeInfo.css + '">' +
          '<img src="' + escapeHTML(product.image) + '" alt="' + escapeHTML(product.name) + '" loading="lazy" onerror="this.parentElement.classList.add(\'img-error\');this.style.display=\'none\';this.parentElement.querySelector(\'.fallback-icon\').style.display=\'block\';">' +
          '<span class="fallback-icon" style="display:none;">' + icon + '</span>' +
        '</div>';
    } else {
      imageInner =
        '<div class="wine-image-placeholder ' + typeInfo.css + '">' +
          '<span class="wine-bottle-icon">' + icon + '</span>' +
        '</div>';
    }

    return '<article class="wine-card" data-id="' + escapeHTML(product.id) + '" data-category="' + product.type + '" data-origin="' + origin + '" data-country="' + product.country + '">' +
      '<div class="wine-card-image">' +
        imageInner +
        badgeHTML +
        '<span class="wine-origin-badge">' + originBadge + '</span>' +
      '</div>' +
      '<div class="wine-card-body">' +
        '<span class="wine-category">' + typeInfo.label + '</span>' +
        '<h3 class="wine-name">' + escapeHTML(product.name) + '</h3>' +
        '<p class="wine-origin">' + escapeHTML(product.region) + ', ' + escapeHTML(countryInfo.name) + '</p>' +
        '<p class="wine-grape">' + escapeHTML(product.winery) + '</p>' +
        '<div class="wine-card-footer">' +
          '<span class="wine-price">' + formatPrice(product.price) + '</span>' +
        '</div>' +
      '</div>' +
    '</article>';
  }


  /* ============================================
     RENDER FEATURED WINES
     ============================================ */
  function renderFeatured() {
    if (!featuredGrid || typeof PRODUCTS === 'undefined') return;
    var html = '';
    FEATURED_NAMES.forEach(function (name, i) {
      var product = null;
      for (var j = 0; j < PRODUCTS.length; j++) {
        if (PRODUCTS[j].name === name) { product = PRODUCTS[j]; break; }
      }
      if (product) {
        html += createCardHTML(product, FEATURED_BADGES[i] || 'Preporuka');
      }
    });
    featuredGrid.innerHTML = html;
  }


  /* ============================================
     GET FILTERED PRODUCTS FROM DATA
     ============================================ */
  function getFilteredProducts() {
    if (typeof PRODUCTS === 'undefined') return [];
    var query = searchQuery.toLowerCase().trim();
    var mainCountries = ['rs', 'hr', 'ba', 'it', 'fr', 'es', 'cl'];

    return PRODUCTS.filter(function (product) {
      var matchCategory = activeCategory === 'all' || product.type === activeCategory;

      var matchOrigin = true;
      if (activeOrigin !== 'all') {
        if (activeOrigin === 'other') {
          matchOrigin = mainCountries.indexOf(product.country) === -1;
        } else {
          matchOrigin = product.country === activeOrigin;
        }
      }

      var matchPrice = activePrice === 'all' ||
        (PRICE_RANGES[activePrice] ? PRICE_RANGES[activePrice](product.price) : true);

      var matchSearch = true;
      if (query.length > 0) {
        var combined = (product.name + ' ' + product.winery + ' ' + (product.region || '')).toLowerCase();
        var combinedNorm = removeDiacritics(combined);
        var queryNorm = removeDiacritics(query);
        matchSearch = combined.indexOf(query) !== -1 || combinedNorm.indexOf(queryNorm) !== -1;
      }

      return matchCategory && matchOrigin && matchPrice && matchSearch;
    });
  }


  /* ============================================
     RENDER NEXT BATCH OF CARDS (LAZY LOADING)
     ============================================ */
  function renderBatch() {
    if (!winesGrid || displayedCount >= filteredProducts.length) return;
    var end = Math.min(displayedCount + BATCH_SIZE, filteredProducts.length);
    var html = '';
    for (var i = displayedCount; i < end; i++) {
      html += createCardHTML(filteredProducts[i]);
    }
    winesGrid.insertAdjacentHTML('beforeend', html);
    displayedCount = end;
    updateResultsCount();

    /* Hide sentinel when all loaded */
    if (sentinel) {
      sentinel.style.display = displayedCount >= filteredProducts.length ? 'none' : 'block';
    }
  }


  /* ============================================
     RESULTS COUNT
     ============================================ */
  function updateResultsCount() {
    if (!resultsCount) return;
    if (filteredProducts.length === 0) {
      resultsCount.textContent = '';
      return;
    }
    resultsCount.textContent = 'Prikazano ' +
      Math.min(displayedCount, filteredProducts.length) +
      ' od ' + filteredProducts.length;
  }


  /* ============================================
     FILTER & SEARCH (resets lazy loading)
     ============================================ */
  function filterWines() {
    filteredProducts = getFilteredProducts();
    displayedCount = 0;
    if (winesGrid) winesGrid.innerHTML = '';
    renderBatch();
    updateResultsCount();

    if (noResults) {
      noResults.style.display = filteredProducts.length === 0 ? 'block' : 'none';
    }

    renderActiveChips();
    updateFilterToggleLabel();
  }


  /* ============================================
     INIT LAZY LOADING OBSERVER
     ============================================ */
  function initLazyLoad() {
    if (!winesGrid || !('IntersectionObserver' in window)) return;

    sentinel = document.createElement('div');
    sentinel.className = 'lazy-sentinel';
    sentinel.style.height = '1px';
    winesGrid.parentNode.insertBefore(sentinel, winesGrid.nextSibling);

    lazyObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && displayedCount < filteredProducts.length) {
        renderBatch();
      }
    }, { rootMargin: '300px' });

    lazyObserver.observe(sentinel);
  }


  /* ============================================
     HEADER SCROLL EFFECT
     ============================================ */
  var isContactPage = !document.getElementById('home');

  function handleHeaderScroll() {
    if (isContactPage || window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }


  /* ============================================
     MOBILE NAVIGATION
     ============================================ */
  function toggleMobileNav() {
    var isOpen = mainNav.classList.contains('open');
    mainNav.classList.toggle('open');
    mobileToggle.classList.toggle('active');
    mobileToggle.setAttribute('aria-expanded', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  function closeMobileNav() {
    mainNav.classList.remove('open');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }


  /* ============================================
     ACTIVE NAV LINK ON SCROLL
     ============================================ */
  function updateActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var scrollY = window.scrollY + 120;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
          if (id === 'home' && link.getAttribute('href') === '#home') {
            link.classList.add('active');
          }
        });
      }
    });
  }


  /* ============================================
     BACK TO TOP
     ============================================ */
  function handleBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  /* ============================================
     SCROLL ANIMATIONS (Intersection Observer)
     ============================================ */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate-on-scroll');
    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }


  /* ============================================
     SMOOTH SCROLL FOR NAV LINKS
     ============================================ */
  function handleNavClick(e) {
    var href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
      closeMobileNav();
    } else {
      /* External page link (e.g. contact.html) - close mobile nav and let browser navigate */
      closeMobileNav();
    }
  }


  /* ============================================
     FOOTER FILTER LINKS
     ============================================ */
  function initFooterFilterLinks() {
    var filterLinks = document.querySelectorAll('[data-filter-link]');
    filterLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var filter = this.getAttribute('data-filter-link');
        var filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(function (btn) {
          btn.classList.remove('active');
          if (btn.getAttribute('data-filter') === filter) btn.classList.add('active');
        });
        activeCategory = filter;
        filterWines();
        var winesSection = document.getElementById('wines');
        if (winesSection) {
          window.scrollTo({ top: winesSection.offsetTop - 80, behavior: 'smooth' });
        }
      });
    });
  }


  /* ============================================
     ABOUT SECTION SLIDESHOW
     ============================================ */
  function initSlideshow() {
    var slideshow = document.querySelector('.about-slideshow');
    if (!slideshow) return;

    var slides = slideshow.querySelectorAll('.slide');
    if (slides.length < 2) return;

    var current = 0;
    var INTERVAL = 4000;

    setInterval(function () {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, INTERVAL);
  }


  /* ============================================
     CART PANEL (UI nad window.Cart API-jem)
     ============================================ */
  var cartPanel = document.getElementById('cart-panel');
  var cartOverlay = document.getElementById('cart-overlay');

  function openCartPanel() {
    if (!cartPanel) return;
    renderCartPanel();
    cartPanel.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('open');
    document.body.classList.add('cart-locked');
  }

  function closeCartPanel() {
    if (!cartPanel) return;
    cartPanel.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');
    document.body.classList.remove('cart-locked');
  }

  function updateCartBadge() {
    var badge = document.getElementById('cart-count');
    if (!badge || typeof Cart === 'undefined') return;
    var count = Cart.getCount();
    badge.textContent = count > 99 ? '99+' : count;
    badge.hidden = count === 0;
  }

  function cartThumbHTML(product) {
    var typeInfo = TYPES[product.type] || { label: product.type, css: 'red-wine' };
    var icon = TYPE_ICONS[product.type] || '&#127863;';
    if (product.image) {
      return '<div class="cart-item-thumb ' + typeInfo.css + '">' +
        '<img src="' + escapeHTML(product.image) + '" alt="" onerror="this.style.display=\'none\';">' +
      '</div>';
    }
    return '<div class="cart-item-thumb ' + typeInfo.css + '"><span>' + icon + '</span></div>';
  }

  function renderCartPanel() {
    var itemsBox = document.getElementById('cart-items');
    var foot = document.getElementById('cart-foot');
    var totalEl = document.getElementById('cart-total');
    if (!itemsBox || typeof Cart === 'undefined') return;

    var items = Cart.getItems();

    if (items.length === 0) {
      itemsBox.innerHTML =
        '<div class="cart-empty">' +
          '<span class="cart-empty-icon">&#127863;</span>' +
          '<p>Korpa je prazna.</p>' +
          '<p class="cart-empty-sub">Dodajte vina iz naše ponude.</p>' +
        '</div>';
      if (foot) foot.style.display = 'none';
      return;
    }

    var html = '';
    items.forEach(function (item) {
      var product = PRODUCT_BY_ID[item.id];
      if (!product) return;
      html +=
        '<div class="cart-item" data-id="' + escapeHTML(item.id) + '">' +
          cartThumbHTML(product) +
          '<div class="cart-item-body">' +
            '<div class="cart-item-name">' + escapeHTML(product.name) + '</div>' +
            '<div class="cart-item-winery">' + escapeHTML(product.winery) + '</div>' +
            '<div class="cart-item-row">' +
              '<div class="qty-stepper qty-stepper-sm">' +
                '<button class="qty-btn" data-cart-action="minus" aria-label="Manje">&minus;</button>' +
                '<span class="qty-value">' + item.qty + '</span>' +
                '<button class="qty-btn" data-cart-action="plus" aria-label="Više">+</button>' +
              '</div>' +
              '<span class="cart-item-price">' + formatPrice(product.price * item.qty) + '</span>' +
            '</div>' +
          '</div>' +
          '<button class="cart-item-remove" data-cart-action="remove" aria-label="Ukloni">&times;</button>' +
        '</div>';
    });
    itemsBox.innerHTML = html;

    if (foot) foot.style.display = '';
    if (totalEl) totalEl.textContent = formatPrice(Cart.getTotal());
  }

  function initCart() {
    var toggle = document.getElementById('cart-toggle');
    if (typeof Cart === 'undefined') {
      if (toggle) toggle.style.display = 'none';
      return;
    }

    if (toggle) toggle.addEventListener('click', openCartPanel);

    var closeBtn = document.getElementById('cart-close');
    var continueBtn = document.getElementById('cart-continue');
    if (closeBtn) closeBtn.addEventListener('click', closeCartPanel);
    if (continueBtn) continueBtn.addEventListener('click', closeCartPanel);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartPanel);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && cartPanel && cartPanel.classList.contains('open')) {
        closeCartPanel();
      }
    });

    /* Event delegacija za +/-/ukloni unutar panela */
    var itemsBox = document.getElementById('cart-items');
    if (itemsBox) {
      itemsBox.addEventListener('click', function (e) {
        var actionBtn = e.target.closest('[data-cart-action]');
        if (!actionBtn) return;
        var row = actionBtn.closest('.cart-item');
        if (!row) return;
        var id = row.getAttribute('data-id');
        var items = Cart.getItems();
        var current = null;
        for (var i = 0; i < items.length; i++) {
          if (items[i].id === id) { current = items[i]; break; }
        }
        if (!current) return;

        var action = actionBtn.getAttribute('data-cart-action');
        if (action === 'plus') Cart.setQty(id, current.qty + 1);
        else if (action === 'minus') Cart.setQty(id, current.qty - 1);
        else if (action === 'remove') Cart.remove(id);
      });
    }

    Cart.onChange(function () {
      updateCartBadge();
      renderCartPanel();
    });

    updateCartBadge();
  }


  /* ============================================
     PRODUCT DETAIL MODAL
     ============================================ */
  var modalOverlay = document.getElementById('product-modal');
  var modalQty = 1;

  function buildModalMedia(product) {
    var typeInfo = TYPES[product.type] || { label: product.type, css: 'red-wine' };
    var icon = TYPE_ICONS[product.type] || '&#127863;';
    if (product.image) {
      return '<div class="modal-image ' + typeInfo.css + '">' +
        '<img src="' + escapeHTML(product.image) + '" alt="' + escapeHTML(product.name) + '" onerror="this.style.display=\'none\';this.parentElement.querySelector(\'.fallback-icon\').style.display=\'block\';">' +
        '<span class="fallback-icon" style="display:none;">' + icon + '</span>' +
      '</div>';
    }
    return '<div class="modal-image ' + typeInfo.css + '">' +
      '<span class="fallback-icon">' + icon + '</span>' +
    '</div>';
  }

  function openProductModal(product) {
    if (!modalOverlay) return;
    var media = document.getElementById('product-modal-media');
    var info = document.getElementById('product-modal-info');
    var typeInfo = TYPES[product.type] || { label: product.type, css: 'red-wine' };
    var countryInfo = COUNTRIES[product.country] || { name: '', flag: '' };
    modalQty = 1;

    media.innerHTML = buildModalMedia(product);

    /* Bez dupliranja kad je region isti kao država (npr. "Srbija, Srbija") */
    var originText = (product.region && product.region !== countryInfo.name)
      ? escapeHTML(product.region) + ', ' + countryInfo.flag + ' ' + escapeHTML(countryInfo.name)
      : countryInfo.flag + ' ' + escapeHTML(countryInfo.name);

    var html =
      '<span class="modal-category">' + typeInfo.label + '</span>' +
      '<h3 class="modal-name">' + escapeHTML(product.name) + '</h3>' +
      '<p class="modal-winery">' + escapeHTML(product.winery) + '</p>' +
      '<ul class="modal-meta">' +
        '<li><span>Poreklo</span>' + originText + '</li>' +
        (product.size ? '<li><span>Pakovanje</span>' + escapeHTML(product.size) + '</li>' : '') +
      '</ul>' +
      '<div class="modal-price" id="modal-price">' + formatPrice(product.price) + '</div>';

    if (product.price > 0) {
      html +=
        '<div class="modal-actions">' +
          '<div class="qty-stepper">' +
            '<button class="qty-btn" id="modal-qty-minus" aria-label="Manje">&minus;</button>' +
            '<span class="qty-value" id="modal-qty-value">1</span>' +
            '<button class="qty-btn" id="modal-qty-plus" aria-label="Više">+</button>' +
          '</div>' +
          '<button class="btn btn-primary modal-add-btn" id="modal-add-to-cart">Dodaj u korpu</button>' +
        '</div>';
    } else {
      html +=
        '<div class="modal-inquiry">' +
          '<p>Za cenu i dostupnost ovog artikla pozovite nas ili nam pišite.</p>' +
          '<a href="tel:+38163367514" class="btn btn-outline">+381 63 367 514</a>' +
        '</div>';
    }

    info.innerHTML = html;

    /* Qty stepper + dodavanje u korpu (Cart stiže u fazi 4 — guard) */
    var minus = document.getElementById('modal-qty-minus');
    var plus = document.getElementById('modal-qty-plus');
    var qtyValue = document.getElementById('modal-qty-value');
    var addBtn = document.getElementById('modal-add-to-cart');
    var priceEl = document.getElementById('modal-price');

    /* Cena se množi sa izabranom količinom, uz naznaku "N × jedinična" */
    function updateModalPrice() {
      if (!priceEl || !(product.price > 0)) return;
      if (modalQty > 1) {
        priceEl.innerHTML = formatPrice(product.price * modalQty) +
          ' <span class="modal-price-unit">' + modalQty + ' &times; ' + formatPrice(product.price) + '</span>';
      } else {
        priceEl.textContent = formatPrice(product.price);
      }
    }

    if (minus && plus && qtyValue) {
      minus.addEventListener('click', function () {
        modalQty = Math.max(1, modalQty - 1);
        qtyValue.textContent = modalQty;
        updateModalPrice();
      });
      plus.addEventListener('click', function () {
        modalQty = Math.min(99, modalQty + 1);
        qtyValue.textContent = modalQty;
        updateModalPrice();
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', function () {
        if (typeof Cart === 'undefined') return;
        var ok = Cart.add(product.id, modalQty);
        if (ok) {
          closeProductModal();
          openCartPanel();
        }
      });
    }

    modalOverlay.hidden = false;
    /* reflow pa klasa za animaciju */
    void modalOverlay.offsetWidth;
    modalOverlay.classList.add('open');
    document.body.classList.add('modal-locked');
  }

  function closeProductModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.classList.remove('modal-locked');
    setTimeout(function () { modalOverlay.hidden = true; }, 300);
  }

  function initProductModal() {
    if (!modalOverlay) return;
    var closeBtn = document.getElementById('product-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeProductModal);
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeProductModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalOverlay.hidden) closeProductModal();
    });

    /* Event delegacija: klik na karticu otvara modal */
    function handleCardClick(e) {
      var card = e.target.closest('.wine-card');
      if (!card || !card.dataset.id) return;
      var product = PRODUCT_BY_ID[card.dataset.id];
      if (product) openProductModal(product);
    }
    if (winesGrid) winesGrid.addEventListener('click', handleCardClick);
    if (featuredGrid) featuredGrid.addEventListener('click', handleCardClick);
  }


  /* ============================================
     AKTIVNI FILTER CHIPOVI + MOBILNI DRAWER
     ============================================ */
  function setGroupActive(btnSelector, attr, value) {
    var btns = document.querySelectorAll(btnSelector);
    btns.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute(attr) === value);
    });
  }

  function getButtonLabel(btnSelector, attr, value) {
    var btn = document.querySelector(btnSelector + '[' + attr + '="' + value + '"]');
    return btn ? btn.textContent.trim() : value;
  }

  function countActiveFilters() {
    var n = 0;
    if (activeCategory !== 'all') n++;
    if (activeOrigin !== 'all') n++;
    if (activePrice !== 'all') n++;
    return n;
  }

  function updateFilterToggleLabel() {
    var toggle = document.getElementById('mobile-filter-toggle');
    if (!toggle) return;
    var n = countActiveFilters();
    toggle.textContent = n > 0 ? 'Filteri (' + n + ')' : 'Filteri';
  }

  function clearAllFilters() {
    activeCategory = 'all';
    activeOrigin = 'all';
    activePrice = 'all';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    setGroupActive('.filter-btn', 'data-filter', 'all');
    setGroupActive('.origin-btn', 'data-origin', 'all');
    setGroupActive('.price-btn', 'data-price', 'all');
    filterWines();
  }

  function renderActiveChips() {
    var box = document.getElementById('active-chips');
    if (!box) return;
    box.innerHTML = '';

    var chips = [];
    if (activeCategory !== 'all') {
      chips.push({
        label: getButtonLabel('.filter-btn', 'data-filter', activeCategory),
        clear: function () {
          activeCategory = 'all';
          setGroupActive('.filter-btn', 'data-filter', 'all');
        }
      });
    }
    if (activeOrigin !== 'all') {
      chips.push({
        label: getButtonLabel('.origin-btn', 'data-origin', activeOrigin),
        clear: function () {
          activeOrigin = 'all';
          setGroupActive('.origin-btn', 'data-origin', 'all');
        }
      });
    }
    if (activePrice !== 'all') {
      chips.push({
        label: getButtonLabel('.price-btn', 'data-price', activePrice),
        clear: function () {
          activePrice = 'all';
          setGroupActive('.price-btn', 'data-price', 'all');
        }
      });
    }
    if (searchQuery.trim().length > 0) {
      chips.push({
        label: '„' + searchQuery.trim() + '“',
        clear: function () {
          searchQuery = '';
          if (searchInput) searchInput.value = '';
        }
      });
    }

    if (chips.length === 0) return;

    chips.forEach(function (chip) {
      var btn = document.createElement('button');
      btn.className = 'active-chip';
      btn.innerHTML = escapeHTML(chip.label) + ' <span class="chip-x">&times;</span>';
      btn.addEventListener('click', function () {
        chip.clear();
        filterWines();
      });
      box.appendChild(btn);
    });

    if (chips.length > 1) {
      var clearBtn = document.createElement('button');
      clearBtn.className = 'active-chip chip-clear';
      clearBtn.textContent = 'Poništi sve';
      clearBtn.addEventListener('click', clearAllFilters);
      box.appendChild(clearBtn);
    }
  }

  function initFilterDrawer() {
    var toggle = document.getElementById('mobile-filter-toggle');
    var panel = document.getElementById('filters-panel');
    var overlay = document.getElementById('filters-overlay');
    var closeBtn = document.getElementById('filters-close');
    var applyBtn = document.getElementById('filters-apply');
    var resetBtn = document.getElementById('filters-reset');
    if (!toggle || !panel) return;

    function openDrawer() {
      panel.classList.add('open');
      if (overlay) overlay.classList.add('open');
      document.body.classList.add('filters-locked');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function closeDrawer() {
      panel.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.classList.remove('filters-locked');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (applyBtn) applyBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
    if (resetBtn) resetBtn.addEventListener('click', clearAllFilters);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) closeDrawer();
    });
  }


  /* ============================================
     DEBOUNCE UTILITY
     ============================================ */
  function debounce(fn, delay) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }


  /* ============================================
     INIT
     ============================================ */
  function init() {
    /* 0. Age verification */
    initAgeGate();

    /* 1. Render dynamic cards */
    renderFeatured();
    initLazyLoad();

    /* 2. Scroll events */
    window.addEventListener('scroll', function () {
      handleHeaderScroll();
      updateActiveNav();
      handleBackToTop();
    }, { passive: true });

    /* 3. Mobile nav */
    if (mobileToggle) mobileToggle.addEventListener('click', toggleMobileNav);

    /* 4. Nav links */
    navLinks.forEach(function (link) { link.addEventListener('click', handleNavClick); });

    /* 5. Back to top */
    if (backToTop) backToTop.addEventListener('click', scrollToTop);

    /* 6. Filter buttons (category) */
    var filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        e.currentTarget.classList.add('active');
        activeCategory = e.currentTarget.getAttribute('data-filter');
        filterWines();
      });
    });

    /* 7. Origin buttons (country) */
    var originBtns = document.querySelectorAll('.origin-btn');
    originBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        originBtns.forEach(function (b) { b.classList.remove('active'); });
        e.currentTarget.classList.add('active');
        activeOrigin = e.currentTarget.getAttribute('data-origin');
        filterWines();
      });
    });

    /* 7b. Price buttons */
    var priceBtns = document.querySelectorAll('.price-btn');
    priceBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        priceBtns.forEach(function (b) { b.classList.remove('active'); });
        e.currentTarget.classList.add('active');
        activePrice = e.currentTarget.getAttribute('data-price');
        filterWines();
      });
    });

    /* 8. Search */
    if (searchInput) {
      searchInput.addEventListener('input', debounce(function () {
        searchQuery = searchInput.value;
        filterWines();
      }, 200));
    }

    /* 8b. Mobilni filter drawer */
    initFilterDrawer();

    /* 8c. Modal detalja proizvoda */
    initProductModal();

    /* 8d. Korpa */
    initCart();

    /* 9. Footer filter links */
    initFooterFilterLinks();

    /* 10. Animations */
    initScrollAnimations();

    /* 11. About slideshow */
    initSlideshow();


    /* 12. Initial state */
    handleHeaderScroll();
    handleBackToTop();
    filterWines();
  }

  /* Start */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
