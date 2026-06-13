## Adminio

[![forthebadge](http://forthebadge.com/images/badges/made-with-javascript.svg)](https://www.linkedin.com/in/drphp/)
[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](https://www.linkedin.com/in/drphp/)

<a href="https://www.instagram.com/amvsoft.tech/">
  <img src="https://adminio.pe/static/main.png" alt="Adminio" width="600">
</a>

Landing page corporativa para Adminio Peru, enfocada en administracion inmobiliaria, captura de leads, envio de mensajes por correo y acceso a modulos internos de asistencia.

## Requisitos

- PHP 8.x o superior
- Composer
- Servidor local (Apache recomendado)
- Acceso SMTP valido para envio de correos
- Base de datos configurada para el modulo de asistencias

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

4. Configurar la conexion a base de datos si usaras asistencias

- Revisar `db/connection.php`.
- Validar credenciales y nombre de base de datos segun el entorno local o servidor.

5. Publicar en tu servidor local

- Ruta sugerida en Windows + Apache: C:/Apache24/htdocs/adminio
- Abrir en navegador: http://127.0.0.1/adminio/

## Flujo de contacto

- El formulario valida campos en frontend.
- Al enviar, la web llama a config/envio_correo.php.
- PHPMailer toma credenciales desde .env usando config/env.php.
- Si el correo se envia correctamente, se muestra confirmacion y se recarga la pagina.

## Flujo de asistencias

- `asistencias.html` muestra la interfaz del modulo de asistencias.
- `js/asistencias.js` controla login, filtros, consulta de registros y cierre de sesion.
- Los endpoints en `controller/` validan el acceso, consultan estado de sesion, devuelven asistencias y cierran la sesion.
- `model/AsistenciaAdministradoresModel.php` contiene la logica de consulta de datos.
- `db/connection.php` centraliza la conexion a la base de datos.

## Estructura del proyecto

```text
adminio/
├── index.html                         # Landing principal
├── asistencias.html                   # Modulo web de asistencias
├── composer.json                      # Dependencias PHP
├── composer.lock                      # Versiones bloqueadas de dependencias
├── README.md                          # Documentacion del proyecto
├── .env                               # Variables locales, no versionar
├── config/
│   ├── env.php                        # Helper para leer variables de entorno
│   └── envio_correo.php               # Endpoint de envio SMTP con PHPMailer
├── controller/
│   ├── asistencia_administradores.php # Consulta de asistencias
│   ├── cerrar_sesion_asistencias.php  # Cierre de sesion del modulo asistencias
│   ├── estado_acceso_asistencias.php  # Estado de acceso/sesion
│   ├── validar_acceso_asistencias.php # Validacion de acceso
│   └── index.php                      # Proteccion de listado/directorio
├── db/
│   ├── connection.php                 # Conexion a base de datos
│   └── index.php                      # Proteccion de listado/directorio
├── model/
│   ├── AsistenciaAdministradoresModel.php # Modelo de asistencias
│   └── index.php                          # Proteccion de listado/directorio
├── css/
│   ├── app.css                        # Estilos base/compilados
│   ├── asistencias.css                # Estilos del modulo asistencias
│   ├── index.css                      # Estilos principales editables
│   └── *.css                          # Assets CSS compilados/versionados
├── js/
│   ├── adminio.js                     # Navegacion, validaciones y formulario
│   ├── asistencias.js                 # Interaccion del modulo asistencias
│   └── *.js                           # Librerias y bundles compilados
├── static/
│   ├── main.png                       # Imagen principal del hero
│   ├── logo.png                       # Logo del sitio
│   ├── google_play.png                # Badge de Google Play
│   ├── data/distritos.json            # Catalogo de distritos para formulario
│   └── *                              # Imagenes, SVGs y recursos visuales
├── docs/
│   ├── backend-rules.md               # Reglas y lineamientos backend
│   └── frontend-rules.md              # Reglas y lineamientos frontend
└── vendor/                            # Dependencias instaladas por Composer
```

## Archivos principales

- `index.html`: landing principal con hero, secciones comerciales, video embebido, contacto y recursos visuales.
- `css/index.css`: estilos editables de la landing, animaciones del hero, responsive y estados de UI.
- `js/adminio.js`: navegacion, validacion del formulario, carga de distritos y envio de contacto.
- `asistencias.html`: pantalla del modulo interno de asistencias.
- `css/asistencias.css`: estilos especificos del modulo de asistencias.
- `js/asistencias.js`: logica frontend de acceso, filtros, listado y cierre de sesion.
- `config/envio_correo.php`: envio SMTP usando PHPMailer.
- `config/env.php`: lectura de variables desde `.env`.
- `db/connection.php`: conexion a base de datos para backend.
- `model/AsistenciaAdministradoresModel.php`: acceso a datos del modulo de asistencias.

## Notas

- Si abres solo index.html sin servidor web, el formulario no podra enviar correos.
- Verifica firewall, puerto SMTP y credenciales si aparece error de envio.
- No versionar `.env`, credenciales SMTP ni credenciales de base de datos.
- `vendor/` se genera con `composer install`; no editar dependencias directamente.

## Licencia

Proyecto de uso privado/comercial segun politicas del propietario del repositorio.
