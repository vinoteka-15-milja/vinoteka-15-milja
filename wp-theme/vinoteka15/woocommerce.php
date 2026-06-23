<?php
/**
 * Wrapper za sve WooCommerce stranice (shop, proizvod, korpa, checkout, nalog).
 */
if (!defined('ABSPATH')) exit;
get_header();
?>
<section class="wines-section">
  <div class="container">
    <?php woocommerce_content(); ?>
  </div>
</section>
<?php
get_footer();
