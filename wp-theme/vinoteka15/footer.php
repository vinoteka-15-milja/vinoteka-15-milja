<?php if (!defined('ABSPATH')) exit; ?>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <span class="logo-name" style="color:var(--clr-gold);font-family:var(--ff-heading);font-size:1.4rem;">Vinoteka 15 Milja</span>
        <p class="footer-tagline">Vaš vinski kutak u srcu Loznice.</p>
      </div>
      <div class="footer-links">
        <h4>Navigacija</h4>
        <ul>
          <li><a href="<?php echo esc_url(home_url('/')); ?>">Početna</a></li>
          <li><a href="<?php echo esc_url(home_url('/shop/')); ?>">Vina</a></li>
          <li><a href="<?php echo esc_url(home_url('/kontakt/')); ?>">Kontakt</a></li>
        </ul>
      </div>
      <div class="footer-contact">
        <h4>Kontakt</h4>
        <p>Žikice Jovanovića 9<br>15300 Loznica, Srbija</p>
        <p><a href="tel:+38163367514">+381 63 367 514</a></p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; <?php echo date('Y'); ?> Vinoteka 15 Milja. Sva prava zadržana.</p>
      <p class="footer-note">Uživajte u vinu odgovorno. Zabranjena prodaja licima mlađim od 18 godina.</p>
    </div>
  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
