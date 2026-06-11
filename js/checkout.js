/* ============================================
   VINOTEKA 15 MILJA - Checkout
   Sažetak korpe + forma + slanje porudžbine
   na email preko Web3Forms (bez backenda).
   ============================================ */

(function () {
  'use strict';

  /* Access key se dobija besplatno na https://web3forms.com
     (javni ključ — sme da stoji u kodu) */
  var WEB3FORMS_ACCESS_KEY = '8d0dcd1f-9682-45d4-b7de-775961f92914';
  var WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

  var emptyBox = document.getElementById('checkout-empty');
  var successBox = document.getElementById('checkout-success');
  var grid = document.getElementById('checkout-grid');
  var form = document.getElementById('checkout-form');
  var summaryItems = document.getElementById('summary-items');
  var summaryTotal = document.getElementById('summary-total');
  var submitBtn = document.getElementById('checkout-submit');
  var errorBox = document.getElementById('checkout-error');

  if (!form || typeof Cart === 'undefined' || typeof PRODUCT_BY_ID === 'undefined') return;

  var orderSent = false;

  function fmt(price) {
    if (!price || price === 0) return 'Na upit';
    return price.toLocaleString('sr-RS') + ' RSD';
  }

  /* ---- Sažetak korpe ---- */
  function renderSummary() {
    if (orderSent) return;
    var items = Cart.getItems();

    if (items.length === 0) {
      if (grid) grid.hidden = true;
      if (emptyBox) emptyBox.hidden = false;
      return;
    }
    if (grid) grid.hidden = false;
    if (emptyBox) emptyBox.hidden = true;

    var html = '';
    items.forEach(function (item) {
      var p = PRODUCT_BY_ID[item.id];
      if (!p) return;
      html +=
        '<div class="summary-item" data-id="' + escapeHTML(item.id) + '">' +
          '<div class="summary-item-info">' +
            '<span class="summary-item-name">' + escapeHTML(p.name) + '</span>' +
            '<span class="summary-item-meta">' + escapeHTML(p.winery) + ' &middot; ' + item.qty + ' kom</span>' +
          '</div>' +
          '<span class="summary-item-price">' + fmt(p.price * item.qty) + '</span>' +
          '<button type="button" class="summary-item-remove" data-remove="' + escapeHTML(item.id) + '" aria-label="Ukloni">&times;</button>' +
        '</div>';
    });
    summaryItems.innerHTML = html;
    summaryTotal.textContent = fmt(Cart.getTotal());
  }

  summaryItems.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove]');
    if (btn) Cart.remove(btn.getAttribute('data-remove'));
  });

  Cart.onChange(renderSummary);
  renderSummary();

  /* ---- Adresa vidljiva samo uz dostavu ---- */
  var addressField = document.getElementById('address-field');
  var radios = form.querySelectorAll('input[name="delivery"]');
  radios.forEach(function (r) {
    r.addEventListener('change', function () {
      addressField.hidden = form.delivery.value !== 'delivery';
    });
  });

  /* ---- Validacija ---- */
  function setFieldError(id, show) {
    var el = document.getElementById(id);
    if (el) el.hidden = !show;
    return !show;
  }

  function validate() {
    var ok = true;
    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var email = form.email.value.trim();
    var isDelivery = form.delivery.value === 'delivery';
    var address = form.address.value.trim();

    ok = setFieldError('err-name', name.length < 2) && ok;
    /* tolerantna provera: cifre, razmaci, +, -, /, zagrade; bar 6 cifara */
    var phoneOk = /^[0-9+\-\/() ]{6,}$/.test(phone) && (phone.replace(/\D/g, '').length >= 6);
    ok = setFieldError('err-phone', !phoneOk) && ok;
    var emailOk = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    ok = setFieldError('err-email', !emailOk) && ok;
    ok = setFieldError('err-address', isDelivery && address.length < 4) && ok;

    return ok;
  }

  /* ---- Telo email poruke ---- */
  function buildMessage() {
    var items = Cart.getItems();
    var lines = ['NOVA PORUDŽBINA — Vinoteka 15 Milja', ''];

    lines.push('Artikli:');
    items.forEach(function (item, i) {
      var p = PRODUCT_BY_ID[item.id];
      if (!p) return;
      lines.push((i + 1) + '. ' + p.name + ' (' + p.winery + ') × ' + item.qty + ' — ' + fmt(p.price * item.qty));
    });
    lines.push('');
    lines.push('UKUPNO: ' + fmt(Cart.getTotal()));
    lines.push('');
    lines.push('Kupac: ' + form.name.value.trim());
    lines.push('Telefon: ' + form.phone.value.trim());
    if (form.email.value.trim()) lines.push('Email: ' + form.email.value.trim());
    lines.push('Način: ' + (form.delivery.value === 'delivery' ? 'Dostava na adresu' : 'Preuzimanje u vinoteci'));
    if (form.delivery.value === 'delivery') lines.push('Adresa: ' + form.address.value.trim());
    if (form.note.value.trim()) lines.push('Napomena: ' + form.note.value.trim());
    lines.push('');
    lines.push('Plaćanje: pouzećem');

    return lines.join('\n');
  }

  /* ---- Slanje ---- */
  function showError(show) {
    if (errorBox) errorBox.hidden = !show;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showError(false);

    /* honeypot: bot je čekirao skriveno polje */
    if (document.getElementById('co-botcheck').checked) return;

    if (!validate()) return;
    if (Cart.getItems().length === 0) { renderSummary(); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Slanje...';

    var payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: 'Porudžbina — ' + form.name.value.trim(),
      from_name: 'Vinoteka 15 Milja — sajt',
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      message: buildMessage()
    };
    if (form.email.value.trim()) payload.replyto = form.email.value.trim();

    fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (result.ok && result.data && result.data.success) {
          /* korpa se čisti TEK posle potvrđenog prijema */
          orderSent = true;
          Cart.clear();
          if (grid) grid.hidden = true;
          if (successBox) successBox.hidden = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          throw new Error('send-failed');
        }
      })
      .catch(function () {
        showError(true);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Pošalji porudžbinu';
      });
  });
})();
