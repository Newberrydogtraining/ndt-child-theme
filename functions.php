<?php
/**
 * Newberry Dog Training Child Theme functions
 */

function ndt_child_enqueue_styles() {
    $parent_style = 'parent-style';

    // Load parent theme stylesheet.
    wp_enqueue_style(
        $parent_style,
        get_template_directory_uri() . '/style.css'
    );
}
add_action( 'wp_enqueue_scripts', 'ndt_child_enqueue_styles' );
