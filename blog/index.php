<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/config/bunzy.php';
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
require_once __DIR__ . '/render.php';
$path = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$post = null; $listing = null; $tags = []; $error = null; $tag = null;
$title = 'Blog ADMINIO'; $description = 'Guías para cuidar tu edificio y tu comunidad.';
try {
    if ($path === '/blog/sitemap.xml') {
        $entries = [];
        for ($page = 1; ; $page++) {
            $result = getPosts($page, 12);
            foreach ($result['data'] as $item) {
                $entries[] = '<url><loc>' . e('https://adminio.pe/blog/' . rawurlencode($item['slug'])) . '</loc><lastmod>' . e((new DateTimeImmutable($item['updatedAt']))->format(DATE_ATOM)) . '</lastmod></url>';
            }
            if ($page >= (int) $result['pagination']['totalPages']) break;
        }
        header('Content-Type: application/xml; charset=utf-8');
        echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . implode('', $entries) . '</urlset>';
        exit;
    }
    if ($path === '/blog' || preg_match('~^/blog/tag/([^/]+)$~', $path, $match)) {
        $tag = isset($match[1]) ? rawurldecode($match[1]) : null;
        $page = filter_var($_GET['page'] ?? 1, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($page === false) { http_response_code(400); $error = 'Número de página inválido.'; }
        else {
            $listing = getPosts($page, 12, $tag); $tags = getTags();
            if ($page > max(1, (int) $listing['pagination']['totalPages'])) { http_response_code(404); $error = 'Página no encontrada.'; }
        }
    } elseif (preg_match('~^/blog/([^/]+)$~', $path, $match)) {
        $post = getPost(rawurldecode($match[1]));
        if ($post === null) { http_response_code(404); $error = 'Artículo no encontrado.'; }
        else {
            $article = bunzyMarkdown($post['markdown']);
            $title = $post['seo']['metaTitle']; $description = $post['seo']['metaDescription'];
        }
    } else { http_response_code(404); $error = 'Página no encontrada.'; }
} catch (Throwable $exception) {
    http_response_code(503); header('Retry-After: 60');
    $error = 'El blog no está disponible en este momento. Vuelve a intentarlo en unos minutos.';
    error_log('Bunzy blog request failed: ' . get_class($exception));
}
header('Content-Type: text/html; charset=utf-8');
require __DIR__ . '/view.php';
