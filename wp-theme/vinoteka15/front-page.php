<?php
/**
 * Početna strana — hero + izdvojena vina + CTA.
 */
if (!defined('ABSPATH')) exit;
get_header();
?>

<section class="hero" id="home">
  <div class="hero-content">
    <p class="hero-tagline"><?php echo esc_html(v15_t('Vinoteka · Loznica')); ?></p>
    <h1 class="hero-title"><?php echo esc_html(v15_t('Vino bira')); ?><br><span class="hero-accent"><?php echo esc_html(v15_t('strpljive.')); ?></span></h1>
    <p class="hero-description"><?php echo esc_html(v15_t('Više od 400 pažljivo odabranih etiketa iz Srbije i sveta.')); ?></p>
    <div class="hero-cta">
      <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn btn-outline"><?php echo esc_html(v15_t('Pogledaj ponudu')); ?></a>
    </div>
  </div>
</section>

<?php if (class_exists('WooCommerce')) : ?>
<section class="featured" id="featured">
  <div class="container">
    <div class="section-header">
      <span class="section-label"><?php echo esc_html(v15_t('Preporuka kuće')); ?></span>
      <h2 class="section-title"><?php echo esc_html(v15_t('Istaknuta vina')); ?></h2>
    </div>
    <ul class="products">
      <?php
      $loop = new WP_Query([
          'post_type'      => 'product',
          'posts_per_page' => 8,
          'orderby'        => 'rand',
          'meta_query'     => [[ 'key' => '_price', 'value' => 0, 'compare' => '>', 'type' => 'NUMERIC' ]],
      ]);
      if ($loop->have_posts()) {
          while ($loop->have_posts()) { $loop->the_post(); wc_get_template_part('content', 'product'); }
      }
      wp_reset_postdata();
      ?>
    </ul>
    <div class="featured-cta" style="text-align:center;margin-top:40px;">
      <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn btn-secondary"><?php echo esc_html(v15_t('Pogledaj celokupnu ponudu')); ?></a>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="quote-section">
  <div class="container">
    <blockquote class="wine-quote">
      <p><?php echo esc_html(v15_t('Vino je poezija u boci.')); ?></p>
      <cite>&mdash; Clifton Fadiman</cite>
    </blockquote>
  </div>
</section>

<?php get_footer();
