<?php
// Variables are prepared by the route controller.
?>
<!doctype html><html lang="<?= e($post['language'] ?? 'es') ?>"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= e($title) ?></title><meta name="description" content="<?= e($description) ?>">
<meta property="og:title" content="<?= e($title) ?>"><meta property="og:description" content="<?= e($description) ?>">
<?php if ($post && !$error): ?>
<link rel="canonical" href="<?= e(safeUrl($post['seo']['canonicalUrl'])) ?>">
<meta property="og:type" content="article"><meta property="og:image" content="<?= e(safeUrl(($post['seo']['ogImage'] ?? '') ?: ($post['thumbnailUrl'] ?? ''))) ?>">
<script type="application/ld+json"><?= json_encode($post['seo']['jsonLd'], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR) ?></script>
<?php endif ?>
<link rel="icon" href="/static/favicon-adminio.png"><link rel="stylesheet" href="/css/app.css"><link rel="stylesheet" href="/css/index.css?v=3.15"><link rel="stylesheet" href="/css/blog.css"><link rel="stylesheet" href="/css/bunzy-blog.css">
</head><body class="blog-page"><a class="blog-skip" href="#contenido">Ir al contenido</a><?php fragment('head'); ?>
<main id="contenido"><div class="blog-shell bunzy-shell">
<?php if ($error): ?><h1><?= e($error) ?></h1><a href="/blog">Volver al blog</a>
<?php elseif ($post): ?>
<nav class="breadcrumbs"><a href="/">Inicio</a> / <a href="/blog">Blog</a></nav>
<article><header class="article-heading"><h1><?= e($post['title']) ?></h1><p><?= e($post['author']['name']) ?> · <time datetime="<?= e($post['publishedAt']) ?>"><?= e(substr($post['publishedAt'], 0, 10)) ?></time></p></header>
<?php if (!empty($post['thumbnailUrl'])): ?><img class="bunzy-cover" src="<?= e(safeUrl($post['thumbnailUrl'])) ?>" alt="<?= e($post['title']) ?>"><?php endif ?>
<div class="article-body bunzy-body">
<?php if (!empty($post['keyTakeaways'])): ?><section><h2><?= e($post['labels']['keyTakeaways']) ?></h2><ul><?php foreach ($post['keyTakeaways'] as $takeaway): ?><li><?= e($takeaway) ?></li><?php endforeach ?></ul></section><?php endif ?>
<?= $article ?>
<?php if (!empty($post['faq'])): ?><section><h2><?= e($post['labels']['faq']) ?></h2><?php foreach ($post['faq'] as $faq): ?><details><summary><?= e($faq['question']) ?></summary><p><?= e($faq['answer']) ?></p></details><?php endforeach ?></section><?php endif ?>
</div></article>
<?php else: ?>
<p class="eyebrow">ADMINIO / CONOCIMIENTO PARA TU COMUNIDAD</p><h1><?= $tag !== null ? 'Tema: ' . e($tag) : 'Un edificio bien informado. Una comunidad mejor.' ?></h1><p><?= e($description) ?></p>
<nav class="bunzy-tags" aria-label="Temas"><a href="/blog">Todos</a><?php foreach ($tags as $item): ?><a href="/blog/tag/<?= e(rawurlencode($item['tag'])) ?>"><?= e($item['tag']) ?> (<?= e($item['count']) ?>)</a><?php endforeach ?></nav>
<div class="blog-grid"><?php foreach ($listing['data'] as $item): $url = '/blog/' . rawurlencode($item['slug']); ?>
<article class="blog-card"><?php if (!empty($item['thumbnailUrl'])): ?><img class="bunzy-thumb" loading="lazy" src="<?= e(safeUrl($item['thumbnailUrl'])) ?>" alt="<?= e($item['title']) ?>"><?php endif ?><h2><a href="<?= e($url) ?>"><?= e($item['title']) ?></a></h2><p><?= e($item['excerpt']) ?></p><p><?= e($item['author']['name']) ?> · <time datetime="<?= e($item['publishedAt']) ?>"><?= e(substr($item['publishedAt'], 0, 10)) ?></time></p><a class="read-link" href="<?= e($url) ?>">Leer artículo ↗</a></article>
<?php endforeach ?></div>
<?php if (!$listing['data']): ?><p>Aún no hay artículos publicados<?= $tag !== null ? ' sobre este tema' : '' ?>.</p><?php endif ?>
<nav class="bunzy-pages" aria-label="Paginación"><?php for ($i = 1; $i <= (int) $listing['pagination']['totalPages']; $i++): ?><a <?= $i === $page ? 'aria-current="page"' : '' ?> href="<?= e($path) ?>?page=<?= $i ?>"><?= $i ?></a><?php endfor ?></nav>
<?php endif ?></div></main><?php fragment('footer'); ?></body></html>
