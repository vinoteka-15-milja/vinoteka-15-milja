# CLAUDE.md - Vinoteka 15 Milja

## Pregled projekta

Statički sajt za vinoteku "15 Milja" iz Loznice. Nema build sistema, nema npm zavisnosti - čist HTML/CSS/JS.

## Ključni fajlovi

- `index.html` - glavna stranica, sadrži sve sekcije (hero, about, wines, contact)
- `business-card.html` - standalone dizajn vizit karte
- `css/style.css` - jedini stylesheet, koristi CSS custom properties (`:root` varijable)
- `js/wines-data.js` - globalni `PRODUCTS` niz sa svim proizvodima (~500), `COUNTRIES` i `TYPES` objekti
- `js/main.js` - IIFE modul: age gate, rendering kartica, filteri, pretraga, navigacija, animacije

## Arhitektura

- **Nema build koraka** - otvara se direktno u browseru
- **Nema zavisnosti** - vanilla JS, bez framework-a
- Podaci o proizvodima su u `wines-data.js` kao globalna `var PRODUCTS` promenljiva
- `main.js` čita `PRODUCTS` i dinamički generiše HTML kartice
- CSS koristi custom properties definisane u `:root` (burgundy, gold, cream, dark, green)

## Konvencije

- Jezik sajta: **srpski** (latinica)
- Commit poruke: na srpskom
- Tipografija: Playfair Display za naslove, Lato za body tekst
- Svaki proizvod u PRODUCTS nizu ima: `name`, `winery`, `price` (RSD), `type`, `country`, `region`, opciono `image` i `size`
- Tipovi proizvoda: `red`, `white`, `rose`, `sparkling`, `special`, `rakija`, `spirits`, `delicacy`
- Kodovi zemalja: ISO 2-slovna (`rs`, `hr`, `it`, `fr`, `es`, `ba`, `me`, `si`, `at`, `mk`, `cl`, `ar`, `nz`, `int`)

## Trenutno stanje

- Sajt je u **under construction** režimu (overlay u `index.html`)
- Age gate koristi `sessionStorage`
- Slike proizvoda su u `images/wines/` direktorijumu (PNG format)
- Neki proizvodi nemaju slike (nemaju `image` polje)
- Cene sa vrednošću `0` prikazuju se kao "Na upit"
