<?php
header("Content-Type: application/json");

require __DIR__ . "/env.php";
require __DIR__ . "/../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

date_default_timezone_set("America/Lima");
$fechaActual = date("d/m/Y H:i:s");
$data = json_decode(file_get_contents("php://input"), true);

$nombre = $data["nombre"] ?? "";
$edificio = $data["edificio"] ?? "";
$correo = $data["correo"] ?? "";
$telefono = $data["telefono"] ?? "";
$distrito = $data["distrito"] ?? "";
$mensaje = $data["mensaje"] ?? "";

function escapeMailValue($value) {
    return htmlspecialchars((string) $value, ENT_QUOTES, "UTF-8");
}

function renderMailTemplate($templatePath, $values) {
    if (!file_exists($templatePath)) {
        throw new Exception("No se encontro la plantilla de correo");
    }

    $template = file_get_contents($templatePath);
    $replacements = [];

    foreach ($values as $key => $value) {
        $replacements["{{" . $key . "}}"] = $value;
        $replacements["<!-- " . strtoupper($key) . " -->"] = $value;
    }

    return strtr($template, $replacements);
}

function getMailStyles($cssPath) {
    return file_exists($cssPath) ? file_get_contents($cssPath) : "";
}

try {
    $mail = new PHPMailer(true);
    $mail->CharSet = "UTF-8";
    $mail->isSMTP();
    $mail->Host       = env("MAIL_HOST");
    $mail->SMTPAuth   = true;
    $mail->Username   = env("MAIL_USERNAME");
    $mail->Password   = env("MAIL_PASSWORD");
    $mail->SMTPSecure = env("MAIL_SECURE") === "ssl" 
    ? PHPMailer::ENCRYPTION_SMTPS 
    : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = env("MAIL_PORT");

    $mail->setFrom(env("MAIL_FROM_EMAIL"), env("MAIL_FROM_NAME"));
    $mail->addAddress(env("MAIL_TO"));
    $mail->addAddress(env("MAIL_FROM_EMAIL"));
    
    $headWebpPath = __DIR__ . "/../static/head_adminio.webp";
    $headPngPath = __DIR__ . "/../static/head_adminio.png";

    if (file_exists($headWebpPath)) {
        $mail->addEmbeddedImage($headWebpPath, "head_adminio", "head_adminio.webp", "base64", "image/webp");
    } elseif (file_exists($headPngPath)) {
        $mail->addEmbeddedImage($headPngPath, "head_adminio", "head_adminio.png", "base64", "image/png");
    }

    $mail->isHTML(true);
    $mail->Subject = "Nuevo mensaje de contacto";

    $mail->Body = renderMailTemplate(__DIR__ . "/template_mail.html", [
        "mail_styles" => "<style>" . getMailStyles(__DIR__ . "/../css/template_mail.css") . "</style>",
        "fecha" => escapeMailValue($fechaActual),
        "nombre" => escapeMailValue($nombre),
        "correo" => escapeMailValue($correo),
        "telefono" => escapeMailValue($telefono),
        "edificio" => escapeMailValue($edificio),
        "distrito" => escapeMailValue($distrito),
        "mensaje" => nl2br(escapeMailValue($mensaje)),
    ]);

    $mail->send();

    echo json_encode([
        "ok" => true,
        "message" => "Correo enviado correctamente"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "ok" => false,
        "message" => "Error enviando correo",
        "error" => $mail->ErrorInfo
    ]);
}
