<?php if (!defined('ABSPATH')) exit; ?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

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

<header class="site-header scrolled" id="site-header">
  <div class="container header-inner">
    <a href="<?php echo esc_url(home_url('/')); ?>" class="logo">
      <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/logo.png'); ?>" alt="Vinoteka 15 Milja" class="logo-img">
      <div class="logo-text">
        <span class="logo-name">Vinoteka</span>
        <span class="logo-sub">15 Milja</span>
      </div>
    </a>

    <nav class="main-nav" id="main-nav" aria-label="Glavna navigacija">
      <?php
      if (has_nav_menu('primary')) {
          wp_nav_menu([
              'theme_location' => 'primary',
              'container' => false,
              'menu_class' => 'nav-list',
          ]);
      } else {
          echo '<ul class="nav-list">'
             . '<li><a class="nav-link" href="' . esc_url(home_url('/')) . '">Početna</a></li>'
             . '<li><a class="nav-link" href="' . esc_url(home_url('/shop/')) . '">Vina</a></li>'
             . '<li><a class="nav-link" href="' . esc_url(home_url('/o-nama/')) . '">O nama</a></li>'
             . '<li><a class="nav-link" href="' . esc_url(home_url('/kontakt/')) . '">Kontakt</a></li>'
             . '</ul>';
      }
      ?>
    </nav>

    <div class="header-actions">
      <?php if (class_exists('WooCommerce')) :
        $v15_s = isset($_GET['s']) ? wp_unslash($_GET['s']) : '';
        $count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0; ?>
        <form class="header-search<?php echo $v15_s !== '' ? ' open' : ''; ?>" id="header-search" role="search" method="get" action="<?php echo esc_url(wc_get_page_permalink('shop')); ?>">
          <input type="hidden" name="post_type" value="product">
          <input type="text" name="s" class="header-search-input" value="<?php echo esc_attr($v15_s); ?>" placeholder="Pretraži vina…" autocomplete="off" aria-label="Pretraži vina">
          <button type="button" class="header-search-btn" id="header-search-btn" aria-label="Pretraga" aria-expanded="<?php echo $v15_s !== '' ? 'true' : 'false'; ?>">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
        </form>
        <a class="cart-toggle" href="<?php echo esc_url(wc_get_cart_url()); ?>" aria-label="Korpa">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="cart-count" id="cart-count"<?php if ($count == 0) echo ' hidden'; ?>><?php echo esc_html($count); ?></span>
        </a>
      <?php endif; ?>
      <button class="mobile-toggle" id="mobile-toggle" aria-label="Meni" aria-expanded="false">
        <span class="hamburger-line"></span><span class="hamburger-line"></span><span class="hamburger-line"></span>
      </button>
    </div>
  </div>
</header>

<?php if (class_exists('WooCommerce')) : ?>
<div class="v15-minicart-overlay" id="minicart-overlay"></div>
<aside class="v15-minicart" id="minicart" aria-label="Korpa" aria-hidden="true">
  <div class="v15-minicart-head">
    <span class="v15-minicart-title">Korpa</span>
    <button class="v15-minicart-close" id="minicart-close" type="button" aria-label="Zatvori korpu">&times;</button>
  </div>
  <div class="widget_shopping_cart_content"><?php woocommerce_mini_cart(); ?></div>
</aside>
<?php endif; ?>

<main id="content" class="site-content">
