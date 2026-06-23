# WooCommerce web-shop (Faze 1–3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Postaviti funkcionalan WooCommerce shop Vinoteke 15 Milja na `staging.15milja.com` sa našim dizajnom, uvezenih 404 proizvoda, i plaćanjem pouzećem + uplatom na račun (bez kartice — ona je Faza 4).

**Architecture:** WordPress + WooCommerce na cPanel-u (LiteSpeed + LSCache). Osnovna tema Blocksy + custom child-tema `vinoteka15` koja prenosi tamni premium izgled iz postojećeg `css/style.css`. Proizvodi se generišu skriptom iz `js/wines-data.js` u WooCommerce CSV i uvoze. Dostava po težini, pravne stranice, checkout.

**Tech Stack:** WordPress, WooCommerce, Blocksy tema, LiteSpeed Cache, Flexible Shipping, Node.js (skripta za CSV), PHP/CSS (child tema).

**Reference spec:** `docs/superpowers/specs/2026-06-23-woocommerce-webshop-design.md`

**Napomena o prirodi plana:** Veliki deo je konfiguracija kroz wp-admin (ne klasičan kod sa unit testovima). Za te zadatke "verifikacija" zamenjuje "run test" — tačno se navodi šta proveriti u browseru/wp-admin. Pravi kod (CSV konverter, child-tema) ima fajlove u repou.

---

## File Structure

Artefakti koje pravimo u ovom repou:

- `tools/woo-export.js` — Node skripta: `js/wines-data.js` → `woocommerce-products.csv` (WooCommerce import format). Testabilno.
- `tools/woo-export.test.js` — testovi za konverter.
- `wp-theme/vinoteka15/style.css` — child-tema header + globalni stilovi (paleta, tipografija).
- `wp-theme/vinoteka15/functions.php` — enqueue parent+child stilova, Google Fonts, age gate snippet, helper-i.
- `wp-theme/vinoteka15/assets/hero.css`, `assets/products.css` — stilovi hero-a i kartica/proizvoda.
- `wp-theme/vinoteka15/woocommerce/` — override-ovi WooCommerce template-a po potrebi.
- `docs/pravne-stranice/*.md` — nacrti pravnih stranica (sadržaj za unos u WP).

Konfiguracija (wp-admin, na staging serveru) nije u repou — dokumentovana je u zadacima.

---

## FAZA 1 — Temelji

### Task 1: Staging poddomen + provera hostinga

**Files:** nema (cPanel konfiguracija)

- [ ] **Step 1: Napravi staging poddomen**

cPanel → Domains → Create A New Domain:
- Domain: `staging.15milja.com`
- Document Root: `staging` (→ `/public_html/staging`)
- Share document root: nečekirano

Verifikacija: cPanel → Domains lista prikazuje `staging.15milja.com`.

- [ ] **Step 2: DNS A record za staging**

Namecheap → Advanced DNS → dodaj: `A Record`, Host `staging`, Value `88.198.1.66`.

Verifikacija (sa lokalne mašine):
```bash
dig +short staging.15milja.com A
```
Expected: `88.198.1.66`

- [ ] **Step 3: Zaključaj staging Basic Auth-om (isti mehanizam kao dev)**

Kopiraj postojeći `/home/miljacom/.htpasswd-dev` pristup: u `staging/.htaccess` dodaj (ili kroz cPanel Directory Privacy na `public_html/staging`):
```apache
AuthType Basic
AuthName "Staging — pristup ograničen"
AuthUserFile /home/miljacom/.htpasswd-dev
Require valid-user
```
Verifikacija:
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://staging.15milja.com/
```
Expected: `401` (bez kredencijala)

- [ ] **Step 4: Proveri limite paketa za WordPress**

cPanel → desni panel (Statistics): proveri PHP version, MySQL dostupan, **Inodes** (slobodno > 50.000), **Physical Memory / Entry Processes**. cPanel → MultiPHP Manager: postavi PHP **8.2** za `staging.15milja.com`.

Verifikacija: zapiši trenutne limite. Ako je inode limit < 50.000 ili RAM jako nizak → označi da je potrebna nadogradnja paketa (komunicirati sa ContraTeam). Ovo NE blokira dalje korake za sada.

---

### Task 2: Instalacija WordPress + WooCommerce na staging

**Files:** nema (WP Toolkit)

- [ ] **Step 1: Instaliraj WordPress**

cPanel → WP Toolkit (ili Softaculous) → Install WordPress:
- Domain: `https://staging.15milja.com`
- Directory: prazno (root staging-a)
- Site title: `Vinoteka 15 Milja`
- Admin user: NE `admin` (npr. `milja-admin`), jaka lozinka (sačuvati)
- Language: Srpski

Verifikacija: otvori `https://staging.15milja.com/wp-admin` (uz Basic Auth + WP login) → vidi se WP Dashboard.

- [ ] **Step 2: Osnovna WordPress podešavanja**

wp-admin → Settings → General: Site Language `Srpski`, Timezone `Beograd`. Settings → Permalinks: **Post name** (`/%postname%/`).

Verifikacija: Permalinks sačuvani; otvaranje proizvoljne stranice daje "lep" URL.

- [ ] **Step 3: Instaliraj WooCommerce**

wp-admin → Plugins → Add New → "WooCommerce" → Install → Activate. Kroz setup wizard:
- Adresa firme: Žikice Jovanovića 9, Loznica, Srbija
- Valuta: **RSD (din)**, format po srpskom standardu (1.234 din)
- Tip proizvoda: fizički
- Preskoči marketing/plaćanje korake za sada

Verifikacija: wp-admin → WooCommerce meni postoji; Settings → General → valuta = RSD.

---

### Task 3: Ključni plugin-ovi

**Files:** nema

- [ ] **Step 1: Instaliraj i aktiviraj plugin-ove**

wp-admin → Plugins → Add New, instaliraj:
- **Blocksy** (tema — Appearance → Themes → Add → Blocksy → Install)
- **LiteSpeed Cache**
- **Flexible Shipping** (WP Desk) — dostava po težini
- **Age Gate** (ili sličan 18+ plugin)
- Sigurnost: **Wordfence** (ili Solid Security)

Verifikacija: svi plugin-ovi "Active" na Plugins listi.

- [ ] **Step 2: LiteSpeed Cache osnovno**

wp-admin → LiteSpeed Cache → Cache: Enable. Preset: postavi standardno keširanje stranica.

Verifikacija: učitaj stranu, header `x-litespeed-cache: hit` posle drugog učitavanja:
```bash
curl -s -I -u 'milja:LOZINKA' https://staging.15milja.com/ | grep -i litespeed
```

---

### Task 4: Konverter podataka u WooCommerce CSV (TDD)

**Files:**
- Create: `tools/woo-export.js`
- Test: `tools/woo-export.test.js`

- [ ] **Step 1: Napiši test koji ne prolazi**

`tools/woo-export.test.js`:
```javascript
const assert = require('assert');
const { productToRow, CATEGORY_LABELS } = require('./woo-export.js');

// Proizvod sa cenom i slikom
const p1 = { name: 'Aleksandrović Harizma', winery: 'Aleksandrović', price: 1770,
  type: 'red', country: 'rs', region: 'Šumadija',
  image: 'images/wines/aleksandrović-harizma.png', id: 'aleksandrovic-harizma-aleksandrovic' };
const r1 = productToRow(p1, { COUNTRIES: { rs: { name: 'Srbija' } } });
assert.strictEqual(r1['Name'], 'Aleksandrović Harizma');
assert.strictEqual(r1['Regular price'], '1770');
assert.strictEqual(r1['Categories'], 'Crveno vino');
assert.strictEqual(r1['SKU'], 'aleksandrovic-harizma-aleksandrovic');
assert.strictEqual(r1['Weight (kg)'], '1.3');
assert.strictEqual(r1['Attribute 1 name'], 'Vinarija');
assert.strictEqual(r1['Attribute 1 value(s)'], 'Aleksandrović');
assert.strictEqual(r1['Attribute 3 value(s)'], 'Srbija'); // Zemlja
// slika URL-enkodovana, apsolutni URL sa produkcije (statika je javna)
assert.ok(r1['Images'].startsWith('https://15milja.com/images/wines/'));
assert.ok(r1['Images'].includes('%C4%87')); // ć enkodovano

// "Na upit" proizvod (price 0) → bez cene, nije za kupovinu
const p2 = { name: 'Test Na Upit', winery: 'X', price: 0, type: 'red', country: 'rs', region: 'Srbija', id: 'test-na-upit-x' };
const r2 = productToRow(p2, { COUNTRIES: { rs: { name: 'Srbija' } } });
assert.strictEqual(r2['Regular price'], '');
assert.strictEqual(r2['Sold individually'], '1');
assert.strictEqual(r2['Catalog visibility'], 'visible');

console.log('SVE OK');
```

- [ ] **Step 2: Pokreni test — mora da padne**

Run: `node tools/woo-export.test.js`
Expected: FAIL (`Cannot find module './woo-export.js'`)

- [ ] **Step 3: Napiši konverter**

`tools/woo-export.js`:
```javascript
const fs = require('fs');
const path = require('path');

const CATEGORY_LABELS = {
  red: 'Crveno vino', white: 'Belo vino', rose: 'Roze vino',
  sparkling: 'Penušavo vino', special: 'Specijalno', rakija: 'Rakija',
  spirits: 'Žestoko', delicacy: 'Delikatesi'
};

// Težina po zapremini (kg); default 0.75L flaša ≈ 1.3kg
function weightFor(size) {
  if (!size) return '1.3';
  var s = String(size).toLowerCase();
  if (s.includes('0.187') || s.includes('0.2')) return '0.5';
  if (s.includes('3l') || s.includes('3 l')) return '4.5';
  if (s.includes('4.5')) return '6.5';
  if (s.includes('1l') || s.includes('1 l') || s.includes('2l')) return '1.6';
  return '1.3';
}

function productToRow(p, ctx) {
  var COUNTRIES = ctx.COUNTRIES || {};
  var country = (COUNTRIES[p.country] && COUNTRIES[p.country].name) || p.country || '';
  var hasPrice = p.price && p.price > 0;
  var imgUrl = '';
  if (p.image) {
    // statika je javno dostupna na produkciji; URL-enkoduj naziv fajla
    var rel = p.image.replace(/^images\//, '');
    imgUrl = 'https://15milja.com/images/' + rel.split('/').map(encodeURIComponent).join('/');
  }
  return {
    'Type': 'simple',
    'SKU': p.id,
    'Name': p.name,
    'Published': '1',
    'Is featured?': '0',
    'Catalog visibility': 'visible',
    'In stock?': '1',
    'Regular price': hasPrice ? String(p.price) : '',
    'Sold individually': hasPrice ? '0' : '1',
    'Weight (kg)': weightFor(p.size),
    'Categories': CATEGORY_LABELS[p.type] || p.type,
    'Images': imgUrl,
    'Attribute 1 name': 'Vinarija', 'Attribute 1 value(s)': p.winery || '',
    'Attribute 1 visible': '1', 'Attribute 1 global': '1',
    'Attribute 2 name': 'Region', 'Attribute 2 value(s)': p.region || '',
    'Attribute 2 visible': '1', 'Attribute 2 global': '1',
    'Attribute 3 name': 'Zemlja', 'Attribute 3 value(s)': country,
    'Attribute 3 visible': '1', 'Attribute 3 global': '1',
    'Attribute 4 name': 'Zapremina', 'Attribute 4 value(s)': p.size || '0.75 L',
    'Attribute 4 visible': '1', 'Attribute 4 global': '1'
  };
}

function toCSV(rows) {
  var cols = Object.keys(rows[0]);
  var esc = function (v) {
    v = v == null ? '' : String(v);
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  };
  var out = [cols.join(',')];
  rows.forEach(function (r) { out.push(cols.map(function (c) { return esc(r[c]); }).join(',')); });
  return out.join('\n');
}

function main() {
  var src = fs.readFileSync(path.join(__dirname, '..', 'js', 'wines-data.js'), 'utf8');
  var sandbox = {};
  // eval u izolovanom kontekstu
  (new Function('PRODUCTS', 'COUNTRIES', 'TYPES', src + '\n;this.PRODUCTS=PRODUCTS;this.COUNTRIES=COUNTRIES;')).call(sandbox);
  var rows = sandbox.PRODUCTS.map(function (p) { return productToRow(p, { COUNTRIES: sandbox.COUNTRIES }); });
  fs.writeFileSync(path.join(__dirname, '..', 'woocommerce-products.csv'), toCSV(rows));
  console.log('Upisano ' + rows.length + ' proizvoda u woocommerce-products.csv');
}

module.exports = { productToRow, toCSV, weightFor, CATEGORY_LABELS };
if (require.main === module) main();
```

- [ ] **Step 4: Pokreni test — mora da prođe**

Run: `node tools/woo-export.test.js`
Expected: `SVE OK`

- [ ] **Step 5: Generiši CSV i proveri**

Run: `node tools/woo-export.js`
Expected: `Upisano 404 proizvoda u woocommerce-products.csv`
Provera: `head -2 woocommerce-products.csv` — header + prvi red ispravni; `wc -l` = 405 (header + 404).

- [ ] **Step 6: Commit**

```bash
git add tools/woo-export.js tools/woo-export.test.js woocommerce-products.csv
git commit -m "WooCommerce CSV konverter za 404 proizvoda"
```

---

### Task 5: Uvoz proizvoda u WooCommerce

**Files:** nema (wp-admin)

- [ ] **Step 1: Uvoz CSV-a**

wp-admin → Products → Import → Choose File: `woocommerce-products.csv` → Continue → automatsko mapiranje kolona (WooCommerce prepoznaje standardne nazive) → Run the importer.

Verifikacija: poruka "Import complete" sa ~404 proizvoda. (Uvoz slika po URL-u traje — sačekaj da završi.)

- [ ] **Step 2: Proveri uvoz**

wp-admin → Products: broj proizvoda = 404. Otvori 3 nasumična → cena, kategorija, atributi (Vinarija/Region/Zemlja/Zapremina), glavna slika prisutni.

Verifikacija: "Na upit" proizvodi (npr. Château du Pape) nemaju cenu i nemaju "Add to cart". Proizvodi sa cenom imaju dugme.

- [ ] **Step 3: Proveri kategorije i atribute**

wp-admin → Products → Categories: 8 kategorija. Products → Attributes: Vinarija, Region, Zemlja, Zapremina sa terminima.

Verifikacija: svaka kategorija ima proizvode; atributi popunjeni.

---

### Task 6: Filteri kataloga (layered navigation)

**Files:** nema (wp-admin / Blocksy)

- [ ] **Step 1: Uključi filtere na shop arhivi**

Blocksy → Customizer → WooCommerce → Product Archive: uključi sidebar; dodaj "Filter by Attribute" widget/blok za **Zemlja, Region, Vinarija, Zapremina** + "Filter by Price" + kategorije.
(Alternativa: plugin "Blocksy Companion" filteri ili WooCommerce blokovi "Filter Products by Attribute".)

Verifikacija: na `staging.15milja.com/shop/` (Basic Auth) filteri rade — biranje Zemlja=Srbija + kategorija=Crveno vino smanjuje listu; cenovni filter radi.

- [ ] **Step 2: Commit dokumentacije konfiguracije**

Zabeleži primenjena podešavanja u `docs/woo-konfiguracija.md` (koji filteri, gde).
```bash
git add docs/woo-konfiguracija.md && git commit -m "Dokumentovana konfiguracija filtera"
```

---

## FAZA 2 — Dizajn (child-tema vinoteka15)

### Task 7: Skelet child-teme

**Files:**
- Create: `wp-theme/vinoteka15/style.css`
- Create: `wp-theme/vinoteka15/functions.php`

- [ ] **Step 1: style.css sa Theme header-om**

`wp-theme/vinoteka15/style.css`:
```css
/*
Theme Name: Vinoteka 15 Milja
Template: blocksy
Version: 1.0
Text Domain: vinoteka15
*/

:root {
  --clr-bg: #171114;
  --clr-panel: #1e171a;
  --clr-card: #2a2125;
  --clr-gold: #C9A96E;
  --clr-cream: #f4ece1;
  --clr-text-light: #b8aca0;
  --ff-heading: 'Playfair Display', Georgia, serif;
  --ff-body: 'Lato', 'Helvetica Neue', Arial, sans-serif;
}

body { background: var(--clr-bg); color: var(--clr-cream); font-family: var(--ff-body); }
h1,h2,h3,.site-title { font-family: var(--ff-heading); }
a { color: var(--clr-gold); }
```

- [ ] **Step 2: functions.php — enqueue + fontovi**

`wp-theme/vinoteka15/functions.php`:
```php
<?php
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('blocksy-parent', get_template_directory_uri() . '/style.css');
    wp_enqueue_style('vinoteka15', get_stylesheet_directory_uri() . '/style.css', ['blocksy-parent'], '1.0');
    wp_enqueue_style('v15-hero', get_stylesheet_directory_uri() . '/assets/hero.css', ['vinoteka15'], '1.0');
    wp_enqueue_style('v15-products', get_stylesheet_directory_uri() . '/assets/products.css', ['vinoteka15'], '1.0');
    wp_enqueue_style('v15-fonts', 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap', [], null);
}, 20);
```

- [ ] **Step 3: Postavi temu na staging i aktiviraj**

Spakuj `wp-theme/vinoteka15/` u zip → wp-admin → Appearance → Themes → Add New → Upload Theme → instaliraj kao child od Blocksy → Activate. (Ili kasnije: deploy preko FTP/GitHub Action u `wp-content/themes/vinoteka15`.)

Verifikacija: `staging.15milja.com` pozadina tamna (`#171114`), naslovi u Playfair fontu.

- [ ] **Step 4: Commit**

```bash
git add wp-theme/vinoteka15/
git commit -m "Child-tema vinoteka15: skelet + dizajn tokeni"
```

---

### Task 8: Hero na početnoj

**Files:**
- Create: `wp-theme/vinoteka15/assets/hero.css`

- [ ] **Step 1: hero.css (tipografski monolit)**

`wp-theme/vinoteka15/assets/hero.css`:
```css
.v15-hero {
  min-height: 80vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  background: radial-gradient(ellipse at 50% 0%, #3a1d22 0%, var(--clr-bg) 70%);
  padding: 0 24px;
}
.v15-hero .eyebrow { font-size: 12px; letter-spacing: 6px; text-transform: uppercase; color: var(--clr-gold); margin-bottom: 28px; }
.v15-hero h1 { font-size: clamp(3rem, 9vw, 6.5rem); line-height: 1.06; color: var(--clr-cream); margin: 0 0 28px; }
.v15-hero h1 em { color: var(--clr-gold); font-style: italic; }
.v15-hero .btn { display: inline-block; padding: 14px 36px; border: 1px solid var(--clr-gold); color: var(--clr-gold); text-transform: uppercase; letter-spacing: .18em; font-size: 12px; }
```

- [ ] **Step 2: Dodaj hero na početnu stranu**

wp-admin → Pages → Home (postavi kao Static front page u Settings → Reading). Ubaci Custom HTML blok:
```html
<section class="v15-hero">
  <p class="eyebrow">Vinoteka · Loznica</p>
  <h1>Vino bira<br><em>strpljive.</em></h1>
  <a class="btn" href="/shop/">Pogledaj ponudu</a>
</section>
```

Verifikacija: početna prikazuje tipografski hero kao na statičkom sajtu (krupan Playfair naslov, zlatni CTA, tamni gradijent).

- [ ] **Step 3: Commit**

```bash
git add wp-theme/vinoteka15/assets/hero.css
git commit -m "Hero sekcija (tipografski monolit)"
```

---

### Task 9: Stil kartica i shop arhive

**Files:**
- Create: `wp-theme/vinoteka15/assets/products.css`

- [ ] **Step 1: products.css**

`wp-theme/vinoteka15/assets/products.css`:
```css
/* Shop arhiva — tamne kartice */
.woocommerce ul.products li.product {
  background: var(--clr-card); border: 1px solid rgba(201,169,110,.1);
  border-radius: 12px; overflow: hidden; transition: transform .25s, box-shadow .25s;
}
.woocommerce ul.products li.product:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0,0,0,.45); }
.woocommerce ul.products li.product img {
  aspect-ratio: 3/4; object-fit: contain; background: linear-gradient(180deg,#332930,#2b1d21); padding: 14px;
}
.woocommerce ul.products li.product .woocommerce-loop-product__title { font-family: var(--ff-heading); color: var(--clr-cream); font-size: 1.1rem; padding: 0 16px; }
.woocommerce ul.products li.product .price { color: var(--clr-cream); padding: 0 16px 8px; display:block; }
.woocommerce ul.products li.product .button { background: var(--clr-gold); color: #171114; border-radius: 0; }
```

- [ ] **Step 2: Verifikacija na shop arhivi**

Otvori `staging.15milja.com/shop/`: kartice tamne, slike `contain` na gradijentu, hover podiže karticu, dugme zlatno.

- [ ] **Step 3: Commit**

```bash
git add wp-theme/vinoteka15/assets/products.css
git commit -m "Stil kartica proizvoda i shop arhive"
```

---

### Task 10: Stranica proizvoda + Customizer fino doterivanje

**Files:** nema (CSS dopune u products.css po potrebi)

- [ ] **Step 1: Blocksy Customizer**

Blocksy → Customizer: General → Colors (paleta na našu), Typography (Playfair za naslove, Lato za telo), Header (logo `logo2.png`, tamna pozadina), Footer (tamna, kontakt). WooCommerce → Single Product: layout (galerija levo, info desno).

- [ ] **Step 2: Verifikacija stranice proizvoda**

Otvori jedan proizvod sa slikom: velika slika, naziv (Playfair), cena, atributi (Vinarija/Region/Zemlja/Zapremina) prikazani, "Dodaj u korpu". "Na upit" proizvod: bez cene/dugmeta, umesto toga kontakt napomena (dodati kratak tekst preko Customizer-a ili template-a).

- [ ] **Step 3: Commit doterivanja**

```bash
git add wp-theme/vinoteka15/
git commit -m "Doterana stranica proizvoda i Customizer"
```

---

### Task 11: Age gate 18+

**Files:** nema (plugin) ili `functions.php` snippet

- [ ] **Step 1: Konfiguriši Age Gate plugin**

wp-admin → Age Gate plugin podešavanja: tekst "Da li imate 18+ godina?", dugmad Da/Ne, brendirano (logo, tamna paleta), zapamti izbor po sesiji, primeni na ceo sajt.

Verifikacija: u incognito-u, prva poseta `staging.15milja.com` prikazuje 18+ prozor; "Da" pušta dalje; "Ne" blokira.

---

## FAZA 3 — Trgovina bez kartice

### Task 12: Plaćanje — pouzeće + uplata na račun

**Files:** nema (wp-admin)

- [ ] **Step 1: Pouzeće (COD)**

wp-admin → WooCommerce → Settings → Payments → **Cash on delivery**: Enable. Naziv "Pouzećem", opis "Plaćanje gotovinom pri preuzimanju ili dostavi."

- [ ] **Step 2: Uplata na račun (BACS)**

WooCommerce → Settings → Payments → **Direct bank transfer**: Enable. Naziv "Uplata na račun". Unesi podatke računa firme (naziv banke, broj računa, primalac: Vinoteka 15 Milja DOO). Opis: instrukcije za uplatu.

Verifikacija: na checkout-u (sa artiklom u korpi) vidljiva oba načina; izbor radi.

---

### Task 13: Dostava po težini + lično preuzimanje

**Files:** nema (wp-admin / Flexible Shipping)

- [ ] **Step 1: Shipping zona Srbija**

WooCommerce → Settings → Shipping → Add zone "Srbija" (region: Serbia).

- [ ] **Step 2: Flexible Shipping po težini**

U zoni Srbija → Add method → Flexible Shipping. Pravila po ukupnoj težini korpe, npr.:
- 0–2 kg → 390 din
- 2–5 kg → 590 din
- 5–10 kg → 790 din
- 10+ kg → 990 din
(vrednosti potvrditi sa cenovnikom kurira)

- [ ] **Step 3: Lično preuzimanje**

U zoni Srbija → Add method → **Local pickup**, cena 0, naziv "Lično preuzimanje u vinoteci".

Verifikacija: dodaj 1 flašu (1.3 kg) u korpu → dostava 390 din; dodaj 8 flaša (~10.4 kg) → 990 din; lično preuzimanje 0 din.

---

### Task 14: Pravne stranice

**Files:**
- Create: `docs/pravne-stranice/uslovi-koriscenja.md`
- Create: `docs/pravne-stranice/politika-privatnosti.md`
- Create: `docs/pravne-stranice/reklamacije-povracaj.md`
- Create: `docs/pravne-stranice/uslovi-dostave.md`
- Create: `docs/pravne-stranice/impressum.md`

- [ ] **Step 1: Napiši nacrte pravnih stranica (srpski)**

Svaki fajl sadrži pun nacrt teksta prilagođen vinoteci (DOO, prodaja alkohola 18+, pouzeće/uplata/kartica, dostava kurirom, povraćaj po Zakonu o zaštiti potrošača 14 dana, podaci firme: PIB, MB, adresa, kontakt). Impressum sadrži: *Vinoteka 15 Milja DOO, Žikice Jovanovića 9, 15300 Loznica, PIB: [unosi vlasnik], MB: [unosi vlasnik], tel +381 63 367 514, email*.

Verifikacija: 5 fajlova postoje, bez praznih `[...]` osim PIB/MB koje vlasnik popunjava.

- [ ] **Step 2: Unesi stranice u WordPress**

wp-admin → Pages → Add New za svaku (naslov + sadržaj iz nacrta). Dodaj ih u footer meni.

- [ ] **Step 3: Poveži WooCommerce pravne stranice**

WooCommerce → Settings → Advanced → Page setup: Terms and conditions → "Uslovi korišćenja". Settings → Accounts & Privacy: privacy policy stranica.

Verifikacija: footer prikazuje sve pravne stranice; checkout ima checkbox "Pročitao/la sam i prihvatam uslove".

- [ ] **Step 4: Commit**

```bash
git add docs/pravne-stranice/
git commit -m "Nacrti pravnih stranica"
```

---

### Task 15: Checkout + email porudžbine

**Files:** nema (wp-admin)

- [ ] **Step 1: Checkout polja i terms**

WooCommerce → Settings → Advanced: terms checkbox uključen (Task 14). Proveri obavezna polja (ime, adresa, telefon, email).

- [ ] **Step 2: Email porudžbine**

WooCommerce → Settings → Emails: "New order" ide na email vinoteke (`vinoteka15milja@gmail.com` ili cPanel email). Brendiraj zaglavlje (logo, boja).

Verifikacija: test porudžbina (Task 16) stiže na email vinoteke i kupcu.

---

### Task 16: End-to-end test i performanse

**Files:** nema

- [ ] **Step 1: Test porudžbina pouzećem**

Na `staging.15milja.com`: dodaj 2 proizvoda → korpa → checkout → popuni podatke → izaberi "Pouzećem" → poruči.
Expected: porudžbina kreirana (wp-admin → WooCommerce → Orders), email stigao vinoteci i kupcu.

- [ ] **Step 2: Test porudžbina uplatom na račun**

Isti tok, izaberi "Uplata na račun" → poruči.
Expected: porudžbina "On hold", prikazane instrukcije za uplatu.

- [ ] **Step 3: Mobilni i performanse**

Otvori shop i proizvod na mobilnom (DevTools 390px): kartice, filteri, checkout upotrebljivi. Proveri LSCache hit (Task 3).

- [ ] **Step 4: Provera atributa/filtera kroz katalog**

Filtriraj po Zemlja/Region/Vinarija/Zapremina + cena; pretraga radi; "Na upit" proizvodi se vide ali nisu za kupovinu.

Verifikacija: ceo tok kupovine (pouzeće + uplata) radi end-to-end na staging-u; shop spreman za dodavanje kartice (Faza 4) i lansiranje (Faza 5).

---

## Self-Review (sproveden)

- **Pokrivenost spec-a:** Faza 1 (Task 1–6: hosting/staging, WP+Woo, plugin-ovi, CSV konverter, uvoz, filteri) ✓; Faza 2 (Task 7–11: child-tema, hero, kartice, proizvod, age gate) ✓; Faza 3 (Task 12–16: plaćanje pouzeće+uplata, dostava po težini+pickup, pravne stranice, checkout, e2e test) ✓. Kartica (Faza 4) i lansiranje (Faza 5) svesno van plana.
- **Placeholder skan:** jedini `[...]` su PIB/MB u impressumu — podatke unosi vlasnik (eksterni, ne kod). Nije plan-rupa.
- **Konzistentnost tipova:** `productToRow`/`CATEGORY_LABELS`/`weightFor` korišćeni isto u testu i konverteru; nazivi atributa (Vinarija/Region/Zemlja/Zapremina) isti u konverteru i u Task 6/10.
- **Zavisnosti:** uvoz slika se oslanja na javnu statiku na `15milja.com/images/wines/` (overlay "u izradi" ne blokira statičke fajlove — provereno ranije u sesiji).
