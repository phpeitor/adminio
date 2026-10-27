<?php
declare(strict_types=1);
require dirname(__DIR__) . '/blog/render.php';
function verify(bool $condition, string $name): void {
    if (!$condition) throw new RuntimeException($name);
    echo 'PASS: ' . $name . PHP_EOL;
}
$post = [
    'title' => 'Ejemplo <script>alert(1)</script>', 'language' => 'es',
    'author' => ['name' => 'ADMINIO & Comunidad'], 'publishedAt' => '2026-10-27T12:00:00Z',
    'thumbnailUrl' => 'https://adminio.pe/static/main.png',
    'markdown' => "[Ver sección](#gestion)\n\n## Gestión {#gestion}\n\n| Concepto | Importe |\n| --- | --- |\n| Mantenimiento | S/ 100 |\n\n<script>alert(1)</script>\n\n[Enlace](javascript:alert(1))\n\n## Prueba {onclick=alert(1)}",
    'keyTakeaways' => ['Idea <b>principal</b>'],
    'faq' => [['question' => '¿Cómo <b>funciona</b>?', 'answer' => 'Respuesta <script>alert(2)</script>']],
    'labels' => ['keyTakeaways' => 'Puntos clave', 'faq' => 'Preguntas frecuentes'],
    'seo' => ['canonicalUrl' => 'https://adminio.pe/blog/ejemplo', 'ogImage' => '', 'jsonLd' => ['@context' => 'https://schema.org', '@graph' => [['@type' => 'BlogPosting', 'headline' => '</script><script>alert(3)</script>'], ['@type' => 'FAQPage']]]],
];
$title = 'Título SEO <prueba>'; $description = 'Descripción "segura"'; $error = null;
$article = bunzyMarkdown($post['markdown']);
ob_start(); require dirname(__DIR__) . '/blog/view.php'; $html = ob_get_clean();
verify(str_contains($html, 'id="gestion"') && !str_contains($html, '{#gestion}'), 'Pandoc heading anchors');
verify(str_contains($html, '<table>'), 'GFM table');
verify(!str_contains($html, '<script>alert(') && !str_contains($html, 'href="javascript:'), 'Escaped HTML and unsafe links');
verify(!str_contains($html, 'onclick="'), 'Attribute allowlist');
verify(str_contains($html, 'Puntos clave') && str_contains($html, 'Preguntas frecuentes'), 'CMS labels');
verify(str_contains($html, 'Idea &lt;b&gt;principal&lt;/b&gt;'), 'Text field escaping');
verify(str_contains($html, 'property="og:image" content="https://adminio.pe/static/main.png"'), 'OG thumbnail fallback');
verify(substr_count($html, 'FAQPage') === 1 && str_contains($html, '\\u003C'), 'One JSON-LD graph with escaped script delimiter');
verify(str_contains($html, '<title>Título SEO &lt;prueba&gt;</title>'), 'SEO title escaping');
if (isset($argv[1])) file_put_contents($argv[1], $html);
