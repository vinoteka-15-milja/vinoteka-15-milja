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

/** Price bucket-i: ključ => [label, params]. Jedini izvor istine. */
function v15_price_buckets() {
    return array(
        'do-1500'   => array('label' => 'do 1.500',    'params' => array('max_price' => '1500')),
        '1500-3000' => array('label' => '1.500–3.000', 'params' => array('min_price' => '1500', 'max_price' => '3000')),
        '3000+'     => array('label' => '3.000+',       'params' => array('min_price' => '3000')),
    );
}

/**
 * Mapiraj price-bucket ključ na WooCommerce price query args. Čista funkcija.
 */
function v15_price_params($bucket) {
    $buckets = v15_price_buckets();
    return isset($buckets[$bucket]) ? $buckets[$bucket]['params'] : array();
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

/** URL sa toggle-ovanim atribut-terminom (multi, OR). Vraća RAW URL (bez esc_url). */
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
    return add_query_arg($args, v15_shop_base_url());
}

/** URL koji postavlja/skida single var (npr. product_cat). $slug='' => skini. Vraća RAW URL (bez esc_url). */
function v15_single_url($var, $slug) {
    $args = v15_current_args();
    unset($args['paged']);
    if ($slug === '' || $slug === null) {
        unset($args[$var]);
    } else {
        $args[$var] = $slug;
    }
    return add_query_arg($args, v15_shop_base_url());
}

/** URL za price bucket (resetuje prethodni min/max). Vraća RAW URL (bez esc_url). */
function v15_price_url($bucket) {
    $args = v15_current_args();
    unset($args['paged'], $args['min_price'], $args['max_price']);
    foreach (v15_price_params($bucket) as $k => $v) {
        $args[$k] = $v;
    }
    return add_query_arg($args, v15_shop_base_url());
}

/** Koji price bucket je trenutno aktivan (za .active stanje). */
function v15_active_price_bucket() {
    $min = isset($_GET['min_price']) ? (string) wp_unslash($_GET['min_price']) : '';
    $max = isset($_GET['max_price']) ? (string) wp_unslash($_GET['max_price']) : '';
    if ($min === '' && $max === '') return 'all';
    foreach (v15_price_buckets() as $key => $b) {
        $bmin = isset($b['params']['min_price']) ? $b['params']['min_price'] : '';
        $bmax = isset($b['params']['max_price']) ? $b['params']['max_price'] : '';
        if ($bmin === $min && $bmax === $max) return $key;
    }
    return ''; // custom raspon (npr. iz druge sesije) — nijedan bucket nije „active"
}

/** Naziv termina iz sluga za chip labelu. */
function v15_term_name($taxonomy, $slug) {
    $t = get_term_by('slug', $slug, $taxonomy);
    return $t ? $t->name : $slug;
}

/** Atribut-filteri (jedini izvor istine za render i chipove). */
function v15_filter_attributes() {
    return array(
        array('label' => 'Zemlja',   'taxonomy' => 'pa_zemlja',   'filter_var' => 'filter_zemlja',   'qtype_var' => 'query_type_zemlja',   'searchable' => false),
        array('label' => 'Region',   'taxonomy' => 'pa_region',   'filter_var' => 'filter_region',   'qtype_var' => 'query_type_region',   'searchable' => true),
        array('label' => 'Vinarija', 'taxonomy' => 'pa_vinarija', 'filter_var' => 'filter_vinarija', 'qtype_var' => 'query_type_vinarija', 'searchable' => true),
    );
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
               href="<?php echo esc_url(v15_attr_toggle_url($filter_var, $qtype_var, $t->slug)); ?>"
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
      <a class="filter-btn <?php echo $cur === '' ? 'active' : ''; ?>" href="<?php echo esc_url(v15_single_url('product_cat', '')); ?>" rel="nofollow">Sve</a>
      <?php foreach ($terms as $t) : ?>
        <a class="filter-btn <?php echo $cur === $t->slug ? 'active' : ''; ?>"
           href="<?php echo esc_url(v15_single_url('product_cat', $t->slug)); ?>" rel="nofollow"><?php echo esc_html($t->name); ?></a>
      <?php endforeach; ?>
    </div>
    <?php
}

/** Render reda Cena-pilula. */
function v15_render_price_pills() {
    $active = v15_active_price_bucket();
    ?>
    <div class="filter-group-label">Cena</div>
    <div class="price-toggle">
      <a class="price-btn <?php echo $active === 'all' ? 'active' : ''; ?>" href="<?php echo esc_url(v15_price_url('all')); ?>" rel="nofollow">Sve cene</a>
      <?php foreach (v15_price_buckets() as $key => $b) : ?>
        <a class="price-btn <?php echo $active === $key ? 'active' : ''; ?>"
           href="<?php echo esc_url(v15_price_url($key)); ?>" rel="nofollow"><?php echo esc_html($b['label']); ?></a>
      <?php endforeach; ?>
    </div>
    <?php
}

/** Render aktivnih chipova (uklonjivi). */
function v15_render_chips() {
    $chips = array(); // [label, raw-url-bez-tog-filtera]

    if (!empty($_GET['product_cat'])) {
        $slug = wp_unslash($_GET['product_cat']);
        $chips[] = array(v15_term_name('product_cat', $slug), v15_single_url('product_cat', ''));
    }
    foreach (v15_filter_attributes() as $a) {
        $fvar = $a['filter_var'];
        if (empty($_GET[$fvar])) continue;
        $slugs = array_filter(array_map('trim', explode(',', wp_unslash($_GET[$fvar]))), 'strlen');
        foreach ($slugs as $slug) {
            $chips[] = array(v15_term_name($a['taxonomy'], $slug), v15_attr_toggle_url($fvar, $a['qtype_var'], $slug));
        }
    }
    $pb = v15_active_price_bucket();
    if ($pb !== 'all' && $pb !== '') {
        $buckets = v15_price_buckets();
        $chips[] = array($buckets[$pb]['label'], v15_price_url('all'));
    }
    if (!empty($_GET['s'])) {
        $args = v15_current_args(); unset($args['s'], $args['paged']);
        $chips[] = array('„' . wp_unslash($_GET['s']) . '"', add_query_arg($args, v15_shop_base_url()));
    }

    if (empty($chips)) return;
    ?>
    <div class="active-chips">
      <?php foreach ($chips as $c) : ?>
        <a class="active-chip" href="<?php echo esc_url($c[1]); ?>" rel="nofollow"><?php echo esc_html($c[0]); ?> <span class="chip-x" aria-hidden="true">×</span></a>
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
        <?php
        // Sačuvaj aktivne filtere pri pretrazi (inače bi pretraga obrisala izbor)
        $keep = v15_current_args();
        unset($keep['s'], $keep['paged'], $keep['post_type']);
        foreach ($keep as $k => $v) {
            echo '<input type="hidden" name="' . esc_attr($k) . '" value="' . esc_attr($v) . '">';
        }
        ?>
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
        <?php foreach (v15_filter_attributes() as $a) {
            v15_render_attr_dropdown($a['label'], $a['taxonomy'], $a['filter_var'], $a['qtype_var'], $a['searchable']);
        } ?>
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
