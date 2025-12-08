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

    // About page (resolved by slug to stay resilient to ID changes)
    $ndt_about_page    = get_page_by_path( 'about' );
    $ndt_about_page_id = $ndt_about_page ? (int) $ndt_about_page->ID : null;

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

    // FAQ page CSS
    if ( is_page( $ndt_faq_page_id ) || ( is_preview() && isset( $_GET['preview_id'] ) && (int) $_GET['preview_id'] === $ndt_faq_page_id ) ) {
        wp_enqueue_style(
            'ndt-faq-css',
            $theme_uri . '/assets/css/ndt-faq.css',
            array( 'ndt-global-css' ),
            $ver
        );
    }

    // Resolve About page match once for reuse
    $preview_id    = isset( $_GET['preview_id'] ) ? (int) $_GET['preview_id'] : null;
    $is_previewing = is_preview() && isset( $_GET['preview'] ) && isset( $_GET['preview_nonce'] );

    $preview_is_about = $is_previewing && (
        // Match resolved About ID when available
        ( $ndt_about_page_id && $preview_id === $ndt_about_page_id )
        // Fallback: allow any preview to load About assets if ID is unknown
        || ! $ndt_about_page_id
    );

    $request_uri  = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
    $uri_is_about = is_string( $request_uri ) && false !== strpos( $request_uri, '/about' );

    $is_about_page = is_page( $ndt_about_page_id )
        || is_page( 'about' )
        || $preview_is_about
        || $uri_is_about;

    // Service Area page CSS
    if ( is_page( $ndt_service_area_page_id ) || ( is_preview() && isset( $_GET['preview_id'] ) && (int) $_GET['preview_id'] === $ndt_service_area_page_id ) ) {
        wp_enqueue_style(
            'ndt-service-area-css',
            $theme_uri . '/assets/css/ndt-service-area.css',
            array( 'ndt-global-css' ),
            $ver
        );
    }

    // About assets (global load; use filemtime for cache-busting while iterating)
    $about_css_path = get_stylesheet_directory() . '/assets/css/ndt-about.css';
    $about_js_path  = get_stylesheet_directory() . '/assets/js/ndt-about.js';
    $about_ver_css  = file_exists( $about_css_path ) ? filemtime( $about_css_path ) : $ver;
    $about_ver_js   = file_exists( $about_js_path ) ? filemtime( $about_js_path ) : $ver;

    // About page CSS
    wp_enqueue_style(
        'ndt-about-css',
        $theme_uri . '/assets/css/ndt-about.css',
        array( 'ndt-global-css' ),
        $about_ver_css
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

    // About page behavior (load globally; JS is self-guarded by selectors)
    wp_enqueue_script(
        'ndt-about-js',
        $theme_uri . '/assets/js/ndt-about.js',
        array( 'ndt-global-js' ),
        $about_ver_js,
        true
    );
}
add_action( 'wp_enqueue_scripts', 'ndt_child_enqueue_assets' );
