<?php
/**
 * Vinoteka 15 Milja — child tema (Blocksy)
 */

add_action('wp_enqueue_scripts', function () {
    // Google fontovi
    wp_enqueue_style(
        'v15-fonts',
        'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap',
        [],
        null
    );
    // parent stil
    wp_enqueue_style('blocksy-parent', get_template_directory_uri() . '/style.css');
    // child stilovi
    wp_enqueue_style('vinoteka15', get_stylesheet_directory_uri() . '/style.css', ['blocksy-parent'], '1.0');
    wp_enqueue_style('v15-hero', get_stylesheet_directory_uri() . '/assets/hero.css', ['vinoteka15'], '1.0');
    wp_enqueue_style('v15-products', get_stylesheet_directory_uri() . '/assets/products.css', ['vinoteka15'], '1.0');
}, 20);

/**
 * Shortcode za hero ([v15_hero]) — koristi se na početnoj strani.
 */
add_shortcode('v15_hero', function () {
    return '<section class="v15-hero">'
        . '<p class="eyebrow">Vinoteka &middot; Loznica</p>'
        . '<h1>Vino bira<br><em>strpljive.</em></h1>'
        . '<a class="v15-btn" href="' . esc_url(home_url('/shop/')) . '">Pogledaj ponudu</a>'
        . '</section>';
});
