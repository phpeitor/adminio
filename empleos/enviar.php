<?php
declare(strict_types=1);
// Conservar sendEmail() en js/adminio.js apuntando a ./config/envio_correo.php.
// Ese endpoint y el .env pertenecen al sitio existente aunque no estén en esta copia.
// Las postulaciones mantienen este controlador multipart para adjuntar el CV
// y comparten las variables MAIL_* mediante config/mail_config.php.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function reply(int $status, string $message): void {
    http_response_code($status);
    echo json_encode(['ok' => $status === 200, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, 'Usa el formulario para enviar tu postulación.');
}
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== 0) reply(415, 'Formato de solicitud no válido.');
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 6 * 1024 * 1024 || (!$_POST && !$_FILES)) reply(413, 'La solicitud supera el tamaño permitido. Adjunta un PDF de hasta 5 MB.');
if (!empty($_POST['website'])) reply(422, 'Solicitud no válida.');
$data = [];
foreach (['nombre' => 480, 'correo' => 254, 'telefono' => 20, 'puesto' => 200, 'mensaje' => 8000] as $field => $limit) {
    $value = $_POST[$field] ?? '';
    if (!is_string($value)) reply(422, 'Revisa los campos del formulario.');
    $value = trim($value);
    if (($field !== 'mensaje' && $value === '') || strlen($value) > $limit || strpos($value, "\0") !== false || !preg_match('//u', $value) || ($field !== 'mensaje' && preg_match('/[\r\n]/', $value))) reply(422, 'Revisa los campos del formulario.');
    $data[$field] = $value;
}
if (!filter_var($data['correo'], FILTER_VALIDATE_EMAIL) || !preg_match('/^9[0-9]{8}$/', $data['telefono'])) reply(422, 'Revisa tu correo electrónico y el teléfono: debe tener 9 dígitos y empezar con 9.');
if (!in_array($data['puesto'], ['Administración de inmuebles', 'Conserjería', 'Limpieza', 'Mantenimiento', 'Administración y contabilidad', 'Otra área'], true)) reply(422, 'Selecciona un área de interés válida.');
if (($_POST['consentimiento'] ?? '') !== '1') reply(422, 'Debes autorizar el uso de tus datos para esta postulación.');
$cv = $_FILES['cv'] ?? null;
if (!is_array($cv) || !isset($cv['error']) || !is_int($cv['error'])) reply(422, 'Adjunta tu CV en PDF.');
if (in_array($cv['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) reply(413, 'El CV supera el tamaño permitido por el servidor. Máximo: 5 MB.');
if ($cv['error'] !== UPLOAD_ERR_OK || !is_string($cv['tmp_name'] ?? null) || !is_uploaded_file($cv['tmp_name'])) reply(422, 'No se pudo cargar el CV. Selecciona el archivo nuevamente.');
if (!is_string($cv['name'] ?? null) || strtolower(pathinfo($cv['name'], PATHINFO_EXTENSION)) !== 'pdf') reply(422, 'El CV debe ser un archivo PDF.');
$size = filesize($cv['tmp_name']);
if ($size === false || $size === 0 || $size > 5 * 1024 * 1024) reply(413, 'Adjunta un PDF válido de hasta 5 MB.');
try {
    if ((new finfo(FILEINFO_MIME_TYPE))->file($cv['tmp_name']) !== 'application/pdf' || file_get_contents($cv['tmp_name'], false, null, 0, 5) !== '%PDF-') reply(422, 'El archivo adjunto no es un PDF válido.');
    require_once dirname(__DIR__) . '/config/mail_config.php';
    $config = adminio_mail_config();
    adminio_mail_autoload();
    $host = $config['smtp_host'];
    $username = $config['smtp_username'];
    $password = $config['smtp_password'];
    $from = $config['from_email'];
    $to = $config['to_email'];
    $port = $config['smtp_port'];
    $secure = $config['smtp_secure'];
    $rateDir = adminio_mail_rate_dir('empleos');
    if (!is_dir($rateDir) && !mkdir($rateDir, 0700, true) && !is_dir($rateDir)) throw new RuntimeException('rate_storage_unavailable');
    $handle = fopen($rateDir . '/' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown') . '.json', 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) throw new RuntimeException('rate_lock_unavailable');
    try {
        $previous = json_decode(stream_get_contents($handle), true);
        $now = time();
        $attempts = array_values(array_filter(is_array($previous) ? $previous : [], static fn($t) => is_int($t) && $t > $now - 3600));
        $limited = count($attempts) >= 5 || ($attempts && max($attempts) > $now - 60);
        if (!$limited) {
            $attempts[] = $now;
            rewind($handle);
            if (!ftruncate($handle, 0) || fwrite($handle, json_encode($attempts)) === false || !fflush($handle)) throw new RuntimeException('rate_write_failed');
        }
    } finally { flock($handle, LOCK_UN); fclose($handle); }
    if ($limited) { header('Retry-After: 60'); reply(429, 'Has realizado varios intentos. Espera unos minutos antes de volver a enviar.'); }
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $host;
    $mail->Port = $port;
    $mail->SMTPAuth = true;
    $mail->Username = $username;
    $mail->Password = $password;
    $mail->SMTPSecure = $secure === 'ssl' ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Timeout = 20;
    $mail->SMTPDebug = 0;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($from, $config['from_name']);
    $mail->addAddress($to);
    if (strcasecmp($from, $to) !== 0) $mail->addAddress($from);
    $mail->addReplyTo($data['correo'], $data['nombre']);
    $mail->Subject = 'Nueva postulación — ' . $data['puesto'];
    date_default_timezone_set('America/Lima');
    $headImage = dirname(__DIR__) . '/static/head_empleo.webp';
    if (is_readable($headImage)) $mail->addEmbeddedImage($headImage, 'head_empleo', 'head_empleo.webp', 'base64', 'image/webp');
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
        '{{puesto}}' => $escape($data['puesto']),
        '{{mensaje}}' => $data['mensaje'] === '' ? 'No indicó experiencia.' : nl2br($escape($data['mensaje']), false),
    ]);
    $mail->AltBody = "POSTULACIÓN A ADMINIO\n\nNombre: {$data['nombre']}\nCorreo: {$data['correo']}\nTeléfono: {$data['telefono']}\nÁrea: {$data['puesto']}\n\nExperiencia:\n" . ($data['mensaje'] === '' ? 'No indicó experiencia.' : $data['mensaje']) . "\n\nCV adjunto en PDF. El postulante autorizó el uso de sus datos y CV para evaluar esta postulación y contactarlo sobre este proceso.\nFecha: " . date('d/m/Y H:i:s');
    $mail->addAttachment($cv['tmp_name'], 'CV.pdf', 'base64', 'application/pdf');
    $mail->send();
    reply(200, 'Postulación enviada correctamente.');
} catch (\Throwable $error) {
    if ($error instanceof \RuntimeException && $error->getMessage() === 'mail_not_configured') reply(503, 'El administrador aún debe habilitar el envío de postulaciones.');
    error_log('ADMINIO empleos: fallo de envío/configuración (' . get_class($error) . ')');
    reply(502, 'No pudimos confirmar el envío. Conserva tus datos y verifica con ADMINIO si recibió tu postulación antes de reenviar.');
}
