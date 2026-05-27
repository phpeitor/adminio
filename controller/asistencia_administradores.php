<?php

header("Content-Type: application/json; charset=utf-8");
session_start();

require_once __DIR__ . "/../model/AsistenciaAdministradoresModel.php";
require_once __DIR__ . "/../config/env.php";

$requestToken = trim((string) ($_GET['token'] ?? $_SERVER['HTTP_X_ASISTENCIAS_TOKEN'] ?? ''));
$expectedToken = env('ASISTENCIAS_TOKEN', '');
$sessionAuthorized = !empty($_SESSION['asistencias_access']);
$tokenAuthorized = $requestToken !== '' && $expectedToken !== '' && hash_equals($expectedToken, $requestToken);

if (!$sessionAuthorized && !$tokenAuthorized) {
    http_response_code(403);

    echo json_encode([
        'ok' => false,
        'message' => 'Acceso no autorizado',
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

try {
    $model = new AsistenciaAdministradoresModel();

    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 100;
    $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
    $desde = isset($_GET['desde']) ? trim((string) $_GET['desde']) : '';
    $hasta = isset($_GET['hasta']) ? trim((string) $_GET['hasta']) : '';

    $limit = max(1, min($limit, 500));
    $offset = max(0, $offset);

    if ($desde === '' && $hasta === '') {
        http_response_code(400);

        echo json_encode([
            'ok' => false,
            'message' => 'Debes enviar al menos un filtro de fecha en desde o hasta',
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    $report = $model->getReport($limit, $offset, $desde !== '' ? $desde : null, $hasta !== '' ? $hasta : null);
    $tipoCounts = $model->countByTipo($desde !== '' ? $desde : null, $hasta !== '' ? $hasta : null);

    echo json_encode([
        'ok' => true,
        'message' => 'Reporte cargado correctamente',
        'total' => $model->countAll(),
        'entradas' => $tipoCounts['entradas'],
        'salidas' => $tipoCounts['salidas'],
        'limit' => $limit,
        'offset' => $offset,
        'desde' => $desde !== '' ? $desde : null,
        'hasta' => $hasta !== '' ? $hasta : null,
        'columns' => $report['columns'],
        'rows' => $report['rows'],
        'dateColumn' => $report['dateColumn'],
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('[asistencia_administradores] ' . $e->getMessage());

    http_response_code(500);

    $message = 'No fue posible cargar el reporte';

    if ($e instanceof PDOException) {
        $message = 'No se pudo conectar o consultar la base de datos';
    } elseif ($e instanceof RuntimeException) {
        $message = $e->getMessage();
    }

    echo json_encode([
        'ok' => false,
        'message' => $message,
    ], JSON_UNESCAPED_UNICODE);
}
