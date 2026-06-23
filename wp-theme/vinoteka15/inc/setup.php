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
