<?php
/**
 * Vinoteka 15 Milja — bespoke tema (WooCommerce).
 */

if (!defined('ABSPATH')) exit;

/* Dvojezičnost (SR/EN) — mora prva (definiše v15_t/v15_country/v15_lang). */
require_once __DIR__ . '/inc/i18n.php';
/* Katalog filteri (definicije + render). */
require_once __DIR__ . '/inc/filters.php';
require_once __DIR__ . '/inc/setup.php';
require_once __DIR__ . '/inc/shop.php';

/* Filter traka iznad shop grida (woocommerce_content() okida ovaj hook). */
add_action('woocommerce_before_shop_loop', 'v15_render_filters', 5);

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('menus');
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
    register_nav_menus([
        'primary' => 'Glavni meni',
        'footer'  => 'Footer meni',
    ]);
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'v15-fonts',
        'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Lato:wght@300;400;700&display=swap',
        [], null
    );
    wp_enqueue_style('v15-app', get_stylesheet_directory_uri() . '/assets/app.css', [], '1.6');
    wp_enqueue_style('v15-woo', get_stylesheet_directory_uri() . '/assets/woo.css', ['v15-app'], '1.10');
    wp_enqueue_script('v15-main', get_stylesheet_directory_uri() . '/assets/theme.js', [], '1.8', true);
}, 100);

/* Kritični override INLINE na kraju <head>-a — pobeđuje plugin CSS bez obzira na redosled */
add_action('wp_head', function () {
    echo '<style id="v15-critical">'
       . 'html,body{background-color:#171114!important;color:#f4ece1!important;}'
       . '.site-content,#content{background-color:#171114!important;}'
       . '.hero{background:radial-gradient(ellipse at 50% 0%,#3a1d22 0%,#171114 70%)!important;}'
       . '.site-header,.site-header.scrolled{background-color:rgba(20,15,17,.96)!important;}'
       . '.wine-card{background-color:#2a2125!important;}'
       . '.site-footer{background-color:#140f11!important;}'
       /* logo u headeru — ograniči visinu (neki plugin gazi app.css) */
       . '.logo-img{height:52px!important;width:auto!important;}'
       /* paginacija: puna pravila u woo.css (.woocommerce nav.woocommerce-pagination) */
       . '</style>';
}, 999);

/* Valuta: prikaži "RSD" umesto ćiriličnog "рсд" */
add_filter('woocommerce_currency_symbol', function ($symbol, $currency) {
    return $currency === 'RSD' ? 'RSD' : $symbol;
}, 10, 2);

/* WooCommerce: koliko proizvoda po strani i kolona */
add_filter('loop_shop_per_page', fn() => 24);
add_filter('loop_shop_columns', fn() => 4);

/* Preview staging bez WP logina:
   ?pregled=KEY zaobiđe „Coming soon" i zapamti pristup 90 dana (cookie).
   Zvanični WC hook (woocommerce_coming_soon_exclude, od 9.1). Gost sa linkom vidi pravi sajt.
   Gašenje pristupa: obrisati ovaj blok (i po želji promeniti KEY). */
add_filter('woocommerce_coming_soon_exclude', function ($excluded) {
    $key = '447ec2b5e893f49dfdd226eb';
    $ok = (isset($_GET['pregled'])   && hash_equals($key, (string) wp_unslash($_GET['pregled'])))
       || (isset($_COOKIE['v15preview']) && hash_equals($key, (string) wp_unslash($_COOKIE['v15preview'])));
    if ($ok) {
        if (empty($_COOKIE['v15preview']) && !headers_sent()) {
            setcookie('v15preview', $key, time() + 60 * 60 * 24 * 90, '/');
        }
        return true;
    }
    return $excluded;
}, 10);

/* Naslov shop arhive na pretrazi: „Rezultati za „pojam"" (umesto „Vina") */
add_filter('woocommerce_page_title', function ($title) {
    $s = get_search_query();
    if ($s === '' && !empty($_GET['s'])) {
        $s = trim(wp_unslash($_GET['s']));
    }
    if ($s !== '') {
        return v15_is_en() ? ('Results for “' . $s . '”') : ('Rezultati za „' . $s . '"');
    }
    return $title;
}, 20);

/* Korpa: broj artikala u headeru (AJAX fragment) */
add_filter('woocommerce_add_to_cart_fragments', function ($fragments) {
    ob_start();
    $count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
    ?><span class="cart-count" id="cart-count"<?php if ($count == 0) echo ' hidden'; ?>><?php echo esc_html($count); ?></span><?php
    $fragments['#cart-count'] = ob_get_clean();
    return $fragments;
});

/* Ukloni default WooCommerce wrappere (koristimo svoje u header/footer) */
remove_action('woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10);
remove_action('woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10);
remove_action('woocommerce_before_main_content', 'woocommerce_breadcrumb', 20);
/* Sklonimo default sidebar */
remove_action('woocommerce_sidebar', 'woocommerce_get_sidebar', 10);

/* Helper: vrati našu "type css" klasu i label po WooCommerce kategoriji */
function v15_type_from_product($product) {
    $cats = wp_get_post_terms($product->get_id(), 'product_cat', ['fields' => 'names']);
    $map = [
        'Crveno vino' => ['red-wine', 'Crveno vino'],
        'Belo vino'   => ['white-wine', 'Belo vino'],
        'Roze vino'   => ['rose-wine', 'Roze vino'],
        'Penušavo vino' => ['sparkling-wine', 'Penušavo'],
        'Specijalno'  => ['special-wine', 'Specijalno'],
        'Rakija'      => ['rakija', 'Rakija'],
        'Žestoko'     => ['spirits', 'Žestoko'],
        'Delikatesi'  => ['delicacy', 'Delikates'],
    ];
    foreach ($cats as $c) {
        if (isset($map[$c])) return ['css' => $map[$c][0], 'label' => $map[$c][1]];
    }
    return ['css' => 'red-wine', 'label' => $cats ? $cats[0] : ''];
}
