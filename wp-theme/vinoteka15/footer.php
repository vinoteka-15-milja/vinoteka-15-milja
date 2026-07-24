<?php if (!defined('ABSPATH')) exit; ?>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <span class="logo-name" style="color:var(--clr-gold);font-family:var(--ff-heading);font-size:1.4rem;">Vinoteka 15 Milja</span>
        <p class="footer-tagline"><?php echo esc_html(v15_t('Vaš vinski kutak u srcu Loznice.')); ?></p>
      </div>
      <div class="footer-links">
        <h4><?php echo esc_html(v15_t('Navigacija')); ?></h4>
        <ul>
          <li><a href="<?php echo esc_url(home_url('/')); ?>"><?php echo esc_html(v15_t('Početna')); ?></a></li>
          <li><a href="<?php echo esc_url(home_url('/shop/')); ?>"><?php echo esc_html(v15_t('Vina')); ?></a></li>
          <li><a href="<?php echo esc_url(home_url('/kontakt/')); ?>"><?php echo esc_html(v15_t('Kontakt')); ?></a></li>
        </ul>
      </div>
      <div class="footer-contact">
        <h4><?php echo esc_html(v15_t('Kontakt')); ?></h4>
        <p>Žikice Jovanovića 9<br><?php echo esc_html(v15_t('15300 Loznica, Srbija')); ?></p>
        <p><a href="tel:+38163367514">+381 63 367 514</a></p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; <?php echo date('Y'); ?> <?php echo esc_html(v15_t('Vinoteka 15 Milja. Sva prava zadržana.')); ?></p>
      <nav class="footer-legal" aria-label="<?php echo esc_attr(v15_t('Pravne informacije')); ?>">
        <a href="<?php echo esc_url(home_url('/uslovi-koriscenja/')); ?>"><?php echo esc_html(v15_t('Uslovi korišćenja')); ?></a>
        <a href="<?php echo esc_url(home_url('/reklamacije/')); ?>"><?php echo esc_html(v15_t('Reklamacije')); ?></a>
        <a href="<?php echo esc_url(home_url('/privatnost/')); ?>"><?php echo esc_html(v15_t('Politika privatnosti')); ?></a>
        <a href="<?php echo esc_url(home_url('/placanje/')); ?>"><?php echo esc_html(v15_t('Plaćanje i bezbednost')); ?></a>
      </nav>
      <p class="footer-note"><?php echo esc_html(v15_t('Uživajte u vinu odgovorno. Zabranjena prodaja licima mlađim od 18 godina.')); ?></p>
    </div>
  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
