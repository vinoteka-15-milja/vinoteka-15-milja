# Meni (O nama / Kontakt / čišćenje) + brendiran age gate 18+ — Design

_Datum: 2026-06-23_

## Cilj

Završiti dva preostala „finishing touch" koraka iz PROJEKAT.md §0 za WooCommerce shop na
`staging.15milja.com` (tema `vinoteka15`):
1. **Meni** — kreirati stranice **O nama** i **Kontakt** (trenutno 404), postaviti editabilan
   WP primary meni (Početna/Vina/O nama/Kontakt), obrisati default **Sample Page** i **Hello world!**.
2. **Brendiran age gate 18+** — custom overlay u našem dizajnu (ne plugin), reuse statičkog sajta.

## Polazno stanje (provereno, 2026-06-23)

- Nav već prikazuje 4 stavke (Početna/Vina/O nama/Kontakt) preko **hardkodovanog fallback-a** u
  `header.php` (nema dodeljenog `primary` menija).
- **`/o-nama/` i `/kontakt/` → HTTP 404** (strane ne postoje; nav linkovi vode u prazno).
- **Sample Page → 200**, **Hello world! post → 301** (default WP sadržaj, treba obrisati).
- Age gate plugin je deaktiviran (PROJEKAT.md).
- **`app.css` već sadrži 27 `age-gate` CSS pravila** (kopija statičkog `style.css`) → dizajn je tu.
- Statički sajt ima kompletan age gate: `index.html` (overlay+modal markup), `js/main.js`
  (`initAgeGate`: `sessionStorage('ageVerified')`, lock scroll preko `body.age-locked`,
  Da→dismiss, Ne→„Pristup odbijen").
- Reuse sadržaj: static about tekst („…gde svaka boca priča svoju priču…"); kontakt podaci
  Žikice Jovanovića 9 Loznica, +381 63 367 514, vinoteka15milja@gmail.com.

## Odluke (potvrđene)

1. **Age gate: po sesiji** (`sessionStorage`, kao stari sajt), custom (reuse), ne plugin.
2. **Logo: NETAKNUT** u ovom krugu (zlatni grozd `logo.png` + tekst ostaje).
3. **Meni: editabilan WP primary meni** + kreiranje strana + brisanje default sadržaja.

## Komponente

### A. Meni i strane (idempotentne migracije u `inc/setup.php`)

Isti obrazac kao postojeće COD/shipping migracije (guard preko `get_option` flag-a, `admin_init`).

- **`v15_setup_pages()`** — ako stranica sa slugom ne postoji, kreiraj:
  - **„O nama"** (`o-nama`): brend tekst (2–3 pasusa, latinica) iz static about sekcije.
  - **„Kontakt"** (`kontakt`): adresa, telefon, email, radno vreme + **Google Maps embed** iframe
    (`https://maps.google.com/maps?q=Žikice+Jovanovića+9,+Loznica&output=embed`, bez API ključa).
  - Guard: `get_page_by_path()` provera; flag `v15_pages_setup`.
- **`v15_setup_nav_menu()`** — ako meni „Glavni meni" ne postoji:
  - `wp_create_nav_menu('Glavni meni')`; dodaj stavke (`wp_update_nav_menu_item`):
    Početna → `home_url('/')`, Vina → `wc_get_page_permalink('shop')`,
    O nama → page link (o-nama), Kontakt → page link (kontakt).
  - Dodeli na `primary` lokaciju preko `get_theme_mod('nav_menu_locations')` + `set_theme_mod`.
  - Guard: postojanje menija po imenu; flag `v15_nav_setup`.
  - `header.php` fallback ostaje (sigurnosna mreža ako lokacija ostane prazna).
- **`v15_cleanup_defaults()`** — `wp_trash_post()` za „Sample Page" (po slugu `sample-page`) i
  „Hello world!" post (po slugu `hello-world`), ako postoje. Flag `v15_defaults_cleaned`.

### B. Age gate 18+ (custom, reuse statičkog)

- **Markup** u `header.php` ODMAH posle `wp_body_open()` (pre `<header>`): `.age-gate-overlay#age-gate`
  > `.age-gate-modal` (logo `assets/logo.png`, brand „Vinoteka / 15 Milja", `h2` „Dobrodošli",
  tekst „Ovaj sajt sadrži informacije o alkoholnim pićima. Da li imate 18 ili više godina?",
  dugmad `#age-gate-yes` „Da, imam 18+" / `#age-gate-no` „Ne, nemam", napomena, i **skriveni**
  `#age-gate-denied` blok „Pristup odbijen — morate imati 18+ godina.").
- **CSS** — reuse `app.css` (27 pravila). Ako `body.age-locked { overflow:hidden }` ne postoji u
  `app.css`, dodati ga u `woo.css`.
- **JS** (IIFE u `theme.js`, vanilla): na DOM ready — ako `sessionStorage.ageVerified==='true'` sakrij;
  inače `body.classList.add('age-locked')`; „Da" → set sessionStorage, `.dismissed`, ukloni `age-locked`,
  sakrij posle animacije; „Ne" → naslov „Pristup odbijen", sakrij pitanje, prikaži `#age-gate-denied`.
- Prikazuje se na **svim front-end stranama**, jednom po sesiji. (Logovani admin takođe vidi —
  prihvatljivo, dismiss je po sesiji; eventualno isključivanje za `is_user_logged_in()` van obima.)

## Fajlovi

- **Izmena:** `wp-theme/vinoteka15/inc/setup.php` (+`v15_setup_pages`, `v15_setup_nav_menu`,
  `v15_cleanup_defaults`, dodate u `v15_run_setup_migrations`).
- **Izmena:** `wp-theme/vinoteka15/header.php` (+age gate markup posle `wp_body_open`).
- **Izmena:** `wp-theme/vinoteka15/assets/theme.js` (+age gate IIFE).
- **Izmena (uslovno):** `wp-theme/vinoteka15/assets/woo.css` (+`body.age-locked` ako fali u app.css).
- **Izmena:** `wp-theme/vinoteka15/functions.php` (bump verzije asseta).
- Deploy: FTP; okini migracije posetom wp-admin; purge keš.

## Rubni slučajevi i rizici

1. **Idempotentnost**: svaka migracija proverava postojanje (page po slugu, meni po imenu, default po slugu)
   + flag; ne duplira, ne gazi ručne izmene vlasnika.
2. **Front page**: „Početna" je već static front page (hero); meni stavka vodi na `home_url('/')`.
3. **Nav lokacija**: ako `set_theme_mod` ne uhvati lokaciju, fallback u `header.php` i dalje radi.
4. **Age gate + scroll-lock**: koristi sopstvenu `age-locked` klasu (CSS), nezavisno od `v15SyncScrollLock`
   (inline overflow za panele) — age gate je prvi/pre panela, bez sudara.
5. **Coming-soon/login**: verifikacija ulogovani; age gate se renderuje i ulogovanom (testabilno).
6. **Google Maps embed**: `output=embed` iframe bez API ključa; ako se ne učita, kontakt info je svejedno tekstualno prisutan.
7. **LiteSpeed keš**: age gate je client-side (sessionStorage) → ne varira keširану stranu; OK. Purge posle deploya.

## Testiranje (verifikacija)

- `/o-nama/` → 200, sadrži brend tekst; `/kontakt/` → 200, sadrži adresu/telefon/email + map iframe.
- `/sample-page/` → 404 (trashed); „Hello world!" → 404.
- Primary meni dodeljen: front-end nav prikazuje 4 stavke (sad iz WP menija, ne fallback-a).
- Age gate: markup `#age-gate` prisutan na početnoj i shopu; `theme.js` `node --check` prolazi;
  `sessionStorage` logika (klik je client-side — provera DOM-om + ručno u browseru).
- Bez-regresija: shop/filteri/korpa/checkout i dalje rade.

## Van obima

- Promena logoa (svesno ostavljeno).
- Isključivanje age gate-a za ulogovane korisnike.
- Footer meni kao WP meni (footer.php ima hardkodovane linkove — ostaje).
- Prevodi/lokalizacija WC strings (zaseban zadatak).
