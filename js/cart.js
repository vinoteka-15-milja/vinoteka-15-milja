/* ============================================
   VINOTEKA 15 MILJA - Korpa (localStorage)
   Izlaže window.Cart API. Čuva SAMO {id, qty} —
   cene i imena se uvek čitaju iz PRODUCTS, pa
   ne mogu da zastare u korpi.
   ============================================ */

(function () {
  'use strict';

  if (typeof PRODUCT_BY_ID === 'undefined') return;

  var KEY = 'vinoteka15m_cart_v1';

  /* In-memory fallback kad localStorage nije dostupan (npr. private mode) */
  var memoryStore = null;

  var listeners = [];

  function readRaw() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : memoryStore;
    } catch (e) {
      return memoryStore;
    }
  }

  function writeRaw(data) {
    memoryStore = data;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* korpa živi samo u memoriji do reload-a */ }
  }

  /* Odbaci stavke čiji id više ne postoji u ponudi, ograniči qty 1-99 */
  function sanitize(items) {
    var out = [];
    (items || []).forEach(function (it) {
      if (!it || typeof it.id !== 'string' || !PRODUCT_BY_ID[it.id]) return;
      var qty = parseInt(it.qty, 10);
      if (isNaN(qty)) qty = 1;
      qty = Math.max(1, Math.min(99, qty));
      out.push({ id: it.id, qty: qty });
    });
    return out;
  }

  function getItems() {
    var data = readRaw();
    return sanitize(data && data.items);
  }

  function save(items) {
    writeRaw({ items: items, updatedAt: new Date().toISOString() });
    emit();
  }

  function emit() {
    listeners.forEach(function (fn) {
      try { fn(); } catch (e) { /* listener ne sme da obori korpu */ }
    });
  }

  /* Sinhronizacija između tabova */
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) emit();
  });

  window.Cart = {
    getItems: getItems,

    /* Vraća false za nepostojeći proizvod ili cenu "Na upit" (0) */
    add: function (id, qty) {
      var product = PRODUCT_BY_ID[id];
      if (!product || !product.price || product.price <= 0) return false;
      var items = getItems();
      var found = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) { found = items[i]; break; }
      }
      if (found) {
        found.qty = Math.min(99, found.qty + (parseInt(qty, 10) || 1));
      } else {
        items.push({ id: id, qty: Math.max(1, Math.min(99, parseInt(qty, 10) || 1)) });
      }
      save(items);
      return true;
    },

    setQty: function (id, qty) {
      var items = getItems();
      qty = parseInt(qty, 10) || 0;
      if (qty <= 0) {
        items = items.filter(function (it) { return it.id !== id; });
      } else {
        items.forEach(function (it) {
          if (it.id === id) it.qty = Math.min(99, qty);
        });
      }
      save(items);
    },

    remove: function (id) {
      save(getItems().filter(function (it) { return it.id !== id; }));
    },

    clear: function () {
      save([]);
    },

    getCount: function () {
      return getItems().reduce(function (n, it) { return n + it.qty; }, 0);
    },

    getTotal: function () {
      return getItems().reduce(function (sum, it) {
        var p = PRODUCT_BY_ID[it.id];
        return sum + (p && p.price > 0 ? p.price * it.qty : 0);
      }, 0);
    },

    onChange: function (fn) {
      if (typeof fn === 'function') listeners.push(fn);
    }
  };
})();
