# Spec — WooCommerce web-shop za Vinoteku 15 Milja

_Datum: 2026-06-23 · Status: odobren dizajn, pre plana implementacije_

## 1. Kontekst i cilj

Vinoteka 15 Milja (registrovan DOO) trenutno ima custom statički sajt (HTML/CSS/JS, 404 proizvoda, ~398 slika) na cPanel hostingu (`15milja.com`), sa porudžbinama pouzećem preko Web3Forms. Sajt je u "Sajt u izradi" režimu na produkciji; pun statički sajt živi na zaključanom `dev.15milja.com`.

**Cilj:** napraviti potpuno funkcionalan e-commerce shop na **WooCommerce** (WordPress) sa prihvatanjem **kartica preko Raiffeisen banke**, uz zadržavanje postojećeg vizuelnog identiteta. Ovo je svestan zaokret sa ranije ideje (custom frontend + serverless) ka standardnoj WooCommerce platformi (lakše održavanje, lokalna podrška, gotovi plugin-ovi za kartično plaćanje u Srbiji).

**Posledica:** custom statički sajt se penzioniše; shop se pravi iznova na WordPress/WooCommerce platformi, ali se dizajn verno reprodukuje kao custom tema.

## 2. Odluke (donete kroz brainstorming)

| Tema | Odluka |
|---|---|
| Dizajn | Preneti postojeći tamni premium izgled kao **custom child-temu** (ne gotova tema, ne od nule) |
| Platforma teme | Osnovna tema **Blocksy** + child-tema `vinoteka15` |
| Banka/kartice | **Raiffeisen banka** (procesor Monri ili AllSecure — potvrđuje se kad banka da integracione podatke) |
| Načini plaćanja | **Kartica online + Pouzeće + Uplata na račun** (sva tri) |
| Dostava | **Kurir, cena po težini/zoni** + besplatno lično preuzimanje |
| Hosting | Postojeći cPanel (LiteSpeed); proveriti da li "Junior SSD" paket dovoljan ili treba nadogradnja |

## 3. Arhitektura i okruženje

- **WordPress + WooCommerce** na cPanel-u, PHP 8.2, MySQL, LiteSpeed web server + **LSCache** plugin za performanse.
- **Staging:** gradi se na poddomenu `staging.15milja.com`, zaključan Basic Auth lozinkom (isti mehanizam kao `dev.15milja.com`: host-conditional `.htaccess` + `.htpasswd` van docroot-a). Produkcija `15milja.com` ostaje "u izradi" do lansiranja.
- **Instalacija:** WordPress preko cPanel WP Toolkit / Softaculous.
- **Lansiranje:** klon staging → glavni domen preko WP Toolkit "Clone/Copy" (sređuje siteurl/home i URL-ove u bazi).
- **Rizik hostinga:** "Junior SSD" je ulazni paket. WP+Woo+400 proizvoda radi uz LSCache, ali RAM/CPU/inode limiti mogu zahtevati nadogradnju paketa — proveriti limite pre/tokom Faze 1.

## 4. Tema (custom child)

- **Parent:** Blocksy (brza, WooCommerce-optimizovana, jak free tier).
- **Child:** `vinoteka15` — prenosi dizajn tokene iz postojećeg `css/style.css`:
  - paleta: `--clr-bg #171114`, panel `#1e171a`, kartica `#2a2125`, zlato `#C9A96E`, tekst `#f4ece1`
  - tipografija: Playfair Display (naslovi) + Lato (telo)
  - tipografski hero na početnoj, tamne kartice proizvoda, hover efekti
  - age gate 18+ (plugin ili snippet u child-temi)
- Filteri katologa → WooCommerce atributi + layered nav (vidi §5). "Modal proizvoda" iz statičkog sajta postaje **prava stranica proizvoda** (bolje za SEO i tok plaćanja).
- Child-tema kod se može držati u git-u (verzionisanje + deploy preko postojeće GitHub Action na `wp-content/themes/vinoteka15`).

## 5. Migracija proizvoda (404)

- Skripta konvertuje `js/wines-data.js` → **WooCommerce CSV** za uvoz.
- Mapiranje polja:
  - `name` → naziv proizvoda
  - `price` → regular_price (RSD)
  - `type` → **kategorija** (8: Crveno, Belo, Roze, Penušavo, Specijalno, Rakija, Žestoko, Delikatesi)
  - `country`, `region`, `winery`, `size` → **atributi** (zemlja, region, vinarija, zapremina) — omogućavaju layered-nav filtere koji zamenjuju postojeće filtere
  - `image` → glavna slika proizvoda (svih 398 u media biblioteku; uvoz po URL-u sa servera)
  - **težina** → postaviti po proizvodu (default 1.3 kg za 0.75L, prilagoditi za mini/magnum) radi dostave po težini
- **11 "Na upit" proizvoda (price 0):** katalog-only (nisu za kupovinu), prikaz "Cena na upit — pozovite", bez dugmeta za korpu.

## 6. Plaćanje

- **Kartica (Raiffeisen):** WooCommerce plugin procesora (Monri ili AllSecure — po banci); redirekcija na hostovanu stranicu banke (PCI najjednostavnije). Aktivira se kad banka da produkcione podatke; do tada sandbox/isključeno.
- **Pouzeće:** WooCommerce COD.
- **Uplata na račun:** WooCommerce BACS (bankovni transfer) sa instrukcijama; ručna potvrda po uplati.

## 7. Dostava

- WooCommerce shipping zona **Srbija** + **cena po težini** (plugin Flexible Shipping ili table-rate) na osnovu težina proizvoda.
- **Lično preuzimanje** u vinoteci — besplatno.
- Opciono kasnije: kurirski plugin (D Express/BEX) za automatske nalepnice i praćenje.

## 8. Pravne stranice i usklađenost (obavezno za banku + zakon)

Banka pregleda sajt pre odobrenja kartičnog plaćanja. Potrebno:
- Uslovi korišćenja (uslovi prodaje)
- Politika privatnosti (ZZPL/GDPR)
- Reklamacije i povraćaj robe
- Uslovi i rokovi dostave
- Cookie obaveštenje
- Impressum / podaci o firmi: naziv (Vinoteka 15 Milja DOO), PIB, matični broj, adresa, kontakt
- 18+ napomena (zabrana prodaje maloletnima) + age gate
- Checkbox "prihvatam uslove" na checkout-u

## 9. Performanse, bezbednost, bekap

- **Performanse:** LSCache plugin; slike već optimizovane/normalizovane (600×800, transparentni PNG).
- **Bezbednost:** Wordfence (ili sl.), ograničenje prijava, redovni update WP/Woo/plugin-a, SSL (AutoSSL već aktivan).
- **Bekap:** automatski (UpdraftPlus ili cPanel backup) pre lansiranja i periodično.

## 10. Tok rada posle migracije

- Shop se vodi kroz **wp-admin**: proizvodi, porudžbine, zalihe, cene.
- Git ostaje samo za **kod child-teme** (opciono, za verzionisanje/deploy); sadržaj i porudžbine su u MySQL bazi.
- Postojeći "push na main = live" model statičkog sajta se penzioniše za shop (ostaje eventualno za marketing/landing ako zatreba).

## 11. Faze implementacije

1. **Paralelno, odmah:** podneti Raiffeisen e-commerce zahtev (gating, traje danima–nedeljama; sandbox podaci dolaze od banke).
2. **Faza 1 — Temelji:** WP+Woo na `staging.15milja.com`, LSCache, provera limita paketa; uvoz 404 proizvoda; kategorije, atributi, layered-nav filteri.
3. **Faza 2 — Dizajn:** child-tema `vinoteka15` (paleta, tipografija, hero, kartice, shop/proizvod stranice), age gate.
4. **Faza 3 — Trgovina bez kartice:** plaćanje pouzećem + uplatom na račun; dostava po težini + lično preuzimanje; pravne stranice; checkout.
5. **Faza 4 — Kartica:** integracija Raiffeisen gateway plugin-a kad stignu sandbox podaci; testiranje transakcija.
6. **Faza 5 — Lansiranje:** klon staging → `15milja.com`; go-live (pouzeće+uplata rade odmah, kartica se "upali" kad banka odobri produkciju).

## 12. Testiranje / kriterijumi uspeha

- Test porudžbina za svaki način plaćanja (pouzeće, uplata, kartica u sandbox-u) — kroz ceo tok do potvrde.
- Provera filtera (tip/zemlja/region/vinarija/zapremina), pretrage, mobilnog prikaza.
- Provera dostave: ispravna cena po težini za više korpi, lično preuzimanje besplatno.
- Provera pravnih stranica i checkout checkbox-a.
- Performanse: učitavanje shop/proizvod stranica uz LSCache; mobilni.
- Vizuelna provera da child-tema verno reprodukuje brend.

## 13. Rizici i zavisnosti

- **Gating:** kartično plaćanje zavisi od Raiffeisen ugovora (spoljni rok, ne-kod). Shop se pušta sa pouzećem+uplatom pre toga.
- **Hosting paket:** "Junior SSD" možda nedovoljan za WP+Woo → moguća nadogradnja (trošak).
- **Migracija URL-ova** staging→produkcija mora proći bez slomljenih linkova/slika (WP Toolkit clone + search-replace).
- **Procesor kartica** (Monri vs AllSecure) potvrđuje se tek kad banka da dokumentaciju → tačan plugin se bira tada.

## 14. Van obima (YAGNI, za sada)

- Automatske kurirske nalepnice (D Express API) — kasnije ako zatreba.
- Višejezičnost, B2B cene, program lojalnosti, newsletter automatizacija — nisu deo prvog lansiranja.
- Headless WooCommerce (custom frontend + Woo API) — odbačeno u korist standardne WP teme.
