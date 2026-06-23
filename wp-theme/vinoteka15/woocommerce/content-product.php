<?php
/**
 * Kartica proizvoda u shop arhivi — naš ".wine-card" markup.
 */
if (!defined('ABSPATH')) exit;

global $product;
if (empty($product) || !$product->is_visible()) return;

$type = v15_type_from_product($product);
$winery = $product->get_attribute('Vinarija');
$region = $product->get_attribute('Region');
$zemlja = $product->get_attribute('Zemlja');
$origin_line = trim(($region ? $region : '') . ($region && $zemlja ? ', ' : '') . ($zemlja ? $zemlja : ''));
$purchasable = $product->is_purchasable() && $product->get_price() !== '';
?>
<li <?php wc_product_class('wine-card-li', $product); ?>>
  <article class="wine-card">
    <a class="wine-card-image" href="<?php echo esc_url(get_permalink()); ?>">
      <div class="wine-image-real <?php echo esc_attr($type['css']); ?>">
        <?php echo $product->get_image('woocommerce_single'); ?>
      </div>
      <?php if ($zemlja) : ?><span class="wine-origin-badge"><?php echo esc_html($zemlja); ?></span><?php endif; ?>
    </a>
    <div class="wine-card-body">
      <span class="wine-category"><?php echo esc_html($type['label']); ?></span>
      <h3 class="wine-name"><a href="<?php echo esc_url(get_permalink()); ?>"><?php echo esc_html($product->get_name()); ?></a></h3>
      <?php if ($origin_line) : ?><p class="wine-origin"><?php echo esc_html($origin_line); ?></p><?php endif; ?>
      <?php if ($winery) : ?><p class="wine-grape"><?php echo esc_html($winery); ?></p><?php endif; ?>
      <div class="wine-card-footer">
        <span class="wine-price"><?php echo $purchasable ? $product->get_price_html() : 'Na upit'; ?></span>
        <?php if ($purchasable) : ?>
          <a href="<?php echo esc_url('?add-to-cart=' . $product->get_id()); ?>"
             data-quantity="1" data-product_id="<?php echo esc_attr($product->get_id()); ?>"
             class="btn btn-primary add_to_cart_button ajax_add_to_cart" rel="nofollow">U korpu</a>
        <?php else : ?>
          <a href="<?php echo esc_url(home_url('/kontakt/')); ?>" class="btn btn-outline">Upit</a>
        <?php endif; ?>
      </div>
    </div>
  </article>
</li>
