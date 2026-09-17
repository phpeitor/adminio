# Adminio 🏦

[![forthebadge](http://forthebadge.com/images/badges/made-with-javascript.svg)](https://www.linkedin.com/in/drphp/)
[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](https://www.linkedin.com/in/drphp/)

<a href="https://www.instagram.com/amvsoft.tech/">
  <img src="https://adminio.pe/static/main.png" alt="Adminio" width="600">
</a>

## Descripción

Adminio es una landing corporativa para administración inmobiliaria con formulario de contacto y un módulo privado de reportes de asistencia. El frontend es HTML, CSS y JavaScript; el backend PHP gestiona correo SMTP, autenticación por token, sesiones y consultas MySQL.

## Requisitos

- PHP 8.x o superior con extensiones PDO y OpenSSL.
- Composer 2.x.
- Apache, el servidor integrado de PHP u otro servidor web que ejecute PHP.
- SMTP funcional para el formulario de contacto.
- MySQL/MariaDB con la tabla `asistencia_administradores` para el módulo privado.

## Instalación local

1. Instalar dependencias:

```bash
composer install
```

2. Crear la configuración local a partir del ejemplo:

```bash
copy .env.example .env
```

En macOS/Linux, usar `cp .env.example .env`. Después completar `.env` con valores del entorno. Nunca usar credenciales reales en `.env.example`.

3. Servir el proyecto desde su raíz. Con PHP:

```bash
php -S 127.0.0.1:8000
```

Abrir `http://127.0.0.1:8000/`. En Apache, la URL puede ser `http://127.0.0.1/adminio/` si la carpeta está dentro del document root.

4. Verificar la conexión de base de datos en `db/connection.php` y que el usuario tenga permisos de lectura sobre `asistencia_administradores`.

## Configuración de entorno

`.env` es local y está excluido del control de versiones. `.env.example` documenta todas las variables necesarias:

| Variable | Uso |
| --- | --- |
| `MAIL_HOST` | Host del servidor SMTP. |
| `MAIL_PORT` | Puerto SMTP, normalmente `587` o `465`. |
| `MAIL_SECURE` | Cifrado SMTP: `tls` o `ssl`. |
| `MAIL_USERNAME` | Usuario SMTP. |
| `MAIL_PASSWORD` | Contraseña o token SMTP. |
| `MAIL_FROM_EMAIL` | Dirección remitente. |
| `MAIL_FROM_NAME` | Nombre visible del remitente. |
| `MAIL_TO` | Dirección que recibe los leads. |
| `DB_HOST` | Host de MySQL/MariaDB. |
| `DB_PORT` | Puerto de base de datos. |
| `DB_NAME` | Nombre de la base de datos. |
| `DB_USERNAME` | Usuario de base de datos. |
| `DB_PASSWORD` | Contraseña de base de datos. |
| `DB_CHARSET` | Codificación, normalmente `utf8mb4`. |
| `ASISTENCIAS_TOKEN` | Token requerido para acceder a asistencias. |

## Flujos de la aplicación

### Landing y contacto

- `index.html` carga `head.html` y `footer.html` mediante `js/adminio.js`.
- `static/data/distritos.json` alimenta el selector de distritos.
- El formulario envía JSON a `config/envio_correo.php`.
- `config/env.php` lee `.env` y PHPMailer envía el correo mediante SMTP.

### Asistencias

- `asistencias.html` carga el header y footer compartidos.
- `js/asistencias.js` valida el token, mantiene la sesión, filtra fechas, renderiza la tabla y genera gráficos.
- `controller/validar_acceso_asistencias.php` compara el token con `hash_equals`, limita intentos y aplica bloqueo temporal.
- `controller/estado_acceso_asistencias.php` informa el estado de la sesión.
- `controller/asistencia_administradores.php` devuelve el reporte filtrado.
- `controller/cerrar_sesion_asistencias.php` destruye la sesión.
- `model/AsistenciaAdministradoresModel.php` consulta la tabla y `db/connection.php` centraliza PDO.

## Estructura relevante

```text
adminio/
├── index.html                  # Landing pública
├── asistencias.html            # Reporte privado de asistencias
├── head.html                   # Header compartido
├── footer.html                 # Footer compartido
├── .env.example                # Plantilla segura de configuración
├── config/                     # Entorno, correo y plantilla HTML
├── controller/                 # Endpoints de autenticación y reportes
├── db/                         # Conexión PDO
├── model/                      # Acceso a datos de asistencias
├── css/                        # Estilos fuente y assets compilados
├── js/                         # Lógica fuente y bundles
├── static/                     # Imágenes, SVG y datos públicos
└── .ia-context/                # Reglas y contexto para agentes
```

## Validación y mantenimiento

Después de modificar PHP:

```bash
php -l config/env.php
php -l config/envio_correo.php
php -l controller/validar_acceso_asistencias.php
php -l controller/asistencia_administradores.php
php -l controller/estado_acceso_asistencias.php
php -l controller/cerrar_sesion_asistencias.php
```

Después de modificar JavaScript:

```bash
node --check js/adminio.js
node --check js/asistencias.js
```

Probar manualmente el formulario de contacto, el acceso con token válido e inválido, el bloqueo tras intentos fallidos, los filtros, la tabla, los gráficos y el cierre de sesión.

## Despliegue y seguridad

- Usar `composer install --no-dev --optimize-autoloader` en producción.
- Mantener `.env` fuera del repositorio y protegerlo de servirlo públicamente.
- Usar HTTPS y un token largo, aleatorio y exclusivo para asistencias.
- Rotar inmediatamente cualquier credencial que haya sido expuesta.
- No devolver secretos, trazas ni credenciales en respuestas JSON.
- Mantener Composer y PHPMailer actualizados.
- No editar `vendor/` manualmente ni modificar bundles compilados sin actualizar su fuente.

## Licencia

Proyecto de uso privado/comercial según las políticas del propietario del repositorio.
