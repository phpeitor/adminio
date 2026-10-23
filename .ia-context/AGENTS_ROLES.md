# Roles de agentes — Adminio

Guía de trabajo para Adminio Perú: una landing corporativa de administración inmobiliaria y un módulo privado para consultar asistencias de administradores.

## Contexto del proyecto

- La landing pública entra por `index.html`.
- El módulo privado entra por `asistencias.html` y requiere un token configurado en `ASISTENCIAS_TOKEN`.
- El inicio conserva un formulario legacy en `js/adminio.js`; la cotización dedicada usa `js/contacto.js` y catálogos `static/data/*_ubigeo_*.json`.
- Las postulaciones usan `js/empleos.js`, AlertifyJS y un endpoint PHP que recibe el PDF.
- El blog usa `js/blog.js` y `css/blog.css`.
- La interfaz de asistencias usa `js/asistencias.js` y `css/asistencias.css`, con jQuery DataTables, Flatpickr, ApexCharts y AlertifyJS cargados desde CDN.
- El backend PHP se divide entre `config/`, `controller/`, `model/` y `db/`.
- El formulario legacy del inicio envía JSON a `config/envio_correo.php`; la página `contacto.html` usa `cotizaciones/enviar.php` y empleo usa `empleos/enviar.php`. Los dos formularios nuevos comparten `config/mail_config.php` y las variables SMTP de `.env`.
- Las asistencias se consultan desde la tabla `asistencia_administradores` mediante `model/AsistenciaAdministradoresModel.php` y `db/connection.php`.

## Principios compartidos

- Mantener las responsabilidades separadas entre HTML, CSS, JavaScript, controladores, modelo y conexión de base de datos.
- Usar rutas relativas compatibles con Apache y con el servidor integrado de PHP.
- No introducir frameworks ni dependencias nuevas si el stack actual resuelve el requerimiento.
- No versionar `.env`, credenciales, tokens, respaldos ni datos sensibles.
- Preservar las respuestas JSON y los nombres de endpoints consumidos por el frontend.
- Mantener accesibilidad, validación del lado servidor y compatibilidad responsive.

## Agente Landing y contacto

Trabaja en:

- `index.html`
- `css/index.css`, `css/app.css`
- `js/adminio.js`
- `static/data/distritos.json`
- `config/envio_correo.php`, `config/env.php`, `config/template_mail.html` y `css/template_mail.css`

Debe:

- Mantener las secciones públicas, navegación, formulario de contacto y carga de distritos.
- Validar campos en frontend sin sustituir la validación del backend.
- Distinguir el formulario legacy en `index.html` del formulario de cotizaciones en `contacto.html`; no mezclar sus payloads o endpoints.
- El formulario nuevo envía JSON con los campos de inmueble, ubicación, servicios y contacto a `cotizaciones/enviar.php`.
- Mantener respuestas JSON con `ok` y `message`/`code` según el endpoint para no romper el frontend.
- Leer la configuración SMTP mediante `env()` y mantener el correo HTML escapado.

No debe:

- Hardcodear credenciales SMTP o direcciones configurables.
- Cambiar `config/envio_correo.php` sin revisar el formulario y la plantilla de correo.
- Editar bundles versionados como sustituto de los archivos fuente sin una razón explícita.

## Agente Asistencias y acceso

Trabaja en:

- `asistencias.html`
- `css/asistencias.css`
- `js/asistencias.js`
- `controller/asistencia_administradores.php`
- `controller/validar_acceso_asistencias.php`
- `controller/estado_acceso_asistencias.php`
- `controller/cerrar_sesion_asistencias.php`

Debe:

- Mantener el acceso protegido por sesión y por `ASISTENCIAS_TOKEN`.
- Respetar el límite de intentos y el bloqueo temporal implementados por el controlador.
- Enviar y consumir los filtros `desde` y `hasta` en formato de fecha ISO.
- Mantener la tabla, los contadores, el estado vacío, los gráficos y el cierre de sesión.
- Escapar valores antes de construir HTML con datos de la base de datos.

No debe:

- Exponer el token en HTML, JavaScript, URLs permanentes o mensajes de error.
- Consultar la base de datos directamente desde JavaScript.
- Cambiar nombres de campos o endpoints sin actualizar todos sus consumidores.

## Agente Backend y datos

Trabaja en:

- `config/`
- `controller/`
- `model/`
- `db/`
- `composer.json`

Debe:

- Usar `env()` para valores sensibles y comprobar configuración ausente con errores controlados.
- Usar consultas preparadas y parámetros tipados para filtros y límites.
- Mantener la conexión centralizada en `db/connection.php`.
- Devolver JSON con `Content-Type` correcto y sin trazas internas al cliente.
- Usar PHPMailer instalado por Composer para el envío SMTP.
- Mantener las plantillas y recursos de correo de cotizaciones y empleos, incluida la validación backend de CV PDF.

## Agente Documentación y contexto

Trabaja en:

- `README.md`
- `.ia-context/`

Debe mantener las rutas, requisitos, variables de entorno y comandos alineados con los archivos existentes. No debe documentar carpetas ni flujos que no existan en el repositorio.

## Flujo recomendado

1. Identificar el archivo que posee la decisión o el dato que se modifica.
2. Revisar sus consumidores directos antes de cambiar nombres, payloads o respuestas.
3. Mantener los cambios pequeños y evitar modificar archivos compilados sin necesidad.
4. Ejecutar `php -l` sobre cada archivo PHP modificado.
5. Probar el formulario de contacto y el acceso, filtro, gráficos y cierre de sesión de asistencias.

## Entorno

- Requiere PHP 8.x, Composer, un servidor web con PHP y una base de datos para asistencias.
- Ejecutar `composer install` para instalar `phpmailer/phpmailer` en `vendor/`.
- Crear `.env` en la raíz con las variables SMTP y `ASISTENCIAS_TOKEN`.
- Servir el proyecto desde su raíz; abrir solo los HTML mediante `file://` no ejecuta los endpoints PHP.
