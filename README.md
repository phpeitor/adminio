# adminio.pe

[![forthebadge](http://forthebadge.com/images/badges/made-with-javascript.svg)](https://www.linkedin.com/in/drphp/)
[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](https://www.linkedin.com/in/drphp/)

Landing page corporativa para Adminio Peru, enfocada en administracion inmobiliaria, captura de leads y envio de mensajes por correo mediante PHPMailer.

## Demo visual

<video src="https://adminio.pe/static/main.mp4" width="860" controls muted loop playsinline></video>

Si tu visor Markdown no reproduce video, abre directamente:
https://adminio.pe/static/main.mp4

## Tecnologias

- HTML5, CSS, JavaScript
- PHP
- PHPMailer (via Composer)
- AlertifyJS para notificaciones y confirmaciones

## Requisitos

- PHP 8.x o superior
- Composer
- Servidor local (Apache recomendado)
- Acceso SMTP valido para envio de correos

## Instalacion local

1. Clonar repositorio

```bash
git clone https://github.com/phpeitor/adminio.git
cd adminio
```

2. Instalar dependencias PHP (PHPMailer)

```bash
composer install
```

3. Crear archivo .env en la raiz del proyecto con tus credenciales SMTP

Ejemplo:

```env
MAIL_HOST=smtp.tudominio.com
MAIL_PORT=587
MAIL_USERNAME=usuario@tudominio.com
MAIL_PASSWORD=tu_password
MAIL_SECURE=tls
MAIL_FROM_EMAIL=usuario@tudominio.com
MAIL_FROM_NAME=Adminio Web
MAIL_TO=ventas@tudominio.com
```

4. Publicar en tu servidor local

- Ruta sugerida en Windows + Apache: C:/Apache24/htdocs/adminio
- Abrir en navegador: http://127.0.0.1/adminio/

## Flujo de contacto

- El formulario valida campos en frontend.
- Al enviar, la web llama a config/envio_correo.php.
- PHPMailer toma credenciales desde .env usando config/env.php.
- Si el correo se envia correctamente, se muestra confirmacion y se recarga la pagina.

## Estructura clave

- index.html: landing principal
- js/adminio.js: navegacion, validaciones y envio del formulario
- config/envio_correo.php: envio SMTP con PHPMailer
- config/env.php: helper para variables de entorno
- static/main.mp4: video principal del hero

## Notas

- Si abres solo index.html sin servidor web, el formulario no podra enviar correos.
- Verifica firewall, puerto SMTP y credenciales si aparece error de envio.

## Licencia

Proyecto de uso privado/comercial segun politicas del propietario del repositorio.
