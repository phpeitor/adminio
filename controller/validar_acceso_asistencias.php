<?php

header("Content-Type: application/json; charset=utf-8");
session_start();

require_once __DIR__ . "/../config/env.php";

$payload = json_decode(file_get_contents("php://input"), true);
$token = trim((string) ($payload['token'] ?? ($_POST['token'] ?? '')));
$expectedToken = env('ASISTENCIAS_TOKEN', '');
$now = time();
$failedAttempts = (int) ($_SESSION['asistencias_failed_attempts'] ?? 0);
$blockedUntil = (int) ($_SESSION['asistencias_blocked_until'] ?? 0);

if ($blockedUntil > $now) {
    http_response_code(429);

    echo json_encode([
        'ok' => false,
        'blocked' => true,
        'remaining_seconds' => $blockedUntil - $now,
        'message' => 'Demasiados intentos. Espera antes de volver a intentar.',
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

if ($blockedUntil !== 0 && $blockedUntil <= $now) {
    unset($_SESSION['asistencias_blocked_until']);
    $blockedUntil = 0;
    $failedAttempts = 0;
    $_SESSION['asistencias_failed_attempts'] = 0;
}

if ($expectedToken === '') {
    http_response_code(500);

    echo json_encode([
        'ok' => false,
        'message' => 'El token de acceso no está configurado',
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

if ($token !== '' && hash_equals($expectedToken, $token)) {
    $_SESSION['asistencias_access'] = true;
    $_SESSION['asistencias_failed_attempts'] = 0;
    unset($_SESSION['asistencias_blocked_until']);

    echo json_encode([
        'ok' => true,
        'message' => 'Acceso autorizado',
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$failedAttempts++;
$_SESSION['asistencias_failed_attempts'] = $failedAttempts;

if ($failedAttempts >= 3) {
    $blockedUntil = $now + 300;
    $_SESSION['asistencias_blocked_until'] = $blockedUntil;
    $_SESSION['asistencias_failed_attempts'] = 0;

    http_response_code(429);

    echo json_encode([
        'ok' => false,
        'blocked' => true,
        'remaining_seconds' => 300,
        'message' => 'Se alcanzó el límite de intentos. Espera 5 minutos.',
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

http_response_code(401);
echo json_encode([
    'ok' => false,
    'attempts_left' => max(0, 3 - $failedAttempts),
    'message' => 'Token inválido',
], JSON_UNESCAPED_UNICODE);
