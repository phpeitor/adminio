<?php
declare(strict_types=1);

// Comparte las variables MAIL_* del .env del contacto anterior.
// El contacto original conserva sendEmail() en js/adminio.js y su endpoint
// ./config/envio_correo.php, provisto por el sitio existente aunque falte localmente.
// Este controlador valida cotizaciones; comparte la configuración mediante mail_config.php.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, string $code, string $message): void
{
    http_response_code($status);
    echo json_encode(['ok' => $status === 200, 'code' => $code, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'method_not_allowed', 'Usa el formulario para enviar tu solicitud.');
}
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    respond(415, 'invalid_content_type', 'Formato de solicitud no válido.');
}
$raw = file_get_contents('php://input', false, null, 0, 16385);
if ($raw === false || strlen($raw) > 16384) {
    respond(413, 'request_too_large', 'La solicitud supera el tamaño permitido.');
}
$input = json_decode($raw, true);
if (!is_array($input)) respond(400, 'invalid_json', 'Solicitud no válida.');
if (!empty($input['website'])) respond(400, 'invalid_request', 'Solicitud no válida.');

$limits = ['nombre' => 240, 'edificio' => 300, 'correo' => 254, 'telefono' => 20, 'tipo' => 200, 'unidades' => 6, 'pisos' => 3, 'sotanos' => 2, 'region' => 100, 'provincia' => 150, 'distrito' => 200, 'cargo' => 100];
$data = [];
foreach ($limits as $field => $limit) {
    if (!isset($input[$field]) || !is_string($input[$field])) {
        respond(422, 'invalid_fields', 'Completa todos los campos del formulario.');
    }
    $value = trim($input[$field]);
    if ($value === '' || strlen($value) > $limit || strpos($value, "\0") !== false || !preg_match('//u', $value)) {
        respond(422, 'invalid_fields', 'Revisa los campos y la longitud de tu solicitud.');
    }
    if ($field !== 'mensaje' && preg_match('/[\r\n]/', $value)) {
        respond(422, 'invalid_fields', 'Hay caracteres no válidos en los datos.');
    }
    $data[$field] = $value;
}
if (!filter_var($data['correo'], FILTER_VALIDATE_EMAIL) || !preg_match('/^[+0-9() .\-]{7,20}$/', $data['telefono']) || !ctype_digit($data['unidades']) || !ctype_digit($data['pisos']) || !ctype_digit($data['sotanos'])) {
    respond(422, 'invalid_fields', 'Revisa el correo y el teléfono.');
}
$services = $input['servicios'] ?? null;
if (!is_array($services) || !$services || count($services) > 6) respond(422, 'invalid_fields', 'Selecciona al menos un servicio.');
$allowedServices = ['Sistema de administración integral de inmuebles (Administración, Conserjería y Limpieza)', 'Soporte Administrativo con IA', 'Servicio de recaudación Multibanca', 'Servicio de Back Office (Soporte Administrativo para Autogestión)', 'Servicio de Administración de Mantenimiento', 'Servicio de Administración de Personal'];
foreach ($services as $service) if (!is_string($service) || !in_array($service, $allowedServices, true)) respond(422, 'invalid_fields', 'Selecciona servicios válidos.');
$data['servicios'] = implode(', ', $services);

try {
    require_once dirname(__DIR__) . '/config/mail_config.php';
    $config = adminio_mail_config();
    adminio_mail_autoload();

    // Límite básico: una solicitud por minuto y un máximo de diez por hora/IP.
    // Archivos temporales, separados por sitio y módulo.
    $rateDir = adminio_mail_rate_dir('cotizaciones');
    if (!is_dir($rateDir) && !mkdir($rateDir, 0700, true) && !is_dir($rateDir)) throw new RuntimeException('rate_storage_unavailable');
    $rateKey = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $handle = fopen($rateDir . '/' . $rateKey . '.json', 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) throw new RuntimeException('rate_lock_unavailable');
    $previous = json_decode(stream_get_contents($handle), true);
    $now = time();
    $attempts = array_values(array_filter(is_array($previous) ? $previous : [], static fn($t) => is_int($t) && $t > $now - 3600));
    if (count($attempts) >= 10 || ($attempts && max($attempts) > $now - 60)) {
        flock($handle, LOCK_UN);
        fclose($handle);
        header('Retry-After: 60');
        respond(429, 'rate_limited', 'Espera un minuto antes de intentar nuevamente. Si persiste, contacta con comercial@adminio-peru.com.');
    }
    $attempts[] = $now;
    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, json_encode($attempts));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->Port = (int) ($config['smtp_port'] ?? 587);
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = ($config['smtp_secure'] ?? 'tls') === 'ssl'
        ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
        : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Timeout = 12;
    $mail->SMTPDebug = 0;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($config['from_email'], $config['from_name'] ?? 'ADMINIO Perú');
    $mail->addAddress($config['to_email']);
    // Igual que el envío anterior: copiar también a la cuenta remitente.
    if (strcasecmp($config['from_email'], $config['to_email']) !== 0) $mail->addAddress($config['from_email']);
    $mail->addReplyTo($data['correo'], $data['nombre']);
    $mail->Subject = 'Nueva solicitud de presupuesto — ADMINIO';
    date_default_timezone_set('America/Lima');
    $headImage = dirname(__DIR__) . '/static/head_adminio.webp';
    if (is_readable($headImage)) $mail->addEmbeddedImage($headImage, 'head_adminio', 'head_adminio.webp', 'base64', 'image/webp');
    $templatePath = __DIR__ . '/template_mail.html';
    if (!is_readable($templatePath)) throw new RuntimeException('mail_template_unavailable');
    $template = file_get_contents($templatePath);
    if ($template === false) throw new RuntimeException('mail_template_unavailable');
    $stylesPath = dirname(__DIR__) . '/css/template_mail.css';
    $styles = is_readable($stylesPath) ? file_get_contents($stylesPath) : '';
    if ($styles === false) $styles = '';
    $escape = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $mail->isHTML(true);
    $mail->Body = strtr($template, [
        '<!-- MAIL_STYLES -->' => '<style>' . $styles . '</style>',
        '{{fecha}}' => date('d/m/Y H:i:s'),
        '{{nombre}}' => $escape($data['nombre']),
        '{{correo}}' => $escape($data['correo']),
        '{{telefono}}' => $escape($data['telefono']),
        '{{edificio}}' => $escape($data['edificio']),
        '{{tipo}}' => $escape($data['tipo']),
        '{{unidades}}' => $escape($data['unidades']),
        '{{pisos}}' => $escape($data['pisos']),
        '{{sotanos}}' => $escape($data['sotanos']),
        '{{region}}' => $escape($data['region']),
        '{{provincia}}' => $escape($data['provincia']),
        '{{distrito}}' => $escape($data['distrito']),
        '{{servicios}}' => $escape($data['servicios']),
        '{{cargo}}' => $escape($data['cargo']),
    ]);
    $mail->AltBody = "SOLICITUD DE PRESUPUESTO\n\nNombre: {$data['nombre']}\nCorreo: {$data['correo']}\nTeléfono: {$data['telefono']}\nTipo de inmueble: {$data['tipo']}\nNombre del inmueble: {$data['edificio']}\nUnidades: {$data['unidades']}\nPisos: {$data['pisos']}\nSótanos: {$data['sotanos']}\nUbicación: {$data['region']} / {$data['provincia']} / {$data['distrito']}\nServicios: {$data['servicios']}\nCargo: {$data['cargo']}";
    $mail->send();
    respond(200, 'sent', 'Solicitud enviada correctamente.');
} catch (\Throwable $error) {
    if ($error instanceof \RuntimeException && $error->getMessage() === 'mail_not_configured') respond(503, 'mail_not_configured', 'El administrador aún debe habilitar el envío de solicitudes.');
    // No registrar cuerpo, contraseña ni respuesta SMTP: podrían contener datos privados.
    error_log('ADMINIO cotizaciones: fallo de envío/configuración (' . get_class($error) . ')');
    respond(502, 'mail_unavailable', 'No pudimos confirmar el envío. Conserva tus datos y contacta con comercial@adminio-peru.com antes de reenviar.');
}
