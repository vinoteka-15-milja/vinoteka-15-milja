# Stranica proizvoda + klasik korpa/checkout + mini-korpa + test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dovršiti kupovinski tok na `staging.15milja.com` u našem dizajnu: stranica proizvoda, klasik korpa/checkout, slide-out mini-korpa, COD+lično preuzimanje, i test porudžbina.

**Architecture:** Bespoke WP tema `vinoteka15` nad WooCommerce-om. Single product preko WC hookova + naš CSS. Korpa/checkout prebačeni sa blokova na klasik shortcode (idempotentna migracija u `inc/setup.php`). Mini-korpa preko WC `add_to_cart_fragments` + override `cart/mini-cart.php` + JS. Config (COD, zona+pickup, strane→shortcode) kao reproduktivne idempotentne migracije.

**Tech Stack:** PHP (WordPress/WooCommerce), vanilla JS (+ jQuery samo za WC `added_to_cart` event), CSS. PHP nema na hostu → lint preko Docker `php:8.3-cli`. Deploy FTP (`deploy@15milja.com`). Verifikacija: lint + autentifikovani `curl` (DOM/markup) + browser-automatizacija za test porudžbinu.

**Reference spec:** `docs/superpowers/specs/2026-06-23-woo-single-korpa-checkout-design.md`

**Napomena:** Ovo je WP rendering/config — nema čiste logike za unit test. „Test" po tasku = lint (`php -l` / `node --check` / brojanje vitičastih). Ponašanje se verifikuje uživo (Task 6–7, controller).

---

## File Structure

- `wp-theme/vinoteka15/inc/setup.php` — **NOV**. Idempotentne migracije: strane→shortcode, COD, shipping zona+pickup. Samo definicije + `admin_init` hook.
- `wp-theme/vinoteka15/inc/shop.php` — **NOV**. Single-product hookovi (ukloni tabove, Detalji, Na upit CTA, breadcrumb, related), mini-korpa fragment, checkout polja.
- `wp-theme/vinoteka15/woocommerce/cart/mini-cart.php` — **NOV**. Naš mini-korpa markup (override WC template-a).
- `wp-theme/vinoteka15/header.php` — **IZMENA**. Mini-korpa panel + overlay.
- `wp-theme/vinoteka15/functions.php` — **IZMENA**. require `inc/shop.php` + `inc/setup.php`; bump verzija asseta.
- `wp-theme/vinoteka15/assets/woo.css` — **IZMENA**. Stilovi: single product, klasik korpa/checkout, mini-korpa.
- `wp-theme/vinoteka15/assets/theme.js` — **IZMENA**. Mini-korpa open/close + open-on-add.

**Kredencijali NIKAD u git/komandu inline.** FTP/WP lozinke se čitaju iz `.secrets-wp.md` (gitignored). PHP lint: `docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -l <fajl>`.

---

## Task 1: Config migracije (`inc/setup.php`)

**Files:**
- Create: `wp-theme/vinoteka15/inc/setup.php`
- Modify: `wp-theme/vinoteka15/functions.php`

- [ ] **Step 1: Napiši `inc/setup.php`**

`wp-theme/vinoteka15/inc/setup.php`:
```php
<?php
/**
 * Vinoteka 15 — idempotentne migracije WooCommerce konfiguracije.
 * Pokreće se na admin_init; svaki korak ima guard (option flag) pa se ne ponavlja.
 * Reproduktivno → lako preslikati staging→produkcija.
 */
if (!defined('ABSPATH')) exit;

add_action('admin_init', 'v15_run_setup_migrations');
function v15_run_setup_migrations() {
    if (!function_exists('wc_get_page_id')) return; // WooCommerce mora biti aktivan
    v15_setup_classic_pages();
    v15_setup_cod();
    v15_setup_local_pickup();
}

/** /cart/ i /checkout/ sa blokova na klasik shortcode (idempotentno). */
function v15_setup_classic_pages() {
    if (get_option('v15_classic_pages') === 'done') return;
    $map = array(
        wc_get_page_id('cart')     => '[woocommerce_cart]',
        wc_get_page_id('checkout') => '[woocommerce_checkout]',
    );
    foreach ($map as $pid => $shortcode) {
        if ($pid && $pid > 0) {
            $page = get_post($pid);
            if ($page && strpos($page->post_content, $shortcode) === false) {
                wp_update_post(array('ID' => $pid, 'post_content' => $shortcode));
            }
        }
    }
    update_option('v15_classic_pages', 'done');
}

/** COD „Pouzećem" (idempotentno). */
function v15_setup_cod() {
    if (get_option('v15_cod_setup') === 'done') return;
    $settings = get_option('woocommerce_cod_settings', array());
    if (!is_array($settings)) $settings = array();
    $settings = array_merge($settings, array(
        'enabled'      => 'yes',
        'title'        => 'Pouzećem',
        'description'  => 'Plaćanje gotovinom pri preuzimanju ili dostavi.',
        'instructions' => 'Platićete gotovinom kuriru pri dostavi ili u vinoteci pri preuzimanju.',
    ));
    update_option('woocommerce_cod_settings', $settings);
    update_option('v15_cod_setup', 'done');
}

/** Shipping zona „Srbija" + Lično preuzimanje, besplatno (idempotentno). */
function v15_setup_local_pickup() {
    if (get_option('v15_shipping_setup') === 'done') return;
    if (!class_exists('WC_Shipping_Zone') || !class_exists('WC_Shipping_Zones')) return;

    $zone_id = null;
    foreach (WC_Shipping_Zones::get_zones() as $z) {
        if (isset($z['zone_name']) && $z['zone_name'] === 'Srbija') { $zone_id = $z['zone_id']; break; }
    }
    $zone = $zone_id ? new WC_Shipping_Zone($zone_id) : new WC_Shipping_Zone();
    if (!$zone_id) {
        $zone->set_zone_name('Srbija');
        $zone->add_location('RS', 'country');
        $zone->save();
    }
    $has_pickup = false;
    foreach ($zone->get_shipping_methods() as $m) {
        if ($m->id === 'local_pickup') { $has_pickup = true; break; }
    }
    if (!$has_pickup) {
        $instance_id = $zone->add_shipping_method('local_pickup');
        if ($instance_id) {
            update_option('woocommerce_local_pickup_' . $instance_id . '_settings', array(
                'title' => 'Lično preuzimanje u vinoteci', 'cost' => '0', 'tax_status' => 'none',
            ));
        }
        $zone->save();
    }
    update_option('v15_shipping_setup', 'done');
}
```

- [ ] **Step 2: Poveži u `functions.php`**

U `wp-theme/vinoteka15/functions.php`, posle linije `require_once __DIR__ . '/inc/filters.php';` dodaj:
```php
require_once __DIR__ . '/inc/setup.php';
```

- [ ] **Step 3: Lint**

Run: `docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -l wp-theme/vinoteka15/inc/setup.php && docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -l wp-theme/vinoteka15/functions.php`
Expected: oba `No syntax errors detected`.

- [ ] **Step 4: Commit**

```bash
git add wp-theme/vinoteka15/inc/setup.php wp-theme/vinoteka15/functions.php
git commit -m "Shop: idempotentne config migracije (klasik strane, COD, zona+lično preuzimanje)"
```

---

## Task 2: Single-product hookovi, mini-korpa fragment, checkout polja (`inc/shop.php`)

**Files:**
- Create: `wp-theme/vinoteka15/inc/shop.php`
- Modify: `wp-theme/vinoteka15/functions.php`

- [ ] **Step 1: Napiši `inc/shop.php`**

`wp-theme/vinoteka15/inc/shop.php`:
```php
<?php
/**
 * Vinoteka 15 — single product prilagođavanja, mini-korpa fragment, checkout polja.
 */
if (!defined('ABSPATH')) exit;

/* --- Single: ukloni tabove (opisi nisu uvezeni) --- */
add_filter('woocommerce_product_tabs', function ($tabs) {
    unset($tabs['description'], $tabs['additional_information'], $tabs['reviews']);
    return $tabs;
}, 98);

/* --- Single: breadcrumb samo na proizvodu (globalno je uklonjen) --- */
add_action('woocommerce_before_main_content', function () {
    if (function_exists('is_product') && is_product()) {
        woocommerce_breadcrumb();
    }
}, 20);

/* --- Single: „Na upit" CTA pre add-to-cart za nekupljive --- */
add_action('woocommerce_single_product_summary', function () {
    global $product;
    if (!$product || ($product->is_purchasable() && $product->get_price() !== '')) return;
    echo '<p class="v15-inquiry"><span class="v15-inquiry-label">Na upit</span> '
       . '<a class="btn btn-outline" href="' . esc_url(home_url('/kontakt/')) . '">Pošalji upit</a></p>';
}, 29);

/* --- Single: „Detalji" spec-lista (atributi) posle add-to-cart --- */
add_action('woocommerce_single_product_summary', function () {
    global $product;
    if (!$product) return;
    $rows = array(
        'Vinarija'  => $product->get_attribute('Vinarija'),
        'Region'    => $product->get_attribute('Region'),
        'Zemlja'    => $product->get_attribute('Zemlja'),
        'Zapremina' => $product->get_attribute('Zapremina'),
    );
    $rows = array_filter($rows, 'strlen');
    if (empty($rows)) return;
    echo '<div class="v15-details"><h3 class="v15-details-title">Detalji</h3><dl class="v15-details-list">';
    foreach ($rows as $k => $v) {
        echo '<dt>' . esc_html($k) . '</dt><dd>' . esc_html($v) . '</dd>';
    }
    echo '</dl></div>';
}, 45);

/* --- Single: „Još iz kategorije" (related) — 4 kom, naš naslov --- */
add_filter('woocommerce_output_related_products_args', function ($args) {
    $args['posts_per_page'] = 4;
    $args['columns'] = 4;
    return $args;
});
add_filter('woocommerce_product_related_products_heading', function () {
    return 'Još iz kategorije';
});

/* --- Mini-korpa: osveži sadržaj kroz AJAX fragment posle add-to-cart --- */
add_filter('woocommerce_add_to_cart_fragments', function ($fragments) {
    ob_start();
    woocommerce_mini_cart();
    $fragments['div.widget_shopping_cart_content'] =
        '<div class="widget_shopping_cart_content">' . ob_get_clean() . '</div>';
    return $fragments;
});

/* --- Checkout polja: telefon obavezan, bez „Firma" --- */
add_filter('woocommerce_checkout_fields', function ($fields) {
    unset($fields['billing']['billing_company']);
    if (isset($fields['billing']['billing_phone'])) {
        $fields['billing']['billing_phone']['required'] = true;
    }
    return $fields;
});
```

- [ ] **Step 2: Poveži u `functions.php`**

U `wp-theme/vinoteka15/functions.php`, posle `require_once __DIR__ . '/inc/setup.php';` dodaj:
```php
require_once __DIR__ . '/inc/shop.php';
```

- [ ] **Step 3: Lint**

Run: `docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -l wp-theme/vinoteka15/inc/shop.php`
Expected: `No syntax errors detected`.

- [ ] **Step 4: Commit**

```bash
git add wp-theme/vinoteka15/inc/shop.php wp-theme/vinoteka15/functions.php
git commit -m "Shop: single hookovi (tabovi/Detalji/Na upit/related/breadcrumb), mini-korpa fragment, checkout polja"
```

---

## Task 3: Mini-korpa template + header markup

**Files:**
- Create: `wp-theme/vinoteka15/woocommerce/cart/mini-cart.php`
- Modify: `wp-theme/vinoteka15/header.php`

- [ ] **Step 1: Napiši `woocommerce/cart/mini-cart.php`**

`wp-theme/vinoteka15/woocommerce/cart/mini-cart.php`:
```php
<?php
/** Mini-korpa (sadržaj slide-out panela). Override WC cart/mini-cart.php. */
if (!defined('ABSPATH')) exit;

do_action('woocommerce_before_mini_cart'); ?>

<?php if (!WC()->cart->is_empty()) : ?>
  <ul class="v15-minicart-list">
    <?php
    do_action('woocommerce_before_mini_cart_contents');
    foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {
        $_product = apply_filters('woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key);
        if (!$_product || !$_product->exists() || $cart_item['quantity'] <= 0
            || !apply_filters('woocommerce_widget_cart_item_visible', true, $cart_item, $cart_item_key)) {
            continue;
        }
        $product_name      = apply_filters('woocommerce_cart_item_name', $_product->get_name(), $cart_item, $cart_item_key);
        $thumbnail         = apply_filters('woocommerce_cart_item_thumbnail', $_product->get_image('woocommerce_thumbnail'), $cart_item, $cart_item_key);
        $product_price     = apply_filters('woocommerce_cart_item_price', WC()->cart->get_product_price($_product), $cart_item, $cart_item_key);
        $product_permalink = apply_filters('woocommerce_cart_item_permalink', $_product->is_visible() ? $_product->get_permalink($cart_item) : '', $cart_item, $cart_item_key);
        ?>
        <li class="v15-minicart-item mini_cart_item">
          <?php echo apply_filters('woocommerce_cart_item_remove_link', sprintf(
              '<a href="%s" class="remove remove_from_cart_button" aria-label="%s" data-product_id="%s" data-cart_item_key="%s" data-product_sku="%s">&times;</a>',
              esc_url(wc_get_cart_remove_url($cart_item_key)),
              esc_attr__('Ukloni stavku', 'woocommerce'),
              esc_attr($_product->get_id()),
              esc_attr($cart_item_key),
              esc_attr($_product->get_sku())
          ), $cart_item_key); ?>
          <a class="v15-minicart-link" href="<?php echo esc_url($product_permalink ? $product_permalink : '#'); ?>">
            <span class="v15-minicart-thumb"><?php echo $thumbnail; ?></span>
            <span class="v15-minicart-name"><?php echo wp_kses_post($product_name); ?></span>
          </a>
          <span class="v15-minicart-qtyprice"><?php echo esc_html($cart_item['quantity']); ?> &times; <?php echo wp_kses_post($product_price); ?></span>
        </li>
        <?php
    }
    do_action('woocommerce_mini_cart_contents');
    ?>
  </ul>

  <p class="v15-minicart-total"><span>Ukupno</span> <strong><?php echo WC()->cart->get_cart_subtotal(); ?></strong></p>

  <p class="v15-minicart-actions">
    <a class="btn btn-outline" href="<?php echo esc_url(wc_get_cart_url()); ?>">Korpa</a>
    <a class="btn btn-primary" href="<?php echo esc_url(wc_get_checkout_url()); ?>">Na plaćanje</a>
  </p>
<?php else : ?>
  <p class="v15-minicart-empty">Korpa je prazna.</p>
<?php endif; ?>

<?php do_action('woocommerce_after_mini_cart'); ?>
```

- [ ] **Step 2: Dodaj mini-korpa panel u `header.php`**

U `wp-theme/vinoteka15/header.php`, ODMAH POSLE `</header>` (linija sa zatvaranjem `site-header`), pre `<main ...>`, dodaj:
```php
<?php if (class_exists('WooCommerce')) : ?>
<div class="v15-minicart-overlay" id="minicart-overlay"></div>
<aside class="v15-minicart" id="minicart" aria-label="Korpa" aria-hidden="true">
  <div class="v15-minicart-head">
    <span class="v15-minicart-title">Korpa</span>
    <button class="v15-minicart-close" id="minicart-close" type="button" aria-label="Zatvori korpu">&times;</button>
  </div>
  <div class="widget_shopping_cart_content"><?php woocommerce_mini_cart(); ?></div>
</aside>
<?php endif; ?>
```

- [ ] **Step 3: Lint**

Run: `docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -l wp-theme/vinoteka15/woocommerce/cart/mini-cart.php && docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -l wp-theme/vinoteka15/header.php`
Expected: oba `No syntax errors detected`.

- [ ] **Step 4: Commit**

```bash
git add wp-theme/vinoteka15/woocommerce/cart/mini-cart.php wp-theme/vinoteka15/header.php
git commit -m "Shop: mini-korpa template (naš markup) + slide-out panel u header"
```

---

## Task 4: Mini-korpa JS (`theme.js`)

**Files:**
- Modify: `wp-theme/vinoteka15/assets/theme.js`

- [ ] **Step 1: Pogledaj postojeći `theme.js`**

Run: `tail -5 wp-theme/vinoteka15/assets/theme.js`
Cilj: dodaj NOV IIFE na kraj (ne diraj postojeće nav/filter blokove).

- [ ] **Step 2: Dodaj mini-korpa IIFE na kraj `theme.js`**

Dodaj na kraj `wp-theme/vinoteka15/assets/theme.js`:
```javascript
/* ---- Mini-korpa (slide-out) ---- */
(function () {
  function openMC() {
    var m = document.getElementById('minicart'), o = document.getElementById('minicart-overlay');
    if (!m) return;
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
    if (o) o.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMC() {
    var m = document.getElementById('minicart'), o = document.getElementById('minicart-overlay');
    if (m) { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); }
    if (o) o.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('.cart-toggle')) { e.preventDefault(); openMC(); return; }
    if (e.target.closest('#minicart-close') || e.target.closest('#minicart-overlay')) { e.preventDefault(); closeMC(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMC(); });
  // Posle WC AJAX add-to-cart (WC okida jQuery event 'added_to_cart') otvori panel
  if (window.jQuery) {
    window.jQuery(document.body).on('added_to_cart', function () { openMC(); });
  }
})();
```

- [ ] **Step 3: JS provera**

Run: `node --check wp-theme/vinoteka15/assets/theme.js`
Expected: bez ispisa (exit 0).

- [ ] **Step 4: Commit**

```bash
git add wp-theme/vinoteka15/assets/theme.js
git commit -m "Shop: mini-korpa JS (otvori na klik korpe i posle dodavanja, zatvori × / overlay / Esc)"
```

---

## Task 5: Stilovi — single + klasik korpa/checkout + mini-korpa (`woo.css`) + bump verzija

**Files:**
- Modify: `wp-theme/vinoteka15/assets/woo.css`
- Modify: `wp-theme/vinoteka15/functions.php`

- [ ] **Step 1: Dodaj stilove na kraj `woo.css`**

Dodaj na kraj `wp-theme/vinoteka15/assets/woo.css`:
```css
/* ============================================
   Stranica proizvoda (single)
   ============================================ */
.single-product .wines-section { padding-top: 24px; }
.single-product .woocommerce-breadcrumb {
  color: var(--clr-text-light); font-size: var(--fs-sm); margin-bottom: 18px;
}
.single-product .woocommerce-breadcrumb a { color: var(--clr-gold); }
.single-product div.product { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
.single-product div.product .woocommerce-product-gallery {
  background: linear-gradient(180deg, #332930, #2b1d21);
  border-radius: var(--radius-lg); padding: 32px; margin: 0;
}
.single-product div.product .woocommerce-product-gallery img { mix-blend-mode: normal; }
.single-product .product_title {
  font-family: var(--ff-heading); color: var(--clr-cream); font-size: var(--fs-3xl); margin: 0 0 6px;
}
.single-product .summary .price,
.single-product .summary .price .amount {
  color: var(--clr-gold) !important; font-family: var(--ff-heading); font-size: var(--fs-2xl);
}
.single-product .summary .quantity input.qty {
  background: var(--clr-card); color: var(--clr-cream);
  border: 1px solid rgba(201,169,110,.3); border-radius: var(--radius-sm); padding: 12px; width: 70px;
}
.single-product .summary .single_add_to_cart_button {
  background: var(--clr-gold); color: var(--clr-dark); border-radius: var(--radius-sm);
  text-transform: uppercase; letter-spacing: .05em; font-weight: var(--fw-bold); padding: 13px 28px;
}
.single-product .summary .single_add_to_cart_button:hover { background: var(--clr-gold-bright); }
.v15-inquiry { display: flex; align-items: center; gap: 16px; margin: 8px 0 18px; }
.v15-inquiry-label { font-family: var(--ff-heading); color: var(--clr-gold); font-size: var(--fs-xl); }
.v15-details { margin-top: 26px; border-top: 1px solid rgba(201,169,110,.18); padding-top: 18px; }
.v15-details-title { font-family: var(--ff-heading); color: var(--clr-cream); font-size: var(--fs-lg); margin: 0 0 10px; }
.v15-details-list { display: grid; grid-template-columns: auto 1fr; gap: 6px 18px; margin: 0; }
.v15-details-list dt { color: var(--clr-gold); font-weight: var(--fw-bold); }
.v15-details-list dd { color: var(--clr-cream); margin: 0; }
.single-product .related.products { margin-top: 56px; clear: both; }
.single-product .related.products > h2 {
  font-family: var(--ff-heading); color: var(--clr-cream); font-size: var(--fs-2xl); text-align: center; margin-bottom: 24px;
}
@media (max-width: 767px) {
  .single-product div.product { grid-template-columns: 1fr; gap: 24px; }
}

/* ============================================
   Klasik korpa / checkout
   ============================================ */
.woocommerce-cart .wines-section,
.woocommerce-checkout .wines-section { padding-top: 28px; }
.woocommerce table.shop_table {
  background: var(--clr-card); border: 1px solid rgba(201,169,110,.15);
  color: var(--clr-cream); border-radius: var(--radius-lg); border-collapse: separate; overflow: hidden;
}
.woocommerce table.shop_table th { color: var(--clr-gold); }
.woocommerce table.shop_table td,
.woocommerce table.shop_table th { border-top: 1px solid rgba(255,255,255,.06); padding: 14px 16px; }
.woocommerce table.shop_table .product-remove a.remove {
  color: var(--clr-gold) !important; border: 1px solid rgba(201,169,110,.4);
}
.woocommerce .cart_totals,
.woocommerce-checkout #order_review,
.woocommerce-checkout #payment {
  background: var(--clr-card); border: 1px solid rgba(201,169,110,.15);
  border-radius: var(--radius-lg); padding: 22px;
}
.woocommerce .cart_totals h2,
.woocommerce-checkout h3,
.woocommerce-checkout #order_review_heading {
  font-family: var(--ff-heading); color: var(--clr-cream);
}
.woocommerce .cart-collaterals .cart_totals td,
.woocommerce .cart-collaterals .cart_totals th { color: var(--clr-cream); }
.woocommerce form .form-row label { color: var(--clr-text-light); }
.woocommerce form .form-row input.input-text,
.woocommerce form .form-row textarea,
.woocommerce form .form-row select,
.woocommerce-checkout .select2-selection {
  background: var(--clr-panel) !important; color: var(--clr-cream) !important;
  border: 1px solid rgba(201,169,110,.3) !important; border-radius: var(--radius-sm); padding: 11px 13px;
}
.woocommerce #payment .payment_methods li { color: var(--clr-cream); }
.woocommerce #payment div.payment_box { background: var(--clr-panel); color: var(--clr-text-light); }
.woocommerce-checkout #payment .place-order .button,
.woocommerce .actions .checkout-button,
.woocommerce .cart .button,
.woocommerce-cart .wc-proceed-to-checkout a.checkout-button {
  background: var(--clr-gold); color: var(--clr-dark); border-radius: var(--radius-sm);
  text-transform: uppercase; letter-spacing: .04em; font-weight: var(--fw-bold);
}

/* ============================================
   Mini-korpa (slide-out)
   ============================================ */
.v15-minicart-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.55);
  opacity: 0; visibility: hidden; transition: opacity .25s, visibility .25s; z-index: 1200;
}
.v15-minicart-overlay.open { opacity: 1; visibility: visible; }
.v15-minicart {
  position: fixed; top: 0; right: 0; height: 100%; width: 380px; max-width: 88vw;
  background: var(--clr-panel); border-left: 1px solid rgba(201,169,110,.25);
  transform: translateX(100%); transition: transform .28s ease; z-index: 1300;
  display: flex; flex-direction: column; box-shadow: -16px 0 40px rgba(0,0,0,.5);
}
.v15-minicart.open { transform: translateX(0); }
.v15-minicart-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px; border-bottom: 1px solid rgba(201,169,110,.18);
}
.v15-minicart-title { font-family: var(--ff-heading); color: var(--clr-cream); font-size: var(--fs-lg); }
.v15-minicart-close { background: none; border: none; color: var(--clr-cream); font-size: 26px; line-height: 1; cursor: pointer; }
.v15-minicart .widget_shopping_cart_content { flex: 1; overflow-y: auto; padding: 16px 22px; }
.v15-minicart-list { list-style: none; margin: 0; padding: 0; }
.v15-minicart-item {
  display: grid; grid-template-columns: 52px 1fr auto; gap: 12px; align-items: center;
  position: relative; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.06);
}
.v15-minicart-item .remove {
  position: absolute; top: 10px; right: 0; color: var(--clr-text-light) !important;
  font-size: 18px; text-decoration: none; line-height: 1;
}
.v15-minicart-link { display: contents; color: var(--clr-cream); text-decoration: none; }
.v15-minicart-thumb img { width: 52px; height: 52px; object-fit: contain; background: var(--clr-card); border-radius: 6px; }
.v15-minicart-name { color: var(--clr-cream); font-size: var(--fs-sm); padding-right: 18px; }
.v15-minicart-qtyprice { color: var(--clr-text-light); font-size: var(--fs-sm); white-space: nowrap; }
.v15-minicart-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 22px; border-top: 1px solid rgba(201,169,110,.18); color: var(--clr-cream);
}
.v15-minicart-total strong { color: var(--clr-gold); font-family: var(--ff-heading); font-size: var(--fs-lg); }
.v15-minicart-actions { display: flex; gap: 10px; padding: 0 22px 22px; margin: 0; }
.v15-minicart-actions .btn { flex: 1; text-align: center; }
.v15-minicart-empty { padding: 30px 22px; color: var(--clr-text-light); text-align: center; }
```

- [ ] **Step 2: Bump verzija asseta u `functions.php`**

U `wp-theme/vinoteka15/functions.php` promeni verziju `v15-woo` na sledeću (npr. `'1.3'` → `'1.4'`) i `v15-main` na sledeću (npr. `'1.4'` → `'1.5'`). (Tačne trenutne vrednosti proveri u fajlu; samo povećaj.)

- [ ] **Step 3: Provera vitičastih (balans)**

Run: `docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -r '$c=file_get_contents("wp-theme/vinoteka15/assets/woo.css"); echo substr_count($c,"{")."/".substr_count($c,"}")."\n";'`
Expected: dva ista broja.

- [ ] **Step 4: Lint functions.php**

Run: `docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -l wp-theme/vinoteka15/functions.php`
Expected: `No syntax errors detected`.

- [ ] **Step 5: Commit**

```bash
git add wp-theme/vinoteka15/assets/woo.css wp-theme/vinoteka15/functions.php
git commit -m "Shop: stilovi single + klasik korpa/checkout + mini-korpa; bump verzija asseta"
```

---

## Task 6: (Controller) Deploy + živa verifikacija

**Files:** nema (deploy/verifikacija)

> Kredencijali iz `.secrets-wp.md` (gitignored). Baseline: ulogovan (coming-soon). Posle deploya: LiteSpeed Toolbox → Purge All.

- [ ] **Step 1: Deploy svih izmenjenih/novih fajlova (FTP)**

```bash
cd /Users/urosboskovic/Documents/Website
FTPPASS=$(awk '/## FTP/{f=1} f && /Lozinka:/{ if (match($0, /`[^`]+`/)) { print substr($0, RSTART+1, RLENGTH-2); exit } }' .secrets-wp.md)
FTPUSER='deploy@15milja.com'; FTPHOST='88.198.1.66'; THEMEDIR='staging/wp-content/themes/vinoteka15'
for f in inc/setup.php inc/shop.php woocommerce/cart/mini-cart.php header.php functions.php assets/woo.css assets/theme.js; do
  curl -sS --ftp-create-dirs --user "$FTPUSER:$FTPPASS" -T "wp-theme/vinoteka15/$f" "ftp://$FTPHOST/$THEMEDIR/$f" && echo "OK: $f" || echo "FAIL: $f"
done
```
Expected: 7× OK.

- [ ] **Step 2: Pokreni config migracije (poseti wp-admin jednom)**

Migracije se okidaju na `admin_init`. Uloguj se i učitaj dashboard da se izvrše:
```bash
WPPASS=$(awk '/## WordPress admin/{f=1} f && /Lozinka:/{ if (match($0, /`[^`]+`/)) { print substr($0, RSTART+1, RLENGTH-2); exit } }' .secrets-wp.md)
WPUSER='claude@15milja.com'; BASE='https://staging.15milja.com'; CJ=/tmp/wpcj.txt; rm -f "$CJ"
curl -s -c "$CJ" "$BASE/wp-login.php" -o /dev/null
curl -s -b "$CJ" -c "$CJ" --data-urlencode "log=$WPUSER" --data-urlencode "pwd=$WPPASS" \
  --data-urlencode "wp-submit=Log In" --data-urlencode "redirect_to=$BASE/wp-admin/" --data-urlencode "testcookie=1" "$BASE/wp-login.php" -o /dev/null
curl -s -b "$CJ" "$BASE/wp-admin/" -o /dev/null   # okida admin_init → migracije
echo "logged_in: $(grep -c wordpress_logged_in "$CJ")"
```
Expected: `1`.

- [ ] **Step 3: Verifikuj klasik korpu/checkout (nije više blok)**

```bash
echo "cart blok? $(curl -s -b "$CJ" "$BASE/cart/" | grep -c 'wp-block-woocommerce-cart')  (očekivano 0)"
echo "cart klasik? $(curl -s -b "$CJ" "$BASE/cart/" | grep -c 'woocommerce-cart-form\|cart_totals\|cart-empty')  (>0)"
```
Expected: blok = 0, klasik > 0.

- [ ] **Step 4: Verifikuj single product (Detalji, bez tabova, related, Na upit)**

```bash
curl -s -b "$CJ" "$BASE/product/aleksandrovic-bela-varijanta/" > /tmp/sp.html
echo "Detalji lista:  $(grep -c 'v15-details' /tmp/sp.html)  (>0)"
echo "tabovi uklonjeni: $(grep -c 'woocommerce-tabs' /tmp/sp.html)  (0)"
echo "još iz kategorije: $(grep -oc 'Još iz kategorije' /tmp/sp.html)  (>=1)"
echo "breadcrumb: $(grep -c 'woocommerce-breadcrumb' /tmp/sp.html)  (>0)"
```
Expected: Detalji>0, tabovi=0, related>=1, breadcrumb>0.

- [ ] **Step 5: Verifikuj „Na upit" single (proizvod bez cene)**

Nađi „Na upit" proizvod (prazna cena) iz shopa i otvori ga:
```bash
# primer: traži proizvod sa klasom koja nema add-to-cart; alternativno uzmi poznati „Na upit" slug
curl -s -b "$CJ" "$BASE/shop/?orderby=price" | grep -oE '/product/[^"]+' | head -1
# zatim ručno otvori jedan „Na upit" proizvod i proveri:
# grep -c 'v15-inquiry' → >0 ; grep -c 'single_add_to_cart_button' → 0
```
Expected: na „Na upit" proizvodu `v15-inquiry` prisutan, nema add-to-cart dugmeta.

- [ ] **Step 6: Verifikuj mini-korpa markup + COD/pickup**

```bash
echo "mini-korpa panel: $(curl -s -b "$CJ" "$BASE/shop/" | grep -c 'id="minicart"')  (>0)"
echo "COD omogućen: $(curl -s -b "$CJ" "$BASE/wp-admin/admin.php?page=wc-settings&tab=checkout&section=cod" | grep -c 'checked')  (>0)"
```
Expected: panel>0; COD checkbox checked.

- [ ] **Step 7: Purge keš**

wp-admin → LiteSpeed Cache → Toolbox → Purge All.

Ako neki korak padne: zabeleži šta i zašto (npr. related se ne prikazuje → proveri da proizvod ima kategoriju sa drugim proizvodima; klasik se ne primeni → proveri da je migracija stvarno prošla preko `get_option('v15_classic_pages')`).

---

## Task 7: (Controller) Test porudžbina end-to-end

**Files:** nema

- [ ] **Step 1: Postavi test porudžbinu**

Browser-automatizacijom (DOM nivo, bez screenshot-a) ili ručno (vlasnik):
1. Uloguj se na staging.
2. Otvori proizvod sa cenom → „U KORPU" (mini-korpa se otvori).
3. „Na plaćanje" → checkout.
4. Popuni ime/prezime/adresu/grad/poštanski/telefon/email; izaberi „Lično preuzimanje" + „Pouzećem".
5. „Poruči".

Expected: stranica „Porudžbina primljena" (thank-you), broj porudžbine prikazan.

- [ ] **Step 2: Potvrdi porudžbinu u adminu + email**

```bash
curl -s -b "$CJ" "$BASE/wp-admin/edit.php?post_type=shop_order" | grep -oE "Pouzećem|Lično preuzimanje|order-[0-9]+" | head
```
Expected: nova porudžbina vidljiva u WooCommerce → Orders (status „Obrada"/processing za COD); „New order" email poslat (proveri inbox vinoteke / cPanel mail log).

- [ ] **Step 3: Zabeleži rezultat**

Ako email ne stigne: WooCommerce → Settings → Emails (i SMTP) — verovatno treba SMTP plugin (van obima ovog taska; zabeleži kao Faza 3 stavku). Porudžbina kreirana u adminu je glavni kriterijum uspeha.

---

## Task 8: (Controller) Dokumentacija + merge

**Files:**
- Modify: `PROJEKAT.md`
- Modify: `/Users/urosboskovic/.claude/projects/-Users-urosboskovic-Documents-Website/memory/vinoteka-woocommerce-stanje.md`

- [ ] **Step 1: Ažuriraj PROJEKAT.md §0**

Označi „Sledeći koraci" tačku 1 (single + korpa/checkout + test) kao URAĐENO; zabeleži: klasik korpa/checkout, mini-korpa, COD+lično preuzimanje omogućeni; BACS + dostava po težini + SMTP email ostaju za Fazu 3.

- [ ] **Step 2: Ažuriraj memory fajl**

„Gde smo stali": single+korpa+checkout+mini-korpa gotovi i verifikovani; sledeće Faza 3 (BACS, dostava po težini, pravne stranice, SMTP) ili meni/age gate.

- [ ] **Step 3: Commit**

```bash
git add PROJEKAT.md
git commit -m "PROJEKAT: single + klasik korpa/checkout + mini-korpa + COD/pickup urađeno"
```

- [ ] **Step 4: Završi granu**

Koristi superpowers:finishing-a-development-branch (merge na main lokalno, bez push-a — kao i dosad).

---

## Self-Review (sproveden)

- **Pokrivenost spec-a:** A Single (Task 2 hookovi + Task 5 CSS): tabovi/Detalji/Na upit/related/breadcrumb ✓. B Klasik korpa/checkout (Task 1 migracija + Task 5 CSS + Task 2 checkout polja) ✓. C Mini-korpa (Task 2 fragment + Task 3 template/header + Task 4 JS + Task 5 CSS) ✓. D Config (Task 1: COD + zona+pickup) ✓. E Test porudžbina (Task 7) ✓. Rubni: Na upit (Task 2 CTA + WC sakriva dugme), prazna korpa (mini-cart.php else grana), fragmenti (Task 2), idempotentne migracije (Task 1 guard flagovi) ✓.
- **Placeholder skan:** „<lozinka iz .secrets-wp.md>" i „povećaj verziju" su namerni (kredencijali van git-a; tačna verzija se čita iz fajla). Task 5/Step2 zahteva da izvršilac pročita trenutnu verziju pre bump-a — eksplicitno navedeno. Task 7 placement je verifikacioni (browser/ručno), ne kod. Nema TODO/„slično kao".
- **Konzistentnost:** hook imena i fragment ključ (`div.widget_shopping_cart_content`) isti u `inc/shop.php`, `mini-cart.php`, `header.php`. CSS klase (`v15-minicart*`, `v15-details*`, `v15-inquiry*`) iste u PHP markup-u i `woo.css`. JS ciljanje (`.cart-toggle`, `#minicart`, `#minicart-overlay`, `#minicart-close`) isto u `header.php` i `theme.js`. `require_once` redosled u functions.php: filters → setup → shop.
- **Rizici označeni:** WC verzija mini-cart template-a (minimalni override); related može biti prazan ako proizvod nema kategorijske parnjake (malo verovatno za vina); email zavisi od SMTP (Faza 3).
