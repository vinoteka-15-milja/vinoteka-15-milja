<?php
/**
 * Vinoteka 15 — WP/WooCommerce email preko SMTP-a (office@15milja.com).
 *
 * Kredencijali se NE drže u temi (git). Definišu se u wp-config.php:
 *   define('V15_SMTP_HOST',   'dolf.dnsserve.rs');
 *   define('V15_SMTP_PORT',   465);
 *   define('V15_SMTP_SECURE', 'ssl');            // 'ssl' (465) ili 'tls' (587)
 *   define('V15_SMTP_USER',   'office@15milja.com');
 *   define('V15_SMTP_PASS',   'lozinka-sanduka');
 *
 * Ako V15_SMTP_PASS nije definisan → SMTP se NE aktivira (fallback na podrazumevani
 * mail preko lokalnog Exim-a). Pošiljalac (From) se svejedno postavlja na office@.
 */

if (!defined('ABSPATH')) exit;

/* Zlatni brend-akcenat u email-ima (naslov + zaglavlje tabele). */
add_filter('woocommerce_email_styles', function ($css) {
    return $css
        . " h1 { color: #b0894f !important; }"
        . " th.td { color: #b0894f !important; }"
        . " #template_header_image img { margin: 0 auto; }";
});

/* From adresa/ime za sav WP mail (WooCommerce ima i svoje, poklapamo ih u setup.php). */
add_filter('wp_mail_from', function ($email) {
    return defined('V15_SMTP_USER') ? V15_SMTP_USER : 'office@15milja.com';
});
add_filter('wp_mail_from_name', function ($name) {
    return 'Vinoteka 15 Milja';
});

/* SMTP transport (samo ako je lozinka definisana). */
add_action('phpmailer_init', function ($phpmailer) {
    if (!defined('V15_SMTP_PASS') || !V15_SMTP_PASS) return; // bez lozinke → default mail()

    $user = defined('V15_SMTP_USER') ? V15_SMTP_USER : 'office@15milja.com';

    $phpmailer->isSMTP();
    $phpmailer->Host       = defined('V15_SMTP_HOST') ? V15_SMTP_HOST : 'dolf.dnsserve.rs';
    $phpmailer->Port       = defined('V15_SMTP_PORT') ? (int) V15_SMTP_PORT : 465;
    $phpmailer->SMTPSecure = defined('V15_SMTP_SECURE') ? V15_SMTP_SECURE : 'ssl';
    $phpmailer->SMTPAuth   = true;
    $phpmailer->Username   = $user;
    $phpmailer->Password   = V15_SMTP_PASS;

    // Envelope sender (Return-Path) = autentikovana adresa → bolje SPF poravnanje
    $phpmailer->Sender = $user;
});
