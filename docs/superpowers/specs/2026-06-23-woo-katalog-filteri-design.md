# Katalog filteri za WooCommerce shop (bespoke tema vinoteka15) — Design

_Datum: 2026-06-23_

## Cilj

Dodati funkcionalan UI za filtriranje kataloga na shop stranicu `staging.15milja.com/shop/`,
u našem tamnom dizajnu, koristeći **native WooCommerce layered navigation**. Filteri:
**Vrsta, Zemlja, Region, Vinarija, Cena + pretraga.**

## Polazno stanje (provereno na živom stagingu, 2026-06-23)

Ranija sesija je **već prebacila atribute na globalne** (PROJEKAT.md §0 je po ovom pitanju zastareo):

- Globalne taksonomije postoje i popunjene su: `pa_vinarija` (132), `pa_region` (55), `pa_zemlja` (14), `pa_zapremina` (3).
- Proizvodi su **dodeljeni** globalnim terminima (provereno na edit strani proizvoda #17: Aleksandrović / Šumadija / Srbija / 0.75 L kao globalni select-ovi).
- **Native layered-nav filtriranje već radi** na nivou upita:
  - `?filter_zemlja=srbija` → 223 rezultata (od 404)
  - `?product_cat=crveno-vino` → 166 rezultata
- **Što NEDOSTAJE:** UI na shop strani. Sidebar je uklonjen u `functions.php`
  (`remove_action('woocommerce_sidebar', ...)`), pa posetilac nema klikabilan način da filtrira,
  iako `?filter_*=` radi ako se ukuca ručno.

→ Zaključak: rizična masovna konverzija 404 proizvoda **nije potrebna**. Zadatak je **čista
front-end/tema izrada**: iscrtati UI vezan za postojeće query-var-ove.

## Odluke (potvrđene sa vlasnikom)

1. **Obim filtera:** pun set — Vrsta + Zemlja + Region + Vinarija + Cena + pretraga.
2. **Mehanizam:** native WooCommerce layered nav, **server-render toggle linkovi**, reload na izmenu
   (Pristup A; AJAX svesno odložen za kasnije).
3. **Desktop raspored:** **traka iznad grida** (kao stari statički sajt), ne sidebar.

## Mapiranje filtera na query-var

| Filter | Query var | Izbor | Izvor termina |
|---|---|---|---|
| Vrsta | `product_cat=<slug>` | jedan | 8 `product_cat` kategorija |
| Zemlja | `filter_zemlja=slug1,slug2` (+ `query_type_zemlja=or`) | više (OR) | `pa_zemlja` |
| Region | `filter_region=…` (+ `query_type_region=or`) | više (OR) | `pa_region` |
| Vinarija | `filter_vinarija=…` (+ `query_type_vinarija=or`) | više (OR) | `pa_vinarija` |
| Cena | `min_price` / `max_price` | jedan (bucket) | — |
| Pretraga | `s=<tekst>` (+ `post_type=product`) | tekst | WC product search |

WooCommerce čita `filter_<slug>` kao **zarezom razdvojenu** listu slug-ova (npr. `filter_zemlja=srbija,hrvatska`),
NE kao `[]` niz. Zato se izbor gradi kao toggle linkovi, ne kao klasičan `<form>` sa checkbox-poljima.

## Raspored i komponente (desktop traka)

Redosled iznad grida (reuse postojećih `app.css` klasa gde postoje):

1. **`.catalog-controls`** — pretraga (`.wine-search` input, `name="s"`) + `.mobile-filter-toggle` dugme.
2. **Filter traka:**
   - **Vrsta** — `.wine-filters` pill red (`.filter-btn`), jedan aktivan; svaka pilula je toggle link
     na `product_cat` (Sve = link bez `product_cat`).
   - **Zemlja / Region / Vinarija** — tri **dropdown popovera** preko `<details>`/`<summary>`
     (open/close radi bez JS-a). Svaki sadrži: opciono „pretraži u listi" input + **scroll listu**
     toggle linkova (multi-select, OR). Trigger prikazuje broj izabranih, npr. „Zemlja (2) ▾".
   - **Cena** — `.price-toggle` pill red (`.price-btn`), jedan aktivan, mapiran na `min_price`/`max_price`:
     - do 1.500 → `max_price=1500`
     - 1.500–3.000 → `min_price=1500&max_price=3000`
     - 3.000+ → `min_price=3000`
     - (Sve → bez parametara)
3. **`.active-chips`** — izabrani filteri kao uklonjivi chipovi; svaki `×` je link koji skida taj
   termin/parametar. „Poništi sve" (`.chip-clear`) = link na `/shop/`.
4. **Rezultat-count** (`.woocommerce-result-count`) — „N rezultata".
5. **Grid proizvoda** (`woocommerce_product_loop`) + **paginacija** (`woocommerce_pagination`).

**Mobilni (<768px):** sav postojeći bottom-sheet (`.filters-panel` + `.filters-overlay`, već u `app.css`).
Drawer drži sve grupe (Vrsta pilule, tri liste kao razgranate sekcije, Cena pilule) + „Poništi sve" / „Prikaži rezultate".

## Mehanika: toggle linkovi (radi bez JS-a)

PHP helper `v15_filter_url($var, $value, $multi)`:
- čita trenutni `$_GET`,
- za `$multi` (atributi): doda/izbaci `$value` iz zarezom-razdvojene liste tog `filter_*` vara
  (+ postavi `query_type_<slug>=or`),
- za single (`product_cat`, cena): postavi ili obriše,
- uvek resetuje `paged` na 1,
- vrati apsolutni URL na shop (`add_query_arg`/`remove_query_arg` nad `wc_get_page_permalink('shop')`).

Izabrani linkovi dobijaju `.active`. Ovo je tačno ponašanje native layered nav-a.

`v15_render_filters()` iscrtava celu traku (i panel za mobilni — isti markup), čita termine preko
`get_terms(['taxonomy' => 'pa_…', 'hide_empty' => true])` i kategorije preko `product_cat`.

## JS (progressive enhancement, `assets/theme.js`)

Filtriranje i open/close rade i **bez** JS-a (`<details>` + linkovi). JS samo dodaje:
1. **mobilni drawer** — toggle `.filters-panel.open` + `.filters-overlay.open` (kao stari `main.js`),
2. **„pretraži u listi"** — sakriva nepodudarne `<a>` u Region/Vinarija dropdown-u (kozmetika),
3. **(opciono, stretch) batch-apply** u dropdown-u: akumuliraj izbor, jedno „Primeni (N)" navigacija
   umesto reload-a po kliku. Bez JS-a → klik = trenutni reload (i dalje funkcionalno).

## Fajlovi

- `wp-theme/vinoteka15/functions.php` — `v15_render_filters()`, `v15_filter_url()`,
  helper za chipove; (opciono) `pre_get_posts` za „Na upit" cenu.
- `wp-theme/vinoteka15/woocommerce/archive-product.php` — **NOV** template: controls → filter traka →
  chipovi → count → loop → paginacija.
- `wp-theme/vinoteka15/assets/theme.js` — drawer + list-search (+ opc. batch-apply).
- `wp-theme/vinoteka15/assets/woo.css` — **novo samo**: stil dropdown popovera (`<details>`),
  scroll-lista termina, „pretraži u listi" input. Sve ostalo (pilule, chipovi, drawer, search) je već u `app.css`.
- Deploy: FTP na `staging/wp-content/themes/vinoteka15/` (nalog `deploy@15milja.com`).

## Rubni slučajevi i rizici (rešiti u implementaciji, verifikacija obavezna)

1. **„Na upit" cena** (prazna/0 cena): native price filter ih NE hvata. Opcije: (a) izostaviti „Na upit"
   bucket u v1, ili (b) custom query var `filter_cena=upit` → `pre_get_posts` `meta_query` za prazan `_price`.
   **Odluka v1:** krenuti bez „Na upit" bucketa; dodati (b) ako vlasnik traži. (Označiti u planu.)
2. **Pretraga + filteri kombinovani:** WC layered nav se primenjuje na `is_post_type_archive('product')`
   i `is_tax`, ali na `is_search` (`?s=`) možda ne spaja `filter_*`. **Verifikovati;** fallback v1:
   pretraga je samostalna (čisti filtere) dok se ne potvrdi kombinovanje.
3. **Paginacija mora da čuva filtere:** `woocommerce_pagination()` koristi `add_query_arg` nad trenutnim
   upitom → trebalo bi da čuva `$_GET`. Verifikovati klikom na stranu 2 sa aktivnim filterom.
4. **`product_cat` kao query var na `/shop/`:** potvrđeno radi (`?product_cat=crveno-vino` → 166).
5. **Coming-soon režim:** staging je u WooCommerce „Coming soon" (gost vidi coming-soon). Testirati
   ulogovan ili privremeno isključiti za test; ne zaboraviti vratiti stanje.
6. **LiteSpeed keš:** OFF tokom razvoja; svejedno purge (Toolbox → Purge All) posle deploy-a teme.

## Testiranje (verifikacija = poređenje broja rezultata, ne screenshot)

Baseline shop = 404. Provere (ulogovan, preko `curl -b cookie` + grep „of N results"):
- Vrsta: `product_cat=crveno-vino` → 166. ✓ (već potvrđeno)
- Zemlja: `filter_zemlja=srbija` → 223. ✓ (već potvrđeno)
- Region/Vinarija: izbor jednog termina < 404 i konzistentno sa brojem termina.
- Kombinacija: `product_cat=crveno-vino&filter_zemlja=srbija` → presek (< 166 i < 223).
- Cena bucket: `min_price=1500&max_price=3000` → podskup.
- Chipovi: tačno odražavaju izbor; `×` skida; „Poništi sve" vraća na 404.
- Paginacija: strana 2 čuva aktivne filtere.
- Mobilni drawer: otvara/zatvara, izbor radi.
- „Pretraži u listi": filtrira vidljive vinarije.
- Bez-JS sanity: linkovi i `<details>` rade sa ugašenim JS-om.

## Van obima (kasnije)

- AJAX instant filtriranje (Pristup C druga runda).
- „Na upit" cena bucket (ako se traži).
- Sortiranje (već postoji native WC ordering; stil po potrebi).
- Stranica proizvoda / korpa / checkout stil (poseban zadatak iz PROJEKAT.md §0).
