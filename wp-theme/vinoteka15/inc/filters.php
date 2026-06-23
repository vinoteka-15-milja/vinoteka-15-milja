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
