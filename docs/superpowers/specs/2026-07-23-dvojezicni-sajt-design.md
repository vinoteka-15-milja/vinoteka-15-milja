# Spec — Dvojezični sajt (SR default / EN)

_Datum: 2026-07-23 · Status: odobreno, u izradi_

## Cilj
Vinoteka 15 Milja dostupna na **srpskom (default)** i **engleskom**, sa prekidačem jezika za posetioca. Bez multilingual plugina — lagani custom sloj u bespoke temi.

## Obim (odabrano)
Prevodi se: **interfejs** (meni, dugmad, korpa, checkout, filteri, age-gate, footer, hero), **nazivi kategorija**, **labele atributa**, **vrednosti zemalja**, i **strane O nama/Kontakt**. Imena proizvoda, vinarija i regiona = vlastite imenice → ostaju.

## Pristup
- **WP jezik = srpski (sr_RS)** kao default → WordPress + WooCommerce sami prevedu svoje stringove na srpski (rešava trenutni en_US problem). Migracija u `inc/setup.php` postavlja `WPLANG=sr_RS` i instalira jezički paket (fallback: ručno u Settings→General).
- **Detekcija jezika** (`inc/i18n.php`): cookie `v15_lang` (`sr`/`en`) + `?lang=` param (postavi cookie, deljivi linkovi). Bez cookie-ja → `sr`.
- **`determine_locale` filter** → `sr_RS` (default) ili `en_US` (kad je EN). Time WC/WP prikažu engleski original u EN modu.
- **Stringovi teme** → helper `v15_t('Srpski')`; u EN vraća prevod iz PHP rečnika (`$V15_EN`), u SR original. Bez `.po/.mo`.
- **Kategorije** → `get_term` filter (product_cat) + direktno u našim render tačkama (pili/čipovi/kartice) preko rečnika.
- **Zemlje** → `v15_country()` mapa (~14): badge na kartici, filter „Zemlja", detalji.
- **Nav meni** (DB stavke) → `nav_menu_item_title` filter kroz `v15_t()`.
- **Strane O nama/Kontakt** → `the_content` filter vraća EN sadržaj iz rečnika kad je EN.
- **Payment/shipping titule** (Pouzećem, Lično preuzimanje) → filteri `woocommerce_gateway_title`/shipping kad je EN.
- **JS stringovi** (age-gate „Pristup odbijen", theme.js) → preko `data-*` atributa iz šablona (već prevedenih `v15_t`).

## Ključne odluke / posledice
- Ručni gettext filteri od ranije (SKU→Šifra, Category→Kategorija, add-to-cart tekst, breadcrumb Home) → **gejtovati na SR** (u EN se ne primenjuju; WC daje engleski). 
- Cookie-based (nema `/en/` URL) → jednostavno; SEO za EN slabiji (prihvatljivo za sada). Napomena: produkcijski LiteSpeed keš mora da varira po `v15_lang` cookie-ju (keš je sad OFF).

## Prekidač UI
`SR | EN` u header-actions (levo od pretrage); mobilni u meniju. Aktivni jezik zlatan. Klik → set cookie + reload.

## Fajlovi
- Novo: `inc/i18n.php` (detekcija, locale filter, `v15_t`, rečnik `$V15_EN`, `v15_country`, term/nav/content/gateway filteri, `v15_lang_switcher()`).
- Izmene: `functions.php` (require + switcher enqueue), `header.php`, `footer.php`, `front-page.php`, `index.php`, `inc/filters.php`, `inc/shop.php` (+gejt SR na stare gettext filtere), `inc/setup.php` (WPLANG migracija), `woocommerce/content-product.php`, `woocommerce/cart/mini-cart.php`, `woocommerce/loop/result-count.php`, `woocommerce/loop/pagination.php`, `assets/app.css` (stil prekidača), bump verzije.

## Verifikacija
Puppeteer sa/bez `v15_lang=en`: nav, dugmad, kategorije, labele atributa, badge zemlje, filteri, footer, age-gate, strane, prekidač (aktivno stanje), i WC (SR=srpski, EN=engleski). Default (bez cookie-ja) = srpski.
