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
        $count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0; ?>
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

<main id="content" class="site-content">
