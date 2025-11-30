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
    
    $headPath = __DIR__ . "/../static/head_adminio.png";

    if (file_exists($headPath)) $mail->addEmbeddedImage($headPath, "head_adminio", "head_adminio.png");

    $mail->isHTML(true);
    $mail->Subject = "Nuevo mensaje de contacto";

    $mail->Body = "
    <div style='width:100%; background:#f5f7fa; padding:20px 0;'>
      <div style='max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden;
                  box-shadow:0 3px 10px rgba(0,0,0,0.1);'>

        <div style='width:100%; text-align:center; background:white; position:relative;'>
            <img src='cid:head_adminio'
                style='display:block; width:100%; border:0; outline:none; text-decoration:none; margin:0;'>
        </div>

        <div style='padding:0 25px 25px; font-family:Arial, sans-serif;'>
          <h2 style='color:#333; text-align:center;'>Nuevo mensaje recibido</h2>
          <table style='width:100%; margin-top:20px; font-size:16px; color:#333;'>
            <tr><td>📆 <strong>Fecha:</strong></td>    <td>$fechaActual</td></tr>
            <tr><td>👤 <strong>Nombre:</strong></td>   <td>$nombre</td></tr>
            <tr><td>📧 <strong>Correo:</strong></td>   <td>$correo</td></tr>
            <tr><td>📱 <strong>Teléfono:</strong></td>  <td>$telefono</td></tr>
            <tr><td>🏢 <strong>Edificio:</strong></td> <td>$edificio</td></tr>
            <tr><td>📍 <strong>Distrito:</strong></td>  <td>$distrito</td></tr>
            <tr><td>💬 <strong>Mensaje:</strong></td>  <td>$mensaje</td></tr>
          </table>
        </div>

        <div style='text-align:center; padding:15px; background:#fafafa; color:#777; font-size:12px;'>
          © Adminio Perú - Sistema de Contacto
        </div>

      </div>
    </div>
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
