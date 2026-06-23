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
