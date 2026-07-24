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
    v15_setup_language();
    v15_setup_classic_pages();
    v15_setup_cod();
    v15_setup_local_pickup();
    v15_setup_pages();
    v15_setup_nav_menu();
    v15_cleanup_defaults();
}

/** Baza jezika = en_US. Srpski je LATINICA i ide preko gettext overlay-a (inc/i18n.php);
    WP-ov sr_RS je ćirilica pa ga NE koristimo (da admin/checkout ne budu ćirilica). */
function v15_setup_language() {
    if (get_option('v15_lang_base') === 'en') return;
    update_option('WPLANG', ''); // '' => en_US (podrazumevano)
    update_option('v15_lang_base', 'en');
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

/** Strane O nama i Kontakt (idempotentno). */
function v15_setup_pages() {
    if (get_option('v15_pages_setup') === 'done') return;

    if (!get_page_by_path('o-nama')) {
        wp_insert_post(array(
            'post_title'   => 'O nama',
            'post_name'    => 'o-nama',
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_content' =>
                "<p>Vinoteka 15 Milja je vaš vinski kutak u srcu Loznice — mesto gde svaka boca priča svoju priču. "
              . "Od najfinijih srpskih sorti do pažljivo odabranih svetskih etiketa, naša kolekcija je kreirana za prave ljubitelje vina.</p>\n"
              . "<p>Verujemo da dobro vino spaja ljude i čini svaki trenutak posebnim. Svratite, posavetujte se sa nama i pronađite svoju sledeću omiljenu flašu.</p>",
        ));
    }

    if (!get_page_by_path('kontakt')) {
        $content =
            "<p><strong>Adresa:</strong> Žikice Jovanovića 9, 15300 Loznica</p>\n"
          . "<p><strong>Telefon:</strong> <a href=\"tel:+38163367514\">+381 63 367 514</a></p>\n"
          . "<p><strong>Email:</strong> <a href=\"mailto:vinoteka15milja@gmail.com\">vinoteka15milja@gmail.com</a></p>\n"
          . "<p><strong>Radno vreme:</strong> Pon–Pet 09–20h · Sub 09–15h · Ned: zatvoreno</p>\n"
          . "[v15_map]";
        wp_insert_post(array(
            'post_title'   => 'Kontakt',
            'post_name'    => 'kontakt',
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_content' => $content,
        ));
    }

    update_option('v15_pages_setup', 'done');
}

/** Editabilan primary meni „Glavni meni" (idempotentno). Pozvati POSLE v15_setup_pages. */
function v15_setup_nav_menu() {
    if (get_option('v15_nav_setup') === 'done') return;
    $name = 'Glavni meni';
    if (!wp_get_nav_menu_object($name)) {
        $menu_id = wp_create_nav_menu($name);
        if (is_wp_error($menu_id)) return; // ne markiraj kao done — pokušaj ponovo sledeći put
        wp_update_nav_menu_item($menu_id, 0, array(
            'menu-item-title' => 'Početna', 'menu-item-url' => home_url('/'),
            'menu-item-type' => 'custom', 'menu-item-status' => 'publish',
        ));
        $shop = wc_get_page_permalink('shop');
        if (!$shop) $shop = home_url('/shop/');
        wp_update_nav_menu_item($menu_id, 0, array(
            'menu-item-title' => 'Vina', 'menu-item-url' => $shop,
            'menu-item-type' => 'custom', 'menu-item-status' => 'publish',
        ));
        $onama = get_page_by_path('o-nama');
        if ($onama) wp_update_nav_menu_item($menu_id, 0, array(
            'menu-item-title' => 'O nama', 'menu-item-type' => 'post_type',
            'menu-item-object' => 'page', 'menu-item-object-id' => $onama->ID, 'menu-item-status' => 'publish',
        ));
        $kontakt = get_page_by_path('kontakt');
        if ($kontakt) wp_update_nav_menu_item($menu_id, 0, array(
            'menu-item-title' => 'Kontakt', 'menu-item-type' => 'post_type',
            'menu-item-object' => 'page', 'menu-item-object-id' => $kontakt->ID, 'menu-item-status' => 'publish',
        ));
        $locations = get_theme_mod('nav_menu_locations');
        if (!is_array($locations)) $locations = array();
        $locations['primary'] = $menu_id;
        set_theme_mod('nav_menu_locations', $locations);
    }
    update_option('v15_nav_setup', 'done');
}

/** Obriši default WP sadržaj: Sample Page + Hello world! (idempotentno, u trash). */
function v15_cleanup_defaults() {
    if (get_option('v15_defaults_cleaned') === 'done') return;
    $sp = get_page_by_path('sample-page');
    if ($sp && $sp->post_status !== 'trash') wp_trash_post($sp->ID);
    $hw = get_posts(array('name' => 'hello-world', 'post_type' => 'post', 'post_status' => 'any', 'numberposts' => 1));
    if (!empty($hw)) wp_trash_post($hw[0]->ID);
    update_option('v15_defaults_cleaned', 'done');
}
