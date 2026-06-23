# Stranica proizvoda + klasik korpa/checkout + mini-korpa + test porudžbine — Design

_Datum: 2026-06-23_

## Cilj

Dovršiti kupovinski tok WooCommerce shopa Vinoteke 15 Milja u našem tamnom dizajnu:
**stranica pojedinačnog proizvoda**, **korpa**, **checkout**, **slide-out mini-korpa**, i
**test porudžbina** end-to-end (pouzećem). Sve na `staging.15milja.com`, bespoke tema `vinoteka15`.

## Polazno stanje (provereno na živom stagingu, 2026-06-23)

- **Stranica proizvoda** (`/product/<slug>/`) renderuje se U NAŠOJ temi (site-header, `.wines-section`,
  site-footer), sa standardnim WC markupom: `product_title`, galerija, `price`, `quantity`,
  `single_add_to_cart_button`, `shop_attributes`, tabovi. Layout je **WC default** uz samo bazni dark CSS
  iz `woo.css` — treba pravi layout/stil + „Na upit" + „Još iz kategorije".
- **Korpa** (`/cart/`) i **checkout** (`/checkout/`) su **BLOKOVSKI** (`wp-block-woocommerce`, nema klasičnog
  `woocommerce-cart-form`). Naš `woo.css` cilja **klasičan** `.woocommerce` markup → na blokove se NE primenjuje.
- Postojeće: `woocommerce.php` wrapper (sve WC strane → `.wines-section .container`), `woocommerce/content-product.php`
  (naš `.wine-card`), header sa ikonicom korpe koja vodi na `/cart/`, AJAX add-to-cart sa `cart-count` fragmentom.

## Odluke (potvrđene sa vlasnikom)

1. **Obim:** sve u jednom spec-u (single + korpa + checkout + test).
2. **Korpa/checkout: KLASIK** — prebaciti strane sa blokova na `[woocommerce_cart]`/`[woocommerce_checkout]`.
3. **Single:** esencijalno + „Još iz kategorije" (related). Bez tabova (opisi nisu uvezeni). „Na upit" → kontakt CTA.
4. **Mini-korpa:** slide-out panel (kao stari statički sajt) + puna `/cart/` strana.
5. **Test porudžbina:** COD „Pouzećem" + Lično preuzimanje (besplatno). Bez spoljnih podataka.
   BACS (uplata na račun) i kurirska dostava po težini ostaju za Fazu 3.

## Komponente

### A. Stranica proizvoda
- Zadržati WC hook-strukturu single-proizvoda (galerija/summary/add-to-cart-forma rade), ali:
  - **Ukloniti tabove** (`woocommerce_output_product_data_tabs`).
  - Dodati **„Detalji"** spec-listu (Vinarija/Region/Zemlja/Zapremina) u summary (preko hook-a; čita `get_attribute`).
  - **„Na upit"** (`!is_purchasable()` ili cena==''): sakriti cenu/qty/add-to-cart, prikazati „Na upit" + dugme
    [Pošalji upit] (link na `/kontakt/`) — preko hook-a na summary.
  - **„Još iz kategorije"**: WC related products (`woocommerce_output_related_products`) — već koristi naš
    `content-product.php` (`.wine-card`). Osigurati da se prikazuje (related po kategoriji; ako WC ne nađe,
    fallback custom upit po istoj `product_cat`). Naslov sekcije „Još iz kategorije".
  - **Breadcrumb** (Početna / Vina / kategorija / naziv) — vratiti za single (globalno je uklonjen u `functions.php`).
  - Stil (`woo.css` `.single-product`): galerija na gradijentu, naslov Playfair, cena zlatno, naša količina + „U KORPU".

### B. Klasik korpa/checkout
- **Migracija strana** (idempotentno, `inc/setup.php`): ako `/cart/` sadrži blok → zameni sadržaj sa
  `[woocommerce_cart]`; `/checkout/` → `[woocommerce_checkout]`. Guard preko `update_option('v15_classic_pages','1')`
  (ili provera da sadržaj već nije shortcode). Koristi `wp_update_post`. Ne dira ako je već shortcode.
- **Stil** (`woo.css`): tamne `table.shop_table`, `.cart_totals`, `#payment`, polja forme, naša dugmad,
  „Ažuriraj korpu"/„Nastavi na plaćanje"/„Poruči" u zlatnom stilu.
- **Checkout polja** (`woocommerce_checkout_fields` filter): srpski, **telefon obavezan**, **uklonjeno `billing_company`**,
  zadržati ime/prezime/adresa/grad/poštanski broj/email. (Bez menjanja core lokalizacije.)
- Po potrebi override `cart/cart.php` / `checkout/form-checkout.php` za sitne raspored-tweakove (prvenstveno CSS).

### C. Mini-korpa (slide-out)
- **Markup** u `header.php`: panel `#mini-cart` (skriven) + overlay; sadržaj iz `woocommerce/cart/mini-cart.php`
  (override sa našim markupom: stavke — slika, naziv, qty, cena, × ukloni; subtotal; dugmad „Korpa"→`/cart/`,
  „Na plaćanje"→`/checkout/`). Prazno stanje: „Korpa je prazna".
- **Fragment** (`inc/shop.php`, `woocommerce_add_to_cart_fragments`): registrovati `#mini-cart-contents`
  (i postojeći `#cart-count`) da se osvežavaju posle add/remove bez reload-a.
- **Otvaranje:** ikonica korpe u headeru otvara panel (umesto navigacije na `/cart/`). Posle „U KORPU"
  (WC AJAX `added_to_cart`) panel se automatski otvori. Zatvaranje: × / overlay / Esc.
- **Uklanjanje stavke:** WC default mini-cart remove (AJAX preko `wc-cart-fragments`).
- JS u `theme.js` (delegirano, u skladu sa postojećim AJAX filterima).

### D. Commerce config (idempotentna migracija, `inc/setup.php`)
- **COD**: `update_option('woocommerce_cod_settings', ['enabled'=>'yes','title'=>'Pouzećem',
  'description'=>'Plaćanje gotovinom pri preuzimanju ili dostavi.', ...])`.
- **Dostava**: kreirati shipping zonu „Srbija" (region RS) sa metodom **Local pickup**
  („Lično preuzimanje", cena 0) preko `WC_Shipping_Zone` API-ja. Guard flagom da se ne duplira.
- Sve reproduktivno (ide u git) → lako se preslika staging→produkcija u Fazi 5.

### E. Test porudžbina
- Dodaj 2 proizvoda → korpa → checkout → Pouzećem → Lično preuzimanje → poruči.
- Provera: porudžbina u wp-admin → WooCommerce → Orders; „New order" email stigao (na email vinoteke / cPanel).
- Postavljanje porudžbine: verifikacija browser-automatizacijom na DOM nivou (bez screenshot-a zbog font-hang-a)
  ili ručno od strane vlasnika. (Označiti u planu kao verifikacioni korak, ne kod.)

## Fajlovi

- **Novo:** `wp-theme/vinoteka15/inc/shop.php` (single hookovi: ukloni tabove, Detalji, Na upit CTA, related naslov,
  breadcrumb; mini-cart fragment; checkout polja filter).
- **Novo:** `wp-theme/vinoteka15/inc/setup.php` (idempotentne migracije: shortcode strane, COD, zona+pickup).
- **Novo:** `wp-theme/vinoteka15/woocommerce/cart/mini-cart.php` (naš mini-cart markup).
- **Po potrebi:** `wp-theme/vinoteka15/woocommerce/single-product/*` ili `content-single-product.php` override
  (samo ako hookovi nisu dovoljni — preferirati hookove + CSS).
- **Izmena:** `header.php` (mini-cart panel + ikonica otvara panel), `functions.php` (require `inc/shop.php`,
  `inc/setup.php` + registracije), `assets/woo.css` (single + klasik korpa/checkout + mini-cart stilovi),
  `assets/theme.js` (mini-cart open/close + open-on-add).
- Deploy: FTP na `staging/wp-content/themes/vinoteka15/` (nalog `deploy@15milja.com`); bump verzija asseta.

## Rubni slučajevi i rizici

1. **„Na upit"** (cena 0 / `!is_purchasable()`): nigde nije kupljivo (WC to već poštuje); single prikazuje kontakt CTA;
   ne može u korpu/mini-korpu.
2. **Prazna korpa/mini-korpa**: stilizovano prazno stanje; checkout sa praznom korpom WC redirektuje na korpu (OK).
3. **Fragmenti**: `add_to_cart_fragments` mora da osveži i `#cart-count` i `#mini-cart-contents`.
4. **Migracija strana**: idempotentna; ne gazi ako su strane već shortcode; ne dira druge strane.
5. **Config migracija**: idempotentna (flag); vlasnik kasnije može ručno da menja (flag se ne resetuje).
6. **Klasik vs blok zavisnosti**: prebacivanjem na shortcode, blok-checkout funkcije (express slots) otpadaju —
   namerno (ne trebaju nam).
7. **WC ažuriranja**: override template-a (`mini-cart.php` itd.) — pratiti WC verziju template-a; minimalni override.
8. **Coming-soon / login**: test i provere rade ulogovani; LiteSpeed keš OFF (purge posle deploya).
9. **jQuery za `added_to_cart`**: WC učitava jQuery; mini-cart open-on-add sluša taj event (jedino mesto gde
   se oslanjamo na jQuery — ostalo je vanilla).

## Testiranje (verifikacija)

- **Single**: renderuje u našem stilu; „Detalji" lista tačna; „Još iz kategorije" pokazuje kartice;
  „Na upit" proizvod nema U KORPU nego kontakt CTA.
- **Mini-korpa**: „U KORPU" → broj se uveća + panel se otvori sa stavkom; × ukloni stavku (AJAX); dugmad vode na /cart/ i /checkout/.
- **Korpa `/cart/`**: klasična, stilizovana; promena količine i uklanjanje rade; ukupno tačno.
- **Checkout `/checkout/`**: klasičan, stilizovan, srpska polja, telefon obavezan, bez „Firma";
  dostupni „Pouzećem" + „Lično preuzimanje".
- **Test porudžbina**: COD + pickup → porudžbina kreirana (wp-admin Orders) + email.
- **Bez-regresija**: shop filteri i AJAX i dalje rade; početna/hero netaknuti.

## Van obima (Faza 3+/kasnije)

- BACS (uplata na račun) — treba broj računa firme.
- Kurirska dostava po težini (Flexible Shipping) — treba cenovnik kurira.
- Kartično plaćanje (Raiffeisen/Monri) — Faza 4.
- Opisi proizvoda / tabovi (nema uvezenog teksta).
- Recenzije proizvoda.
