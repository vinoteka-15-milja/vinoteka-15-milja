<?php
/**
 * Checkout Form — override.
 * Raspored: 1) Pregled porudžbine (proizvodi+iznos+dostava) gore →
 *           2) Kontakt/adresa forma → 3) Plaćanje + „Poruči" na dnu.
 * IDs/klase (#order_review, .woocommerce-checkout-review-order-table, #payment,
 * .woocommerce-checkout-payment) zadržani da WC AJAX (update_order_review) radi.
 *
 * @see https://woocommerce.com/document/template-structure/
 */

if (!defined('ABSPATH')) exit;

do_action('woocommerce_before_checkout_form', $checkout);

// Ako je registracija obavezna a korisnik nije prijavljen — WC standardna poruka.
if (!$checkout->is_registration_enabled() && $checkout->is_registration_required() && !is_user_logged_in()) {
    echo esc_html(apply_filters('woocommerce_checkout_must_be_logged_in_message', __('You must be logged in to checkout.', 'woocommerce')));
    return;
}
?>
<form name="checkout" method="post" class="checkout woocommerce-checkout v15-checkout" action="<?php echo esc_url(wc_get_checkout_url()); ?>" enctype="multipart/form-data" aria-label="<?php echo esc_attr__('Checkout', 'woocommerce'); ?>">

    <?php /* 1) PREGLED PORUDŽBINE (gore) */ ?>
    <?php do_action('woocommerce_checkout_before_order_review_heading'); ?>
    <h3 id="order_review_heading"><?php echo esc_html(v15_is_en() ? 'Your order' : 'Pregled porudžbine'); ?></h3>
    <?php do_action('woocommerce_checkout_before_order_review'); ?>
    <div id="order_review" class="woocommerce-checkout-review-order">
        <?php woocommerce_order_review(); ?>
    </div>
    <?php do_action('woocommerce_checkout_after_order_review'); ?>

    <?php /* 2) KONTAKT / ADRESA */ ?>
    <?php if ($checkout->get_checkout_fields()) : ?>
        <?php do_action('woocommerce_checkout_before_customer_details'); ?>
        <div class="col2-set" id="customer_details">
            <div class="col-1">
                <?php do_action('woocommerce_checkout_billing'); ?>
            </div>
            <div class="col-2">
                <?php do_action('woocommerce_checkout_shipping'); ?>
            </div>
        </div>
        <?php do_action('woocommerce_checkout_after_customer_details'); ?>
    <?php endif; ?>

    <?php /* 3) PLAĆANJE + „Poruči" (na dnu) */ ?>
    <div id="v15-payment-wrap">
        <?php woocommerce_checkout_payment(); ?>
    </div>

</form>
<?php do_action('woocommerce_after_checkout_form', $checkout); ?>
