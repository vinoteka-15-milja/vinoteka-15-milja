# Katalog filteri (WooCommerce, tema vinoteka15) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dodati UI za filtriranje kataloga (Vrsta/Zemlja/Region/Vinarija/Cena + pretraga) na `staging.15milja.com/shop/` u našem tamnom dizajnu, vezan za već-funkcionalan native WooCommerce layered nav.

**Architecture:** Bespoke WP tema. Filteri se renderuju u PHP-u i kače na `woocommerce_before_shop_loop` (koji `woocommerce_content()` u našem `woocommerce.php` već okida). Svaka opcija je server-render **toggle link** koji menja `product_cat` / `filter_<atr>` / `min_price|max_price` query-var i reload-uje — WooCommerce sam filtrira. `<details>` daje dropdown bez JS-a; JS je samo progressive enhancement (mobilni drawer, „pretraži u listi").

**Tech Stack:** PHP (WordPress/WooCommerce), vanilla JS, CSS. Deploy preko FTP (`deploy@15milja.com`). Verifikacija: PHP CLI unit test za čistu logiku + autentifikovani `curl` koji poredi broj rezultata na živom stagingu.

**Reference spec:** `docs/superpowers/specs/2026-06-23-woo-katalog-filteri-design.md`

**Napomena:** Najveći deo je WP rendering — „test" za njega je živa verifikacija (Task 8), ne unit test. Jedino je čista logika (toggle CSV, price bucket) unit-testabilna (Task 1, pravi TDD).

---

## File Structure

- `wp-theme/vinoteka15/inc/filters.php` — **NOV**. Sve za filtere: čiste funkcije (`v15_csv_toggle`, `v15_price_params`), WP-zavisni URL/selection helperi, render funkcije. SADRŽI SAMO DEFINICIJE FUNKCIJA (bez top-level WP poziva) da bi bio testabilan standalone.
- `wp-theme/vinoteka15/functions.php` — **IZMENA**. `require inc/filters.php` + registracija 2 hook-a (`woocommerce_before_shop_loop`).
- `wp-theme/vinoteka15/assets/woo.css` — **IZMENA**. Stil dropdown popovera (`<details>`), scroll-liste termina, „pretraži u listi" input. (Pilule/chipovi/drawer/search su već u `app.css`.)
- `wp-theme/vinoteka15/assets/theme.js` — **IZMENA**. Mobilni drawer toggle + „pretraži u listi".
- `tools/filter-logic.test.php` — **NOV**. PHP CLI unit test za čiste funkcije.

**Kredencijali (NIKAD u git):** FTP i WP lozinke su u `.secrets-wp.md` (gitignored). U komandama ispod koristi env var-ove (`$FTPPASS`, `$WPPASS`) koje postaviš iz tog fajla pre pokretanja. Ne upisuj lozinke u plan/commit.

---

## Task 1: Čista filter-logika (TDD)

**Files:**
- Create: `tools/filter-logic.test.php`
- Create: `wp-theme/vinoteka15/inc/filters.php`

- [ ] **Step 1: Napiši test koji pada**

`tools/filter-logic.test.php`:
```php
<?php
// Pretvaramo se da smo u WP-u da ABSPATH-guard u filters.php ne prekine učitavanje.
define('ABSPATH', __DIR__);
require __DIR__ . '/../wp-theme/vinoteka15/inc/filters.php';

function eq($got, $exp, $msg) {
    if ($got !== $exp) {
        fwrite(STDERR, "FAIL: $msg\n  got: " . var_export($got, true) . "\n  exp: " . var_export($exp, true) . "\n");
        exit(1);
    }
}

// v15_csv_toggle: dodaje/izbacuje slug iz zarezom-razdvojene liste
eq(v15_csv_toggle('', 'srbija'), 'srbija', 'add to empty');
eq(v15_csv_toggle('srbija', 'srbija'), '', 'remove only');
eq(v15_csv_toggle('srbija,hrvatska', 'srbija'), 'hrvatska', 'remove first');
eq(v15_csv_toggle('hrvatska', 'srbija'), 'hrvatska,srbija', 'append');
eq(v15_csv_toggle('srbija, hrvatska', 'italija'), 'srbija,hrvatska,italija', 'trim + append');
eq(v15_csv_toggle('srbija,,hrvatska', 'srbija'), 'hrvatska', 'drop empty segments');

// v15_price_params: bucket -> WC price args
eq(v15_price_params('do-1500'), ['max_price' => '1500'], 'bucket do-1500');
eq(v15_price_params('1500-3000'), ['min_price' => '1500', 'max_price' => '3000'], 'bucket 1500-3000');
eq(v15_price_params('3000+'), ['min_price' => '3000'], 'bucket 3000+');
eq(v15_price_params('all'), [], 'bucket all -> none');

echo "SVE OK\n";
```

- [ ] **Step 2: Pokreni test — mora da padne**

Run: `php tools/filter-logic.test.php`
Expected: FAIL — `require(...inc/filters.php): Failed to open stream` (fajl još ne postoji).

- [ ] **Step 3: Napiši minimalan `inc/filters.php` (samo čiste funkcije)**

`wp-theme/vinoteka15/inc/filters.php`:
```php
<?php
/**
 * Vinoteka 15 — katalog filteri (logika + rendering).
 * SAMO definicije funkcija (bez top-level WP poziva) — da bi fajl bio testabilan standalone.
 */
if (!defined('ABSPATH')) exit;

/**
 * Toggle slug u/iz zarezom-razdvojene liste. Čista funkcija.
 */
function v15_csv_toggle($csv, $value) {
    $parts = array_values(array_filter(array_map('trim', explode(',', (string) $csv)), 'strlen'));
    $idx = array_search($value, $parts, true);
    if ($idx === false) {
        $parts[] = $value;
    } else {
        unset($parts[$idx]);
    }
    return implode(',', $parts);
}

/**
 * Mapiraj price-bucket ključ na WooCommerce price query args. Čista funkcija.
 */
function v15_price_params($bucket) {
    switch ($bucket) {
        case 'do-1500':   return ['max_price' => '1500'];
        case '1500-3000': return ['min_price' => '1500', 'max_price' => '3000'];
        case '3000+':     return ['min_price' => '3000'];
        default:          return [];
    }
}
```

- [ ] **Step 4: Pokreni test — mora da prođe**

Run: `php tools/filter-logic.test.php`
Expected: `SVE OK`

- [ ] **Step 5: Commit**

```bash
git add tools/filter-logic.test.php wp-theme/vinoteka15/inc/filters.php
git commit -m "Filteri: čista logika (csv toggle, price bucket) + test"
```

---

## Task 2: WP-zavisni URL/selection helperi

**Files:**
- Modify: `wp-theme/vinoteka15/inc/filters.php` (dodaj funkcije na kraj)

- [ ] **Step 1: Dodaj helpere**

Dodaj na kraj `wp-theme/vinoteka15/inc/filters.php`:
```php
/** Bazni shop URL (bez query-ja). */
function v15_shop_base_url() {
    return wc_get_page_permalink('shop');
}

/** Trenutni $_GET kao čist niz (unslashed). */
function v15_current_args() {
    $args = array();
    foreach ($_GET as $k => $v) {
        if (is_array($v)) continue; // naši filteri su uvek skalarni
        $args[$k] = wp_unslash($v);
    }
    return $args;
}

/** Da li je slug izabran u datom filter varu. */
function v15_is_selected($var, $slug) {
    if (empty($_GET[$var])) return false;
    $vals = array_map('trim', explode(',', wp_unslash($_GET[$var])));
    return in_array($slug, $vals, true);
}

/** URL sa toggle-ovanim atribut-terminom (multi, OR). */
function v15_attr_toggle_url($filter_var, $qtype_var, $slug) {
    $current = isset($_GET[$filter_var]) ? wp_unslash($_GET[$filter_var]) : '';
    $next = v15_csv_toggle($current, $slug);
    $args = v15_current_args();
    unset($args['paged']);
    if ($next === '') {
        unset($args[$filter_var], $args[$qtype_var]);
    } else {
        $args[$filter_var] = $next;
        $args[$qtype_var]  = 'or';
    }
    return esc_url(add_query_arg($args, v15_shop_base_url()));
}

/** URL koji postavlja/skida single var (npr. product_cat). $slug='' => skini. */
function v15_single_url($var, $slug) {
    $args = v15_current_args();
    unset($args['paged']);
    if ($slug === '' || $slug === null) {
        unset($args[$var]);
    } else {
        $args[$var] = $slug;
    }
    return esc_url(add_query_arg($args, v15_shop_base_url()));
}

/** URL za price bucket (resetuje prethodni min/max). */
function v15_price_url($bucket) {
    $args = v15_current_args();
    unset($args['paged'], $args['min_price'], $args['max_price']);
    foreach (v15_price_params($bucket) as $k => $v) {
        $args[$k] = $v;
    }
    return esc_url(add_query_arg($args, v15_shop_base_url()));
}

/** Koji price bucket je trenutno aktivan (za .active stanje). */
function v15_active_price_bucket() {
    $min = isset($_GET['min_price']) ? (string) wp_unslash($_GET['min_price']) : '';
    $max = isset($_GET['max_price']) ? (string) wp_unslash($_GET['max_price']) : '';
    if ($min === '' && $max === '') return 'all';
    if ($min === '' && $max === '1500') return 'do-1500';
    if ($min === '1500' && $max === '3000') return '1500-3000';
    if ($min === '3000' && $max === '') return '3000+';
    return ''; // custom raspon (npr. iz druge sesije) — nijedan bucket nije „active"
}

/** Naziv termina iz sluga za chip labelu. */
function v15_term_name($taxonomy, $slug) {
    $t = get_term_by('slug', $slug, $taxonomy);
    return $t ? $t->name : $slug;
}
```

- [ ] **Step 2: Sintaksna provera (PHP lint)**

Run: `php -l wp-theme/vinoteka15/inc/filters.php`
Expected: `No syntax errors detected in wp-theme/vinoteka15/inc/filters.php`

- [ ] **Step 3: Re-run unit test (čiste funkcije i dalje rade)**

Run: `php tools/filter-logic.test.php`
Expected: `SVE OK` (helperi koriste WP funkcije ali se ne POZIVAJU u testu — samo definišu)

- [ ] **Step 4: Commit**

```bash
git add wp-theme/vinoteka15/inc/filters.php
git commit -m "Filteri: URL/selection helperi (toggle, single, price, chip naziv)"
```

---

## Task 3: Render funkcije (traka + dropdown + chipovi)

**Files:**
- Modify: `wp-theme/vinoteka15/inc/filters.php` (dodaj render funkcije na kraj)

- [ ] **Step 1: Dodaj render funkcije**

Dodaj na kraj `wp-theme/vinoteka15/inc/filters.php`:
```php
/** Render jednog atribut-dropdowna (Zemlja/Region/Vinarija). */
function v15_render_attr_dropdown($label, $taxonomy, $filter_var, $qtype_var, $searchable = false) {
    $terms = get_terms(array('taxonomy' => $taxonomy, 'hide_empty' => true, 'orderby' => 'name'));
    if (is_wp_error($terms) || empty($terms)) return;

    $selected = array();
    if (!empty($_GET[$filter_var])) {
        $selected = array_map('trim', explode(',', wp_unslash($_GET[$filter_var])));
    }
    $count = count(array_filter($selected, 'strlen'));
    ?>
    <details class="filter-dropdown" data-filter="<?php echo esc_attr($filter_var); ?>">
      <summary class="filter-dropdown-trigger">
        <?php echo esc_html($label); ?><?php if ($count) : ?> (<?php echo (int) $count; ?>)<?php endif; ?>
        <span class="filter-caret" aria-hidden="true">▾</span>
      </summary>
      <div class="filter-dropdown-panel">
        <?php if ($searchable) : ?>
          <input type="text" class="filter-list-search" placeholder="Pretraži…" autocomplete="off" aria-label="Pretraži u listi">
        <?php endif; ?>
        <div class="filter-term-list">
          <?php foreach ($terms as $t) :
              $is = in_array($t->slug, $selected, true); ?>
            <a class="filter-term <?php echo $is ? 'active' : ''; ?>"
               href="<?php echo v15_attr_toggle_url($filter_var, $qtype_var, $t->slug); ?>"
               rel="nofollow"
               data-name="<?php echo esc_attr(mb_strtolower($t->name)); ?>">
              <span class="filter-term-box" aria-hidden="true"></span>
              <span class="filter-term-name"><?php echo esc_html($t->name); ?></span>
            </a>
          <?php endforeach; ?>
        </div>
      </div>
    </details>
    <?php
}

/** Render reda Vrsta-pilula (kategorije). */
function v15_render_category_pills() {
    $terms = get_terms(array('taxonomy' => 'product_cat', 'hide_empty' => true, 'orderby' => 'name'));
    if (is_wp_error($terms)) return;
    $cur = isset($_GET['product_cat']) ? wp_unslash($_GET['product_cat']) : '';
    ?>
    <div class="filter-group-label">Vrsta</div>
    <div class="wine-filters">
      <a class="filter-btn <?php echo $cur === '' ? 'active' : ''; ?>" href="<?php echo v15_single_url('product_cat', ''); ?>" rel="nofollow">Sve</a>
      <?php foreach ($terms as $t) : ?>
        <a class="filter-btn <?php echo $cur === $t->slug ? 'active' : ''; ?>"
           href="<?php echo v15_single_url('product_cat', $t->slug); ?>" rel="nofollow"><?php echo esc_html($t->name); ?></a>
      <?php endforeach; ?>
    </div>
    <?php
}

/** Render reda Cena-pilula. */
function v15_render_price_pills() {
    $active = v15_active_price_bucket();
    $buckets = array(
        'all'       => 'Sve cene',
        'do-1500'   => 'do 1.500',
        '1500-3000' => '1.500–3.000',
        '3000+'     => '3.000+',
    );
    ?>
    <div class="filter-group-label">Cena</div>
    <div class="price-toggle">
      <?php foreach ($buckets as $key => $lbl) : ?>
        <a class="price-btn <?php echo $active === $key ? 'active' : ''; ?>"
           href="<?php echo v15_price_url($key); ?>" rel="nofollow"><?php echo esc_html($lbl); ?></a>
      <?php endforeach; ?>
    </div>
    <?php
}

/** Render aktivnih chipova (uklonjivi). */
function v15_render_chips() {
    $chips = array(); // [label, url-bez-tog-filtera]

    if (!empty($_GET['product_cat'])) {
        $slug = wp_unslash($_GET['product_cat']);
        $chips[] = array(v15_term_name('product_cat', $slug), v15_single_url('product_cat', ''));
    }
    $attr_map = array(
        'filter_zemlja'   => array('pa_zemlja', 'query_type_zemlja'),
        'filter_region'   => array('pa_region', 'query_type_region'),
        'filter_vinarija' => array('pa_vinarija', 'query_type_vinarija'),
    );
    foreach ($attr_map as $fvar => $info) {
        if (empty($_GET[$fvar])) continue;
        $slugs = array_filter(array_map('trim', explode(',', wp_unslash($_GET[$fvar]))), 'strlen');
        foreach ($slugs as $slug) {
            $chips[] = array(v15_term_name($info[0], $slug), v15_attr_toggle_url($fvar, $info[1], $slug));
        }
    }
    $pb = v15_active_price_bucket();
    if ($pb !== 'all' && $pb !== '') {
        $labels = array('do-1500' => 'do 1.500', '1500-3000' => '1.500–3.000', '3000+' => '3.000+');
        $chips[] = array($labels[$pb], v15_price_url('all'));
    }
    if (!empty($_GET['s'])) {
        $args = v15_current_args(); unset($args['s'], $args['paged']);
        $chips[] = array('„' . wp_unslash($_GET['s']) . '"', esc_url(add_query_arg($args, v15_shop_base_url())));
    }

    if (empty($chips)) return;
    ?>
    <div class="active-chips">
      <?php foreach ($chips as $c) : ?>
        <a class="active-chip" href="<?php echo $c[1]; ?>" rel="nofollow"><?php echo esc_html($c[0]); ?> <span class="chip-x" aria-hidden="true">×</span></a>
      <?php endforeach; ?>
      <a class="active-chip chip-clear" href="<?php echo esc_url(v15_shop_base_url()); ?>" rel="nofollow">Poništi sve</a>
    </div>
    <?php
}

/** Glavni render: search + traka filtera. Kači se na woocommerce_before_shop_loop. */
function v15_render_filters() {
    ?>
    <div class="catalog-controls">
      <form class="wine-search" role="search" method="get" action="<?php echo esc_url(v15_shop_base_url()); ?>">
        <input type="text" name="s" value="<?php echo isset($_GET['s']) ? esc_attr(wp_unslash($_GET['s'])) : ''; ?>"
               placeholder="Pretraži po nazivu ili vinariji…" autocomplete="off">
        <input type="hidden" name="post_type" value="product">
      </form>
      <button class="mobile-filter-toggle" id="mobile-filter-toggle" type="button" aria-expanded="false" aria-controls="filters-panel">Filteri</button>
    </div>

    <div class="filters-overlay" id="filters-overlay"></div>
    <div class="filters-panel" id="filters-panel">
      <div class="filters-panel-head">
        <span class="filters-panel-title">Filteri</span>
        <button class="filters-close" id="filters-close" type="button" aria-label="Zatvori filtere">×</button>
      </div>

      <?php v15_render_category_pills(); ?>

      <div class="filter-group-label">Poreklo</div>
      <div class="filter-dropdowns">
        <?php
        v15_render_attr_dropdown('Zemlja', 'pa_zemlja', 'filter_zemlja', 'query_type_zemlja', false);
        v15_render_attr_dropdown('Region', 'pa_region', 'filter_region', 'query_type_region', true);
        v15_render_attr_dropdown('Vinarija', 'pa_vinarija', 'filter_vinarija', 'query_type_vinarija', true);
        ?>
      </div>

      <?php v15_render_price_pills(); ?>

      <div class="filters-panel-actions">
        <a class="filters-reset" href="<?php echo esc_url(v15_shop_base_url()); ?>" rel="nofollow">Poništi sve</a>
        <button class="filters-apply" id="filters-apply" type="button">Prikaži rezultate</button>
      </div>
    </div>

    <?php v15_render_chips(); ?>
    <?php
}
```

- [ ] **Step 2: PHP lint**

Run: `php -l wp-theme/vinoteka15/inc/filters.php`
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit**

```bash
git add wp-theme/vinoteka15/inc/filters.php
git commit -m "Filteri: render (Vrsta pilule, Poreklo dropdownovi, Cena, chipovi, pretraga)"
```

---

## Task 4: Poveži u functions.php (require + hookovi)

**Files:**
- Modify: `wp-theme/vinoteka15/functions.php`

- [ ] **Step 1: Require inc/filters.php i registruj hookove**

U `wp-theme/vinoteka15/functions.php`, ODMAH posle `if (!defined('ABSPATH')) exit;` (linija 6), dodaj:
```php

/* Katalog filteri (definicije + render). */
require_once __DIR__ . '/inc/filters.php';

/* Filter traka iznad shop grida (woocommerce_content() okida ovaj hook). */
add_action('woocommerce_before_shop_loop', 'v15_render_filters', 5);
```

- [ ] **Step 2: PHP lint oba fajla**

Run: `php -l wp-theme/vinoteka15/functions.php && php -l wp-theme/vinoteka15/inc/filters.php`
Expected: oba `No syntax errors detected`

- [ ] **Step 3: Commit**

```bash
git add wp-theme/vinoteka15/functions.php
git commit -m "Filteri: require inc/filters.php + hook na woocommerce_before_shop_loop"
```

---

## Task 5: CSS za dropdown / scroll-listu / list-search

**Files:**
- Modify: `wp-theme/vinoteka15/assets/woo.css` (dodaj na kraj)

- [ ] **Step 1: Dodaj stilove**

Dodaj na kraj `wp-theme/vinoteka15/assets/woo.css`:
```css
/* ============================================
   Katalog filteri — dropdown popoveri + scroll liste
   (pilule/chipovi/drawer/search su već u app.css)
   ============================================ */
.filter-dropdowns { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 8px; }

details.filter-dropdown { position: relative; }
.filter-dropdown-trigger {
  list-style: none; cursor: pointer; user-select: none;
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--clr-card); color: var(--clr-cream);
  border: 1px solid rgba(201,169,110,.3); border-radius: var(--radius-sm);
  padding: 9px 14px; font-size: var(--fs-sm); white-space: nowrap;
}
.filter-dropdown-trigger::-webkit-details-marker { display: none; }
.filter-dropdown[open] .filter-dropdown-trigger { border-color: var(--clr-gold); color: var(--clr-gold); }
.filter-caret { font-size: 10px; transition: transform .15s; }
.filter-dropdown[open] .filter-caret { transform: rotate(180deg); }

.filter-dropdown-panel {
  position: absolute; z-index: 40; top: calc(100% + 6px); left: 0;
  width: 260px; max-width: 80vw;
  background: var(--clr-panel); border: 1px solid rgba(201,169,110,.3);
  border-radius: var(--radius-sm); padding: 10px;
  box-shadow: 0 12px 32px rgba(0,0,0,.5);
}
.filter-list-search {
  width: 100%; box-sizing: border-box; margin-bottom: 8px;
  background: var(--clr-card); color: var(--clr-cream);
  border: 1px solid rgba(201,169,110,.3); border-radius: var(--radius-sm); padding: 8px 10px;
}
.filter-term-list { max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; }
.filter-term {
  display: flex; align-items: center; gap: 9px;
  padding: 7px 6px; color: var(--clr-cream); text-decoration: none;
  border-radius: 4px; font-size: var(--fs-sm);
}
.filter-term:hover { background: var(--clr-card); }
.filter-term.hidden { display: none; }
.filter-term-box {
  width: 16px; height: 16px; flex: 0 0 16px;
  border: 1px solid rgba(201,169,110,.5); border-radius: 3px; position: relative;
}
.filter-term.active .filter-term-box { background: var(--clr-gold); border-color: var(--clr-gold); }
.filter-term.active .filter-term-box::after {
  content: ''; position: absolute; left: 5px; top: 1px;
  width: 4px; height: 9px; border: solid #171114; border-width: 0 2px 2px 0; transform: rotate(45deg);
}
.filter-term.active .filter-term-name { color: var(--clr-gold); }

/* Na mobilnom (drawer) dropdownovi su uvek otvoreni i puni širine */
@media (max-width: 767px) {
  details.filter-dropdown[open] .filter-dropdown-panel,
  details.filter-dropdown .filter-dropdown-panel {
    position: static; width: 100%; box-shadow: none; border: none; padding: 0 0 8px;
  }
  .filter-dropdowns { flex-direction: column; align-items: stretch; }
  .filter-dropdown-trigger { width: 100%; justify-content: space-between; }
}
```

- [ ] **Step 2: Verifikuj da CSS nije slomljen (broj otvorenih = zatvorenih vitičastih)**

Run: `php -r '$c=file_get_contents("wp-theme/vinoteka15/assets/woo.css"); echo substr_count($c,"{")."/".substr_count($c,"}")."\n";'`
Expected: dva ista broja (npr. `52/52`).

- [ ] **Step 3: Commit**

```bash
git add wp-theme/vinoteka15/assets/woo.css
git commit -m "Filteri: CSS za dropdown popovere i scroll-liste termina"
```

---

## Task 6: JS — mobilni drawer + „pretraži u listi"

**Files:**
- Modify: `wp-theme/vinoteka15/assets/theme.js`

- [ ] **Step 1: Pogledaj postojeći theme.js**

Run: `cat wp-theme/vinoteka15/assets/theme.js`
Cilj: ne dupliraj postojeći mobilni-meni kod; dodaj novi blok na kraj.

- [ ] **Step 2: Dodaj filter JS (na kraj fajla)**

Dodaj na kraj `wp-theme/vinoteka15/assets/theme.js`:
```javascript
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
})();
```

- [ ] **Step 3: JS sintaksna provera (zagrade balansirane)**

Run: `node --check wp-theme/vinoteka15/assets/theme.js`
Expected: bez ispisa (exit 0). (Ako `node` nije dostupan: `php -r '...'` provera nije pouzdana za JS — preskoči, osloni se na živi test u Task 8.)

- [ ] **Step 4: Commit**

```bash
git add wp-theme/vinoteka15/assets/theme.js
git commit -m "Filteri: JS mobilni drawer + pretraga u listi (progressive enhancement)"
```

---

## Task 7: Deploy na staging (FTP) + purge keša

**Files:** nema (deploy)

- [ ] **Step 1: Postavi FTP lozinku iz .secrets-wp.md (NE u git)**

Otvori `.secrets-wp.md`, sekcija FTP, i izvezi lozinku u env:
```bash
export FTPUSER='deploy@15milja.com'
export FTPPASS='<lozinka iz .secrets-wp.md>'
export FTPHOST='88.198.1.66'
export THEMEDIR='staging/wp-content/themes/vinoteka15'
```

- [ ] **Step 2: Uploaduj izmenjene/nove fajlove**

```bash
cd /Users/urosboskovic/Documents/Website
for f in inc/filters.php functions.php assets/woo.css assets/theme.js; do
  curl --ftp-create-dirs --user "$FTPUSER:$FTPPASS" -T "wp-theme/vinoteka15/$f" \
    "ftp://$FTPHOST/$THEMEDIR/$f" && echo "OK: $f"
done
```
Expected: `OK: inc/filters.php` … `OK: assets/theme.js` (4 puta OK).

- [ ] **Step 3: Bump verzije asseta (cache-bust) — opciono ali preporučeno**

U `functions.php` promeni verziju enqueue-a (`'1.0'` → `'1.1'`) za `v15-woo` i `v15-main`, pa ponovo uploaduj `functions.php` (kao Step 2). Time browser uzima nov CSS/JS.
```bash
# posle izmene:
curl --user "$FTPUSER:$FTPPASS" -T wp-theme/vinoteka15/functions.php "ftp://$FTPHOST/$THEMEDIR/functions.php"
git add wp-theme/vinoteka15/functions.php && git commit -m "Filteri: bump verzije asseta (cache-bust)"
```

- [ ] **Step 4: Purge LiteSpeed keš**

WP admin → LiteSpeed Cache → Toolbox → Purge All. (Keš je inače OFF u razvoju, ali purge za svaki slučaj.)
Verifikacija: fajlovi prisutni na serveru:
```bash
curl -s --user "$FTPUSER:$FTPPASS" "ftp://$FTPHOST/$THEMEDIR/inc/" | grep filters.php
```
Expected: linija sa `filters.php`.

---

## Task 8: Živa verifikacija (autentifikovani curl, poređenje broja rezultata)

**Files:** nema

> Staging je u WooCommerce „Coming soon" → gost vidi coming-soon. Zato se verifikacija radi ULOGOVAN (cookie jar). Baseline shop = **404**.

- [ ] **Step 1: Prijavi se i sačuvaj cookie**

Postavi WP lozinku iz `.secrets-wp.md` (WordPress admin sekcija):
```bash
export WPUSER='claude@15milja.com'
export WPPASS='<lozinka iz .secrets-wp.md>'
export BASE='https://staging.15milja.com'
CJ=/tmp/wpcj.txt; rm -f "$CJ"
curl -s -c "$CJ" "$BASE/wp-login.php" -o /dev/null
curl -s -b "$CJ" -c "$CJ" \
  --data-urlencode "log=$WPUSER" --data-urlencode "pwd=$WPPASS" \
  --data-urlencode "wp-submit=Log In" --data-urlencode "redirect_to=$BASE/wp-admin/" \
  --data-urlencode "testcookie=1" "$BASE/wp-login.php" -o /dev/null
grep -c wordpress_logged_in "$CJ"
```
Expected: `1`

- [ ] **Step 2: Helper za brojanje rezultata**

```bash
rc () { curl -s -b "$CJ" "$1" | grep -oE "of [0-9]+ results" | head -1; }
```

- [ ] **Step 3: Proveri da se traka filtera renderuje**

```bash
curl -s -b "$CJ" "$BASE/shop/" | grep -oE "catalog-controls|filter-dropdown|wine-filters|active-chips" | sort | uniq -c
```
Expected: vidljivi `catalog-controls`, `filter-dropdown`, `wine-filters` (traka se renderuje).

- [ ] **Step 4: Pojedinačni filteri smanjuju rezultat (404 baseline)**

```bash
echo "baseline:        $(rc "$BASE/shop/")"                                  # of 404 results
echo "Vrsta crveno:    $(rc "$BASE/shop/?product_cat=crveno-vino")"          # of 166 results
echo "Zemlja srbija:   $(rc "$BASE/shop/?filter_zemlja=srbija&query_type_zemlja=or")"  # of 223 results
echo "Region (neki):   $(rc "$BASE/shop/?filter_region=sumadija&query_type_region=or")" # < 404 (slug po stvarnom terminu)
echo "Cena 1500-3000:  $(rc "$BASE/shop/?min_price=1500&max_price=3000")"    # podskup < 404
```
Expected: crveno=166, srbija=223 (poznate vrednosti); ostali < 404. (Ako region slug nije `sumadija`, uzmi tačan slug iz `/wp-admin/edit-tags.php?taxonomy=pa_region&post_type=product`.)

- [ ] **Step 5: Kombinacija filtera = presek**

```bash
echo "crveno+srbija:   $(rc "$BASE/shop/?product_cat=crveno-vino&filter_zemlja=srbija&query_type_zemlja=or")"
```
Expected: broj < 166 i < 223 (presek crvenih srpskih vina).

- [ ] **Step 6: Paginacija čuva filtere**

```bash
curl -s -b "$CJ" "$BASE/shop/page/2/?filter_zemlja=srbija&query_type_zemlja=or" | grep -oE "of [0-9]+ results"
```
Expected: i dalje `of 223 results` (filter zadržan na strani 2). Ako WC koristi `?paged=2` umesto `/page/2/`, probaj `"$BASE/shop/?filter_zemlja=srbija&query_type_zemlja=or&paged=2"`.

- [ ] **Step 7: Chipovi i „Poništi sve"**

```bash
curl -s -b "$CJ" "$BASE/shop/?filter_zemlja=srbija&query_type_zemlja=or" | grep -oE "active-chip[^\"]*\"[^>]*>[^<]*" | head
```
Expected: chip sa „Srbija" + chip „Poništi sve" (href = goli `/shop/`).

- [ ] **Step 8: Zabeleži rezultate**

Ako sve prolazi → Task complete. Ako neki filter vrati 404 (nije filtrirao) → proveri tačan slug termina i query_type; ako traka se ne renderuje → proveri da `woocommerce_before_shop_loop` okida (možda treba template override `woocommerce/archive-product.php` umesto hooka — fallback).

---

## Task 9: Ažuriraj dokumentaciju i memoriju

**Files:**
- Modify: `PROJEKAT.md`
- Modify: `/Users/urosboskovic/.claude/projects/-Users-urosboskovic-Documents-Website/memory/vinoteka-woocommerce-stanje.md`

- [ ] **Step 1: Ispravi PROJEKAT.md §0**

U `PROJEKAT.md`, sekcija 0:
- „Stanje (urađeno)": ispravi tvrdnju da su atributi „custom (NE globalni)" → atributi su **globalni** (`pa_*`) i popunjeni; filtriranje radi.
- „Sledeći koraci" tačka 2 (globalni atributi → filteri): označi kao **urađeno** (filter UI dodat: Vrsta/Zemlja/Region/Vinarija/Cena+pretraga, native layered nav).
- Dodaj kratku belešku: „Na upit" cena bucket i AJAX su svesno van obima v1.

- [ ] **Step 2: Ažuriraj memory fajl**

U `vinoteka-woocommerce-stanje.md`, „Gde smo stali": dodaj da su filteri kataloga gotovi; sledeće je single product + korpa/checkout stil.

- [ ] **Step 3: Commit**

```bash
git add PROJEKAT.md
git commit -m "PROJEKAT: filteri kataloga urađeni; ispravka da su atributi globalni"
```
(Memory fajl je van git repoa — ne commituje se.)

---

## Self-Review (sproveden)

- **Pokrivenost spec-a:** Vrsta (`v15_render_category_pills`/Task 3) ✓; Zemlja/Region/Vinarija (`v15_render_attr_dropdown`/Task 3) ✓; Cena (`v15_render_price_pills`/Task 3) ✓; pretraga (`v15_render_filters` search form/Task 3) ✓; toggle linkovi i OR (`v15_attr_toggle_url`/Task 2) ✓; chipovi + Poništi (`v15_render_chips`/Task 3) ✓; mobilni drawer + list-search (Task 6) ✓; CSS dropdown/scroll (Task 5) ✓; hook umesto template override (Task 4) ✓; živa verifikacija sa konkretnim brojevima (Task 8) ✓; „Na upit" izostavljen u v1 (spec) ✓.
- **Placeholder skan:** jedini „<lozinka iz .secrets-wp.md>" je namerno (kredencijali NE idu u git); region slug u Task 8 ima fallback uputstvo. Nema TODO/TBD u kodu.
- **Konzistentnost tipova:** `v15_csv_toggle`, `v15_price_params`, `v15_attr_toggle_url`, `v15_single_url`, `v15_price_url`, `v15_active_price_bucket`, `v15_is_selected`, `v15_term_name`, `v15_current_args`, `v15_shop_base_url`, `v15_render_*` — imena dosledna u Task 1–4 i u testu. Hook `woocommerce_before_shop_loop` + `v15_render_filters` isti u Task 3 i 4. Query-var imena (`filter_zemlja/region/vinarija`, `query_type_*`, `product_cat`, `min_price/max_price`) ista u render, chip i verifikaciji.
- **Rizik dokumentovan:** ako se traka ne renderuje preko hooka → fallback na `woocommerce/archive-product.php` (Task 8 Step 8).
