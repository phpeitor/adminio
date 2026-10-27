<?php
declare(strict_types=1);

function e($value): string { return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function safeUrl($value): string { return preg_match('~^https?://~i', (string) $value) ? (string) $value : ''; }
function fragment(string $name): void {
    $html = file_get_contents(dirname(__DIR__) . '/' . $name . '.html');
    echo str_replace(['href="./blog.html"', 'href="./', 'src="./'], ['href="/blog"', 'href="/', 'src="/'], $html);
}
function bunzyMarkdown(string $markdown): string {
    require_once dirname(__DIR__) . '/vendor/autoload.php';
    $environment = new League\CommonMark\Environment\Environment(['html_input' => 'escape', 'allow_unsafe_links' => false, 'attributes' => ['allow' => ['id', 'class']]]);
    $environment->addExtension(new League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension());
    $environment->addExtension(new League\CommonMark\Extension\GithubFlavoredMarkdownExtension());
    $environment->addExtension(new League\CommonMark\Extension\Attributes\AttributesExtension());
    return (string) (new League\CommonMark\MarkdownConverter($environment))->convert($markdown);
}
