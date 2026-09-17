# Reglas de desarrollo backend — Adminio

## Alcance

- El backend gestiona el envío de contacto desde `config/envio_correo.php`.
- Los endpoints de asistencias viven en `controller/`.
- La conexión se centraliza en `db/connection.php` y el acceso a datos en `model/`.
- Las respuestas consumidas por JavaScript deben conservar el formato JSON.

## Configuración

- No hardcodear credenciales SMTP, correos, tokens ni datos de conexión.
- Leer valores sensibles desde `.env` mediante `config/env.php` y `env()`.
- Mantener las variables SMTP actuales: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SECURE`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME` y `MAIL_TO`.
- Mantener `ASISTENCIAS_TOKEN` fuera del código y de las respuestas públicas.
- Usar la zona horaria `America/Lima` cuando el flujo requiera fechas locales.

## Correo

- Usar PHPMailer instalado por Composer.
- Conservar el flujo JSON de entrada, PHPMailer y respuesta JSON.
- Escapar los valores antes de insertarlos en `config/template_mail.html`.
- Mantener los estilos de correo en `css/template_mail.css` y las imágenes embebidas existentes.
- No cambiar la ruta `config/envio_correo.php` sin actualizar `js/adminio.js`.

## Asistencias y base de datos

- Proteger el acceso con sesión y validar el token mediante `hash_equals`.
- Mantener el límite de intentos y el bloqueo temporal del acceso.
- Usar consultas preparadas y parámetros tipados para filtros, límites y desplazamientos.
- Mantener la tabla `asistencia_administradores` y la resolución de columna de fecha del modelo.
- No consultar la base de datos directamente desde JavaScript.

## Validación y respuestas

- No confiar solo en la validación del frontend.
- Validar y sanear los datos recibidos antes de usarlos en consultas o correos.
- Enviar `Content-Type: application/json` en los endpoints JSON.
- Responder con `ok: true` y `message` en operaciones exitosas.
- Responder con `ok: false` y mensajes breves sin trazas ni secretos cuando ocurra un error.

## Verificación

- Ejecutar `php -l` sobre cada archivo PHP modificado.
- Probar contacto, autenticación, consulta filtrada, cierre de sesión y respuestas de error.
- Ejecutar `composer install` para regenerar `vendor/` cuando falten dependencias.