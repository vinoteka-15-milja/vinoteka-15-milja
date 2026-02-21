# Vinoteka 15 Milja

Sajt za vinoteku **15 Milja** iz Loznice, Srbija. Premium wine shop sa kuriranom kolekcijom srpskih i svetskih vina, rakija, žestokih pića i delikatesa.

## Struktura projekta

```
Website/
├── index.html              # Glavna stranica sajta
├── business-card.html      # Dizajn vizit karte (3.5 x 2 in)
├── css/
│   └── style.css           # Glavni stylesheet (CSS custom properties)
├── js/
│   ├── wines-data.js       # Kompletna baza proizvoda (~500 artikala)
│   └── main.js             # Navigacija, filteri, pretraga, animacije
├── images/
│   ├── logo/               # Logo varijante
│   └── wines/              # Slike proizvoda (PNG)
└── image-matches.json      # Mapiranje slika na proizvode
```

## Tehnologije

- **HTML5** - semantički markup
- **CSS3** - custom properties, grid/flexbox, responsive dizajn
- **Vanilla JavaScript** - bez framework-a ili zavisnosti
- **Google Fonts** - Playfair Display (naslovi), Lato (body)

## Funkcionalnosti

- **Age gate** (18+) - verifikacija starosti sa session storage
- **Under construction overlay** - privremeni ekran dok se sajt razvija
- **Dinamička kartica proizvoda** - generisane iz `wines-data.js`
- **Filtriranje** - po tipu (crveno, belo, roze, penušavo, rakija, žestoko, delikatesi)
- **Filtriranje po zemlji** - Srbija, Hrvatska, BiH, Italija, Francuska, Španija, ostale
- **Pretraga** - po nazivu i vinariji, sa podrškom za dijakritike (ć, č, š, ž, đ)
- **Istaknuta vina** - ručno odabrani featured proizvodi
- **Responsive dizajn** - prilagođen za mobilne uređaje
- **Scroll animacije** - Intersection Observer API
- **Google Maps** - ugrađena mapa lokacije

## Paleta boja

| Boja       | Hex       |
|------------|-----------|
| Burgundy   | `#5C1A1B` |
| Gold       | `#C9A96E` |
| Cream      | `#FAF6F0` |
| Dark       | `#1A1A1A` |
| Green      | `#2D4A3E` |

## Kontakt

- **Adresa:** Žikice Jovanovića 9, 15300 Loznica, Srbija
- **Telefon:** +381 63 367 514
- **Email:** vinoteka15milja@gmail.com
