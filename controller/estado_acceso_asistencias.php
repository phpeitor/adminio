<?php

header("Content-Type: application/json; charset=utf-8");
session_start();

require_once __DIR__ . "/../config/env.php";

$now = time();
$blockedUntil = (int) ($_SESSION['asistencias_blocked_until'] ?? 0);
$blocked = $blockedUntil > $now;
$requestToken = trim((string) ($_GET['token'] ?? $_SERVER['HTTP_X_ASISTENCIAS_TOKEN'] ?? ''));
$expectedToken = env('ASISTENCIAS_TOKEN', '');
$tokenAuthorized = $requestToken !== '' && $expectedToken !== '' && hash_equals($expectedToken, $requestToken);

if ($blockedUntil !== 0 && $blockedUntil <= $now) {
    unset($_SESSION['asistencias_blocked_until']);
    $_SESSION['asistencias_failed_attempts'] = 0;
    $blockedUntil = 0;
}

echo json_encode([
    'ok' => true,
    'authorized' => !empty($_SESSION['asistencias_access']) || $tokenAuthorized,
    'blocked' => $blocked,
    'remaining_seconds' => $blocked ? ($blockedUntil - $now) : 0,
    'attempts_left' => max(0, 3 - (int) ($_SESSION['asistencias_failed_attempts'] ?? 0)),
], JSON_UNESCAPED_UNICODE);