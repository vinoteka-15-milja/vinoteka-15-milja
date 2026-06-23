# Meni (O nama/Kontakt/čišćenje) + age gate 18+ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kreirati strane O nama/Kontakt + editabilan primary meni + obrisati default WP sadržaj, i dodati brendiran age gate 18+ (po sesiji) na `staging.15milja.com` (tema `vinoteka15`).

**Architecture:** Meni i strane se prave idempotentnim migracijama u `inc/setup.php` (isti obrazac kao postojeće COD/shipping). Age gate je custom: markup u `header.php`, sav CSS već u `app.css` (reuse), logika u `theme.js` (`sessionStorage`), + mali inline anti-flash skript jer se `theme.js` učitava u footeru.

**Tech Stack:** PHP (WordPress/WooCommerce), vanilla JS, CSS (reuse). PHP nema na hostu → lint preko Docker `php:8.3-cli`. Deploy FTP. Verifikacija: lint + autentifikovani `curl`.

**Reference spec:** `docs/superpowers/specs/2026-06-23-woo-meni-age-gate-design.md`

**Napomena:** WP rendering/config — nema čiste logike za unit test. „Test" po tasku = lint (`php -l` / `node --check`). Ponašanje verifikujem uživo (Task 4, controller). Sav age-gate CSS i `body.age-locked` su VEĆ u `app.css` (provereno) → nema izmena CSS-a.

---

## File Structure

- `wp-theme/vinoteka15/inc/setup.php` — **IZMENA**. +3 idempotentne migracije: `v15_setup_pages`, `v15_setup_nav_menu`, `v15_cleanup_defaults`; pozvane iz `v15_run_setup_migrations` (redosled: pages → nav → cleanup).
- `wp-theme/vinoteka15/header.php` — **IZMENA**. Age gate markup + inline anti-flash skript posle `wp_body_open()`.
- `wp-theme/vinoteka15/assets/theme.js` — **IZMENA**. Age gate IIFE (sessionStorage, Da/Ne).
- `wp-theme/vinoteka15/functions.php` — **IZMENA**. Bump `v15-main` verzije.

Kredencijali NIKAD u git/komandu inline (čitaju se iz `.secrets-wp.md`). PHP lint: `docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -l <fajl>`.

---

## Task 1: Migracije — strane, meni, čišćenje (`inc/setup.php`)

**Files:**
- Modify: `wp-theme/vinoteka15/inc/setup.php`

- [ ] **Step 1: Dodaj tri migracione funkcije**

Dodaj na kraj `wp-theme/vinoteka15/inc/setup.php` (pre zatvaranja fajla; fajl nema `?>` na kraju — dodaj funkcije posle poslednje postojeće):
```php

/** Strane O nama i Kontakt (idempotentno). */
function v15_setup_pages() {
    if (get_option('v15_pages_setup') === 'done') return;

    if (!get_page_by_path('o-nama')) {
        wp_insert_post(array(
            'post_title'   => 'O nama',
            'post_name'    => 'o-nama',
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_content' =>
                "<p>Vinoteka 15 Milja je vaš vinski kutak u srcu Loznice — mesto gde svaka boca priča svoju priču. "
              . "Od najfinijih srpskih sorti do pažljivo odabranih svetskih etiketa, naša kolekcija je kreirana za prave ljubitelje vina.</p>\n"
              . "<p>Verujemo da dobro vino spaja ljude i čini svaki trenutak posebnim. Svratite, posavetujte se sa nama i pronađite svoju sledeću omiljenu flašu.</p>",
        ));
    }

    if (!get_page_by_path('kontakt')) {
        $map = '<iframe src="https://maps.google.com/maps?q=' . rawurlencode('Žikice Jovanovića 9, Loznica') . '&output=embed" '
             . 'width="100%" height="360" style="border:0;border-radius:12px" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
        $content =
            "<p><strong>Adresa:</strong> Žikice Jovanovića 9, 15300 Loznica</p>\n"
          . "<p><strong>Telefon:</strong> <a href=\"tel:+38163367514\">+381 63 367 514</a></p>\n"
          . "<p><strong>Email:</strong> <a href=\"mailto:vinoteka15milja@gmail.com\">vinoteka15milja@gmail.com</a></p>\n"
          . "<p><strong>Radno vreme:</strong> Pon–Pet 09–20h · Sub 09–15h · Ned: zatvoreno</p>\n"
          . $map;
        wp_insert_post(array(
            'post_title'   => 'Kontakt',
            'post_name'    => 'kontakt',
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_content' => $content,
        ));
    }

    update_option('v15_pages_setup', 'done');
}

/** Editabilan primary meni „Glavni meni" (idempotentno). Pozvati POSLE v15_setup_pages. */
function v15_setup_nav_menu() {
    if (get_option('v15_nav_setup') === 'done') return;
    $name = 'Glavni meni';
    if (!wp_get_nav_menu_object($name)) {
        $menu_id = wp_create_nav_menu($name);
        if (!is_wp_error($menu_id)) {
            wp_update_nav_menu_item($menu_id, 0, array(
                'menu-item-title' => 'Početna', 'menu-item-url' => home_url('/'),
                'menu-item-type' => 'custom', 'menu-item-status' => 'publish',
            ));
            wp_update_nav_menu_item($menu_id, 0, array(
                'menu-item-title' => 'Vina', 'menu-item-url' => wc_get_page_permalink('shop'),
                'menu-item-type' => 'custom', 'menu-item-status' => 'publish',
            ));
            $onama = get_page_by_path('o-nama');
            if ($onama) wp_update_nav_menu_item($menu_id, 0, array(
                'menu-item-title' => 'O nama', 'menu-item-type' => 'post_type',
                'menu-item-object' => 'page', 'menu-item-object-id' => $onama->ID, 'menu-item-status' => 'publish',
            ));
            $kontakt = get_page_by_path('kontakt');
            if ($kontakt) wp_update_nav_menu_item($menu_id, 0, array(
                'menu-item-title' => 'Kontakt', 'menu-item-type' => 'post_type',
                'menu-item-object' => 'page', 'menu-item-object-id' => $kontakt->ID, 'menu-item-status' => 'publish',
            ));
            $locations = get_theme_mod('nav_menu_locations');
            if (!is_array($locations)) $locations = array();
            $locations['primary'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
    }
    update_option('v15_nav_setup', 'done');
}

/** Obriši default WP sadržaj: Sample Page + Hello world! (idempotentno, u trash). */
function v15_cleanup_defaults() {
    if (get_option('v15_defaults_cleaned') === 'done') return;
    $sp = get_page_by_path('sample-page');
    if ($sp && $sp->post_status !== 'trash') wp_trash_post($sp->ID);
    $hw = get_posts(array('name' => 'hello-world', 'post_type' => 'post', 'post_status' => 'any', 'numberposts' => 1));
    if (!empty($hw)) wp_trash_post($hw[0]->ID);
    update_option('v15_defaults_cleaned', 'done');
}
```

- [ ] **Step 2: Pozovi nove migracije iz `v15_run_setup_migrations`**

U `wp-theme/vinoteka15/inc/setup.php`, u funkciji `v15_run_setup_migrations()`, posle postojeće linije `v15_setup_local_pickup();` dodaj:
```php
    v15_setup_pages();
    v15_setup_nav_menu();
    v15_cleanup_defaults();
```

- [ ] **Step 3: Lint**

Run: `docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -l wp-theme/vinoteka15/inc/setup.php`
Expected: `No syntax errors detected`.

- [ ] **Step 4: Commit**

```bash
git add wp-theme/vinoteka15/inc/setup.php
git commit -m "Meni: migracije za strane O nama/Kontakt, primary meni, čišćenje default sadržaja"
```

---

## Task 2: Age gate markup u `header.php`

**Files:**
- Modify: `wp-theme/vinoteka15/header.php`

- [ ] **Step 1: Pogledaj gde je `wp_body_open()`**

Run: `grep -n "wp_body_open" wp-theme/vinoteka15/header.php`
Cilj: ubaci age gate ODMAH posle te linije, pre `<header ...>`.

- [ ] **Step 2: Dodaj age gate markup + anti-flash skript**

U `wp-theme/vinoteka15/header.php`, ODMAH posle linije `<?php wp_body_open(); ?>`, dodaj:
```php

<!-- Age gate 18+ -->
<div class="age-gate-overlay" id="age-gate">
  <div class="age-gate-modal">
    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/logo.png'); ?>" alt="Vinoteka 15 Milja" class="age-gate-logo-img">
    <div class="age-gate-brand">
      <span class="age-gate-name">Vinoteka</span>
      <span class="age-gate-sub">15 Milja</span>
    </div>
    <h2 class="age-gate-title">Dobrodošli</h2>
    <p class="age-gate-text">Ovaj sajt sadrži informacije o alkoholnim pićima.<br>Da li imate 18 ili više godina?</p>
    <div class="age-gate-buttons">
      <button class="age-gate-btn age-gate-yes" id="age-gate-yes" type="button">Da, imam 18+</button>
      <button class="age-gate-btn age-gate-no" id="age-gate-no" type="button">Ne, nemam</button>
    </div>
    <p class="age-gate-note">Ulaskom na sajt potvrđujete da imate zakonski dozvoljene godine za kupovinu alkohola.</p>
    <p class="age-gate-denied" id="age-gate-denied" style="display:none">Žao nam je — sajtu mogu pristupiti samo punoletne osobe (18+).</p>
  </div>
</div>
<script>
/* Anti-flash: theme.js je u footeru; ako je već potvrđeno, sakrij odmah (bez treperenja). */
(function(){try{
  if (sessionStorage.getItem('ageVerified') === 'true') {
    var el = document.getElementById('age-gate'); if (el) el.style.display = 'none';
  } else {
    document.body.classList.add('age-locked');
  }
}catch(e){}})();
</script>
```

- [ ] **Step 3: Lint**

Run: `docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -l wp-theme/vinoteka15/header.php`
Expected: `No syntax errors detected`.

- [ ] **Step 4: Commit**

```bash
git add wp-theme/vinoteka15/header.php
git commit -m "Age gate: markup u headeru + inline anti-flash provera sesije"
```

---

## Task 3: Age gate JS (`theme.js`) + bump verzije

**Files:**
- Modify: `wp-theme/vinoteka15/assets/theme.js`
- Modify: `wp-theme/vinoteka15/functions.php`

- [ ] **Step 1: Dodaj age gate IIFE na kraj `theme.js`**

Dodaj na kraj `wp-theme/vinoteka15/assets/theme.js`:
```javascript
/* ---- Age gate 18+ (po sesiji) ---- */
(function () {
  var overlay = document.getElementById('age-gate');
  if (!overlay) return;
  if (sessionStorage.getItem('ageVerified') === 'true') {
    overlay.style.display = 'none';
    document.body.classList.remove('age-locked');
    return;
  }
  document.body.classList.add('age-locked');
  var yes = document.getElementById('age-gate-yes');
  var no = document.getElementById('age-gate-no');
  if (yes) yes.addEventListener('click', function () {
    sessionStorage.setItem('ageVerified', 'true');
    overlay.classList.add('dismissed');
    document.body.classList.remove('age-locked');
    setTimeout(function () { overlay.style.display = 'none'; }, 500);
  });
  if (no) no.addEventListener('click', function () {
    var denied = document.getElementById('age-gate-denied');
    var title = overlay.querySelector('.age-gate-title');
    var text = overlay.querySelector('.age-gate-text');
    var buttons = overlay.querySelector('.age-gate-buttons');
    if (title) title.textContent = 'Pristup odbijen';
    if (text) text.style.display = 'none';
    if (buttons) buttons.style.display = 'none';
    if (denied) denied.style.display = 'block';
  });
})();
```

- [ ] **Step 2: Bump `v15-main` verzije u `functions.php`**

U `wp-theme/vinoteka15/functions.php` nađi `v15-main` enqueue (trenutno `'1.5'`) i povećaj na sledeću (`'1.6'`). (Proveri tačnu trenutnu vrednost pre izmene — samo povećaj.)

- [ ] **Step 3: Provere**

Run: `node --check wp-theme/vinoteka15/assets/theme.js`
Expected: exit 0 (bez ispisa).
Run: `docker run --rm -v "$PWD":/app -w /app php:8.3-cli php -l wp-theme/vinoteka15/functions.php`
Expected: `No syntax errors detected`.

- [ ] **Step 4: Commit**

```bash
git add wp-theme/vinoteka15/assets/theme.js wp-theme/vinoteka15/functions.php
git commit -m "Age gate: JS logika (sessionStorage, Da/Ne, Pristup odbijen) + bump verzije"
```

---

## Task 4: (Controller) Deploy + okini migracije + verifikacija

**Files:** nema

> Kredencijali iz `.secrets-wp.md`. Posle deploya: LiteSpeed Toolbox → Purge All.

- [ ] **Step 1: Deploy**

```bash
cd /Users/urosboskovic/Documents/Website
FTPPASS=$(awk '/## FTP/{f=1} f && /Lozinka:/{ if (match($0, /`[^`]+`/)) { print substr($0, RSTART+1, RLENGTH-2); exit } }' .secrets-wp.md)
FTPUSER='deploy@15milja.com'; FTPHOST='88.198.1.66'; THEMEDIR='staging/wp-content/themes/vinoteka15'
for f in inc/setup.php header.php assets/theme.js functions.php; do
  curl -sS --user "$FTPUSER:$FTPPASS" -T "wp-theme/vinoteka15/$f" "ftp://$FTPHOST/$THEMEDIR/$f" && echo "OK: $f" || echo "FAIL: $f"
done
```
Expected: 4× OK.

- [ ] **Step 2: Uloguj se i okini migracije (admin_init)**

```bash
WPPASS=$(awk '/## WordPress admin/{f=1} f && /Lozinka:/{ if (match($0, /`[^`]+`/)) { print substr($0, RSTART+1, RLENGTH-2); exit } }' .secrets-wp.md)
WPUSER='claude@15milja.com'; BASE='https://staging.15milja.com'; CJ=/tmp/wpcj.txt; rm -f "$CJ"
curl -s -c "$CJ" "$BASE/wp-login.php" -o /dev/null
curl -s -b "$CJ" -c "$CJ" --data-urlencode "log=$WPUSER" --data-urlencode "pwd=$WPPASS" \
  --data-urlencode "wp-submit=Log In" --data-urlencode "redirect_to=$BASE/wp-admin/" --data-urlencode "testcookie=1" "$BASE/wp-login.php" -o /dev/null
curl -s -b "$CJ" "$BASE/wp-admin/" -o /dev/null   # admin_init → migracije
echo "logged_in: $(grep -c wordpress_logged_in "$CJ")"
```
Expected: `1`.

- [ ] **Step 3: Verifikuj strane + čišćenje + meni**

```bash
echo "/o-nama/:  $(curl -s -o /dev/null -w '%{http_code}' -b "$CJ" "$BASE/o-nama/")  (200)"
echo "/kontakt/: $(curl -s -o /dev/null -w '%{http_code}' -b "$CJ" "$BASE/kontakt/")  (200)"
echo "Kontakt sadrži telefon+mapu: $(curl -s -b "$CJ" "$BASE/kontakt/" | grep -oc '367 514\|maps.google')"
echo "O nama sadrži tekst: $(curl -s -b "$CJ" "$BASE/o-nama/" | grep -oc 'priča svoju priču')"
echo "/sample-page/: $(curl -s -o /dev/null -w '%{http_code}' -b "$CJ" "$BASE/sample-page/")  (404)"
echo "hello-world:   $(curl -s -o /dev/null -w '%{http_code}' -b "$CJ" "$BASE/hello-world/")  (404)"
```
Expected: o-nama/kontakt = 200 (+sadržaj), sample-page/hello-world = 404.

- [ ] **Step 4: Verifikuj age gate markup**

```bash
echo "age-gate na početnoj: $(curl -s -b "$CJ" "$BASE/" | grep -c 'id=\"age-gate\"') (>0)"
echo "age gate dugmad: $(curl -s -b "$CJ" "$BASE/" | grep -oc 'age-gate-yes\|age-gate-no')"
echo "anti-flash skript: $(curl -s -b "$CJ" "$BASE/" | grep -c 'ageVerified') (>0)"
```
Expected: sve > 0.

- [ ] **Step 5: Purge keš**

wp-admin → LiteSpeed Cache → Toolbox → Purge All.

Ako primary meni nije „uhvatio" (front-end i dalje fallback): proveri `Appearance → Menus` da je „Glavni meni" dodeljen na Primary; fallback u `header.php` svejedno prikazuje ispravne stavke pa nije blokirajuće.

---

## Task 5: (Controller) Dokumentacija + merge

**Files:**
- Modify: `PROJEKAT.md`
- Modify: `/Users/urosboskovic/.claude/projects/-Users-urosboskovic-Documents-Website/memory/vinoteka-woocommerce-stanje.md`

- [ ] **Step 1: Ažuriraj PROJEKAT.md §0**

Označi „Sledeći koraci" tačke 3 (meni) i 4 (age gate) kao URAĐENO; zabeleži: strane O nama/Kontakt kreirane, primary meni postavljen, Sample Page/Hello world obrisani, brendiran age gate (po sesiji).

- [ ] **Step 2: Ažuriraj memory fajl**

„Gde smo stali": meni + age gate gotovi; ostaje Faza 3 (BACS, dostava po težini, pravne stranice, SMTP) i Faza 5 (staging→produkcija).

- [ ] **Step 3: Commit**

```bash
git add PROJEKAT.md
git commit -m "PROJEKAT: meni (O nama/Kontakt) + age gate 18+ urađeno"
```

- [ ] **Step 4: Završi granu**

Koristi superpowers:finishing-a-development-branch (merge na main lokalno, bez push-a — kao i dosad).

---

## Self-Review (sproveden)

- **Pokrivenost spec-a:** A meni/strane: `v15_setup_pages` (O nama+Kontakt+map), `v15_setup_nav_menu` (primary meni), `v15_cleanup_defaults` (Sample Page/Hello world) — Task 1 ✓. B age gate: markup+anti-flash (Task 2), JS sessionStorage/Da/Ne/denied (Task 3), CSS reuse iz app.css (bez izmena, provereno) ✓. Verifikacija sa konkretnim proverama (Task 4) ✓.
- **Placeholder skan:** sadržaj strana (tekst, radno vreme) je konkretan default koji vlasnik može urediti u wp-adminu — nije plan-rupa. Verzija bump traži čitanje trenutne vrednosti (eksplicitno). „<lozinka iz .secrets-wp.md>" namerno. Nema TODO/„slično kao".
- **Konzistentnost:** ID-jevi/klase u `header.php` markup-u (`age-gate`, `age-gate-yes`, `age-gate-no`, `age-gate-denied`, `age-gate-title`, `age-gate-text`, `age-gate-buttons`) isti u `theme.js`; `body.age-locked` isti u inline skriptu, `theme.js`, i `app.css` (postoji). Migracije pozvane redom pages→nav→cleanup (nav zavisi od strana). Flag imena (`v15_pages_setup`/`v15_nav_setup`/`v15_defaults_cleaned`) jedinstvena.
- **Rizici označeni:** primary meni dodela preko `set_theme_mod` — ako ne uhvati, `header.php` fallback radi (Task 4 napomena). Maps embed bez API ključa — ako se ne učita, kontakt info je tekstualno tu.
