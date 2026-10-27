<?php
declare(strict_types=1);
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if ($path !== '/config/envio_correo.php' && preg_match('~(?:^|/)(?:\.|vendor(?:/|$)|config(?:/|$)|tools(?:/|$)|composer\.)~i', $path)) {
    http_response_code(404); exit('Not found');
}
if ($path === '/blog.html') { header('Location: /blog', true, 301); exit; }
if ($path === '/blog' || str_starts_with($path, '/blog/')) { require dirname(__DIR__) . '/blog/index.php'; return true; }
return false;
