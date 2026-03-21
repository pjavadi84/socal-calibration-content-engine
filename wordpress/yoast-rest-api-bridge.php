<?php
/**
 * Plugin Name: Yoast REST API Bridge
 * Description: Enables setting Yoast SEO fields (focus keyphrase, meta description, SEO title) via the WordPress REST API. Required for the SoCal Calibration Content Engine.
 * Version: 1.0.0
 * Author: SoCal Calibration
 */

if (!defined('ABSPATH')) exit;

add_action('init', function () {
    $yoast_meta_keys = [
        '_yoast_wpseo_focuskw'  => ['type' => 'string', 'default' => ''],
        '_yoast_wpseo_metadesc' => ['type' => 'string', 'default' => ''],
        '_yoast_wpseo_title'    => ['type' => 'string', 'default' => ''],
    ];

    foreach ($yoast_meta_keys as $key => $args) {
        register_post_meta('post', $key, [
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => $args['type'],
            'default'       => $args['default'],
            'auth_callback' => function () {
                return current_user_can('edit_posts');
            },
        ]);
    }
});
