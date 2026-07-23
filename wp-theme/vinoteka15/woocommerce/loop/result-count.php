<?php
/**
 * Broj rezultata iznad shop petlje — override na srpski.
 * WC default je engleski („Showing all N results"); ovde srpski + ispravna množina.
 *
 * Dostupne promenljive: $total, $per_page, $current, $first, $last.
 * @see https://docs.woocommerce.com/document/template-structure/
 */

if (!defined('ABSPATH')) exit;

/* Srpska množina za „rezultat": 1/21/31… → rezultat; ostalo → rezultata. */
$rez = function ($n) {
    $n = (int) $n;
    return ($n % 10 === 1 && $n % 100 !== 11) ? 'rezultat' : 'rezultata';
};
?>
<?php if ((int) $total === 1) : ?>
  <p class="woocommerce-result-count">Prikazan 1 rezultat</p>
<?php elseif ($total <= $per_page || (int) $per_page === -1) : ?>
  <p class="woocommerce-result-count"><?php echo 'Prikazano ' . (int) $total . ' ' . esc_html($rez($total)); ?></p>
<?php else : ?>
  <p class="woocommerce-result-count"><?php
    echo 'Prikazano ' . (int) $first . '&ndash;' . (int) $last
       . ' od ' . (int) $total . ' ' . esc_html($rez($total));
  ?></p>
<?php endif; ?>
