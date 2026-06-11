/* ============================================
   VINOTEKA 15 MILJA - Wine & Product Data
   Complete inventory from PDF export
   ============================================ */

var PRODUCTS = [

  // ========================================
  // 🇷🇸 SRBIJA - CRVENA VINA
  // ========================================
  { name: "Aleksandrović Harizma", winery: "Aleksandrović", price: 1770, type: "red", country: "rs", region: "Šumadija", image: "images/wines/aleksandrović-harizma.png" },
  { name: "Aleksandrović Prokupac", winery: "Aleksandrović", price: 1770, type: "red", country: "rs", region: "Šumadija", image: "images/wines/aleksandrović-prokupac.png" },
  { name: "Aleksandrović Regent", winery: "Aleksandrović", price: 2340, type: "red", country: "rs", region: "Šumadija", image: "images/wines/aleksandrović-regent-reserve.png" },
  { name: "Aleksandrović Rodoslov", winery: "Aleksandrović", price: 4980, type: "red", country: "rs", region: "Šumadija", image: "images/wines/aleksandrović-rodoslov-magnum-3l.png" },
  { name: "Aleksandrović Varijanta", winery: "Aleksandrović", price: 1390, type: "red", country: "rs", region: "Šumadija", image: "images/wines/aleksandrović-varijanta.png" },
  { name: "Aleksandrović Vizija", winery: "Aleksandrović", price: 1700, type: "red", country: "rs", region: "Šumadija" },
  { name: "Aleksandrović Trijumf", winery: "Aleksandrović", price: 1920, type: "red", country: "rs", region: "Šumadija", image: "images/wines/aleksandrović-trijumf.png" },
  { name: "Aleksandrović Trijumf Gold", winery: "Aleksandrović", price: 2200, type: "red", country: "rs", region: "Šumadija", image: "images/wines/aleksandrović-trijumf-gold.png" },
  { name: "Aleksandrović Trijumf Noir", winery: "Aleksandrović", price: 2200, type: "red", country: "rs", region: "Šumadija", image: "images/wines/aleksandrović-trijumf-noir-penušavac.png" },
  { name: "Aleksandrović Trijumf Teroir", winery: "Aleksandrović", price: 2350, type: "red", country: "rs", region: "Šumadija", image: "images/wines/aleksandrović-trijumf-terroir.png" },
  { name: "Aleksić Kardaš", winery: "Aleksić", price: 1010, type: "red", country: "rs", region: "Vranje", image: "images/wines/aleksić-kardaš.png" },
  { name: "Aleksić Kardaš Limited", winery: "Aleksić", price: 1560, type: "red", country: "rs", region: "Vranje", image: "images/wines/aleksić-kardaš-limited.png" },
  { name: "Belo Brdo A.M. Cuvée Rouge", winery: "Belo Brdo", price: 1490, type: "red", country: "rs", region: "Fruška Gora" },
  { name: "Bjelica Babaroga Crvena", winery: "Bjelica", price: 5150, type: "red", country: "rs", region: "Srbija", image: "images/wines/bjelica-babaroga-crvena.png" },
  { name: "Bjelica Graffiti", winery: "Bjelica", price: 2500, type: "red", country: "rs", region: "Srbija", image: "images/wines/bjelica-graffiti-crveno.png" },
  { name: "Bjelica Saga", winery: "Bjelica", price: 2220, type: "red", country: "rs", region: "Srbija", image: "images/wines/bjelica-saga.png" },
  { name: "Budimir Triada Prokupac", winery: "Budimir", price: 1100, type: "red", country: "rs", region: "Negotin" },
  { name: "Budimir Projekat IKS", winery: "Budimir", price: 1750, type: "red", country: "rs", region: "Negotin", image: "images/wines/budimir-projekat-x.png" },
  { name: "Chichateau Fabula Lagum", winery: "Chichateau", price: 3260, type: "red", country: "rs", region: "Srbija", image: "images/wines/chichateau-fabula-lagum.png" },
  { name: "Chichateau Fabula Mala", winery: "Chichateau", price: 1760, type: "red", country: "rs", region: "Srbija", image: "images/wines/chichateau-fabula-mala-0.75-l.png" },
  { name: "Čilić Cabernet-Merlot", winery: "Čilić", price: 1330, type: "red", country: "rs", region: "Srbija", image: "images/wines/cilić-crni-vrh-cabernet-&-merlot.png" },
  { name: "Deurić Aksiom Crveni", winery: "Deurić", price: 2070, type: "red", country: "rs", region: "Župa", image: "images/wines/deurić-aksiom-crveni.png" },
  { name: "Deurić Merlot", winery: "Deurić", price: 1300, type: "red", country: "rs", region: "Župa", image: "images/wines/deurić-princeps-merlot.png" },
  { name: "Deurić Pinot Noir", winery: "Deurić", price: 1360, type: "red", country: "rs", region: "Župa", image: "images/wines/deurić-pinot-noir.png" },
  { name: "Deurić Probus", winery: "Deurić", price: 1690, type: "red", country: "rs", region: "Župa", image: "images/wines/deurić-probus-276.png" },
  { name: "Doja Prokupac", winery: "Doja", price: 1490, type: "red", country: "rs", region: "Srbija", image: "images/wines/doja-prokupac.png" },
  { name: "Draganić Pálava Profil", winery: "Draganić", price: 1600, type: "red", country: "rs", region: "Srbija" },
  { name: "Erdevik Grand Trianon", winery: "Erdevik", price: 2680, type: "red", country: "rs", region: "Fruška Gora", image: "images/wines/erdevik-grand-trianon.png" },
  { name: "Erdevik Marlon Delon", winery: "Erdevik", price: 4280, type: "red", country: "rs", region: "Fruška Gora", image: "images/wines/erdevik-marlon-delon.png" },
  { name: "Erdevik Omnibus Lector", winery: "Erdevik", price: 4280, type: "red", country: "rs", region: "Fruška Gora", image: "images/wines/erdevik-omnibus-lector-chardonnay.png" },
  { name: "Erdevik Stifler's Mom", winery: "Erdevik", price: 4280, type: "red", country: "rs", region: "Fruška Gora", image: "images/wines/erdevik-stifler's-mom-shiraz.png" },
  { name: "Erdevik Tri Crvene Koze", winery: "Erdevik", price: 810, type: "red", country: "rs", region: "Fruška Gora" },
  { name: "Erdevik Trianon", winery: "Erdevik", price: 1690, type: "red", country: "rs", region: "Fruška Gora", image: "images/wines/erdevik-trianon.png" },
  { name: "Ivanović Prokupac", winery: "Ivanović", price: 1490, type: "red", country: "rs", region: "Srbija", image: "images/wines/ivanović-prokupac-0.75-l.png" },
  { name: "Jeremić Kanon", winery: "Jeremić", price: 1700, type: "red", country: "rs", region: "Srbija", image: "images/wines/jeremić-kanon.png" },
  { name: "Jeremić Merlot Terroir", winery: "Jeremić", price: 3260, type: "red", country: "rs", region: "Srbija", image: "images/wines/jeremić-merlot-terroire.png" },
  { name: "Jeremić Sonata", winery: "Jeremić", price: 1590, type: "red", country: "rs", region: "Srbija", image: "images/wines/jeremić-sonata.png" },
  { name: "Jović Cabernet Sauvignon", winery: "Jović", price: 1670, type: "red", country: "rs", region: "Srbija", image: "images/wines/jović-cabernet-sauvignon.png" },
  { name: "Jović Dionizije", winery: "Jović", price: 2780, type: "red", country: "rs", region: "Srbija", image: "images/wines/jović-dionizije.png" },
  { name: "Jović Vranac", winery: "Jović", price: 2010, type: "red", country: "rs", region: "Srbija", image: "images/wines/jović-vranac-potrkanjski.png" },
  { name: "Jović Vranac Premium", winery: "Jović", price: 2010, type: "red", country: "rs", region: "Srbija" },
  { name: "Kovačević Orphelin Crveni", winery: "Kovačević", price: 500, type: "red", country: "rs", region: "Fruška Gora", size: "0.187l" },
  { name: "Lastar Merlot", winery: "Lastar", price: 1420, type: "red", country: "rs", region: "Srbija" },
  { name: "Legat Do Neba i Nazad", winery: "Legat", price: 1220, type: "red", country: "rs", region: "Srbija", image: "images/wines/đurđevića-legat-do-neba-i-nazad.png" },
  { name: "Legat Otisak", winery: "Legat", price: 1950, type: "red", country: "rs", region: "Srbija", image: "images/wines/đurđevića-legat-otisak.png" },
  { name: "Mačkov Podrum Portugizer", winery: "Mačkov Podrum", price: 890, type: "red", country: "rs", region: "Fruška Gora" },
  { name: "Magaza Merlot", winery: "Magaza", price: 1540, type: "red", country: "rs", region: "Srbija", image: "images/wines/magaza-merlot.png" },
  { name: "Manastir Bukovo Filigran Cabernet", winery: "Manastir Bukovo", price: 2090, type: "red", country: "rs", region: "Srbija" },
  { name: "Manastir Bukovo Filigran GAME", winery: "Manastir Bukovo", price: 1870, type: "red", country: "rs", region: "Srbija", image: "images/wines/bukovo-filigran-game.png" },
  { name: "Manastir Hilandar Crveno", winery: "Manastir Hilandar", price: 1620, type: "red", country: "rs", region: "Srbija" },
  { name: "Matalj Bukovski Cuvée", winery: "Matalj", price: 1960, type: "red", country: "rs", region: "Negotin" },
  { name: "Matalj Kremen", winery: "Matalj", price: 1770, type: "red", country: "rs", region: "Negotin", image: "images/wines/matalj-kremen-1,5l.png" },
  { name: "Matalj Kremen Kamen", winery: "Matalj", price: 8620, type: "red", country: "rs", region: "Negotin", image: "images/wines/matalj-kremen-kamen.png" },
  { name: "Matalj Crna Tamjanika", winery: "Matalj", price: 1280, type: "red", country: "rs", region: "Negotin" },
  { name: "Matalj Zemna Reserva", winery: "Matalj", price: 3040, type: "red", country: "rs", region: "Negotin", image: "images/wines/matalj-zemna.png" },
  { name: "Matijašević Cukundeda", winery: "Matijašević", price: 2080, type: "red", country: "rs", region: "Šumadija", image: "images/wines/matijašević-čukundeda.png" },
  { name: "Matijašević SoviNoa", winery: "Matijašević", price: 2150, type: "red", country: "rs", region: "Šumadija", image: "images/wines/matijašević-sovinoa.png" },
  { name: "Matijašević Tri Doline", winery: "Matijašević", price: 2290, type: "red", country: "rs", region: "Šumadija", image: "images/wines/matijašević-merlot-tri-doline.png" },
  { name: "Milanović Probus", winery: "Milanović", price: 1310, type: "red", country: "rs", region: "Srbija", image: "images/wines/milanović-probus.png" },
  { name: "Milanović Sila", winery: "Milanović", price: 1800, type: "red", country: "rs", region: "Srbija", image: "images/wines/milanović-sila.png" },
  { name: "Minić Dorotej Rskavac", winery: "Minić", price: 2350, type: "red", country: "rs", region: "Srbija" },
  { name: "Porta Cuvée", winery: "Porta", price: 1790, type: "red", country: "rs", region: "Srbija" },
  { name: "Porta Merlot", winery: "Porta", price: 1470, type: "red", country: "rs", region: "Srbija" },
  // { name: "Pusula Rinfuz Crveno 1L", winery: "Pusula", price: 470, type: "red", country: "rs", region: "Srbija" },
  { name: "Radovanović Cabernet", winery: "Radovanović", price: 1520, type: "red", country: "rs", region: "Šumadija", image: "images/wines/radovanović-cabernet-sauvignon-reserve.png" },
  { name: "Radovanović Cabernet Reserve", winery: "Radovanović", price: 3600, type: "red", country: "rs", region: "Šumadija", image: "images/wines/radovanović-cabernet-sauvignon-reserve-0.75-l.png" },
  { name: "Temet Ergo Crveno", winery: "Temet", price: 3640, type: "red", country: "rs", region: "Tri Morave" },
  { name: "Temet Tri Morave Crveno", winery: "Temet", price: 1930, type: "red", country: "rs", region: "Tri Morave", image: "images/wines/temet-tri-morave-rezerva-crveno.png" },
  { name: "Tonković Campanella", winery: "Tonković", price: 1660, type: "red", country: "rs", region: "Srbija" },
  { name: "Tonković Kadarka Allegro", winery: "Tonković", price: 1470, type: "red", country: "rs", region: "Srbija", image: "images/wines/tonković-kadarka-allegro.png" },
  { name: "Tonković Kadarka Fantazija", winery: "Tonković", price: 1470, type: "red", country: "rs", region: "Srbija", image: "images/wines/tonković-kadarka-fantazija.png" },
  { name: "Tonković Kadarka Rapsodija", winery: "Tonković", price: 1840, type: "red", country: "rs", region: "Srbija" },
  { name: "Trivanović Optimus", winery: "Trivanović", price: 1370, type: "red", country: "rs", region: "Srbija" },
  { name: "Trivanović Cab. Sauvignon Limited", winery: "Trivanović", price: 2030, type: "red", country: "rs", region: "Srbija" },
  { name: "Trivanović Shiraz Limited", winery: "Trivanović", price: 2620, type: "red", country: "rs", region: "Srbija" },
  { name: "Varina Prokupac", winery: "Varina", price: 1410, type: "red", country: "rs", region: "Srbija" },
  { name: "Virtus Marselan", winery: "Virtus", price: 1700, type: "red", country: "rs", region: "Srbija", image: "images/wines/virtus-marselan.png" },
  { name: "Virtus Mlavac Crveni", winery: "Virtus", price: 790, type: "red", country: "rs", region: "Srbija" },
  { name: "Virtus Prokupac", winery: "Virtus", price: 1300, type: "red", country: "rs", region: "Srbija", image: "images/wines/virtus-prokupac.png" },
  { name: "Zvonko Bogdan 4 Konja Debela", winery: "Zvonko Bogdan", price: 1310, type: "red", country: "rs", region: "Subotica" },
  { name: "Zvonko Bogdan 8 Tamburasa", winery: "Zvonko Bogdan", price: 1310, type: "red", country: "rs", region: "Subotica", image: "images/wines/zvonko-bogdan-8-tamburaša.png" },
  { name: "Zvonko Bogdan Cuvée No1", winery: "Zvonko Bogdan", price: 2380, type: "red", country: "rs", region: "Subotica", image: "images/wines/zvonko-bogdan-cuvee-no.1.png" },
  { name: "Zvonko Bogdan Život Teče", winery: "Zvonko Bogdan", price: 1310, type: "red", country: "rs", region: "Subotica", image: "images/wines/zvonko-bogdan-život-teče.png" },

  // 🇷🇸 SRBIJA - BELA VINA
  { name: "Aleksandrović Bela Varijanta", winery: "Aleksandrović", price: 1390, type: "white", country: "rs", region: "Šumadija" },
  { name: "Aleksić Barbara", winery: "Aleksić", price: 840, type: "white", country: "rs", region: "Vranje", image: "images/wines/aleksić-barbara-rose.png" },
  { name: "Aleksić Žuti Cvet", winery: "Aleksić", price: 1180, type: "white", country: "rs", region: "Vranje", image: "images/wines/aleksić-žuti-cvet.png" },
  { name: "Belo Brdo Chardonnay", winery: "Belo Brdo", price: 1130, type: "white", country: "rs", region: "Fruška Gora", image: "images/wines/belo-brdo-chardonnay.png" },
  { name: "Belo Brdo Sauvignon Blanc", winery: "Belo Brdo", price: 1250, type: "white", country: "rs", region: "Fruška Gora", image: "images/wines/belo-brdo-sauvignon-blanc-0.75-l.png" },
  { name: "Bjelica Babaroga", winery: "Bjelica", price: 4960, type: "white", country: "rs", region: "Srbija", image: "images/wines/bjelica-babaroga.png" },
  { name: "Budimir Tamjanika", winery: "Budimir", price: 1580, type: "white", country: "rs", region: "Negotin", image: "images/wines/budimir-tamjanika.png" },
  { name: "Budimir Tamjanika Vera", winery: "Budimir", price: 2140, type: "white", country: "rs", region: "Negotin", image: "images/wines/budimir-tamjanika-vera.png" },
  { name: "Budimir Triada Bela", winery: "Budimir", price: 1100, type: "white", country: "rs", region: "Negotin" },
  { name: "Budimir Kao Da Si Anđeo", winery: "Budimir", price: 1490, type: "white", country: "rs", region: "Negotin", image: "images/wines/budimir-i-kao-da-si-anđeo.png" },
  { name: "Budimir Boje Lila", winery: "Budimir", price: 2140, type: "white", country: "rs", region: "Negotin", image: "images/wines/budimir-prokupac-boje-lila.png" },
  { name: "Chichateau Chardonnay", winery: "Chichateau", price: 3270, type: "white", country: "rs", region: "Srbija", image: "images/wines/chichateau-chichardonnay.png" },
  { name: "Chichateau Fabula Mala a Bela", winery: "Chichateau", price: 1570, type: "white", country: "rs", region: "Srbija", image: "images/wines/chichateau-fabula-mala-a-bela.png" },
  { name: "Čilić Fumé Blanc", winery: "Čilić", price: 1330, type: "white", country: "rs", region: "Srbija" },
  { name: "Deurić Aksiom Beli", winery: "Deurić", price: 1620, type: "white", country: "rs", region: "Župa", image: "images/wines/deurić-aksiom-beli.png" },
  { name: "Deurić Chardonnay", winery: "Deurić", price: 1360, type: "white", country: "rs", region: "Župa", image: "images/wines/deurić-chardonnay-classic.png" },
  { name: "Deurić Gorska Tamjanika", winery: "Deurić", price: 1460, type: "white", country: "rs", region: "Župa", image: "images/wines/deurić-gorska-tamjanika.png" },
  { name: "Deurić Sauvignon Blanc", winery: "Deurić", price: 1170, type: "white", country: "rs", region: "Župa" },
  { name: "Doja Belo", winery: "Doja", price: 1220, type: "white", country: "rs", region: "Srbija" },
  { name: "Doja Tamjanika", winery: "Doja", price: 1220, type: "white", country: "rs", region: "Srbija" },
  { name: "Enjingi Rajnski Rizling", winery: "Enjingi", price: 1600, type: "white", country: "rs", region: "Fruška Gora" },
  { name: "Enjingi Venje", winery: "Enjingi", price: 3180, type: "white", country: "rs", region: "Fruška Gora" },
  { name: "Erdevik Bella Novela", winery: "Erdevik", price: 1290, type: "white", country: "rs", region: "Fruška Gora", image: "images/wines/erdevik-bella-novela.png" },
  { name: "Erdevik Tri Bele Koze", winery: "Erdevik", price: 810, type: "white", country: "rs", region: "Fruška Gora", image: "images/wines/erdevik-tri-bele-koze-0.75-l.png" },
  { name: "Grašević Mitrovac", winery: "Grašević", price: 1470, type: "white", country: "rs", region: "Srbija" },
  { name: "Jović Chardonnay", winery: "Jović", price: 1110, type: "white", country: "rs", region: "Srbija", image: "images/wines/jović-chardonnay.png" },
  { name: "Jović Rajnski Rizling", winery: "Jović", price: 1110, type: "white", country: "rs", region: "Srbija" },
  { name: "Jović Sauvignon Blanc", winery: "Jović", price: 1250, type: "white", country: "rs", region: "Srbija" },
  { name: "Kovačević Aurelius", winery: "Kovačević", price: 1590, type: "white", country: "rs", region: "Fruška Gora", image: "images/wines/kovačević-aurelius.png" },
  { name: "Kovačević Aurelius S", winery: "Kovačević", price: 2780, type: "white", country: "rs", region: "Fruška Gora", image: "images/wines/kovačević-aurelius-s-1,5-l.png" },
  { name: "Kovačević Chardonnay", winery: "Kovačević", price: 1460, type: "white", country: "rs", region: "Fruška Gora", image: "images/wines/kovačević-chardonnay.png" },
  { name: "Kovačević Fresco Bianco", winery: "Kovačević", price: 1150, type: "white", country: "rs", region: "Fruška Gora", image: "images/wines/kovačević-fresco-bianco.png" },
  { name: "Kovačević Orphelin Beli", winery: "Kovačević", price: 500, type: "white", country: "rs", region: "Fruška Gora", size: "0.187l" },
  { name: "Kovačević Sauvignon", winery: "Kovačević", price: 1390, type: "white", country: "rs", region: "Fruška Gora", image: "images/wines/kovačević-sauvignon-edicija-s.png" },
  { name: "Lastar Tamjanika", winery: "Lastar", price: 1560, type: "white", country: "rs", region: "Srbija", image: "images/wines/lastar-tamjanika.png" },
  { name: "Legat Tamjanika", winery: "Legat", price: 1220, type: "white", country: "rs", region: "Srbija" },
  { name: "Mačkov Podrum Chardonnay", winery: "Mačkov Podrum", price: 1320, type: "white", country: "rs", region: "Fruška Gora" },
  { name: "Mačkov Podrum Frajla", winery: "Mačkov Podrum", price: 890, type: "white", country: "rs", region: "Fruška Gora" },
  { name: "Mačkov Podrum Traminac", winery: "Mačkov Podrum", price: 1160, type: "white", country: "rs", region: "Fruška Gora" },
  { name: "Magaza Chardonnay", winery: "Magaza", price: 1590, type: "white", country: "rs", region: "Srbija" },
  { name: "Magaza Tamjanika", winery: "Magaza", price: 1410, type: "white", country: "rs", region: "Srbija" },
  { name: "Manastir Bukovo Chardonnay LUX", winery: "Manastir Bukovo", price: 2010, type: "white", country: "rs", region: "Srbija" },
  { name: "Matalj Chardonnay Terasa", winery: "Matalj", price: 1460, type: "white", country: "rs", region: "Negotin" },
  { name: "Matalj Sauvignon Terasa", winery: "Matalj", price: 1280, type: "white", country: "rs", region: "Negotin" },
  { name: "Matijašević SoviNoa Fumé Blanc", winery: "Matijašević", price: 5780, type: "white", country: "rs", region: "Šumadija", image: "images/wines/matijašević-sovinoa-fume-blanc.png" },
  { name: "Minić Tamjanika", winery: "Minić", price: 1250, type: "white", country: "rs", region: "Srbija" },
  { name: "Porta Chardonnay", winery: "Porta", price: 1390, type: "white", country: "rs", region: "Srbija" },
  { name: "Porta Sauvignon Blanc", winery: "Porta", price: 1230, type: "white", country: "rs", region: "Srbija" },
  { name: "Pusula Chardonnay", winery: "Pusula", price: 920, type: "white", country: "rs", region: "Srbija" },
  { name: "Pusula Sauvignon Blanc", winery: "Pusula", price: 1040, type: "white", country: "rs", region: "Srbija", image: "images/wines/pusula-sauvignon-blanc.png" },
  { name: "Pusula Traminac", winery: "Pusula", price: 1040, type: "white", country: "rs", region: "Srbija", image: "images/wines/pusula-traminac.png" },
  { name: "Pusula Rinfuz Belo 1L", winery: "Pusula", price: 470, type: "white", country: "rs", region: "Srbija" },
  { name: "Radovanović Chardonnay", winery: "Radovanović", price: 1520, type: "white", country: "rs", region: "Šumadija", image: "images/wines/radovanović-chardonnay-classique.png" },
  { name: "Radovanović Chardonnay Selekcija", winery: "Radovanović", price: 2290, type: "white", country: "rs", region: "Šumadija", image: "images/wines/radovanović-chardonnay-selekcija.png" },
  { name: "Radovanović Sauvignon", winery: "Radovanović", price: 1180, type: "white", country: "rs", region: "Šumadija", image: "images/wines/radovanović-cabernet-sauvignon-classique.png" },
  { name: "Spasić Tamjanika", winery: "Spasić", price: 1090, type: "white", country: "rs", region: "Srbija", image: "images/wines/spasić-tamnjanika.png" },
  { name: "Temet Ergo Belo", winery: "Temet", price: 3290, type: "white", country: "rs", region: "Tri Morave" },
  { name: "Temet Tri Morave Belo", winery: "Temet", price: 1890, type: "white", country: "rs", region: "Tri Morave", image: "images/wines/temet-tri-morave-belo-0.75-l.png" },
  { name: "Tonković Tamjanika", winery: "Tonković", price: 1350, type: "white", country: "rs", region: "Srbija" },
  { name: "Trivanović Pinot Grigio", winery: "Trivanović", price: 1370, type: "white", country: "rs", region: "Srbija" },
  { name: "Varina Tamjanika", winery: "Varina", price: 1090, type: "white", country: "rs", region: "Srbija" },
  { name: "Virtus Gewürztraminer", winery: "Virtus", price: 1300, type: "white", country: "rs", region: "Srbija", image: "images/wines/virtus-gewurztraminer-0.75-l.png" },
  { name: "Virtus Mlavac Beli", winery: "Virtus", price: 790, type: "white", country: "rs", region: "Srbija" },
  { name: "Virtus Morava", winery: "Virtus", price: 1300, type: "white", country: "rs", region: "Srbija", image: "images/wines/virtus-morava.png" },
  { name: "Virtus Pinot Grigio", winery: "Virtus", price: 990, type: "white", country: "rs", region: "Srbija", image: "images/wines/virtus-pinot-grigio.png" },
  { name: "Zvonko Bogdan Pinot Blanc", winery: "Zvonko Bogdan", price: 1790, type: "white", country: "rs", region: "Subotica", image: "images/wines/zvonko-bogdan-pinot-blanc.png" },
  { name: "Zvonko Bogdan Sauvignon Blanc", winery: "Zvonko Bogdan", price: 1570, type: "white", country: "rs", region: "Subotica" },

  // 🇷🇸 SRBIJA - ROZE VINA
  { name: "Aleksandrović Roze Penušavo", winery: "Aleksandrović", price: 2060, type: "rose", country: "rs", region: "Šumadija" },
  { name: "Bjelica Evil Rose", winery: "Bjelica", price: 1320, type: "rose", country: "rs", region: "Srbija" },
  { name: "Budimir Triada Rose", winery: "Budimir", price: 1080, type: "rose", country: "rs", region: "Negotin" },
  { name: "Chichateau Pink Punk", winery: "Chichateau", price: 1370, type: "rose", country: "rs", region: "Srbija", image: "images/wines/chichateau-pink-punk.png" },
  { name: "Čilić Onyx Rose", winery: "Čilić", price: 1200, type: "rose", country: "rs", region: "Srbija" },
  { name: "Doja Rose", winery: "Doja", price: 1020, type: "rose", country: "rs", region: "Srbija" },
  { name: "Erdevik Rose Nostra", winery: "Erdevik", price: 1350, type: "rose", country: "rs", region: "Fruška Gora", image: "images/wines/erdevik-roza-nostra.png" },
  { name: "Erdevik Rose Nostra 1.5L", winery: "Erdevik", price: 2820, type: "rose", country: "rs", region: "Fruška Gora", image: "images/wines/erdevik-roza-nostra-1.5l.png" },
  { name: "Erdevik Tri Rose Koze", winery: "Erdevik", price: 810, type: "rose", country: "rs", region: "Fruška Gora" },
  { name: "Iconic Rose", winery: "Iconic", price: 1610, type: "rose", country: "rs", region: "Srbija" },
  { name: "Jović Rose Dionizije", winery: "Jović", price: 970, type: "rose", country: "rs", region: "Srbija" },
  { name: "Kovačević Rosetto", winery: "Kovačević", price: 1040, type: "rose", country: "rs", region: "Fruška Gora" },
  { name: "Kovačević Orphe Rose", winery: "Kovačević", price: 280, type: "rose", country: "rs", region: "Fruška Gora", size: "0.187l" },
  { name: "Legat Rose", winery: "Legat", price: 1220, type: "rose", country: "rs", region: "Srbija" },
  { name: "Magaza Rose", winery: "Magaza", price: 1140, type: "rose", country: "rs", region: "Srbija" },
  { name: "Porta Rose", winery: "Porta", price: 1140, type: "rose", country: "rs", region: "Srbija" },
  { name: "Pusula Rinfuz Rose 1L", winery: "Pusula", price: 470, type: "rose", country: "rs", region: "Srbija" },
  { name: "Radovanović Rose", winery: "Radovanović", price: 1180, type: "rose", country: "rs", region: "Šumadija", image: "images/wines/radovanović-rose.png" },
  { name: "Temet Tri Morave Rose", winery: "Temet", price: 1520, type: "rose", country: "rs", region: "Tri Morave", image: "images/wines/temet-tri-morave-rose-0.75-l.png" },
  { name: "Tonković Kadarka Rose", winery: "Tonković", price: 1180, type: "rose", country: "rs", region: "Srbija" },
  { name: "Trivanović Lex Rose", winery: "Trivanović", price: 1370, type: "rose", country: "rs", region: "Srbija" },
  { name: "Varina Jagoda", winery: "Varina", price: 2720, type: "rose", country: "rs", region: "Srbija" },
  { name: "Zvonko Bogdan Rose Sec", winery: "Zvonko Bogdan", price: 1430, type: "rose", country: "rs", region: "Subotica", image: "images/wines/zvonko-bogdan-rose-sec.png" },

  // 🇷🇸 SRBIJA - PENUŠAVA
  { name: "Bjelica Babaroga Penušavo", winery: "Bjelica", price: 5900, type: "sparkling", country: "rs", region: "Srbija", image: "images/wines/bjelica-babaroga-penušavac.png" },
  { name: "Monarh Immortal Cuvée", winery: "Monarh", price: 190, type: "sparkling", country: "rs", region: "Srbija", size: "0.187l" },

  // 🇷🇸 SRBIJA - BERMET / SPECIJALNA
  { name: "Belo Brdo Bermet", winery: "Belo Brdo", price: 1400, type: "special", country: "rs", region: "Fruška Gora" },
  { name: "Bermet Crveni Kis", winery: "Kis", price: 1300, type: "special", country: "rs", region: "Fruška Gora", image: "images/wines/kiš-bermet-crveni.png" },

  // ========================================
  // 🇭🇷 HRVATSKA
  // ========================================
  { name: "Bibich Babich", winery: "Bibich", price: 3140, type: "red", country: "hr", region: "Dalmacija", image: "images/wines/bibich-babich.png" },
  { name: "Bibich Bas De Bas", winery: "Bibich", price: 9500, type: "red", country: "hr", region: "Dalmacija", image: "images/wines/bibich-bas-de-bas.png" },
  { name: "Bibich R5", winery: "Bibich", price: 1990, type: "white", country: "hr", region: "Dalmacija", image: "images/wines/bibich-r5.png" },
  { name: "Bibich R6", winery: "Bibich", price: 1990, type: "red", country: "hr", region: "Dalmacija", image: "images/wines/bibich-r6.png" },
  { name: "Matuško Dingač", winery: "Matuško", price: 3450, type: "red", country: "hr", region: "Pelješac", image: "images/wines/matusko-dingac.png" },
  { name: "Matuško Dingač Reserve", winery: "Matuško", price: 5910, type: "red", country: "hr", region: "Pelješac", image: "images/wines/matusko-dingac-reserve.png" },
  { name: "Matuško Dingač Royal", winery: "Matuško", price: 9150, type: "red", country: "hr", region: "Pelješac", image: "images/wines/matusko-dingac-royal.png" },
  { name: "Matuško Postup", winery: "Matuško", price: 2800, type: "red", country: "hr", region: "Pelješac", image: "images/wines/matusko-postup.png" },
  { name: "Rnjak Cabernet", winery: "Rnjak", price: 1560, type: "red", country: "hr", region: "Hrvatska" },
  { name: "Rnjak Crveni Puz", winery: "Rnjak", price: 1810, type: "red", country: "hr", region: "Hrvatska" },
  { name: "Rnjak Cuvée De Rgnac", winery: "Rnjak", price: 1950, type: "red", country: "hr", region: "Hrvatska", image: "images/wines/rnjak-cuvee-de-rgnac.png" },
  { name: "Rnjak Pinot Noir", winery: "Rnjak", price: 2080, type: "red", country: "hr", region: "Hrvatska", image: "images/wines/rnjak-pinot-noir.png" },
  { name: "Rnjak Skala", winery: "Rnjak", price: 1810, type: "red", country: "hr", region: "Hrvatska" },
  { name: "Stina Plavac Mali", winery: "Stina", price: 2250, type: "red", country: "hr", region: "Brač", image: "images/wines/stina-plavac-mali.png" },
  { name: "Stina Plavac Mali Barrique", winery: "Stina", price: 4620, type: "red", country: "hr", region: "Brač", image: "images/wines/stina-plavac-barrique.png" },
  { name: "Zlatan Plavac", winery: "Zlatan", price: 1750, type: "red", country: "hr", region: "Hvar", image: "images/wines/zlatan-plavac.png" },
  { name: "Zlatan Plavac Premium", winery: "Zlatan", price: 2400, type: "red", country: "hr", region: "Hvar", image: "images/wines/zlatan-plavac-premium.png" },
  { name: "Fakin Teran", winery: "Fakin", price: 1890, type: "red", country: "hr", region: "Istra", image: "images/wines/fakin-teran.png" },
  { name: "Deklić Malvazija", winery: "Deklić", price: 2140, type: "white", country: "hr", region: "Istra" },
  { name: "Fakin Malvazija", winery: "Fakin", price: 1860, type: "white", country: "hr", region: "Istra", image: "images/wines/fakin-malvazija.png" },
  { name: "Festigia Malvazija", winery: "Festigia", price: 2220, type: "white", country: "hr", region: "Istra" },
  { name: "Kabola Malvazija Istarska", winery: "Kabola", price: 2090, type: "white", country: "hr", region: "Istra" },
  { name: "Kozlović Malvazija", winery: "Kozlović", price: 2600, type: "white", country: "hr", region: "Istra" },
  { name: "Meneghetti Malvazija", winery: "Meneghetti", price: 1930, type: "white", country: "hr", region: "Istra", image: "images/wines/meneghetti-malvazija.png" },
  { name: "Pošip Cara Marko Polo", winery: "Cara", price: 3410, type: "white", country: "hr", region: "Korčula" },
  { name: "Pošip Cara", winery: "Cara", price: 2500, type: "white", country: "hr", region: "Korčula" },
  { name: "Pošip Nerica", winery: "Nerica", price: 3990, type: "white", country: "hr", region: "Korčula" },
  { name: "Rnjak Chardonnay", winery: "Rnjak", price: 1300, type: "white", country: "hr", region: "Hrvatska", image: "images/wines/rnjak-chardonnay.png" },
  { name: "Rnjak Sauvignon", winery: "Rnjak", price: 1170, type: "white", country: "hr", region: "Hrvatska", image: "images/wines/rnjak-sauvignon-blanc.png" },
  { name: "Zlatna Vrbničkа Žlahtina", winery: "Zlatna", price: 1450, type: "white", country: "hr", region: "Krk" },
  { name: "MEDEA Chardonnay", winery: "MEDEA", price: 1570, type: "white", country: "hr", region: "Hrvatska", image: "images/wines/medea-chardonnay-0.75l.png" },
  { name: "MEDEA Malvazija", winery: "MEDEA", price: 1570, type: "white", country: "hr", region: "Hrvatska", image: "images/wines/medea-malvazija-istarska-0.75-l.png" },
  { name: "Meneghetti Rose", winery: "Meneghetti", price: 2060, type: "rose", country: "hr", region: "Istra", image: "images/wines/meneghetti-rose-brut.png" },
  { name: "Meneghetti Merlot", winery: "Meneghetti", price: 2180, type: "red", country: "hr", region: "Istra", image: "images/wines/meneghetti-merlot.png" },
  { name: "MEDEA Rose", winery: "MEDEA", price: 1570, type: "rose", country: "hr", region: "Hrvatska", image: "images/wines/medea-rose-0.75-l.png" },
  { name: "Rnjak Rose", winery: "Rnjak", price: 880, type: "rose", country: "hr", region: "Hrvatska" },

  // ========================================
  // 🇮🇹 ITALIJA
  // ========================================
  { name: "Antonini Nero D'Avola", winery: "Antonini", price: 840, type: "red", country: "it", region: "Sicilija" },
  { name: "Collefrisio Appasimento Rosso", winery: "Collefrisio", price: 1760, type: "red", country: "it", region: "Abruzzo" },
  { name: "Collefrisio Primitivo", winery: "Collefrisio", price: 3590, type: "red", country: "it", region: "Puglia" },
  { name: "Dolce&Gabbana Tancredi", winery: "Dolce&Gabbana", price: 5500, type: "red", country: "it", region: "Sicilija" },
  { name: "Dolce&Gabbana Isolano", winery: "Dolce&Gabbana", price: 4650, type: "red", country: "it", region: "Sicilija" },
  { name: "Lava Montepulciano", winery: "Lava", price: 1640, type: "red", country: "it", region: "Abruzzo" },
  { name: "Marina Cvetić Iskra", winery: "Marina Cvetić", price: 3660, type: "red", country: "it", region: "Abruzzo", image: "images/wines/marina-cvetic-iskra.png" },
  { name: "Marina Cvetić Iskra Riserva", winery: "Marina Cvetić", price: 4720, type: "red", country: "it", region: "Abruzzo", image: "images/wines/marina-cvetic-iskra-riserva.png" },
  { name: "Marina Cvetić Merlot", winery: "Marina Cvetić", price: 4470, type: "red", country: "it", region: "Abruzzo", image: "images/wines/marina-cvetic-merlot.png" },
  { name: "Marina Cvetić Montepulciano", winery: "Marina Cvetić", price: 4250, type: "red", country: "it", region: "Abruzzo", image: "images/wines/marina-cvetic-montepulciano.png" },
  { name: "Marina Cvetić Syrah", winery: "Marina Cvetić", price: 4100, type: "red", country: "it", region: "Abruzzo", image: "images/wines/marina-cvetic-syrah.png" },
  { name: "Marina Cvetić Trebbiano d'Abruzzo", winery: "Marina Cvetić", price: 5120, type: "white", country: "it", region: "Abruzzo", image: "images/wines/marina-cvetic-trebbiano.png" },
  { name: "Nobu Montepulciano 1830", winery: "Nobu", price: 2750, type: "red", country: "it", region: "Abruzzo" },
  { name: "Primitivo del Salento", winery: "Primitivo", price: 910, type: "red", country: "it", region: "Puglia" },
  { name: "Recastro Primitivo", winery: "Recastro", price: 1980, type: "red", country: "it", region: "Puglia" },
  { name: "Rosso Da Uve Appassite", winery: "Rosso", price: 2390, type: "red", country: "it", region: "Italija" },
  { name: "San Marzano Anniversario 62", winery: "San Marzano", price: 3580, type: "red", country: "it", region: "Puglia", image: "images/wines/san-marzano-anniversario-62-0.75-l.png" },
  { name: "San Marzano Collezione 50 Rosso", winery: "San Marzano", price: 2980, type: "red", country: "it", region: "Puglia", image: "images/wines/san-marzano-collezione-50.png" },
  { name: "San Marzano Il Pumo Negroamaro", winery: "San Marzano", price: 940, type: "red", country: "it", region: "Puglia", image: "images/wines/san-marzano-il-pumo-negroamaro-0.75-l.png" },
  { name: "San Marzano Sessantanni", winery: "San Marzano", price: 3750, type: "red", country: "it", region: "Puglia", image: "images/wines/san-marzano-sessantanni-primitivo-di-manduria-crveno-vino-0,75l.png" },
  { name: "San Marzano Talò Malvasia Nera", winery: "San Marzano", price: 1130, type: "red", country: "it", region: "Puglia", image: "images/wines/san-marzano-talo-malvasia-nera-0.75-l.png" },
  { name: "San Marzano Talò Primitivo", winery: "San Marzano", price: 1580, type: "red", country: "it", region: "Puglia", image: "images/wines/san-marzano-talo-primitivo-0.75-l.png" },
  { name: "San Marzano Talò Primitivo di Manduria", winery: "San Marzano", price: 0, type: "red", country: "it", region: "Puglia", image: "images/wines/san-marzano-talo-primitivo.png" },
  { name: "TDS Santoro Primitivo", winery: "TDS Santoro", price: 840, type: "red", country: "it", region: "Puglia" },
  { name: "Kriya Montepulciano", winery: "Kriya", price: 1290, type: "red", country: "it", region: "Abruzzo" },
  { name: "ZENATO Amarone DOCG", winery: "ZENATO", price: 6300, type: "red", country: "it", region: "Veneto", image: "images/wines/zenato-amarone.png" },
  { name: "ZENATO Amarone Riserva", winery: "ZENATO", price: 11650, type: "red", country: "it", region: "Veneto", image: "images/wines/zenato-amarone-della-valpolicella-classico-riserva-0.75-l.png" },
  { name: "ZENATO Valpolicella Ripasso", winery: "ZENATO", price: 2630, type: "red", country: "it", region: "Veneto", image: "images/wines/zenato-ripasso.png" },
  { name: "ZENATO Valpolicella Superiore", winery: "ZENATO", price: 1500, type: "red", country: "it", region: "Veneto", image: "images/wines/zenato-valpolicella-superiore-0.75l.png" },
  { name: "Collefrisio Magnolia Bianco", winery: "Collefrisio", price: 1700, type: "white", country: "it", region: "Abruzzo" },
  { name: "Gavi di Gavi", winery: "Gavi", price: 1200, type: "white", country: "it", region: "Piemonte" },
  { name: "Hofstätter Pinot Grigio", winery: "Hofstätter", price: 0, type: "white", country: "it", region: "Alto Adige" },
  { name: "Jermann Pinot Grigio", winery: "Jermann", price: 3650, type: "white", country: "it", region: "Friuli" },
  { name: "Kriya Pecorino", winery: "Kriya", price: 1290, type: "white", country: "it", region: "Abruzzo" },
  { name: "Lava Pecorino IGP", winery: "Lava", price: 1640, type: "white", country: "it", region: "Abruzzo" },
  { name: "San Marzano Edda Bianco", winery: "San Marzano", price: 1860, type: "white", country: "it", region: "Puglia", image: "images/wines/san-marzano-edda-bianco-0.75-l.png" },
  { name: "San Marzano Il Pumo Sauvignon Malvasia", winery: "San Marzano", price: 950, type: "white", country: "it", region: "Puglia", image: "images/wines/san-marzano-il-pumo-sauvignon-malvasia-0.75-l.png" },
  { name: "San Marzano Talò Fiano Salento", winery: "San Marzano", price: 1250, type: "white", country: "it", region: "Puglia", image: "images/wines/san-marzano-talo-fiano.png" },
  { name: "San Marzano Timo Vermentino", winery: "San Marzano", price: 1340, type: "white", country: "it", region: "Puglia", image: "images/wines/san-marzano-timo-vermentino-0.75-l.png" },
  { name: "TDS Santoro Chardonnay", winery: "TDS Santoro", price: 840, type: "white", country: "it", region: "Puglia" },
  { name: "Terreum Passerina", winery: "Terreum", price: 2290, type: "white", country: "it", region: "Marche" },
  { name: "ZENATO Chardonnay Garda", winery: "ZENATO", price: 1350, type: "white", country: "it", region: "Veneto", image: "images/wines/zenato-chardonnay-garda.png" },
  { name: "ZENATO Lugana San Benedetto", winery: "ZENATO", price: 1790, type: "white", country: "it", region: "Veneto", image: "images/wines/zenato-lugana-san-benedetto-0.75-l.png" },
  { name: "Dolce&Gabbana Rosa", winery: "Dolce&Gabbana", price: 4650, type: "rose", country: "it", region: "Sicilija" },
  { name: "San Marzano Tramari Rose", winery: "San Marzano", price: 1250, type: "rose", country: "it", region: "Puglia", image: "images/wines/san-marzano-tramari-rose.png" },
  { name: "ZENATO Rose San Benedetto", winery: "ZENATO", price: 1260, type: "rose", country: "it", region: "Veneto", image: "images/wines/zenato-rose-san-benedetto-0.75-l.png" },
  // Prosecco / Penušava
  { name: "Antesa Spumante Bianco", winery: "Antesa", price: 850, type: "sparkling", country: "it", region: "Italija" },
  { name: "Astoria Arzanà Cartizze", winery: "Astoria", price: 2820, type: "sparkling", country: "it", region: "Veneto", image: "images/wines/astoria-arzana-cartizze-prosecco-dry-0.75-l.png" },
  { name: "Astoria Beltà Cuvée Brut", winery: "Astoria", price: 950, type: "sparkling", country: "it", region: "Veneto" },
  { name: "Astoria Fashion Victim Diamond", winery: "Astoria", price: 1590, type: "sparkling", country: "it", region: "Veneto", image: "images/wines/astoria-fashion-victim-diamond-dry-penušavo-belo-vino-0,75l.png" },
  { name: "Astoria Fashion Victim Rose", winery: "Astoria", price: 1220, type: "sparkling", country: "it", region: "Veneto", image: "images/wines/astoria-fashion-victim-rose-dry-0.75-l.png" },
  { name: "Astoria Fashion Victim Unica", winery: "Astoria", price: 1470, type: "sparkling", country: "it", region: "Veneto" },
  { name: "Astoria Galìe Prosecco", winery: "Astoria", price: 1510, type: "sparkling", country: "it", region: "Veneto", image: "images/wines/astoria-galie-prosecco-dry-0.75-l.png" },
  { name: "Astoria Luxury Gold", winery: "Astoria", price: 1920, type: "sparkling", country: "it", region: "Veneto" },
  { name: "Astoria Prosecco Lounge", winery: "Astoria", price: 1400, type: "sparkling", country: "it", region: "Veneto" },
  { name: "Astoria Prosecco Rose", winery: "Astoria", price: 1460, type: "sparkling", country: "it", region: "Veneto", image: "images/wines/astoria-arzana-cartizze-prosecco-dry-0.75-l.png" },
  { name: "Cipriani Bellini", winery: "Cipriani", price: 2530, type: "sparkling", country: "it", region: "Veneto" },
  { name: "Moscato d'Asti", winery: "Moscato", price: 1120, type: "sparkling", country: "it", region: "Piemonte" },
  { name: "Pizzolato Prosecco Spumante DOC", winery: "Pizzolato", price: 1050, type: "sparkling", country: "it", region: "Veneto" },
  { name: "Pizzolato Prosecco Spumante Rose", winery: "Pizzolato", price: 1050, type: "sparkling", country: "it", region: "Veneto" },
  { name: "Prosecco Maschio 0.20L", winery: "Maschio", price: 395, type: "sparkling", country: "it", region: "Veneto", size: "0.20l" },
  { name: "Prosecco Valdobbiadene", winery: "Valdobbiadene", price: 1230, type: "sparkling", country: "it", region: "Veneto" },
  { name: "Rebuli Prosecco Settegrammi", winery: "Rebuli", price: 1370, type: "sparkling", country: "it", region: "Veneto" },

  // ========================================
  // 🇫🇷 FRANCUSKA
  // ========================================
  { name: "Château du Pape", winery: "Château", price: 0, type: "red", country: "fr", region: "Rhône" },
  { name: "Château Rollan de By", winery: "Château", price: 0, type: "red", country: "fr", region: "Médoc" },
  { name: "Louis Latour Chablis 1er Cru", winery: "Louis Latour", price: 5970, type: "white", country: "fr", region: "Burgundija" },
  { name: "Chablis 1er Cru Côte", winery: "Chablis", price: 5100, type: "white", country: "fr", region: "Burgundija" },
  { name: "Château d'Esclans Whispering Angel", winery: "Château d'Esclans", price: 0, type: "rose", country: "fr", region: "Provansa" },
  { name: "Miraval Rose", winery: "Miraval", price: 0, type: "rose", country: "fr", region: "Provansa" },
  { name: "Dom Pérignon", winery: "Dom Pérignon", price: 31700, type: "sparkling", country: "fr", region: "Champagne" },
  { name: "Moët & Chandon Brut Impérial", winery: "Moët & Chandon", price: 6980, type: "sparkling", country: "fr", region: "Champagne" },
  { name: "Moët & Chandon Rosé Impérial", winery: "Moët & Chandon", price: 8430, type: "sparkling", country: "fr", region: "Champagne" },
  { name: "Moët & Chandon Ice Impérial", winery: "Moët & Chandon", price: 0, type: "sparkling", country: "fr", region: "Champagne" },

  // ========================================
  // 🇪🇸 ŠPANIJA
  // ========================================
  { name: "Bayanegra Cabernet Sauvignon", winery: "Bayanegra", price: 590, type: "red", country: "es", region: "Castilla", image: "images/wines/bodegas-celaya-bayanegra-cabernet-sauvignon-0.75-l.png" },
  { name: "Demuerte One", winery: "Demuerte", price: 1110, type: "red", country: "es", region: "Yecla", image: "images/wines/demuerte-one.png" },
  { name: "Izadi Crianza", winery: "Izadi", price: 0, type: "red", country: "es", region: "Rioja" },
  { name: "Juan Gil CLIO", winery: "Juan Gil", price: 5780, type: "red", country: "es", region: "Jumilla", image: "images/wines/juan-gil-clio.png" },
  { name: "Juan Gil Godina", winery: "Juan Gil", price: 2880, type: "red", country: "es", region: "Campo de Borja", image: "images/wines/juan-gil-godina-crveno-vino-0,75-l.png" },
  { name: "Juan Gil Honoro Vera Rioja", winery: "Juan Gil", price: 1040, type: "red", country: "es", region: "Rioja", image: "images/wines/juan-gil-honoro-vera-rioja-0.75-l.png" },
  { name: "Juan Gil LAYA", winery: "Juan Gil", price: 1280, type: "red", country: "es", region: "Almansa", image: "images/wines/juan-gil-la-atalaya-crveno-vino-0,75l.png" },
  { name: "Bayanegra Sauvignon Blanc", winery: "Bayanegra", price: 590, type: "white", country: "es", region: "Castilla", image: "images/wines/bodegas-celaya-bayanegra-sauvignon-blanc-0.75-l.png" },
  { name: "Juan Gil SHAYA Verdejo", winery: "Juan Gil", price: 1530, type: "white", country: "es", region: "Rueda", image: "images/wines/juan-gil-shaya-verdejo.png" },
  { name: "Telmo Rodriguez Basa", winery: "Telmo Rodriguez", price: 0, type: "white", country: "es", region: "Rueda" },
  { name: "Bayanegra Rose", winery: "Bayanegra", price: 590, type: "rose", country: "es", region: "Castilla", image: "images/wines/bodegas-celaya-bayanegra-rose-0.75-l.png" },

  // ========================================
  // 🇨🇱 ČILE
  // ========================================
  { name: "Tarapaca GR Cabernet Sauvignon", winery: "Tarapacá", price: 2480, type: "red", country: "cl", region: "Maipo Valley", image: "images/wines/tarapaca-gr-cabernet.png" },
  { name: "Tarapaca GR Cabernet S. Black", winery: "Tarapacá", price: 4620, type: "red", country: "cl", region: "Maipo Valley", image: "images/wines/tarapaca-gr-cabernet-black.png" },
  { name: "Tarapaca GR Carménère", winery: "Tarapacá", price: 2480, type: "red", country: "cl", region: "Rapel Valley", image: "images/wines/tarapaca-gr-carmenere.png" },
  { name: "Tarapaca GR Carménère Black", winery: "Tarapacá", price: 4620, type: "red", country: "cl", region: "Rapel Valley", image: "images/wines/tarapaca-gr-carmenere-black.png" },
  { name: "Tarapaca GR Etiqueta Azul", winery: "Tarapacá", price: 5460, type: "red", country: "cl", region: "Maipo Valley", image: "images/wines/tarapaca-gr-etiqueta-azul.png" },
  { name: "Tarapaca GR Merlot", winery: "Tarapacá", price: 2480, type: "red", country: "cl", region: "Maipo Valley", image: "images/wines/tarapaca-gr-merlot.png" },
  { name: "Luis Felipe Merlot", winery: "Luis Felipe", price: 1120, type: "red", country: "cl", region: "Čile", image: "images/wines/luis-felipe-merlot.png" },

  // ========================================
  // 🇦🇷 ARGENTINA
  // ========================================
  { name: "Catena Alamos Cabernet Sauvignon", winery: "Catena", price: 1050, type: "red", country: "ar", region: "Mendoza", image: "images/wines/catena-alamos-cabernet.png" },
  { name: "Catena Alamos Malbec", winery: "Catena", price: 1120, type: "red", country: "ar", region: "Mendoza", image: "images/wines/catena-alamos-malbec.png" },
  { name: "Catena Alamos Chardonnay", winery: "Catena", price: 1050, type: "white", country: "ar", region: "Mendoza", image: "images/wines/catena-alamos-chardonnay.png" },

  // ========================================
  // 🇦🇹 AUSTRIJA
  // ========================================
  { name: "Ecker Grüner Veltliner Schlossberg", winery: "Ecker", price: 1550, type: "white", country: "at", region: "Wagram" },
  { name: "Ecker Riesling Wagram", winery: "Ecker", price: 1380, type: "white", country: "at", region: "Wagram" },
  { name: "Ecker Roter Veltliner Wagram", winery: "Ecker", price: 1300, type: "white", country: "at", region: "Wagram" },
  { name: "Friedrich Blauer Zweigelt Prestige", winery: "Friedrich", price: 1630, type: "red", country: "at", region: "Austrija", image: "images/wines/friedrich-blauer-zweigelt-prestige-0.75-l.png" },
  { name: "Friedrich Chardonnay Alte Reben", winery: "Friedrich", price: 1880, type: "white", country: "at", region: "Austrija" },
  { name: "Friedrich Welschriesling Exklusiv", winery: "Friedrich", price: 1130, type: "white", country: "at", region: "Austrija" },

  // ========================================
  // 🇸🇮 SLOVENIJA
  // ========================================
  { name: "Marjan Šimčič Pinot Grigio", winery: "Šimčič", price: 0, type: "white", country: "si", region: "Goriška Brda" },
  { name: "Verus Pinot Noir", winery: "Verus", price: 1890, type: "red", country: "si", region: "Štajerska" },
  { name: "Verus Sauvignon Blanc", winery: "Verus", price: 1440, type: "white", country: "si", region: "Štajerska" },
  { name: "San Tommaso Malvazija", winery: "San Tommaso", price: 2300, type: "white", country: "si", region: "Slovenija" },
  { name: "Galot Balerina", winery: "Galot", price: 1240, type: "white", country: "si", region: "Slovenija" },

  // ========================================
  // 🇲🇪 CRNA GORA
  // ========================================
  { name: "Plantaže 13. Jul Vladika", winery: "Plantaže", price: 1690, type: "red", country: "me", region: "Crna Gora", image: "images/wines/plantaze-vladika.png" },
  { name: "Plantaže Epoha", winery: "Plantaže", price: 1460, type: "red", country: "me", region: "Crna Gora", image: "images/wines/plantaze-epoha.png" },
  { name: "Plantaže Vranac Pro Corde", winery: "Plantaže", price: 1090, type: "red", country: "me", region: "Crna Gora", image: "images/wines/plantaze-vranac-pro-corde.png" },
  { name: "Plantaže 13. Jul Malvazija", winery: "Plantaže", price: 1050, type: "white", country: "me", region: "Crna Gora", image: "images/wines/plantaze-malvazija.png" },
  { name: "Plantaže Medun", winery: "Plantaže", price: 1190, type: "red", country: "me", region: "Crna Gora", image: "images/wines/plantaze-medun.png" },

  // ========================================
  // 🇧🇦 BOSNA I HERCEGOVINA
  // ========================================
  { name: "Brkić Žilavka", winery: "Brkić", price: 1050, type: "white", country: "ba", region: "Hercegovina", image: "images/wines/brkic-zilavka.png" },
  { name: "Nuić Blatina Barrique", winery: "Nuić", price: 1650, type: "red", country: "ba", region: "Hercegovina", image: "images/wines/nuic-blatina-barrique.png" },
  { name: "Nuić Merlot Vrhunski", winery: "Nuić", price: 1410, type: "red", country: "ba", region: "Hercegovina", image: "images/wines/nuic-merlot.png" },
  { name: "Nuić Trnjak", winery: "Nuić", price: 2280, type: "red", country: "ba", region: "Hercegovina", image: "images/wines/nuic-trnjak.png" },
  { name: "Nuić Žilavka", winery: "Nuić", price: 1050, type: "white", country: "ba", region: "Hercegovina", image: "images/wines/nuic-zilavka.png" },
  { name: "Nuić Žilavka Vrhunska", winery: "Nuić", price: 1250, type: "white", country: "ba", region: "Hercegovina", image: "images/wines/nuic-zilavka-vrhunska.png" },
  { name: "Tvrdoš Metoh", winery: "Tvrdoš", price: 1250, type: "red", country: "ba", region: "Hercegovina", image: "images/wines/tvrdos-metoh.png" },
  { name: "Tvrdoš Vranac", winery: "Tvrdoš", price: 1920, type: "red", country: "ba", region: "Hercegovina", image: "images/wines/tvrdos-vranac.png" },
  { name: "Tvrdoš Žilavka", winery: "Tvrdoš", price: 2170, type: "white", country: "ba", region: "Hercegovina", image: "images/wines/tvrdos-zilavka.png" },
  { name: "Vukoje Herceg Vranac", winery: "Vukoje", price: 2050, type: "red", country: "ba", region: "Trebinje", image: "images/wines/vukoje-herceg-vranac.png" },
  { name: "Vukoje Herceg Žilavka", winery: "Vukoje", price: 2050, type: "white", country: "ba", region: "Trebinje", image: "images/wines/vukoje-herceg-zilavka.png" },
  { name: "Vukoje Selekcija Belo", winery: "Vukoje", price: 4510, type: "white", country: "ba", region: "Trebinje", image: "images/wines/vukoje-selekcija-belo.png" },
  { name: "Vukoje Selekcija Crveno", winery: "Vukoje", price: 5270, type: "red", country: "ba", region: "Trebinje", image: "images/wines/vukoje-selekcija-crveno.png" },
  { name: "Vukoje Shiraz", winery: "Vukoje", price: 1730, type: "red", country: "ba", region: "Trebinje", image: "images/wines/vukoje-shiraz.png" },
  { name: "Vukoje Tamjanika Galerija", winery: "Vukoje", price: 1450, type: "white", country: "ba", region: "Trebinje", image: "images/wines/vukoje-tamjanika-galerija.png" },
  { name: "Vukoje Tribunia Belo", winery: "Vukoje", price: 2050, type: "white", country: "ba", region: "Trebinje", image: "images/wines/vukoje-tribunia-belo.png" },
  { name: "Vukoje Tribunia Crvena", winery: "Vukoje", price: 2330, type: "red", country: "ba", region: "Trebinje", image: "images/wines/vukoje-tribunia-crvena.png" },
  { name: "Vukoje Vranac Reserva", winery: "Vukoje", price: 3950, type: "red", country: "ba", region: "Trebinje", image: "images/wines/vukoje-vranac-reserva.png" },
  { name: "Vukoje Zlatna Crvena", winery: "Vukoje", price: 5040, type: "red", country: "ba", region: "Trebinje", image: "images/wines/vukoje-zlatna-crvena.png" },

  // ========================================
  // 🇲🇰 SEVERNA MAKEDONIJA
  // ========================================
  { name: "Tikveš Alexandria Belo", winery: "Tikveš", price: 760, type: "white", country: "mk", region: "Makedonija", image: "images/wines/tikves-alexandria-belo.png" },
  { name: "Tikveš Babuna Belo", winery: "Tikveš", price: 1660, type: "white", country: "mk", region: "Makedonija", image: "images/wines/tikves-babuna-belo.png" },
  { name: "Tikveš Babuna Crveno", winery: "Tikveš", price: 1660, type: "red", country: "mk", region: "Makedonija", image: "images/wines/tikves-babuna-crveno.png" },
  { name: "Tikveš Barovo Belo Terroir", winery: "Tikveš", price: 4480, type: "white", country: "mk", region: "Makedonija", image: "images/wines/tikves-barovo-belo.png" },
  { name: "Tikveš Barovo Crveno", winery: "Tikveš", price: 4580, type: "red", country: "mk", region: "Makedonija", image: "images/wines/tikves-barovo-crveno.png" },
  { name: "Tikveš Bela Voda", winery: "Tikveš", price: 4480, type: "white", country: "mk", region: "Makedonija", image: "images/wines/tikves-bela-voda.png" },
  { name: "Tikveš Lepovo Chardonnay", winery: "Tikveš", price: 4210, type: "white", country: "mk", region: "Makedonija", image: "images/wines/tikves-lepovo-chardonnay.png" },
  { name: "Tikveš LM Cuvée Red", winery: "Tikveš", price: 1220, type: "red", country: "mk", region: "Makedonija", image: "images/wines/tikves-lm-cuvee-red.png" },
  { name: "Tikveš LM Cuvée White", winery: "Tikveš", price: 1220, type: "white", country: "mk", region: "Makedonija", image: "images/wines/tikves-lm-cuvee-white.png" },
  { name: "Tikveš LM Tamjanika", winery: "Tikveš", price: 1230, type: "white", country: "mk", region: "Makedonija", image: "images/wines/tikves-lm-tamjanika.png" },
  { name: "Tikveš LM Vranac", winery: "Tikveš", price: 1220, type: "red", country: "mk", region: "Makedonija", image: "images/wines/tikves-lm-vranac.png" },

  // ========================================
  // 🇳🇿 NOVI ZELAND
  // ========================================
  { name: "Babich Sauvignon Blanc", winery: "Babich", price: 0, type: "white", country: "nz", region: "Marlborough" },

  // ========================================
  // RAKIJE
  // ========================================
  { name: "Bojkovčanka Dunja Premium", winery: "Bojkovčanka", price: 3880, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/bojkovcanka-dunja-premium.png" },
  { name: "Bojkovčanka Šljiva Premium", winery: "Bojkovčanka", price: 4970, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/bojkovcanka-sljiva-premium.png" },
  { name: "Bojkovčanka Viljamovka Premium", winery: "Bojkovčanka", price: 3340, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/bojkovcanka-viljamovka-premium.png" },
  { name: "Djedova Rakija Šljiva", winery: "Djedova Rakija", price: 2980, type: "rakija", country: "rs", region: "Srbija" },
  { name: "Gorda Šljiva", winery: "Gorda", price: 3680, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/gorda-šljiva-premium-0.7-l.png" },
  { name: "Gorda Šljiva Sa Kutijom", winery: "Gorda", price: 4040, type: "rakija", country: "rs", region: "Srbija" },
  { name: "Jelički Dukat Šljiva", winery: "Jelički Dukat", price: 4920, type: "rakija", country: "rs", region: "Srbija" },
  { name: "Limit Brusnica & Badem", winery: "Limit", price: 1250, type: "rakija", country: "rs", region: "Srbija" },
  { name: "Limit Čokolada & Narandža", winery: "Limit", price: 1250, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/limit-cokolada-narandza.png" },
  { name: "Limit Dunja", winery: "Limit", price: 2420, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/limit-dunja.png" },
  { name: "Limit Kruška & Viljamovka", winery: "Limit", price: 2270, type: "rakija", country: "rs", region: "Srbija" },
  { name: "Limit Nana & Ananas", winery: "Limit", price: 1250, type: "rakija", country: "rs", region: "Srbija" },
  { name: "Limit Šljiva", winery: "Limit", price: 1640, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/limit-sljiva.png" },
  { name: "Manastir Kovilj Šljiva", winery: "Manastir Kovilj", price: 3800, type: "rakija", country: "rs", region: "Srbija" },
  { name: "Momirović Vizantija Šljiva", winery: "Momirović", price: 2930, type: "rakija", country: "rs", region: "Srbija" },
  { name: "Ornament Dunja", winery: "Ornament", price: 4240, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/ornament-dunja.png" },
  { name: "Ornament Dunja LUX", winery: "Ornament", price: 4550, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/ornament-dunja-lux.png" },
  { name: "Ornament Šljiva", winery: "Ornament", price: 3320, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/ornament-sljiva.png" },
  { name: "Ornament Šljiva LUX", winery: "Ornament", price: 3620, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/ornament-sljiva-lux.png" },
  { name: "Srpska Trojka Dunja", winery: "Srpska Trojka", price: 3460, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/srpska-trojka-dunja.png" },
  { name: "Srpska Trojka Kajsija", winery: "Srpska Trojka", price: 3270, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/srpska-trojka-kajsija.png" },
  { name: "Srpska Trojka Šljiva", winery: "Srpska Trojka", price: 2900, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/srpska-trojka-sljiva.png" },
  { name: "Srpska Trojka Medena Kapljica", winery: "Srpska Trojka", price: 2440, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/srpska-trojka-medena-kapljica.png" },
  { name: "Uteha Naša", winery: "Uteha", price: 7890, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/uteha-naša.png" },
  { name: "Zarić Kraljica", winery: "Zarić", price: 3260, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/zaric-kraljica.png" },
  { name: "Zarić Kraljica Sa Kutijom", winery: "Zarić", price: 3530, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/zaric-kraljica-kutija.png" },
  { name: "Zarić Magija", winery: "Zarić", price: 3620, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/zaric-magija.png" },
  { name: "Zarić Magija Sa Kutijom", winery: "Zarić", price: 3890, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/zaric-magija-kutija.png" },
  { name: "Zarić Medena", winery: "Zarić", price: 2520, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/zaric-medena.png" },
  { name: "Zarić Nostalgija", winery: "Zarić", price: 3330, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/zaric-nostalgija.png" },
  { name: "Zarić Nostalgija Sa Kutijom", winery: "Zarić", price: 3600, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/zaric-nostalgija-kutija.png" },
  { name: "Zarić Opsesija Sa Kutijom", winery: "Zarić", price: 13900, type: "rakija", country: "rs", region: "Srbija", image: "images/wines/zaric-opsesija-kutija.png" },

  // ========================================
  // VISKI / WHISKEY
  // ========================================
  { name: "Chivas Regal 12YO 4.5L", winery: "Chivas Regal", price: 23200, type: "spirits", country: "int", region: "Škotska" },
  { name: "Johnnie Walker Blue 0.7L", winery: "Johnnie Walker", price: 33600, type: "spirits", country: "int", region: "Škotska" },
  { name: "Proper Twelve Whiskey 0.7L", winery: "Proper Twelve", price: 4600, type: "spirits", country: "int", region: "Irska" },
  { name: "Taylor's Fine Tawny Port 0.75L", winery: "Taylor's", price: 1640, type: "spirits", country: "int", region: "Portugal" },
  { name: "Tullamore Dew 0.7L", winery: "Tullamore Dew", price: 2780, type: "spirits", country: "int", region: "Irska" },

  // ========================================
  // DŽIN / GIN
  // ========================================
  { name: "Portofino Gin 0.5L", winery: "Portofino", price: 6520, type: "spirits", country: "int", region: "Italija" },
  { name: "Sinner Gin 0.7L", winery: "Sinner", price: 1560, type: "spirits", country: "int", region: "Srbija", image: "images/wines/sinner-gin.png" },
  { name: "Twin Tigers Gin 0.7L", winery: "Twin Tigers", price: 2810, type: "spirits", country: "int", region: "Srbija", image: "images/wines/twin-tigers-gin.png" },
  { name: "XiRo Gin 0.7L", winery: "XiRo", price: 1880, type: "spirits", country: "rs", region: "Srbija", image: "images/wines/xiro-ginger-gin.png" },
  { name: "XiRo Gin Jagoda 0.7L", winery: "XiRo", price: 1880, type: "spirits", country: "rs", region: "Srbija", image: "images/wines/xiro-jagoda-gin.png" },
  { name: "XiRo Gin Lavanda 0.7L", winery: "XiRo", price: 1880, type: "spirits", country: "rs", region: "Srbija", image: "images/wines/xiro-lavanda-gin.png" },
  { name: "XiRo Gin Malina 0.7L", winery: "XiRo", price: 1880, type: "spirits", country: "rs", region: "Srbija", image: "images/wines/xiro-malina-gin.png" },
  { name: "XiRo Gin Zova 0.7L", winery: "XiRo", price: 1880, type: "spirits", country: "rs", region: "Srbija", image: "images/wines/xiro-zova-gin.png" },
  { name: "XiRo Plavi Gin 0.7L", winery: "XiRo", price: 1880, type: "spirits", country: "rs", region: "Srbija" },

  // ========================================
  // LIKERI
  // ========================================
  { name: "Con Te Apple Spirit Box 0.7L", winery: "Con Te", price: 4390, type: "spirits", country: "rs", region: "Srbija", image: "images/wines/con-te-apple-spirit-box.png" },
  { name: "Srpska Trojka Liker Malina 1L", winery: "Srpska Trojka", price: 2390, type: "spirits", country: "rs", region: "Srbija", image: "images/wines/srpska-trojka-liker-malina.png" },
  { name: "Viola Verde Liker 0.7L", winery: "Viola Verde", price: 1890, type: "spirits", country: "rs", region: "Srbija" },

  // ========================================
  // DELIKATESI
  // ========================================
  { name: "Maslinovo Ulje Salvela Aurum 0.25L", winery: "Salvela", price: 1790, type: "delicacy", country: "hr", region: "Istra", image: "images/wines/salvela-aurum-extra-devičansko-maslinovo-ulje-2.png" },
  { name: "Maslinovo Ulje Salvela Bjelica 0.25L", winery: "Salvela", price: 1790, type: "delicacy", country: "hr", region: "Istra", image: "images/wines/salvela-bjelica-extra-devičansko-maslinovo-ulje-2.png" },
  { name: "Maslinovo Ulje Salvela Buža 0.25L", winery: "Salvela", price: 1790, type: "delicacy", country: "hr", region: "Istra", image: "images/wines/salvela-buža-extra-devičansko-maslinovo-ulje-2.png" },
  { name: "Njeguški Pršut list 100g", winery: "Njeguški", price: 290, type: "delicacy", country: "me", region: "Crna Gora" },
  // { name: "Med Bagremov 0.5kg", winery: "Domaći", price: 750, type: "delicacy", country: "rs", region: "Srbija" },
  // { name: "Med Livadski 0.5kg", winery: "Domaći", price: 750, type: "delicacy", country: "rs", region: "Srbija" },
];

/* Country display names and flags */
var COUNTRIES = {
  rs: { name: "Srbija", flag: "\uD83C\uDDF7\uD83C\uDDF8" },
  hr: { name: "Hrvatska", flag: "\uD83C\uDDED\uD83C\uDDF7" },
  it: { name: "Italija", flag: "\uD83C\uDDEE\uD83C\uDDF9" },
  fr: { name: "Francuska", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  es: { name: "\u0160panija", flag: "\uD83C\uDDEA\uD83C\uDDF8" },
  cl: { name: "\u010Cile", flag: "\uD83C\uDDE8\uD83C\uDDF1" },
  ar: { name: "Argentina", flag: "\uD83C\uDDE6\uD83C\uDDF7" },
  at: { name: "Austrija", flag: "\uD83C\uDDE6\uD83C\uDDF9" },
  si: { name: "Slovenija", flag: "\uD83C\uDDF8\uD83C\uDDEE" },
  me: { name: "Crna Gora", flag: "\uD83C\uDDF2\uD83C\uDDEA" },
  ba: { name: "BiH", flag: "\uD83C\uDDE7\uD83C\uDDE6" },
  mk: { name: "S. Makedonija", flag: "\uD83C\uDDF2\uD83C\uDDF0" },
  nz: { name: "Novi Zeland", flag: "\uD83C\uDDF3\uD83C\uDDFF" },
  int: { name: "Import", flag: "\uD83C\uDF0D" }
};

/* Type display config */
var TYPES = {
  red:       { label: "Crveno vino",    css: "red-wine" },
  white:     { label: "Belo vino",      css: "white-wine" },
  rose:      { label: "Roze vino",      css: "rose-wine" },
  sparkling: { label: "Penu\u0161avo",  css: "sparkling-wine" },
  special:   { label: "Specijalno",     css: "special-wine" },
  rakija:    { label: "Rakija",         css: "rakija" },
  spirits:   { label: "Žestoko",        css: "spirits" },
  delicacy:  { label: "Delikates",      css: "delicacy" }
};

/* Escape HTML specijalnih karaktera (imena sadrže &, navodnike...) */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Stabilni ID po proizvodu (slug od imena + vinarije) i lookup mapa.
   Slug umesto indeksa niza: indeks se menja brisanjem/komentarisanjem
   proizvoda, pa bi korpa u localStorage pokazivala pogrešan artikal. */
var PRODUCT_BY_ID = {};
(function () {
  function slugify(str) {
    return String(str).toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "dj")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  for (var i = 0; i < PRODUCTS.length; i++) {
    var base = slugify(PRODUCTS[i].name + "-" + PRODUCTS[i].winery);
    var id = base, n = 2;
    while (PRODUCT_BY_ID[id]) { id = base + "-" + (n++); }
    PRODUCTS[i].id = id;
    PRODUCT_BY_ID[id] = PRODUCTS[i];
  }
})();
