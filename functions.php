<?php
/**
 * Newberry Dog Training Child Theme functions
 */

function ndt_child_enqueue_assets() {
    // Parent theme stylesheet (Hello Elementor)
    $parent_style = 'parent-style';

    $theme_uri  = get_stylesheet_directory_uri();
    $parent_uri = get_template_directory_uri();
    $ver        = wp_get_theme()->get( 'Version' );

    // Page IDs
    $ndt_home_page_id          = 6075;
    $ndt_faq_page_id           = 2028;
    $ndt_services_page_id      = 10135;
    $ndt_service_area_page_id  = 10171;

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

    // Services carousel CSS (site-wide for now)
    wp_enqueue_style(
        'ndt-services-css',
        $theme_uri . '/assets/css/ndt-services.css',
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

    // Evaluation modal (site-wide)
    wp_enqueue_style(
        'ndt-eval-form-css',
        $theme_uri . '/assets/css/ndt-evaluation-form.css',
        array( 'ndt-global-css' ),
        $ver
    );

    // Hero combo card CSS (separate file, loads only where hero runs)
    if ( is_front_page() || is_page( $ndt_home_page_id ) ) {
        wp_enqueue_style(
            'ndt-hero-combo-card-css',
            $theme_uri . '/assets/css/ndt-hero-combo-card.css',
            array( 'ndt-hero-css' ),
            $ver
        );
    }

    // FAQ page CSS
    if ( is_page( $ndt_faq_page_id ) || ( is_preview() && isset( $_GET['preview_id'] ) && (int) $_GET['preview_id'] === $ndt_faq_page_id ) ) {
        wp_enqueue_style(
            'ndt-faq-css',
            $theme_uri . '/assets/css/ndt-faq.css',
            array( 'ndt-global-css' ),
            $ver
        );
    }

    // Service Area page CSS
    if ( is_page( $ndt_service_area_page_id ) || ( is_preview() && isset( $_GET['preview_id'] ) && (int) $_GET['preview_id'] === $ndt_service_area_page_id ) ) {
        wp_enqueue_style(
            'ndt-service-area-css',
            $theme_uri . '/assets/css/ndt-service-area.css',
            array( 'ndt-global-css' ),
            $ver
        );
    }

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

    // Evaluation modal behavior (site-wide)
    wp_enqueue_script(
        'ndt-eval-form-js',
        $theme_uri . '/assets/js/ndt-evaluation-form.js',
        array(),
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

    // Services carousel behavior (site-wide for now)
    wp_enqueue_script(
        'ndt-services-js',
        $theme_uri . '/assets/js/ndt-services.js',
        array( 'ndt-global-js' ),
        $ver,
        true
    );

    // Hero / home-page behavior (parallax, services guide, drag gallery)
    if ( is_front_page() || is_page( $ndt_home_page_id ) ) {
        wp_enqueue_script(
            'ndt-hero-js',
            $theme_uri . '/assets/js/ndt-hero.js',
            array( 'ndt-global-js' ),
            $ver,
            true
        );
    }

    // FAQ behavior
    if ( is_page( $ndt_faq_page_id ) || ( is_preview() && isset( $_GET['preview_id'] ) && (int) $_GET['preview_id'] === $ndt_faq_page_id ) ) {
        wp_enqueue_script(
            'ndt-faq-js',
            $theme_uri . '/assets/js/ndt-faq.js',
            array( 'ndt-global-js' ),
            $ver,
            true
        );
    }

    // Services page behavior
    if ( is_page( $ndt_services_page_id ) || ( is_preview() && isset( $_GET['preview_id'] ) && (int) $_GET['preview_id'] === $ndt_services_page_id ) ) {
        wp_enqueue_style(
            'ndt-services-page-css',
            $theme_uri . '/assets/css/ndt-services-page.css',
            array( 'ndt-global-css' ),
            $ver
        );
        wp_enqueue_script(
            'ndt-services-page-js',
            $theme_uri . '/assets/js/ndt-services-page.js',
            array( 'ndt-global-js' ),
            $ver,
            true
        );
    }

    // Service Area page behavior
    if ( is_page( $ndt_service_area_page_id ) || ( is_preview() && isset( $_GET['preview_id'] ) && (int) $_GET['preview_id'] === $ndt_service_area_page_id ) ) {
        wp_enqueue_script(
            'ndt-service-area-js',
            $theme_uri . '/assets/js/ndt-service-area.js',
            array( 'ndt-global-js' ),
            $ver,
            true
        );
    }
}
add_action( 'wp_enqueue_scripts', 'ndt_child_enqueue_assets' );
