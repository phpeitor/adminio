# Reglas de Backend

## Objetivo
Mantener el flujo de contacto por correo estable, seguro y predecible.

## Alcance
- El backend actual está centrado en el envío de correo desde `config/envio_correo.php`.
- La configuración sensible vive en `.env` y se lee mediante `config/env.php`.
- La salida esperada del endpoint es JSON.

## Configuración
- No hardcodear credenciales SMTP, correos de destino ni nombres de remitente.
- Leer siempre las variables desde `.env` usando el helper `env()`.
- Mantener la compatibilidad con los nombres actuales: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SECURE`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME`, `MAIL_TO`.
- Respetar la zona horaria configurada para el correo y los registros de fecha.

## Envío de correo
- Usar PHPMailer como implementación base.
- Conservar el flujo JSON -> PHPMailer -> respuesta JSON.
- Mantener el cuerpo del correo legible y orientado a recepción interna.
- Si se agrega contenido nuevo, validar que siga funcionando con SMTP y con adjuntos embebidos si existen.

## Validación y seguridad
- No confiar solo en la validación del frontend.
- Validar y sanear los datos recibidos antes de usarlos en el body del correo.
- No exponer información sensible en respuestas de error.
- Evitar devolver trazas o detalles internos al cliente final.

## Respuestas
- Responder con `ok: true` y un mensaje claro cuando el envío sea correcto.
- Responder con `ok: false` y un mensaje breve cuando falle el envío.
- Mantener el formato JSON para no romper el consumo desde JavaScript.

## Mantenimiento
- No cambiar la ruta del endpoint sin actualizar el frontend.
- No reemplazar PHPMailer por otra librería sin revisar la configuración SMTP completa.
- Si cambian las credenciales o el correo destino, documentarlo en el README o en un `.env.example` si se crea uno.
