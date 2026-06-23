<?php
/**
 * Vinoteka 15 — katalog filteri (logika + rendering).
 * SAMO definicije funkcija (bez top-level WP poziva) — da bi fajl bio testabilan standalone.
 */
if (!defined('ABSPATH')) exit;

/**
 * Toggle slug u/iz zarezom-razdvojene liste. Čista funkcija.
 */
function v15_csv_toggle($csv, $value) {
    $parts = array_values(array_filter(array_map('trim', explode(',', (string) $csv)), 'strlen'));
    $idx = array_search($value, $parts, true);
    if ($idx === false) {
        $parts[] = $value;
    } else {
        unset($parts[$idx]);
    }
    return implode(',', $parts);
}

/**
 * Mapiraj price-bucket ključ na WooCommerce price query args. Čista funkcija.
 */
function v15_price_params($bucket) {
    switch ($bucket) {
        case 'do-1500':   return ['max_price' => '1500'];
        case '1500-3000': return ['min_price' => '1500', 'max_price' => '3000'];
        case '3000+':     return ['min_price' => '3000'];
        default:          return [];
    }
}

/** Bazni shop URL (bez query-ja). */
function v15_shop_base_url() {
    return wc_get_page_permalink('shop');
}

/** Trenutni $_GET kao čist niz (unslashed). */
function v15_current_args() {
    $args = array();
    foreach ($_GET as $k => $v) {
        if (is_array($v)) continue; // naši filteri su uvek skalarni
        $args[$k] = wp_unslash($v);
    }
    return $args;
}

/** Da li je slug izabran u datom filter varu. */
function v15_is_selected($var, $slug) {
    if (empty($_GET[$var])) return false;
    $vals = array_map('trim', explode(',', wp_unslash($_GET[$var])));
    return in_array($slug, $vals, true);
}

/** URL sa toggle-ovanim atribut-terminom (multi, OR). */
function v15_attr_toggle_url($filter_var, $qtype_var, $slug) {
    $current = isset($_GET[$filter_var]) ? wp_unslash($_GET[$filter_var]) : '';
    $next = v15_csv_toggle($current, $slug);
    $args = v15_current_args();
    unset($args['paged']);
    if ($next === '') {
        unset($args[$filter_var], $args[$qtype_var]);
    } else {
        $args[$filter_var] = $next;
        $args[$qtype_var]  = 'or';
    }
    return esc_url(add_query_arg($args, v15_shop_base_url()));
}

/** URL koji postavlja/skida single var (npr. product_cat). $slug='' => skini. */
function v15_single_url($var, $slug) {
    $args = v15_current_args();
    unset($args['paged']);
    if ($slug === '' || $slug === null) {
        unset($args[$var]);
    } else {
        $args[$var] = $slug;
    }
    return esc_url(add_query_arg($args, v15_shop_base_url()));
}

/** URL za price bucket (resetuje prethodni min/max). */
function v15_price_url($bucket) {
    $args = v15_current_args();
    unset($args['paged'], $args['min_price'], $args['max_price']);
    foreach (v15_price_params($bucket) as $k => $v) {
        $args[$k] = $v;
    }
    return esc_url(add_query_arg($args, v15_shop_base_url()));
}

/** Koji price bucket je trenutno aktivan (za .active stanje). */
function v15_active_price_bucket() {
    $min = isset($_GET['min_price']) ? (string) wp_unslash($_GET['min_price']) : '';
    $max = isset($_GET['max_price']) ? (string) wp_unslash($_GET['max_price']) : '';
    if ($min === '' && $max === '') return 'all';
    if ($min === '' && $max === '1500') return 'do-1500';
    if ($min === '1500' && $max === '3000') return '1500-3000';
    if ($min === '3000' && $max === '') return '3000+';
    return ''; // custom raspon (npr. iz druge sesije) — nijedan bucket nije „active"
}

/** Naziv termina iz sluga za chip labelu. */
function v15_term_name($taxonomy, $slug) {
    $t = get_term_by('slug', $slug, $taxonomy);
    return $t ? $t->name : $slug;
}

/** Render jednog atribut-dropdowna (Zemlja/Region/Vinarija). */
function v15_render_attr_dropdown($label, $taxonomy, $filter_var, $qtype_var, $searchable = false) {
    $terms = get_terms(array('taxonomy' => $taxonomy, 'hide_empty' => true, 'orderby' => 'name'));
    if (is_wp_error($terms) || empty($terms)) return;

    $selected = array();
    if (!empty($_GET[$filter_var])) {
        $selected = array_map('trim', explode(',', wp_unslash($_GET[$filter_var])));
    }
    $count = count(array_filter($selected, 'strlen'));
    ?>
    <details class="filter-dropdown" data-filter="<?php echo esc_attr($filter_var); ?>">
      <summary class="filter-dropdown-trigger">
        <?php echo esc_html($label); ?><?php if ($count) : ?> (<?php echo (int) $count; ?>)<?php endif; ?>
        <span class="filter-caret" aria-hidden="true">▾</span>
      </summary>
      <div class="filter-dropdown-panel">
        <?php if ($searchable) : ?>
          <input type="text" class="filter-list-search" placeholder="Pretraži…" autocomplete="off" aria-label="Pretraži u listi">
        <?php endif; ?>
        <div class="filter-term-list">
          <?php foreach ($terms as $t) :
              $is = in_array($t->slug, $selected, true); ?>
            <a class="filter-term <?php echo $is ? 'active' : ''; ?>"
               href="<?php echo v15_attr_toggle_url($filter_var, $qtype_var, $t->slug); ?>"
               rel="nofollow"
               data-name="<?php echo esc_attr(mb_strtolower($t->name)); ?>">
              <span class="filter-term-box" aria-hidden="true"></span>
              <span class="filter-term-name"><?php echo esc_html($t->name); ?></span>
            </a>
          <?php endforeach; ?>
        </div>
      </div>
    </details>
    <?php
}

/** Render reda Vrsta-pilula (kategorije). */
function v15_render_category_pills() {
    $terms = get_terms(array('taxonomy' => 'product_cat', 'hide_empty' => true, 'orderby' => 'name'));
    if (is_wp_error($terms)) return;
    $cur = isset($_GET['product_cat']) ? wp_unslash($_GET['product_cat']) : '';
    ?>
    <div class="filter-group-label">Vrsta</div>
    <div class="wine-filters">
      <a class="filter-btn <?php echo $cur === '' ? 'active' : ''; ?>" href="<?php echo v15_single_url('product_cat', ''); ?>" rel="nofollow">Sve</a>
      <?php foreach ($terms as $t) : ?>
        <a class="filter-btn <?php echo $cur === $t->slug ? 'active' : ''; ?>"
           href="<?php echo v15_single_url('product_cat', $t->slug); ?>" rel="nofollow"><?php echo esc_html($t->name); ?></a>
      <?php endforeach; ?>
    </div>
    <?php
}

/** Render reda Cena-pilula. */
function v15_render_price_pills() {
    $active = v15_active_price_bucket();
    $buckets = array(
        'all'       => 'Sve cene',
        'do-1500'   => 'do 1.500',
        '1500-3000' => '1.500–3.000',
        '3000+'     => '3.000+',
    );
    ?>
    <div class="filter-group-label">Cena</div>
    <div class="price-toggle">
      <?php foreach ($buckets as $key => $lbl) : ?>
        <a class="price-btn <?php echo $active === $key ? 'active' : ''; ?>"
           href="<?php echo v15_price_url($key); ?>" rel="nofollow"><?php echo esc_html($lbl); ?></a>
      <?php endforeach; ?>
    </div>
    <?php
}

/** Render aktivnih chipova (uklonjivi). */
function v15_render_chips() {
    $chips = array(); // [label, url-bez-tog-filtera]

    if (!empty($_GET['product_cat'])) {
        $slug = wp_unslash($_GET['product_cat']);
        $chips[] = array(v15_term_name('product_cat', $slug), v15_single_url('product_cat', ''));
    }
    $attr_map = array(
        'filter_zemlja'   => array('pa_zemlja', 'query_type_zemlja'),
        'filter_region'   => array('pa_region', 'query_type_region'),
        'filter_vinarija' => array('pa_vinarija', 'query_type_vinarija'),
    );
    foreach ($attr_map as $fvar => $info) {
        if (empty($_GET[$fvar])) continue;
        $slugs = array_filter(array_map('trim', explode(',', wp_unslash($_GET[$fvar]))), 'strlen');
        foreach ($slugs as $slug) {
            $chips[] = array(v15_term_name($info[0], $slug), v15_attr_toggle_url($fvar, $info[1], $slug));
        }
    }
    $pb = v15_active_price_bucket();
    if ($pb !== 'all' && $pb !== '') {
        $labels = array('do-1500' => 'do 1.500', '1500-3000' => '1.500–3.000', '3000+' => '3.000+');
        $chips[] = array($labels[$pb], v15_price_url('all'));
    }
    if (!empty($_GET['s'])) {
        $args = v15_current_args(); unset($args['s'], $args['paged']);
        $chips[] = array('„' . wp_unslash($_GET['s']) . '"', esc_url(add_query_arg($args, v15_shop_base_url())));
    }

    if (empty($chips)) return;
    ?>
    <div class="active-chips">
      <?php foreach ($chips as $c) : ?>
        <a class="active-chip" href="<?php echo $c[1]; ?>" rel="nofollow"><?php echo esc_html($c[0]); ?> <span class="chip-x" aria-hidden="true">×</span></a>
      <?php endforeach; ?>
      <a class="active-chip chip-clear" href="<?php echo esc_url(v15_shop_base_url()); ?>" rel="nofollow">Poništi sve</a>
    </div>
    <?php
}

/** Glavni render: search + traka filtera. Kači se na woocommerce_before_shop_loop. */
function v15_render_filters() {
    ?>
    <div class="catalog-controls">
      <form class="wine-search" role="search" method="get" action="<?php echo esc_url(v15_shop_base_url()); ?>">
        <input type="text" name="s" value="<?php echo isset($_GET['s']) ? esc_attr(wp_unslash($_GET['s'])) : ''; ?>"
               placeholder="Pretraži po nazivu ili vinariji…" autocomplete="off">
        <input type="hidden" name="post_type" value="product">
      </form>
      <button class="mobile-filter-toggle" id="mobile-filter-toggle" type="button" aria-expanded="false" aria-controls="filters-panel">Filteri</button>
    </div>

    <div class="filters-overlay" id="filters-overlay"></div>
    <div class="filters-panel" id="filters-panel">
      <div class="filters-panel-head">
        <span class="filters-panel-title">Filteri</span>
        <button class="filters-close" id="filters-close" type="button" aria-label="Zatvori filtere">×</button>
      </div>

      <?php v15_render_category_pills(); ?>

      <div class="filter-group-label">Poreklo</div>
      <div class="filter-dropdowns">
        <?php
        v15_render_attr_dropdown('Zemlja', 'pa_zemlja', 'filter_zemlja', 'query_type_zemlja', false);
        v15_render_attr_dropdown('Region', 'pa_region', 'filter_region', 'query_type_region', true);
        v15_render_attr_dropdown('Vinarija', 'pa_vinarija', 'filter_vinarija', 'query_type_vinarija', true);
        ?>
      </div>

      <?php v15_render_price_pills(); ?>

      <div class="filters-panel-actions">
        <a class="filters-reset" href="<?php echo esc_url(v15_shop_base_url()); ?>" rel="nofollow">Poništi sve</a>
        <button class="filters-apply" id="filters-apply" type="button">Prikaži rezultate</button>
      </div>
    </div>

    <?php v15_render_chips(); ?>
    <?php
}
