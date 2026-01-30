<?php
/**
 * Global Email Styles & Branding Configuration
 * Used across all PHP contact and notification scripts.
 */

$BRAND = [
    'primary'   => '#213261', // Dark Navy
    'secondary' => '#3F3D91', // Indigo
    'accent'    => '#61B6DE', // Light Blue
    'success'   => '#00C853',
    'error'     => '#E1306C',
    'bg'        => '#F0F4F8',
    'white'     => '#FFFFFF',
    'text'      => '#334155',
    'gray'      => '#94A3B8',
    'border'    => '#EAEAEA'
];

$EMAIL_STYLES = [
    'body' => "font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: {$BRAND['bg']}; margin: 0; padding: 0; color: {$BRAND['text']};",
    'container' => "max-width: 600px; margin: 0 auto; background-color: {$BRAND['white']}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);",
    'header' => "background-color: {$BRAND['primary']}; padding: 40px 20px; text-align: center; color: {$BRAND['white']};",
    'content' => "padding: 40px; line-height: 1.6;",
    'button' => "display: inline-block; background-color: {$BRAND['primary']}; color: {$BRAND['white']}; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;",
    'footer' => "background-color: #FAFAFA; padding: 30px; text-align: center; font-size: 12px; color: {$BRAND['gray']}; border-top: 1px solid {$BRAND['border']};",
    'table' => "width: 100%; border-collapse: separate; border-spacing: 0; margin: 25px 0; border: 1px solid #eee; border-radius: 8px; overflow: hidden;",
    'table_label' => "padding: 12px 15px; font-weight: 600; color: #555; width: 35%; border-bottom: 1px solid #eee; background-color: #fafafa;",
    'table_value' => "padding: 12px 15px; color: #222; border-bottom: 1px solid #eee; background-color: #ffffff;",
    'card' => "background-color: #F8FAFC; border: 1px dashed {$BRAND['gray']}; border-radius: 12px; padding: 25px; margin-bottom: 25px;",
    'tip' => "background-color: #E0EFFF; border-radius: 12px; padding: 20px; margin-bottom: 25px; color: {$BRAND['secondary']};"
];
