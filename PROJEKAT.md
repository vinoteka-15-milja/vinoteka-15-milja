# PROJEKAT — Vinoteka 15 Milja

Sažetak svega urađenog, trenutnog stanja i plana. Tehnički detalji arhitekture su u `CLAUDE.md`.

_Poslednje ažuriranje: 2026-06-12_

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

## 5. Hosting (preporuka)

Za trenutni statički sajt: **Cloudflare Pages** (besplatno, neograničen bandwidth, jak EU CDN — bitno zbog ~90MB slika). Alternative: Netlify (lak, 100GB/mes limit), GitHub Pages (najjednostavnije jer je repo na GitHubu).
Hosting servira `main` granu — sve je trenutno na `dev`; za produkciju spojiti `dev` → `main`.

Domen: `.rs` preko RNIDS registrara (Loopia, Webglobe…), `.com` može direktno preko Cloudflare.

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
