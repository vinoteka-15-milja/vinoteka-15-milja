<?php if (!defined('ABSPATH')) exit; get_header(); ?>
<section class="wines-section">
  <div class="container">
    <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
      <article <?php post_class(); ?>>
        <h1 class="section-title"><?php the_title(); ?></h1>
        <div class="entry-content"><?php the_content(); ?></div>
      </article>
    <?php endwhile; else : ?>
      <h1 class="section-title">Nema sadržaja</h1>
    <?php endif; ?>
  </div>
</section>
<?php get_footer();
