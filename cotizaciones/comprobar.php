<?php
declare(strict_types=1);

// Comprobación sin credenciales, rutas internas ni datos de la cuenta.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

echo json_encode([
    'php_funciona' => true,
    'php_compatible' => PHP_VERSION_ID >= 80000,
    'openssl_disponible' => extension_loaded('openssl'),
    'phpmailer_instalado' => is_file(__DIR__ . '/vendor/autoload.php'),
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
