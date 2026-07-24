<?php
/**
 * Broj rezultata iznad shop petlje — override na srpski.
 * WC default je engleski („Showing all N results"); ovde srpski + ispravna množina.
 *
 * Dostupne promenljive: $total, $per_page, $current, $first, $last.
 * @see https://docs.woocommerce.com/document/template-structure/
 */

if (!defined('ABSPATH')) exit;

/* WC šalje samo $total/$per_page/$current → $first/$last računamo (kao default template). */
$current  = max(1, (int) $current);
$per_page = (int) $per_page;
$total    = (int) $total;
$first    = ($per_page * $current) - $per_page + 1;
$last     = min($total, $per_page * $current);

/* Srpska množina za „rezultat": 1/21/31… → rezultat; ostalo → rezultata. */
$rez = function ($n) {
    $n = (int) $n;
    return ($n % 10 === 1 && $n % 100 !== 11) ? 'rezultat' : 'rezultata';
};
$en = function_exists('v15_is_en') && v15_is_en();
?>
<?php if ((int) $total === 1) : ?>
  <p class="woocommerce-result-count"><?php echo $en ? 'Showing 1 result' : 'Prikazan 1 rezultat'; ?></p>
<?php elseif ($total <= $per_page || (int) $per_page === -1) : ?>
  <p class="woocommerce-result-count"><?php
    echo $en
      ? ('Showing all ' . (int) $total . ' results')
      : ('Prikazano ' . (int) $total . ' ' . esc_html($rez($total)));
  ?></p>
<?php else : ?>
  <p class="woocommerce-result-count"><?php
    echo $en
      ? ('Showing ' . (int) $first . '&ndash;' . (int) $last . ' of ' . (int) $total . ' results')
      : ('Prikazano ' . (int) $first . '&ndash;' . (int) $last . ' od ' . (int) $total . ' ' . esc_html($rez($total)));
  ?></p>
<?php endif; ?>
