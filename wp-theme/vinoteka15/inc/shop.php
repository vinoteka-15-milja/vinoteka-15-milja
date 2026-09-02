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

/* --- Single: breadcrumb iznad proizvoda.
   NB: naš woocommerce.php wrapper zove woocommerce_content() koja NE okida
   `woocommerce_before_main_content`; zato koristimo `woocommerce_before_single_product`
   (okida se u content-single-product.php, samo na single proizvodu). --- */
add_action('woocommerce_before_single_product', 'woocommerce_breadcrumb', 5);

/* --- Single: redosled u summary-ju ---
   naslov(5) → cena(10) → Šifra(15) → Kategorija(16) → Detalji(45) → dugme+brojač(60).
   Default meta (SKU+kategorija u jednom redu) uklonjen; dodavanje u korpu premešteno na dno. */
remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_meta', 40);
remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30);
add_action('woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 60);

/* Šifra (odvojen red) — trenutno SKU; zameniti POS šifrom kad stigne lista. */
add_action('woocommerce_single_product_summary', function () {
    global $product;
    if (!$product) return;
    $sku = $product->get_sku();
    if ($sku === '') return;
    echo '<p class="v15-meta-row"><span class="v15-meta-k">' . esc_html(v15_is_en() ? 'SKU:' : 'Šifra:') . '</span> ' . esc_html($sku) . '</p>';
}, 15);

/* Kategorija (odvojen red, odmah ispod Šifre) */
add_action('woocommerce_single_product_summary', function () {
    global $product;
    if (!$product) return;
    $cats = wc_get_product_category_list($product->get_id(), ', ');
    if (!$cats) return;
    echo '<p class="v15-meta-row"><span class="v15-meta-k">' . esc_html(v15_is_en() ? 'Category:' : 'Kategorija:') . '</span> ' . wp_kses_post($cats) . '</p>';
}, 16);

/* --- Single: „Na upit" CTA (za nekupljive) — uz dno, pored dodavanja u korpu --- */
add_action('woocommerce_single_product_summary', function () {
    global $product;
    if (!$product || ($product->is_purchasable() && $product->get_price() !== '')) return;
    echo '<p class="v15-inquiry"><span class="v15-inquiry-label">' . esc_html(v15_t('Na upit')) . '</span> '
       . '<a class="btn btn-outline" href="' . esc_url(home_url('/kontakt/')) . '">' . esc_html(v15_t('Pošalji upit')) . '</a></p>';
}, 59);

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
    echo '<div class="v15-details"><h3 class="v15-details-title">' . esc_html(v15_t('Detalji')) . '</h3><dl class="v15-details-list">';
    foreach ($rows as $k => $v) {
        $val = ($k === 'Zemlja') ? v15_country($v) : $v; // vrednost zemlje prevedi; ostalo (vlastite imenice) ostaje
        echo '<dt>' . esc_html(v15_t($k)) . '</dt><dd>' . esc_html($val) . '</dd>';
    }
    echo '</dl></div>';
}, 45);

/* --- Single: „Još iz kategorije" (related) — pun red, naš naslov --- */
add_filter('woocommerce_output_related_products_args', function ($args) {
    $args['posts_per_page'] = 5;  // koliko stane u jedan red na punoj širini (~1200px)
    $args['columns'] = 5;
    return $args;
});
add_filter('woocommerce_product_related_products_heading', function () {
    return v15_t('Još iz kategorije');
});

/* --- Prevod WC stringova na SRPSKI (samo u SR modu; u EN ostaje engleski original).
   WP je postavljen na sr_RS pa WC većinu prevede sam; ovde fiksiramo tačne reči. --- */
// Dugme na stranici proizvoda
add_filter('woocommerce_product_single_add_to_cart_text', fn($t) => v15_is_en() ? $t : 'Dodaj u korpu');
// Breadcrumb „Home" → „Početna" (SKU/Category i ostali WC stringovi su u inc/i18n.php)
add_filter('woocommerce_breadcrumb_defaults', function ($args) {
    if (!v15_is_en()) $args['home'] = 'Početna';
    return $args;
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

/* --- Kontakt mapa kao shortcode: iframe renderuje tema, ne čuva se kroz kses --- */
add_shortcode('v15_map', function () {
    $q = rawurlencode('Žikice Jovanovića 9, Loznica');
    return '<iframe src="https://maps.google.com/maps?q=' . $q . '&output=embed" '
         . 'width="100%" height="360" style="border:0;border-radius:12px" loading="lazy" '
         . 'referrerpolicy="no-referrer-when-downgrade" title="Mapa — Vinoteka 15 Milja"></iframe>';
});

/* --- Naslov shop arhive: „Vina" / „Wines" umesto „Shop" --- */
add_filter('woocommerce_page_title', function ($title) {
    return (function_exists('is_shop') && is_shop()) ? v15_t('Vina') : $title;
});
