# CLAUDE.md - Vinoteka 15 Milja

## Pregled projekta

Statički sajt + webshop (porudžbine pouzećem) za vinoteku "15 Milja" iz Loznice. Nema build sistema, nema npm zavisnosti - čist HTML/CSS/JS.

## Ključni fajlovi

- `index.html` - glavna stranica (hero, intro, featured, about, wines katalog, quote, footer) + cart panel i modal detalja proizvoda
- `checkout.html` - stranica porudžbine (sažetak korpe + forma, slanje preko Web3Forms)
- `contact.html` - kontakt stranica sa mapom
- `business-card.html` - standalone dizajn vizit karte
- `css/style.css` - jedini stylesheet, koristi CSS custom properties (`:root` varijable)
- `js/wines-data.js` - globalni `PRODUCTS` niz (~400 proizvoda), `COUNTRIES`, `TYPES`; na dnu generiše stabilan `id` (slug) po proizvodu + `PRODUCT_BY_ID` mapu i `escapeHTML()` helper
- `js/cart.js` - `window.Cart` API (localStorage ključ `vinoteka15m_cart_v1`, čuva samo `{id, qty}`; in-memory fallback; sync tabova kroz `storage` event)
- `js/main.js` - IIFE modul: age gate, rendering kartica, filteri (tip/zemlja/cena), pretraga, aktivni chip-ovi, mobilni filter drawer, modal proizvoda, UI korpe, navigacija, animacije
- `js/checkout.js` - validacija forme, sastavljanje porudžbine, POST na Web3Forms

## Arhitektura

- **Nema build koraka** - otvara se direktno u browseru (za testiranje: `python3 -m http.server`)
- **Nema zavisnosti** - vanilla JS, bez framework-a
- Redosled skripti je bitan: `wines-data.js` → `cart.js` → `main.js` (→ `checkout.js` na checkout strani)
- Proizvodi se identifikuju slugom (`id`), NE indeksom niza — indeks se menja brisanjem/komentarisanjem proizvoda
- Korpa čuva samo `{id, qty}` — cene/imena se uvek čitaju iz `PRODUCTS`
- Sva tekstualna polja proizvoda prolaze kroz `escapeHTML()` pre ubacivanja u HTML

## Dizajn (tamni premium "Podrum")

- Paleta u `:root`: pozadina `#171114` (`--clr-bg`), panel `#1e171a`, kartice `#2a2125`, zlato `#C9A96E`, svetli tekst `#f4ece1` (`--clr-cream` je boja TEKSTA, ne pozadine!)
- Hero: tipografski monolit — ogroman centriran Playfair naslov na radijalnom bordo gradijentu, bez fotografije
- Kartice: tamne, zlatni akcenti, `aspect-ratio 3/4` + `object-fit: contain` za boce
- Mobilni filteri (<768px): dugme "Filteri (N)" otvara bottom sheet (`#filters-panel`, jedan markup za desktop i mobilni)
- Tipografija: Playfair Display za naslove, Lato za body

## Konvencije

- Jezik sajta: **srpski** (latinica)
- Commit poruke: na srpskom
- Svaki proizvod u PRODUCTS nizu ima: `name`, `winery`, `price` (RSD), `type`, `country`, `region`, opciono `image` i `size` (`id` se generiše automatski)
- Tipovi proizvoda: `red`, `white`, `rose`, `sparkling`, `special`, `rakija`, `spirits`, `delicacy`
- Kodovi zemalja: ISO 2-slovna (`rs`, `hr`, `it`, `fr`, `es`, `ba`, `me`, `si`, `at`, `mk`, `cl`, `ar`, `nz`, `int`)

## Webshop / porudžbine

- Bez online plaćanja — **pouzećem** (preuzimanje u vinoteci ili dostava)
- Porudžbina stiže na email preko **Web3Forms**: ključ se unosi u `js/checkout.js` (`WEB3FORMS_ACCESS_KEY`) — registracija na web3forms.com sa emailom vinoteke
- Cena `0` = "Na upit": blokirano i u `Cart.add()` i u UI modala (nudi telefon umesto korpe)
- Korpa se čisti TEK posle potvrđenog uspešnog slanja (HTTP 200 + `success`)

## Trenutno stanje

- Age gate koristi `sessionStorage`
- Under construction overlay postoji zakomentarisan u `index.html`
- Slike proizvoda su u `images/wines/` (PNG, cut-out boce); neki proizvodi nemaju slike → gradijent placeholder po tipu
- `FEATURED_NAMES` u `main.js` je hardkodovana lista — imena moraju tačno da postoje u `PRODUCTS`
