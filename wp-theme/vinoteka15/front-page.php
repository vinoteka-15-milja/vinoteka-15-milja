<?php
/**
 * Početna strana — hero + izdvojena vina + CTA.
 */
if (!defined('ABSPATH')) exit;
get_header();
?>

<section class="hero" id="home">
  <div class="hero-content">
    <p class="hero-tagline">Vinoteka &middot; Loznica</p>
    <h1 class="hero-title">Vino bira<br><span class="hero-accent">strpljive.</span></h1>
    <p class="hero-description">Više od 400 pažljivo odabranih etiketa iz Srbije i sveta.</p>
    <div class="hero-cta">
      <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn btn-outline">Pogledaj ponudu</a>
    </div>
  </div>
</section>

<?php if (class_exists('WooCommerce')) : ?>
<section class="featured" id="featured">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Preporuka kuće</span>
      <h2 class="section-title">Istaknuta vina</h2>
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
      <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn btn-secondary">Pogledaj celokupnu ponudu</a>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="quote-section">
  <div class="container">
    <blockquote class="wine-quote">
      <p>Vino je poezija u boci.</p>
      <cite>&mdash; Clifton Fadiman</cite>
    </blockquote>
  </div>
</section>

<?php get_footer();
