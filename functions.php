<?php
/**
 * Newberry Dog Training Child Theme functions
 */

function ndt_child_enqueue_assets() {
    // Parent theme stylesheet (Hello Elementor)
    $parent_style = 'parent-style';

    wp_enqueue_style(
        $parent_style,
        get_template_directory_uri() . '/style.css'
    );

    // Child theme base stylesheet
    wp_enqueue_style(
        'ndt-child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array( $parent_style ),
        wp_get_theme()->get( 'Version' )
    );

    // Global NDT CSS (all custom sections live here)
    wp_enqueue_style(
        'ndt-global-css',
        get_stylesheet_directory_uri() . '/assets/css/ndt.css',
        array( 'ndt-child-style' ),
        wp_get_theme()->get( 'Version' )
    );

    // Global NDT JS
    wp_enqueue_script(
        'ndt-global-js',
        get_stylesheet_directory_uri() . '/assets/js/ndt.js',
        array(), // add 'jquery' here if you ever actually need it
        wp_get_theme()->get( 'Version' ),
        true
    );
}
add_action( 'wp_enqueue_scripts', 'ndt_child_enqueue_assets' );
