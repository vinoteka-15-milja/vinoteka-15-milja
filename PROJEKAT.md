# PROJEKAT — Vinoteka 15 Milja

Sažetak svega urađenog, trenutnog stanja i plana. Tehnički detalji arhitekture su u `CLAUDE.md`.

_Poslednje ažuriranje: 2026-06-23_

---

## 0. AKTIVNO: WooCommerce shop sa NAŠIM dizajnom (staging) — nastavak rada

> **Za nastavak u novom chatu:** pristupni podaci (WP admin, FTP) su u mojoj memoriji (`vinoteka-woocommerce-stanje`) i u lokalnom `.secrets-wp.md` (gitignored, NIJE na GitHub-u). Spec: `docs/superpowers/specs/2026-06-23-woocommerce-webshop-design.md`. Plan: `docs/superpowers/plans/2026-06-23-woocommerce-webshop-faze-1-3.md`.

**Odluka (2026-06-23):** prelazak sa custom statičkog sajta na **WooCommerce** (zbog kartičnog plaćanja preko Raiffeisen-a). Posle neuspelog pokušaja sa generičkom Blocksy temom (izgledalo loše), vlasnik je izabrao **bespoke WordPress temu koja reprodukuje NAŠ dizajn nad WooCommerce-om**.

**Okruženje:**
- WordPress + WooCommerce na cPanel-u, poddomen **`staging.15milja.com`** (gradi se ovde; produkcija `15milja.com` ostaje statički "u izradi" do prebacivanja).
- PHP 8.3, LiteSpeed. **LiteSpeed page keš je TRENUTNO ISKLJUČEN** (radi razvoja — da nema zastarelih stranica; vratiti ON pred lansiranje).
- Deploy teme: preko **namenskog FTP naloga `deploy@15milja.com`** (rootovan na `public_html`) na `staging/wp-content/themes/vinoteka15/`. GitHub auto-deploy (Action) i dalje radi za statički `15milja.com` (main→public_html, dev→public_html/dev).

**Bespoke tema `vinoteka15`** (izvor u repou: `wp-theme/vinoteka15/`, deployuje se FTP-om na staging):
- `style.css` (WP header), `assets/app.css` (= naš `css/style.css`, ceo dizajn), `assets/woo.css` (WooCommerce most: grid, dark cart/checkout, paginacija), `assets/theme.js` (mobilni meni), `assets/logo.png` (= logo2.png).
- `functions.php` — WooCommerce support, enqueue (priority 100), nav meni, korpa-fragment, **inline kritični CSS u `wp_head` (priority 999)** koji forsira tamni izgled/logo 52px/paginaciju jer plugin CSS gazi naš (KLJUČNO — bez ovoga pozadina ostaje svetla), filter valute → "RSD", helper `v15_type_from_product()`.
- `header.php` (naš header: logo, nav, korpa), `footer.php`, `front-page.php` (hero "Vino bira strpljive" + 8 izdvojenih vina + citat), `index.php`, `woocommerce.php` (wrapper), `woocommerce/content-product.php` (NAŠ `.wine-card` markup za shop loop).
- Tema je **standalone** (NE Blocksy child) — pri promenama aktivacije paziti da `template` ostane `vinoteka15` (ranije zaglavio na `blocksy`; rešeno prebacivanjem na Blocksy pa nazad).

**Stanje (urađeno):**
- 404 proizvoda uvezeno u WooCommerce (slike, cene, 8 kategorija). Atributi Vinarija/Region/Zemlja/Zapremina ušli kao **custom** (NE globalni) — za filtere treba prebaciti na globalne.
- Plugin-ovi: aktivni **WooCommerce, LiteSpeed Cache, Flexible Shipping**. Deaktivirani: **Age Gate** (privremeno, vratiti brendiran), + očišćen bloat (Jetpack/Google/Pinterest/Reddit/Snapchat/MailPoet/PayPal).
- Tema `vinoteka15` aktivna; početna (hero+featured), shop (naše tamne kartice, "U KORPU", "RSD"), logo 52px, paginacija stilizovana.
- WooCommerce **"Coming soon"** režim je ON (gost vidi coming-soon; ulogovan vidi pravi sajt). Prebaciti na **Live** pred lansiranje (React toggle u WC→Settings→Site visibility; nije išlo kroz automatizaciju, ručno).

**Sledeći koraci (Faza 2/3 ostatak):**
1. Stranica pojedinačnog proizvoda + **korpa/checkout** u našem stilu + test porudžbine
2. Globalni atributi (zamena custom) → filteri po zemlji/regionu/vinariji/zapremini
3. Meni: izbaciti "Sample Page"/"Hello world", postaviti Početna/Vina/O nama/Kontakt; logo u header (trenutno gold grozd `logo.png`)
4. Vratiti **brendiran age gate** (18+)
5. **Faza 3:** plaćanje (pouzeće COD + uplata na račun BACS), dostava po težini (Flexible Shipping, zona Srbija + lično preuzimanje), pravne stranice (impressum/PIB/MB, uslovi, reklamacije, privatnost)
6. **Faza 4:** Raiffeisen kartica (Monri/AllSecure plugin) kad banka da sandbox podatke
7. **Faza 5:** prebaciti staging → `15milja.com` (klon/migracija URL-ova), Live, LiteSpeed keš ON

**Ključne zamke (da se ne ponavljaju):**
- Plugin CSS se učitava posle naše teme → tamni izgled se forsira inline `wp_head` CSS-om u `functions.php` (ne oslanjati se samo na app.css).
- LiteSpeed keš za goste ume da servira staru verziju → drži keš OFF dok razvijamo, ili purge posle svake izmene (Toolbox → Purge All).
- Screenshot kroz browser-automatizaciju zapinje na Google Fontovima — proveravati kroz computed-style/DOM, ne screenshot.
- Promena cPanel lozinke lomi FTP/deploy → koristi se namenski `deploy@15milja.com` nalog (nezavisan).

---

## 1. Šta je sajt sada

Statički sajt + webshop (porudžbine pouzećem) za vinoteku "15 Milja" iz Loznice.
Čist HTML/CSS/JS, bez build sistema i zavisnosti. Jezik: srpski (latinica).

**Stranice:** `index.html` (hero, intro, featured, katalog, footer + korpa i modal), `checkout.html` (porudžbina), `contact.html` (kontakt + mapa), `business-card.html`.

**Funkcionalnost:**
- Tamni premium dizajn ("Podrum"), tipografski hero, tamne kartice
- Katalog 404 proizvoda: filteri po vrsti/zemlji/ceni, pretraga (sa dijakriticima i regionom), lazy loading
- Mobilni filter drawer, aktivni filter chipovi
- Modal detalja proizvoda (količina + cena koja se množi)
- Korpa (localStorage) + checkout sa slanjem porudžbine na email
- Age gate (18+), sessionStorage

---

## 2. Urađeno u ovom projektu (jun 2026)

1. **Kompletan redizajn** — tamna premium paleta, hero, kartice, filteri, modal (vidi `CLAUDE.md` za boje/stil)
2. **Webshop** — korpa (`js/cart.js`), checkout (`checkout.html` + `js/checkout.js`), stabilni ID-jevi proizvoda (slug) + `escapeHTML` u `js/wines-data.js`
3. **Slike za ~320 proizvoda** kroz 4 talasa (Tikveš, Vukoje, rakije, Italija, Španija/Čile, Hercegovina/CG, Hrvatska, srpske vinarije, penušavci, žestoko, D&G, evropske etikete) — svaka kao transparentni PNG
4. **Normalizacija svih slika** — svih 398 na 600×800 platno, boca skalirana na istu visinu i centrirana (uniformne kartice)
5. **Ispravke podataka** — Bibich R5 → belo, Plantaže Medun → crveno, D&G Isolano → belo, Rnjak (8 vina) → Srbija/Banat; uklonjena 2 rinfuz vina; ispravljena featured lista

**Alati napravljeni usput (privremeni, u /tmp):** `removebg.swift` (skidanje pozadine + krop preko Vision frameworka), `normalize.swift` (ujednačavanje na 600×800), `croprect.swift`. Koriste se za obradu novih slika.

---

## 3. Trenutno stanje slika

| | Broj |
|---|---|
| Proizvoda ukupno | 404 |
| Sa slikom | 399 (99%) |
| Bez slike / za zamenu | vidi `slike-za-zamenu.csv` |

**`slike-za-zamenu.csv`** (kolone: prioritet, naziv, vinarija, tip, cena, fajl, originalna_velicina, razlog, NOVA_URL):
- **NEMA SLIKU (5):** Antonini Nero d'Avola, Iconic Rose, Limit (Brusnica&Badem, Kruška&Viljamovka, Nana&Ananas)
- **VISOK (2):** Minić Dorotej Rskavac (niska rez.), Njeguški pršut (fotka narezka, ne pakovanje)
- **OPCIONO (~122):** originalne slike ~450–599px — posle normalizacije OK, nije hitno

**Za fotkanje u radnji:** onih 7 (NEMA SLIKU + VISOK) su domaći proizvodi kojih nema kvalitetno online. Slikati telefonom (bilo koja pozadina) → obradiće se istim alatom (skidanje pozadine + krop + normalizacija 600×800). Za Iconic Rose proveriti tačan naziv na boci.

---

## 4. Porudžbine (trenutno)

- Plaćanje: **pouzećem** (preuzimanje u vinoteci ili dostava)
- Porudžbina stiže na **vinoteka15milja@gmail.com** preko **Web3Forms**
- Access key je u `js/checkout.js` (`WEB3FORMS_ACCESS_KEY`), besplatni plan ~250 poruka/mes
- Testirano end-to-end, radi ispravno (š/đ/ž, artikli, ukupno, podaci kupca)

---

## 5. Hosting i deploy (AKTIVNO)

- **Hosting:** cPanel (ContraTeam, "Junior SSD"), server IP `88.198.1.66`, nalog `miljacom`, sajt u `public_html`.
- **Domen:** `15milja.com` registrovan na Namecheap.
- **Auto-deploy:** GitHub Action `.github/workflows/deploy.yml` — svaki **push na `main`** automatski uploaduje izmene na cPanel preko FTP-a (SamKirkland/FTP-Deploy-Action). Prvi pun upload urađen 2026-06-17. FTP lozinka je GitHub Secret `FTP_PASSWORD` (nije u kodu).
- **Tok rada / model grana (od 2026-06-17):** main i dev su NAMERNO različiti.
  - `main` → **15milja.com** = javni "Sajt u izradi" overlay (under-construction blok u `index.html` je AKTIVAN). Pun katalog je u kodu ali skriven overlayem.
  - `dev` → **dev.15milja.com** (zaključan lozinkom) = pun shop na kome se radi (under-construction blok ZAKOMENTARISAN).
  - NE merge-ovati main↔dev dok traje "u izradi" režim (overlay bi se prepisao). Za LANSIRANJE: zakomentarisati overlay u `index.html` na main (ili prebaciti dev verziju index.html) → 15milja.com postaje pun shop.
- **DNS:** domen treba upereti na cPanel — promeniti nameservere na Namecheap-u na `dolf.dnsserve.rs` / `dolf2.dnsserve.rs` (ili A record `@`+`www` → `88.198.1.66`). Dok to ne uradiš, domen pokazuje na stari Vercel.
- **HTTPS:** posle propagacije DNS-a pokrenuti AutoSSL u cPanel-u (SSL/TLS Status).
- **Vercel:** stari hosting — ukloniti domen sa Vercel projekta posle potvrde da cPanel radi.
- **HTTPS redirekcija + dev zaključavanje:** `.htaccess` (u gitu) forsira https i traži Basic Auth **samo za `dev.15milja.com`** (produkcija otvorena). Fajl sa lozinkom je `/home/miljacom/.htpasswd-dev` — VAN `public_html`, da ga auto-deploy ne pregazi. Promena lozinke: regenerisati `.htpasswd-dev` (`openssl passwd -apr1`) i uploadovati preko FTP-a na isto mesto.

---

## 6. SLEDEĆE: "Pravi shop" sa online plaćanjem (plan)

**Odluka vlasnika (2026-06-12):** treba **online plaćanje karticom** + **zadržati postojeći custom dizajn**.

### Pravac
- Zadržati naš frontend (korpa ostaje) + dodati **serverless backend + bazu porudžbina**
- Stack: **Cloudflare Pages + Workers + D1** (alt. Vercel + Supabase)
- Plaćanje preko **lokalnog srpskog procesora: WSPay ili AllSecure** (Asseco SEE), ili banka (Intesa/Raiffeisen)
  - ⚠️ NE Snipcart/Ecwid/Stripe — ne onboarduju srpske trgovce
  - Backend šalje kupca na hostovanu stranicu za plaćanje (PCI najlakše) + prima callback
- Zadržati **pouzeće kao opciju** pored kartice (shop radi i dok čeka odobrenje)

### BLOKER (ne-kod, pokrenuti ODMAH)
Online kartica u Srbiji traži **e-commerce merchant ugovor**:
- registrovan biznis (PIB/APR)
- prijava i odobrenje kod procesora (WSPay/AllSecure) — traje danima do par nedelja
- obavezne pravne stranice: uslovi korišćenja, reklamacije, politika privatnosti
- sandbox kredencijali — **kod se testira tek kad stigne nalog**

→ **Akcija:** poslati prijavu WSPay-u/AllSecure-u što pre, paralelno sa razvojem.

### Redosled rada
1. Pokrenuti papirologiju kod procesora (blokira testiranje)
2. Brainstorming → spec → plan (pre kodiranja)
3. Backend + baza, kartica kao drugi način plaćanja pored pouzeća
4. Integracija gatewaya + test kad stignu sandbox kredencijali

---

## 7. Git

- Grana: `dev` (sve gurnuto na `origin/dev`)
- Remote: github.com/vinoteka-15-milja/vinoteka-15-milja
- Commit poruke: na srpskom
- Za produkciju: `dev` → `main` pa hosting
