<?php
/**
 * Vinoteka 15 — dvojezičnost (SR default / EN), lagani custom sloj bez plugina.
 *
 * - Jezik: cookie `v15_lang` (sr/en) + `?lang=` param. Bez izbora → sr.
 * - determine_locale → sr_RS (default) / en_US (WC/WP prevode sami).
 * - Tekst teme: v15_t('Srpski') → EN iz rečnika $V15_EN u EN modu, inače original.
 * - Kategorije/zemlje: mape (get_term filter + direktni pozivi u renderu).
 * - Nav meni (DB), strane O nama/Kontakt, COD/pickup titule: filteri.
 */

if (!defined('ABSPATH')) exit;

/* ---------------------------------------------------------------------------
 * Detekcija jezika
 * ------------------------------------------------------------------------- */
function v15_lang() {
    static $lang = null;
    if ($lang !== null) return $lang;
    if (isset($_GET['lang'])) {
        $lang = ($_GET['lang'] === 'en') ? 'en' : 'sr';
    } elseif (isset($_COOKIE['v15_lang'])) {
        $lang = ($_COOKIE['v15_lang'] === 'en') ? 'en' : 'sr';
    } else {
        $lang = 'sr';
    }
    return $lang;
}

function v15_is_en() { return v15_lang() === 'en'; }

/* ?lang= → zapamti u cookie (90 dana), da naredne strane pamte izbor. */
add_action('init', function () {
    if (isset($_GET['lang']) && !headers_sent()) {
        setcookie('v15_lang', v15_lang(), time() + 60 * 60 * 24 * 90, '/');
    }
});

/* Locale: baza je uvek engleski (en_US). Srpski je LATINICA i ide preko gettext
   overlay-a (WP-ov sr_RS je ćirilica → ne koristimo ga da ne mešamo pisma). */
add_filter('determine_locale', function ($locale) {
    if (is_admin()) return $locale;
    return 'en_US';
});

/* ---------------------------------------------------------------------------
 * Rečnik teme (SR izvor → EN). U SR modu se ne koristi (vraća se original).
 * ------------------------------------------------------------------------- */
$GLOBALS['V15_EN'] = array(
    // Navigacija / header / footer
    'Početna' => 'Home',
    'Vina' => 'Wines',
    'O nama' => 'About',
    'Kontakt' => 'Contact',
    'Navigacija' => 'Navigation',
    'Meni' => 'Menu',
    'Pretraži vina…' => 'Search wines…',
    'Pretraga' => 'Search',
    'Korpa' => 'Cart',
    'Zatvori korpu' => 'Close cart',
    'Vaš vinski kutak u srcu Loznice.' => 'Your wine corner in the heart of Loznica.',
    '15300 Loznica, Srbija' => '15300 Loznica, Serbia',
    'Vinoteka 15 Milja. Sva prava zadržana.' => 'Vinoteka 15 Milja. All rights reserved.',
    'Uživajte u vinu odgovorno. Zabranjena prodaja licima mlađim od 18 godina.' => 'Enjoy wine responsibly. Sale to persons under 18 is prohibited.',
    'Pravne informacije' => 'Legal',
    'Uslovi korišćenja' => 'Terms of Service',
    'Reklamacije' => 'Returns',
    'Politika privatnosti' => 'Privacy Policy',
    'Plaćanje i bezbednost' => 'Payment & Security',
    // Age gate
    'Dobrodošli' => 'Welcome',
    'Ovaj sajt sadrži informacije o alkoholnim pićima.' => 'This site contains information about alcoholic beverages.',
    'Da li imate 18 ili više godina?' => 'Are you 18 or older?',
    'Da, imam 18+' => "Yes, I'm 18+",
    'Ne, nemam' => "No, I'm not",
    'Ulaskom na sajt potvrđujete da imate zakonski dozvoljene godine za kupovinu alkohola.' => 'By entering the site, you confirm that you are of legal drinking age.',
    'Žao nam je — sajtu mogu pristupiti samo punoletne osobe (18+).' => 'Sorry — only adults (18+) may access this site.',
    'Pristup odbijen' => 'Access denied',
    // Hero / početna
    'Vinoteka · Loznica' => 'Wine shop · Loznica',
    'Vino bira' => 'Wine chooses',
    'strpljive.' => 'the patient.',
    'Više od 400 pažljivo odabranih etiketa iz Srbije i sveta.' => 'More than 400 carefully selected labels from Serbia and beyond.',
    'Pogledaj ponudu' => 'Browse wines',
    'Preporuka kuće' => 'House selection',
    'Istaknuta vina' => 'Featured wines',
    'Pogledaj celokupnu ponudu' => 'View the full selection',
    'Vino je poezija u boci.' => 'Wine is poetry in a bottle.',
    'Nema sadržaja' => 'No content',
    // Filteri
    'Filteri' => 'Filters',
    'Vrsta' => 'Type',
    'Poreklo' => 'Origin',
    'Cena' => 'Price',
    'Sve' => 'All',
    'Sve cene' => 'All prices',
    'do 1.500' => 'under 1,500',
    '1.500–3.000' => '1,500–3,000',
    '3.000+' => '3,000+',
    'Zemlja' => 'Country',
    'Vinarija' => 'Winery',
    'Pretraži…' => 'Search…',
    'Pretraži u listi' => 'Search in list',
    'Zatvori filtere' => 'Close filters',
    'Poništi sve' => 'Clear all',
    'Prikaži rezultate' => 'Show results',
    // Single / kartica
    'Na upit' => 'On request',
    'Pošalji upit' => 'Send inquiry',
    'Upit' => 'Inquiry',
    'Detalji' => 'Details',
    'Zapremina' => 'Volume',
    'Još iz kategorije' => 'More in this category',
    'U korpu' => 'Add to cart',
    // Kategorije (term nazivi + labele iz v15_type_from_product)
    'Crveno vino' => 'Red wine',
    'Belo vino' => 'White wine',
    'Roze vino' => 'Rosé wine',
    'Penušavo vino' => 'Sparkling wine',
    'Penušavo' => 'Sparkling',
    'Specijalno' => 'Special',
    'Žestoko' => 'Spirits',
    'Delikatesi' => 'Delicatessen',
    'Delikates' => 'Delicatessen',
    // Mini-korpa
    'Ukloni stavku' => 'Remove item',
    'Ukupno' => 'Total',
    'Na plaćanje' => 'Checkout',
    'Korpa je prazna.' => 'Your cart is empty.',
    // Paginacija
    'Prethodna' => 'Previous',
    'Sledeća' => 'Next',
    // Plaćanje / dostava
    'Pouzećem' => 'Cash on delivery',
    'Plaćanje gotovinom pri preuzimanju ili dostavi.' => 'Cash payment on pickup or delivery.',
    'Lično preuzimanje u vinoteci' => 'Local pickup at the shop',
);

/** Prevedi string teme: EN iz rečnika (fallback original), SR → original. */
function v15_t($sr) {
    if (!v15_is_en()) return $sr;
    return isset($GLOBALS['V15_EN'][$sr]) ? $GLOBALS['V15_EN'][$sr] : $sr;
}

/* ---------------------------------------------------------------------------
 * Zemlje (vrednosti pa_zemlja / badge). Vlastite imenice regiona/vinarija ostaju.
 * ------------------------------------------------------------------------- */
$GLOBALS['V15_COUNTRIES'] = array(
    'Srbija' => 'Serbia',
    'Hrvatska' => 'Croatia',
    'Italija' => 'Italy',
    'Francuska' => 'France',
    'Španija' => 'Spain',
    'Bosna i Hercegovina' => 'Bosnia and Herzegovina',
    'Hercegovina' => 'Herzegovina',
    'Crna Gora' => 'Montenegro',
    'Slovenija' => 'Slovenia',
    'Austrija' => 'Austria',
    'Makedonija' => 'North Macedonia',
    'Severna Makedonija' => 'North Macedonia',
    'Čile' => 'Chile',
    'Argentina' => 'Argentina',
    'Novi Zeland' => 'New Zealand',
    'Mađarska' => 'Hungary',
    'Nemačka' => 'Germany',
    'Grčka' => 'Greece',
    'Internacionalno' => 'International',
);

/** Prevedi naziv zemlje (SR → EN u EN modu; nepoznato ostaje). */
function v15_country($sr) {
    $sr = trim((string) $sr);
    if (!v15_is_en() || $sr === '') return $sr;
    return isset($GLOBALS['V15_COUNTRIES'][$sr]) ? $GLOBALS['V15_COUNTRIES'][$sr] : $sr;
}

/* ---------------------------------------------------------------------------
 * WooCommerce/WP stringovi → srpska LATINICA (samo u SR modu; baza je en_US).
 * Nije iscrpno — pokriva shop/proizvod/korpu/checkout osnovu; lako se dopunjava.
 * ------------------------------------------------------------------------- */
$GLOBALS['V15_WC_SR'] = array(
    // Meta proizvoda
    'SKU:' => 'Šifra:',
    'SKU' => 'Šifra',
    // Korpa
    'Cart' => 'Korpa',
    'View cart' => 'Prikaži korpu',
    'Product' => 'Proizvod',
    'Price' => 'Cena',
    'Quantity' => 'Količina',
    'Subtotal' => 'Međuzbir',
    'Total' => 'Ukupno',
    'Cart totals' => 'Zbir korpe',
    'Update cart' => 'Ažuriraj korpu',
    'Proceed to checkout' => 'Idi na plaćanje',
    'Remove this item' => 'Ukloni stavku',
    'Coupon:' => 'Kupon:',
    'Apply coupon' => 'Primeni kupon',
    'Your cart is currently empty.' => 'Vaša korpa je trenutno prazna.',
    'Return to shop' => 'Nazad u prodavnicu',
    'Free!' => 'Besplatno!',
    'Free' => 'Besplatno',
    // Checkout
    'Checkout' => 'Plaćanje',
    'Billing details' => 'Podaci za dostavu',
    'Your order' => 'Vaša porudžbina',
    'Place order' => 'Poručite',
    'Order notes' => 'Napomene uz porudžbinu',
    'Additional information' => 'Dodatne informacije',
    'First name' => 'Ime',
    'Last name' => 'Prezime',
    'Country / Region' => 'Zemlja / Region',
    'Street address' => 'Adresa',
    'Town / City' => 'Grad',
    'Postcode / ZIP' => 'Poštanski broj',
    'Phone' => 'Telefon',
    'Email address' => 'Email adresa',
    'Order number:' => 'Broj porudžbine:',
    'Payment method:' => 'Način plaćanja:',
    'Thank you. Your order has been received.' => 'Hvala! Vaša porudžbina je primljena.',
    // Sortiranje (shop)
    'Default sorting' => 'Podrazumevano',
    'Sort by popularity' => 'Po popularnosti',
    'Sort by latest' => 'Najnovije',
    'Sort by price: low to high' => 'Cena: rastuće',
    'Sort by price: high to low' => 'Cena: opadajuće',
);

/* SR overlay za WooCommerce (EN → srpska latinica). U EN modu: no-op. */
add_filter('gettext', function ($translated, $text, $domain) {
    if (v15_is_en() || $domain !== 'woocommerce') return $translated;
    return isset($GLOBALS['V15_WC_SR'][$text]) ? $GLOBALS['V15_WC_SR'][$text] : $translated;
}, 20, 3);
add_filter('ngettext', function ($translated, $single, $plural, $number, $domain) {
    if (v15_is_en() || $domain !== 'woocommerce') return $translated;
    if ($single === 'Category:') return ((int) $number > 1) ? 'Kategorije:' : 'Kategorija:';
    return $translated;
}, 20, 5);

/* ---------------------------------------------------------------------------
 * Filteri: nav meni, kategorije (get_term), strane, WC titule
 * ------------------------------------------------------------------------- */

/* Nav meni (DB stavke: Početna/Vina/O nama/Kontakt) */
add_filter('nav_menu_item_title', function ($title) {
    return v15_is_en() ? v15_t($title) : $title;
}, 10, 1);

/* Kategorije (product_cat) — hvata WC breadcrumb, meta, naslov arhive */
add_filter('get_term', function ($term) {
    if (!v15_is_en() || is_admin() || !is_object($term)) return $term;
    if (isset($term->taxonomy) && $term->taxonomy === 'product_cat' && isset($term->name)) {
        $term->name = v15_t($term->name);
    }
    return $term;
});

/* Strane O nama / Kontakt — EN sadržaj u EN modu */
add_filter('the_content', function ($content) {
    if (!v15_is_en() || is_admin()) return $content;
    if (is_page('o-nama')) {
        return "<p>Vinoteka 15 Milja is your wine corner in the heart of Loznica — a place where every bottle tells its story. "
             . "From the finest Serbian varietals to carefully selected labels from around the world, our collection is made for true wine lovers.</p>\n"
             . "<p>We believe good wine brings people together and makes every moment special. Drop by, ask for our advice, and find your next favourite bottle.</p>";
    }
    if (is_page('kontakt')) {
        return "<p><strong>Address:</strong> Žikice Jovanovića 9, 15300 Loznica</p>\n"
             . "<p><strong>Phone:</strong> <a href=\"tel:+38163367514\">+381 63 367 514</a></p>\n"
             . "<p><strong>Email:</strong> <a href=\"mailto:vinoteka15milja@gmail.com\">vinoteka15milja@gmail.com</a></p>\n"
             . "<p><strong>Opening hours:</strong> Mon–Fri 9am–8pm · Sat 9am–3pm · Sun: closed</p>\n"
             . do_shortcode('[v15_map]');
    }
    return $content;
});

/* Naslov strane (O nama/Kontakt) u EN */
add_filter('the_title', function ($title, $post_id = 0) {
    if (!v15_is_en() || is_admin()) return $title;
    if ($title === 'O nama') return 'About';
    if ($title === 'Kontakt') return 'Contact';
    return $title;
}, 10, 2);

/* COD gateway titula/opis u EN */
add_filter('woocommerce_gateway_title', function ($title, $id = '') {
    return (v15_is_en() && $id === 'cod') ? v15_t($title) : $title;
}, 10, 2);
add_filter('woocommerce_gateway_description', function ($desc, $id = '') {
    return (v15_is_en() && $id === 'cod') ? v15_t($desc) : $desc;
}, 10, 2);

/* Lično preuzimanje — labela na checkoutu u EN */
add_filter('woocommerce_cart_shipping_method_full_label', function ($label, $method) {
    if (v15_is_en() && strpos($label, 'Lično preuzimanje u vinoteci') !== false) {
        $label = str_replace('Lično preuzimanje u vinoteci', v15_t('Lično preuzimanje u vinoteci'), $label);
    }
    return $label;
}, 10, 2);

/* ---------------------------------------------------------------------------
 * Prekidač jezika (render u headeru)
 * ------------------------------------------------------------------------- */
function v15_lang_switcher() {
    $cur = v15_lang();
    echo '<div class="lang-switch" role="group" aria-label="Jezik / Language">'
       . '<a class="lang-opt' . ($cur === 'sr' ? ' active' : '') . '" href="' . esc_url(add_query_arg('lang', 'sr')) . '" hreflang="sr" rel="nofollow">SR</a>'
       . '<span class="lang-sep" aria-hidden="true">|</span>'
       . '<a class="lang-opt' . ($cur === 'en' ? ' active' : '') . '" href="' . esc_url(add_query_arg('lang', 'en')) . '" hreflang="en" rel="nofollow">EN</a>'
       . '</div>';
}
