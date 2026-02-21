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
  var searchQuery = '';

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
    'Zarić Opsesija Kutija'
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

    var badgeHTML = badge ? '<span class="wine-badge">' + badge + '</span>' : '';
    var originBadge = countryInfo.flag + ' ' + countryInfo.name;

    /* Image: real photo if available, otherwise gradient placeholder */
    var imageInner;
    if (product.image) {
      imageInner =
        '<div class="wine-image-real ' + typeInfo.css + '">' +
          '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy" onerror="this.parentElement.classList.add(\'img-error\');this.style.display=\'none\';this.parentElement.querySelector(\'.fallback-icon\').style.display=\'block\';">' +
          '<span class="fallback-icon" style="display:none;">' + icon + '</span>' +
        '</div>';
    } else {
      imageInner =
        '<div class="wine-image-placeholder ' + typeInfo.css + '">' +
          '<span class="wine-bottle-icon">' + icon + '</span>' +
        '</div>';
    }

    return '<article class="wine-card" data-category="' + product.type + '" data-origin="' + origin + '" data-country="' + product.country + '">' +
      '<div class="wine-card-image">' +
        imageInner +
        badgeHTML +
        '<span class="wine-origin-badge">' + originBadge + '</span>' +
      '</div>' +
      '<div class="wine-card-body">' +
        '<span class="wine-category">' + typeInfo.label + '</span>' +
        '<h3 class="wine-name">' + product.name + '</h3>' +
        '<p class="wine-origin">' + product.region + ', ' + countryInfo.name + '</p>' +
        '<p class="wine-grape">' + product.winery + '</p>' +
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
    var mainCountries = ['rs', 'hr', 'ba', 'it', 'fr', 'es'];

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

      var matchSearch = true;
      if (query.length > 0) {
        var combined = (product.name + ' ' + product.winery).toLowerCase();
        var combinedNorm = removeDiacritics(combined);
        var queryNorm = removeDiacritics(query);
        matchSearch = combined.indexOf(query) !== -1 || combinedNorm.indexOf(queryNorm) !== -1;
      }

      return matchCategory && matchOrigin && matchSearch;
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

    /* Hide sentinel when all loaded */
    if (sentinel) {
      sentinel.style.display = displayedCount >= filteredProducts.length ? 'none' : 'block';
    }
  }


  /* ============================================
     FILTER & SEARCH (resets lazy loading)
     ============================================ */
  function filterWines() {
    filteredProducts = getFilteredProducts();
    displayedCount = 0;
    if (winesGrid) winesGrid.innerHTML = '';
    renderBatch();

    if (noResults) {
      noResults.style.display = filteredProducts.length === 0 ? 'block' : 'none';
    }

    if (resultsCount) {
      if (activeCategory === 'all' && activeOrigin === 'all' && searchQuery.trim().length === 0) {
        resultsCount.textContent = 'Prikazano: ' + filteredProducts.length + ' artikala';
      } else {
        resultsCount.textContent = 'Pronađeno: ' + filteredProducts.length + ' artikala';
      }
    }
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
  function handleHeaderScroll() {
    if (window.scrollY > 50) {
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

    /* 8. Search */
    if (searchInput) {
      searchInput.addEventListener('input', debounce(function () {
        searchQuery = searchInput.value;
        filterWines();
      }, 200));
    }

    /* 9. Footer filter links */
    initFooterFilterLinks();

    /* 10. Animations */
    initScrollAnimations();

    /* 11. Initial state */
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
