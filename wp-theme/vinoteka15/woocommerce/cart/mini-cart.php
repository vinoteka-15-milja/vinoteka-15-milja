<?php
/** Mini-korpa (sadržaj slide-out panela). Override WC cart/mini-cart.php. */
if (!defined('ABSPATH')) exit;

do_action('woocommerce_before_mini_cart'); ?>

<?php if (!WC()->cart->is_empty()) : ?>
  <ul class="v15-minicart-list">
    <?php
    do_action('woocommerce_before_mini_cart_contents');
    foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {
        $_product = apply_filters('woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key);
        if (!$_product || !$_product->exists() || $cart_item['quantity'] <= 0
            || !apply_filters('woocommerce_widget_cart_item_visible', true, $cart_item, $cart_item_key)) {
            continue;
        }
        $product_name      = apply_filters('woocommerce_cart_item_name', $_product->get_name(), $cart_item, $cart_item_key);
        $thumbnail         = apply_filters('woocommerce_cart_item_thumbnail', $_product->get_image('woocommerce_thumbnail'), $cart_item, $cart_item_key);
        $product_price     = apply_filters('woocommerce_cart_item_price', WC()->cart->get_product_price($_product), $cart_item, $cart_item_key);
        $product_permalink = apply_filters('woocommerce_cart_item_permalink', $_product->is_visible() ? $_product->get_permalink($cart_item) : '', $cart_item, $cart_item_key);
        ?>
        <li class="v15-minicart-item mini_cart_item">
          <?php echo apply_filters('woocommerce_cart_item_remove_link', sprintf(
              '<a href="%s" class="remove remove_from_cart_button" aria-label="%s" data-product_id="%s" data-cart_item_key="%s" data-product_sku="%s">&times;</a>',
              esc_url(wc_get_cart_remove_url($cart_item_key)),
              esc_attr__('Ukloni stavku', 'woocommerce'),
              esc_attr($_product->get_id()),
              esc_attr($cart_item_key),
              esc_attr($_product->get_sku())
          ), $cart_item_key); ?>
          <a class="v15-minicart-link" href="<?php echo esc_url($product_permalink ? $product_permalink : '#'); ?>">
            <span class="v15-minicart-thumb"><?php echo wp_kses_post($thumbnail); ?></span>
            <span class="v15-minicart-name"><?php echo wp_kses_post($product_name); ?></span>
          </a>
          <span class="v15-minicart-qtyprice"><?php echo esc_html($cart_item['quantity']); ?> &times; <?php echo wp_kses_post($product_price); ?></span>
        </li>
        <?php
    }
    do_action('woocommerce_mini_cart_contents');
    ?>
  </ul>

  <p class="v15-minicart-total"><span>Ukupno</span> <strong><?php echo WC()->cart->get_cart_subtotal(); ?></strong></p>

  <p class="v15-minicart-actions">
    <a class="btn btn-outline" href="<?php echo esc_url(wc_get_cart_url()); ?>">Korpa</a>
    <a class="btn btn-primary" href="<?php echo esc_url(wc_get_checkout_url()); ?>">Na plaćanje</a>
  </p>
<?php else : ?>
  <p class="v15-minicart-empty">Korpa je prazna.</p>
<?php endif; ?>

<?php do_action('woocommerce_after_mini_cart'); ?>
