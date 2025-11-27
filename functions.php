<?php
/**
 * Newberry Dog Training Child Theme functions
 */

function ndt_child_enqueue_assets() {
    // Parent theme stylesheet (Hello Elementor)
    $parent_style = 'parent-style';

    $theme_uri = get_stylesheet_directory_uri();
    $parent_uri = get_template_directory_uri();
    $ver       = wp_get_theme()->get( 'Version' );

    // Parent theme CSS
    wp_enqueue_style(
        $parent_style,
        $parent_uri . '/style.css',
        array(),
        $ver
    );

    // Child theme base stylesheet
    wp_enqueue_style(
        'ndt-child-style',
        $theme_uri . '/style.css',
        array( $parent_style ),
        $ver
    );

    // Global NDT CSS (tokens, theme mapping, global resets)
    wp_enqueue_style(
        'ndt-global-css',
        $theme_uri . '/assets/css/ndt.css',
        array( 'ndt-child-style' ),
        $ver
    );

    // Header CSS (site-wide)
    wp_enqueue_style(
        'ndt-header-css',
        $theme_uri . '/assets/css/ndt-header.css',
        array( 'ndt-global-css' ),
        $ver
    );

    // Hero / home-page CSS (hero card, services, gallery)
    wp_enqueue_style(
        'ndt-hero-css',
        $theme_uri . '/assets/css/ndt-hero.css',
        array( 'ndt-global-css' ),
        $ver
    );

    // Footer CSS (site-wide)
    wp_enqueue_style(
        'ndt-footer-css',
        $theme_uri . '/assets/css/ndt-footer.css',
        array( 'ndt-global-css' ),
        $ver
    );

    /**
     * JS
     * GSAP stack first, then global NDT helpers, then header/hero behavior.
     */

    // GSAP core
    wp_enqueue_script(
        'gsap-core',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
        array(),
        '3.12.5',
        true
    );

    // GSAP ScrollTrigger
    wp_enqueue_script(
        'gsap-scrolltrigger',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
        array( 'gsap-core' ),
        '3.12.5',
        true
    );

    // GSAP Draggable
    wp_enqueue_script(
        'gsap-draggable',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Draggable.min.js',
        array( 'gsap-core' ),
        '3.12.5',
        true
    );

    // Global NDT JS (namespace, onReady, gsap helpers)
    wp_enqueue_script(
        'ndt-global-js',
        $theme_uri . '/assets/js/ndt.js',
        array( 'gsap-core', 'gsap-scrolltrigger', 'gsap-draggable' ),
        $ver,
        true
    );

    // Header behavior (scroll, sticky etc.) site-wide
    wp_enqueue_script(
        'ndt-header-js',
        $theme_uri . '/assets/js/ndt-header.js',
        array( 'ndt-global-js' ),
        $ver,
        true
    );

    // Hero / home-page behavior (parallax, services guide, drag gallery)
    // Load on front page and on specific page ID so renaming the page does not break it.
    $ndt_home_page_id = 6075; // homev3 page ID

    if ( is_front_page() || is_page( $ndt_home_page_id ) ) {
        wp_enqueue_script(
            'ndt-hero-js',
            $theme_uri . '/assets/js/ndt-hero.js',
            array( 'ndt-global-js' ),
            $ver,
            true
        );
    }
}
add_action( 'wp_enqueue_scripts', 'ndt_child_enqueue_assets' );
