<?php
declare(strict_types=1);
require_once __DIR__ . '/env.php';

function bunzyRequest(string $path, array $query = []): ?array
{
    $key = getenv('BUNZY_BLOG_API_KEY') ?: env('BUNZY_BLOG_API_KEY', '');
    $base = rtrim(getenv('BUNZY_BLOG_API_URL') ?: env('BUNZY_BLOG_API_URL', 'https://app.bunzy.io'), '/');
    if (!$key || !function_exists('curl_init')) throw new RuntimeException('Blog configuration unavailable');
    if (parse_url($base, PHP_URL_SCHEME) !== 'https') throw new RuntimeException('HTTPS required');
    $url = $base . '/api/v1' . $path . ($query ? '?' . http_build_query($query) : '');
    $curl = curl_init($url);
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $key, 'Accept: application/json', 'Cache-Control: no-store']]);
    $body = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);
    if ($status === 404 && str_starts_with($path, '/posts/')) return null;
    if ($body === false || $status !== 200) throw new RuntimeException('Blog API unavailable (' . $status . ')');
    $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($data)) throw new RuntimeException('Invalid API response');
    return $data;
}

function getPosts(int $page = 1, int $limit = 12, ?string $tag = null): array
{
    $query = ['page' => max(1, $page), 'limit' => $limit];
    if ($tag !== null) $query['tag'] = $tag;
    $result = bunzyRequest('/posts', $query);
    if (!isset($result['data'], $result['pagination']['totalPages'])) throw new RuntimeException('Invalid pagination');
    return $result;
}
function getPost(string $slug): ?array { return bunzyRequest('/posts/' . rawurlencode($slug)); }
function getTags(): array { return bunzyRequest('/tags'); }
