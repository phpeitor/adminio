<?php

header("Content-Type: application/json; charset=utf-8");
session_start();

$_SESSION = [];

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
}

session_destroy();

echo json_encode([
    'ok' => true,
    'message' => 'Sesión cerrada correctamente',
], JSON_UNESCAPED_UNICODE);