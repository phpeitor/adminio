<?php
header("Content-Type: application/json");

require __DIR__ . "/env.php";
require __DIR__ . "/../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$data = json_decode(file_get_contents("php://input"), true);

$nombre = $data["nombre"] ?? "";
$edificio = $data["edificio"] ?? "";
$correo = $data["correo"] ?? "";
$telefono = $data["telefono"] ?? "";
$distrito = $data["distrito"] ?? "";
$mensaje = $data["mensaje"] ?? "";

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

    $logoPath = __DIR__ . "/../static/logo.png";
    if (file_exists($logoPath)) {
        $mail->addEmbeddedImage($logoPath, "logo_adminio", "logo.png");
    }

    $mail->isHTML(true);
    $mail->Subject = "Nuevo mensaje de contacto";
    $mail->Body    = "
        <h3>Nuevo mensaje recibido</h3>
        <p><strong>Nombre:</strong> $nombre</p>
        <p><strong>Correo:</strong> $correo</p>
        <p><strong>Teléfono:</strong> $telefono</p>
        <p><strong>Edificio:</strong> $edificio</p>
        <p><strong>Distrito:</strong> $distrito</p>
        <p><strong>Mensaje:</strong><br>$mensaje</p>
        <br><br>
        <img src='cid:logo_adminio' style='width:150px;' alt='Logo'>
    ";

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
