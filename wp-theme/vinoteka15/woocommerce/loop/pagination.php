<?php
/**
 * Paginacija shop petlje — override.
 *
 * WooCommerce default (paginate_links) uvek prikaže prvu/poslednju stranu:
 * WP core klemuje end_size na minimum 1, pa se „1 … X … 17" ne može ukloniti kroz args.
 * Zato renderujemo sami: klizni prozor SUSEDNIH strana (bez prve/poslednje, bez „…").
 *
 * Zadržane WC klase (nav.woocommerce-pagination, ul.page-numbers, a.page-numbers)
 * da woo.css i AJAX filtriranje (theme.js: '.woocommerce-pagination a') rade nepromenjeni.
 *
 * @see https://docs.woocommerce.com/document/template-structure/
 */

if (!defined('ABSPATH')) exit;

$total   = (int) wc_get_loop_prop('total_pages');
$current = max(1, (int) wc_get_loop_prop('current_page'));

if ($total <= 1) return;

$window = 3;                      // koliko susednih brojeva prikazati
$half   = intdiv($window, 2);
$start  = $current - $half;
$end    = $current + $half;

// Zadrži konstantnu širinu prozora i uz ivice (npr. strana 1 → 1 2 3; strana 17 → 15 16 17)
if ($start < 1)      { $end += (1 - $start); $start = 1; }
if ($end > $total)   { $start -= ($end - $total); $end = $total; }
$start = max(1, $start);

$page_url = function ($n) {
    return remove_query_arg('add-to-cart', get_pagenum_link($n, false));
};
?>
<nav class="woocommerce-pagination">
  <ul class="page-numbers">
    <?php if ($current > 1) : ?>
      <li><a class="prev page-numbers" href="<?php echo esc_url($page_url($current - 1)); ?>" aria-label="Prethodna">←</a></li>
    <?php endif; ?>

    <?php for ($i = $start; $i <= $end; $i++) : ?>
      <?php if ($i === $current) : ?>
        <li><span aria-current="page" class="page-numbers current"><?php echo (int) $i; ?></span></li>
      <?php else : ?>
        <li><a class="page-numbers" href="<?php echo esc_url($page_url($i)); ?>"><?php echo (int) $i; ?></a></li>
      <?php endif; ?>
    <?php endfor; ?>

    <?php if ($current < $total) : ?>
      <li><a class="next page-numbers" href="<?php echo esc_url($page_url($current + 1)); ?>" aria-label="Sledeća">→</a></li>
    <?php endif; ?>
  </ul>
</nav>
