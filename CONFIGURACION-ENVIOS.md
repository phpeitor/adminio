# Entrega al administrador: envío de formularios

Contacto (contacto.html) y Trabaja con nosotros (trabaja-con-nosotros.html) usan las mismas variables MAIL_* del .env ubicado en la raíz del sitio. No se ha configurado ninguna cuenta ni contraseña propia. Ambos envían al destinatario MAIL_TO; el correo del visitante se usa únicamente para responder (Reply-To).

## Subir y conservar

Confirmación del propietario (22 de octubre de 2026): el proyecto desplegado cuenta con las funciones de correo y el .env existentes. Su ausencia en esta copia local no implica que falten en el servidor. Mantener `sendEmail(data, { onError } = {})` en `js/adminio.js`, con POST JSON a `./config/envio_correo.php`, respuesta `ok/message`, avisos mediante Alertify, recarga tras 1500 ms al tener éxito y callback `onError` ante fallo. No sustituir esa ruta por los controladores nuevos ni crear o sobrescribir el endpoint existente por su ausencia local.

- Subir las páginas y sus CSS/JS, head.html, footer.html, cotizaciones/enviar.php, empleos/enviar.php y config/mail_config.php.
- Conservar el .env del administrador, config/env.php (si existe), config/envio_correo.php y vendor del sitio anterior. No sobrescribirlos. La plantilla .env.example es solo una referencia sin credenciales.
- El formulario antiguo del inicio conserva su controlador config/envio_correo.php. Los formularios nuevos comparten su configuración de correo, pero tienen controladores propios para validar sus campos y adjuntar el CV.
- Si existe config/env.php y define env(), se utiliza esa función. De lo contrario, el módulo lee el .env directamente con el mismo formato clave=valor del código facilitado. No incluye config/envio_correo.php, porque podría ejecutar un envío al cargarlo.

## Variables existentes

MAIL_HOST, MAIL_PORT, MAIL_SECURE (tls o ssl), MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_EMAIL, MAIL_FROM_NAME y MAIL_TO. Ambos formularios usan exactamente el mismo remitente, servidor y destinatario. Completar o revisar estos valores en el hosting; no hacen falta ADMINIO_COTIZACIONES_CONFIG, ADMINIO_EMPLEOS_ENV, MAIL_JOBS_TO ni archivos privados adicionales de configuración.

## Dependencias y servidor

PHP 8.x, OpenSSL y Fileinfo para verificar PDF. Se reutiliza PHPMailer de vendor/autoload.php en la raíz; también se admite la instalación en cotizaciones/vendor o empleos/vendor. Si no existe, ejecutar composer install --no-dev --optimize-autoloader dentro de empleos; ambos formularios podrán usar esa instalación. No hace falta phpdotenv.

Integrar el bloque de .htaccess entregado con las reglas existentes (no reemplazar el .htaccess del hosting). En Apache impide descargar .env y sus variantes. Para Nginx u otro servidor, aplicar la regla equivalente. Confirmar que /.env no es accesible por HTTP.

Para el CV: upload_max_filesize = 5M, post_max_size = 8M y límite de petición del servidor de al menos 8 MB. Los CV solo se adjuntan al correo; no se guardan en la web. Los contadores de intentos usan el directorio temporal de PHP, separado por sitio y formulario; debe estar fuera del directorio público y ser escribible por PHP. Limpiar periódicamente contadores antiguos.

## Verificar después de subir

1. Ejecutar php -l config/mail_config.php, php -l cotizaciones/enviar.php y php -l empleos/enviar.php.
2. Probar contacto y comprobar recepción en MAIL_TO.
3. Probar una postulación con PDF y comprobar recepción del adjunto CV.pdf.
4. Comprobar rechazo de archivos que no sean PDF o superen 5 MB y que un fallo no borre los datos.

No se han enviado correos ni publicado cambios. Esta máquina no tiene PHP ni Composer: la ejecución PHP y la prueba SMTP quedan para el administrador.
