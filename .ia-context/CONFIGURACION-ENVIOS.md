# Entrega al administrador: envío de formularios

`contacto.html` y `trabaja-con-nosotros.html` usan las variables `MAIL_*` del `.env` ubicado en la raíz. Cotizaciones y empleos envían a `MAIL_TO` y agregan copia a `MAIL_FROM_EMAIL` si es distinta; el correo del visitante solo se establece como `Reply-To`. Los secretos reales pertenecen al administrador y no deben incorporarse a este archivo.

## Subir y conservar

El formulario legacy del inicio mantiene `sendEmail(data, { onError } = {})` en `js/adminio.js`, POST JSON a `./config/envio_correo.php`, respuesta `ok/message`, avisos mediante Alertify y callback `onError` ante fallo. No cambiar ese flujo al modificar los formularios nuevos.

- Desplegar los archivos de cada formulario, sus hojas y scripts, plantillas, `config/mail_config.php` y `vendor/` generado por Composer.
- Conservar el `.env` del administrador y no sobrescribir configuración SMTP existente. `.env.example` solo documenta nombres de variables y contiene placeholders.
- El formulario legacy del inicio conserva `config/envio_correo.php`; los formularios nuevos usan controladores propios para validación y envío, incluido el adjunto CV.
- `config/mail_config.php` reutiliza `config/env.php`/`env()` cuando está disponible y, si no, lee las variables desde el `.env` raíz. No incluir el endpoint legacy para cargar su configuración, porque ejecuta un envío.

## Variables existentes

Variables necesarias: `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE` (`tls` o `ssl`), `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME` y `MAIL_TO`. Ambos formularios nuevos comparten estos valores; no requieren variables privadas adicionales por formulario.

## Dependencias y servidor

PHP 8+, OpenSSL y Fileinfo para verificar PDF. Se reutiliza PHPMailer desde `vendor/autoload.php` raíz; `config/mail_config.php` también busca instalaciones en `cotizaciones/vendor` y `empleos/vendor`. Instalar dependencias ejecutando `composer install --no-dev --optimize-autoloader` en la raíz del proyecto.

Integrar el bloque de .htaccess entregado con las reglas existentes (no reemplazar el .htaccess del hosting). En Apache impide descargar .env y sus variantes. Para Nginx u otro servidor, aplicar la regla equivalente. Confirmar que /.env no es accesible por HTTP.

Para el CV: upload_max_filesize = 5M, post_max_size = 8M y límite de petición del servidor de al menos 8 MB. Los CV solo se adjuntan al correo; no se guardan en la web. Los contadores de intentos usan el directorio temporal de PHP, separado por sitio y formulario; debe estar fuera del directorio público y ser escribible por PHP. Limpiar periódicamente contadores antiguos.

## Verificar después de subir

1. Ejecutar `php -l config/mail_config.php`, `php -l cotizaciones/enviar.php` y `php -l empleos/enviar.php`.
2. Probar contacto y comprobar recepción en `MAIL_TO` y, si es distinto, `MAIL_FROM_EMAIL`.
3. Probar una postulación con PDF y comprobar recepción del adjunto `CV.pdf` en los destinatarios configurados.
4. Comprobar rechazo de archivos que no sean PDF o superen 5 MB y que un fallo no borre los datos.

