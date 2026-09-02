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
    v15_setup_email_sender();
    v15_setup_email_design();
    v15_setup_classic_pages();
    v15_setup_cod();
    v15_setup_local_pickup();
    v15_setup_pages();
    v15_setup_legal_pages();
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

/** WooCommerce email pošiljalac + primalac porudžbina = office@15milja.com (idempotentno). */
function v15_setup_email_sender() {
    if (get_option('v15_email_sender') === 'done') return;
    $office = 'office@15milja.com';

    // „From" na svim WC mejlovima
    update_option('woocommerce_email_from_address', $office);
    update_option('woocommerce_email_from_name', 'Vinoteka 15 Milja');

    // Kopije porudžbina (admin obaveštenja) stižu na office@
    foreach (array('new_order', 'cancelled_order', 'failed_order') as $email_id) {
        $key = 'woocommerce_' . $email_id . '_settings';
        $s = get_option($key, array());
        if (!is_array($s)) $s = array();
        $s['recipient'] = $office;
        update_option($key, $s);
    }

    update_option('v15_email_sender', 'done');
}

/** Dizajn email-a (boje/logo/footer) + srpski naslovi/subjekti. Versionisano. */
function v15_setup_email_design() {
    $ver = 2;
    if ((int) get_option('v15_email_design_ver') >= $ver) return;

    // Datum: srpski numerički (bez engleskog naziva meseca) — npr. 2.9.2026.
    update_option('date_format', 'j.n.Y.');

    // Boje: tamni okvir/header (zlatni logo puca), bela sadržajna kartica, taman tekst
    update_option('woocommerce_email_background_color', '#1a1416');
    update_option('woocommerce_email_base_color', '#1a1416');
    update_option('woocommerce_email_body_background_color', '#ffffff');
    update_option('woocommerce_email_text_color', '#2a2125');
    update_option('woocommerce_email_header_image', get_stylesheet_directory_uri() . '/assets/email-logo.png');
    update_option('woocommerce_email_footer_text',
        'Vinoteka 15 Milja &middot; Žikice Jovanovića 9, Loznica &middot; +381 63 367 514');

    // Srpski naslovi/subjekti/dodatni tekst po tipu mejla (čuva postojeća polja: enabled/recipient)
    $set = function ($key, $fields) {
        $s = get_option($key, array());
        if (!is_array($s)) $s = array();
        update_option($key, array_merge($s, $fields));
    };
    $set('woocommerce_customer_processing_order_settings', array(
        'heading'            => 'Hvala na porudžbini',
        'subject'            => 'Vaša porudžbina #{order_number} je primljena',
        'additional_content' => 'Hvala još jednom! Za pomoć oko porudžbine kontaktirajte nas na office@15milja.com.',
    ));
    $set('woocommerce_customer_completed_order_settings', array(
        'heading'            => 'Vaša porudžbina je isporučena',
        'subject'            => 'Vaša porudžbina #{order_number} je završena',
        'additional_content' => 'Hvala na poverenju! Za sva pitanja tu smo na office@15milja.com.',
    ));
    $set('woocommerce_customer_on_hold_order_settings', array(
        'heading' => 'Porudžbina primljena',
        'subject' => 'Vaša porudžbina #{order_number} je na čekanju',
    ));
    $set('woocommerce_new_order_settings', array(
        'heading' => 'Nova porudžbina',
        'subject' => '[{site_title}]: Nova porudžbina #{order_number}',
    ));

    update_option('v15_email_design_ver', $ver);
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

/** Pravne stranice (Uslovi/Reklamacije/Privatnost/Plaćanje) — nacrti, idempotentno.
    NB: placeholderи [Naziv firme]/[PIB]/[Matični broj]/[PDV] popunjava vlasnik. */
function v15_setup_legal_pages() {
    $ver = 2; // bump kad se menja sadržaj pravnih strana → ažurira postojeće strane
    if ((int) get_option('v15_legal_pages_ver') >= $ver) return;

    $uslovi = <<<HTML
<p>Ovi uslovi korišćenja odnose se na internet prodavnicu Vinoteka 15 Milja (u daljem tekstu: „Prodavnica").</p>
<h3>Prodavac</h3>
<p>[Naziv firme], Žikice Jovanovića 9, 15300 Loznica<br>PIB: [PIB] · Matični broj: [Matični broj]<br>Kontakt: +381 63 367 514 · vinoteka15milja@gmail.com</p>
<h3>Poručivanje</h3>
<p>Porudžbina se kreira dodavanjem proizvoda u korpu i popunjavanjem podataka pri plaćanju. Ugovor o prodaji smatra se zaključenim kada Prodavac potvrdi porudžbinu.</p>
<h3>Cene</h3>
<p>Sve cene iskazane su u dinarima (RSD). [Napomena o PDV-u: u sistemu PDV-a / nije u sistemu PDV-a.] Cene važe u trenutku poručivanja.</p>
<h3>Načini plaćanja</h3>
<p>Plaćanje je moguće pouzećem (gotovinom pri preuzimanju ili dostavi) i platnim karticama putem bezbedne stranice banke. Detalji: <a href="/placanje/">Plaćanje i bezbednost</a>.</p>
<h3>Isporuka</h3>
<p>Isporuka se vrši na teritoriji Republike Srbije, kurirskom službom ili ličnim preuzimanjem u vinoteci. Roba se isporučuje u roku od tri (3) radna dana od potvrde porudžbine. Ako poručeni proizvod nije dostupan, blagovremeno ćemo vas obavestiti. Rok i troškovi isporuke prikazani su pri poručivanju.</p>
<h3>Saobraznost robe i garancija</h3>
<p>Prodavac odgovara za saobraznost robe ugovoru (zakonska garancija) u skladu sa Zakonom o zaštiti potrošača. Saobraznost i eventualna ugovorna garancija važe u rokovima određenim važećim propisima Republike Srbije.</p>
<h3>Odgovornost</h3>
<p>Trudimo se da opisi i fotografije proizvoda budu tačni, ali ne odgovaramo za eventualne nenamerne greške u opisu ili prikazu. Ako je greška bitna za odluku o kupovini, kupac ima pravo da odustane od porudžbine.</p>
<h3>Prodaja alkohola</h3>
<p>Prodaja alkoholnih pića licima mlađim od 18 godina je zabranjena. Poručivanjem potvrđujete da imate 18 ili više godina.</p>
<h3>Odustanak i reklamacije</h3>
<p>Pravo na odustanak od ugovora i postupak reklamacije opisani su na stranici <a href="/reklamacije/">Reklamacije i povraćaj</a>.</p>
<h3>Izmene uslova</h3>
<p>Prodavac zadržava pravo da izmeni ove uslove korišćenja. Izmene stupaju na snagu objavljivanjem na ovoj stranici.</p>
HTML;

    $reklamacije = <<<HTML
<p>U skladu sa Zakonom o zaštiti potrošača, potrošač ima pravo na reklamaciju i na odustanak od ugovora zaključenog na daljinu.</p>
<h3>Pravo na odustanak (14 dana)</h3>
<p>Potrošač ima pravo da u roku od 14 dana od dana prijema robe odustane od ugovora bez navođenja razloga. Izjavu o odustanku pošaljite na vinoteka15milja@gmail.com. Troškove vraćanja robe snosi potrošač, osim ako je isporučena pogrešna ili oštećena roba.</p>
<h3>Reklamacija</h3>
<p>Reklamaciju možete izjaviti na vinoteka15milja@gmail.com ili lično u vinoteci, uz račun ili dokaz o kupovini. Odgovor na reklamaciju dostavljamo u roku od 8 dana, a rešavamo je u zakonskom roku od 15 dana od dana prijema.</p>
<h3>Povraćaj sredstava</h3>
<p>U slučaju vraćanja robe i povraćaja sredstava kupcu koji je prethodno platio platnom karticom, povraćaj se vrši isključivo preko VISA/Mastercard/Maestro metoda plaćanja, na isti račun sa kog je plaćanje izvršeno, u skladu sa pravilima kartičarskih organizacija i banke.</p>
<h3>Izuzeci</h3>
<p>Otvorena alkoholna pića se, iz higijenskih i zakonskih razloga, ne mogu vratiti osim u slučaju nedostatka (npr. neispravan proizvod).</p>
HTML;

    $privatnost = <<<HTML
<p>Vinoteka 15 Milja poštuje privatnost korisnika i postupa u skladu sa Zakonom o zaštiti podataka o ličnosti.</p>
<h3>Koje podatke prikupljamo</h3>
<p>Prilikom poručivanja prikupljamo: ime i prezime, adresu za isporuku, broj telefona i email adresu. Podatke koristimo isključivo za obradu i isporuku porudžbine i komunikaciju u vezi sa njom.</p>
<h3>Podaci o plaćanju</h3>
<p>Prilikom plaćanja karticom, podatke o kartici unosite na bezbednoj stranici banke/procesora. Ti podaci se ne čuvaju na našem sajtu niti su nam dostupni.</p>
<h3>Ustupanje trećim licima</h3>
<p>Podatke delimo samo sa kurirskom službom (radi isporuke) i bankom/procesorom plaćanja (radi naplate). Ne prodajemo i ne ustupamo podatke u druge svrhe.</p>
<h3>Vaša prava</h3>
<p>Imate pravo na uvid, ispravku i brisanje svojih podataka. Zahtev pošaljite na vinoteka15milja@gmail.com.</p>
<h3>Kolačići</h3>
<p>Sajt koristi kolačiće neophodne za rad korpe i pamćenje izbora jezika.</p>
HTML;

    $placanje = <<<HTML
<h3>Načini plaćanja</h3>
<p>Plaćanje je moguće pouzećem i platnim karticama (VISA, Mastercard, Maestro, DinaCard) putem bezbedne stranice banke.</p>
<h3>Bezbednost plaćanja</h3>
<p>Sva plaćanja karticom obavljaju se na bezbednoj (3D Secure) stranici banke. Vinoteka 15 Milja nema pristup podacima o vašoj platnoj kartici. Prenos podataka zaštićen je SSL enkripcijom.</p>
<h3>Valuta plaćanja</h3>
<p>Sva plaćanja obavljaju se u dinarima (RSD).</p>
<h3>Izjava o konverziji valuta</h3>
<p>Sva plaćanja biće izvršena u dinarima (RSD). Ukoliko se plaća karticom izdatom u inostranstvu, iznos transakcije biće konvertovan u lokalnu valutu korisnika kartice prema kursu kartičarske organizacije, o čemu Prodavac ne raspolaže podacima. Kao rezultat konverzije, moguća je manja razlika u odnosu na originalnu cenu.</p>
HTML;

    $pages = array(
        'uslovi-koriscenja' => array('Uslovi korišćenja', $uslovi),
        'reklamacije'       => array('Reklamacije i povraćaj', $reklamacije),
        'privatnost'        => array('Politika privatnosti', $privatnost),
        'placanje'          => array('Plaćanje i bezbednost', $placanje),
    );
    foreach ($pages as $slug => $p) {
        $existing = get_page_by_path($slug);
        if ($existing) {
            // Osveži sadržaj (strane su auto-generisane; menjaju se ovde, ne u adminu)
            wp_update_post(array('ID' => $existing->ID, 'post_content' => $p[1]));
        } else {
            wp_insert_post(array(
                'post_title'   => $p[0],
                'post_name'    => $slug,
                'post_status'  => 'publish',
                'post_type'    => 'page',
                'post_content' => $p[1],
            ));
        }
    }
    update_option('v15_legal_pages_ver', $ver);
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
