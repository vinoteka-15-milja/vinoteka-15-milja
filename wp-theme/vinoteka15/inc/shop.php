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
