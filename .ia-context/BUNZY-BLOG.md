# Blog ADMINIO con Bunzy

Integración PHP de servidor en `/blog`. Los artículos estáticos `blog-*.html` se conservan. `blog.html` redirige a `/blog` en Apache y en el router de desarrollo.

## Requisitos y configuración

PHP 8.2 o posterior con cURL y mbstring; Composer 2. Ejecutar `composer install --no-dev --optimize-autoloader` en la raíz del repositorio. Subir también `vendor/` si el hosting no permite ejecutar Composer.

Configurar `BUNZY_BLOG_API_KEY` y `BUNZY_BLOG_API_URL=https://app.bunzy.io` como variables del servidor o en el `.env` privado existente. Las variables del servidor tienen prioridad. No publicar el `.env` ni incluirlo en Git. La clave no se utiliza en el navegador. Las peticiones tienen un timeout de 10 segundos, verifican HTTPS y no se almacenan en caché.

En Bunzy, usar `https://adminio.pe/blog` como URL base del blog, español como idioma y la integración API activa. La selección PHP en Bunzy muestra las instrucciones correspondientes. Los artículos aparecen cuando estén publicados, no cuando solo estén planificados o en borrador.

## Prueba local

Desde la raíz del repositorio:

```powershell
php -S 127.0.0.1:8000 tools/blog-router.php
```

En este equipo también está disponible el PHP portátil descargado para las pruebas:

```powershell
& ../tmp/php-runtime/php.exe -S 127.0.0.1:8000 tools/blog-router.php
```

Abrir `http://127.0.0.1:8000/blog`. Rutas adicionales: `/blog/<slug>`, `/blog/tag/<tag>` y `/blog/sitemap.xml`.

## Hosting

Las reglas de `.htaccess` requieren Apache 2.4, `mod_rewrite` y AllowOverride habilitado. Esta integración se publica en la raíz del dominio. Para nginx se deben replicar las reglas de rutas y la denegación de acceso a `.env`, `config/`, `vendor/`, `tools/` y los archivos Composer; nginx no interpreta `.htaccess`.

En producción (VPS Ubuntu con nginx y PHP 8.2-FPM) la configuración aplicada está en `deploy/nginx/adminio.pe.conf`, copia de `/etc/nginx/sites-available/adminio.pe`:

- `/blog` y `/blog/...` se envían a `blog/index.php` mediante FastCGI. Los artículos estáticos `blog-*.html` siguen sirviéndose como archivos.
- `/blog.html` redirige con 301 a `/blog`.
- `config/`, `tools/`, `vendor/`, `model/` y `db/` responden 403. La única excepción es `config/envio_correo.php`, que usa el formulario de contacto. Estos bloqueos van antes de la regla general `\.php$`, porque nginx evalúa las expresiones regulares en orden.
- `BUNZY_BLOG_API_URL` y `BUNZY_BLOG_API_KEY` se leen del `.env` privado del servidor.

Para aplicarla: copiar el archivo a `/etc/nginx/sites-available/adminio.pe` y ejecutar `nginx -t && systemctl reload nginx`.

El sitemap usa el dominio de producción `https://adminio.pe`. Una caída o fallo de autenticación de Bunzy produce HTTP 503; un artículo inexistente, HTTP 404. El listado vacío devuelve 200. Las cabeceras y el pie se renderizan en PHP reutilizando los fragmentos del sitio.

## Archivos

- `config/bunzy.php`: cliente cURL y helpers `getPosts`, `getPost`, `getTags`.
- `blog/index.php`, `blog/render.php`, `blog/view.php`: rutas, vistas, CommonMark, metadatos y sitemap.
- `tools/check-bunzy-render.php`: prueba de renderizado con datos sintéticos, sin publicar contenido.
- `css/bunzy-blog.css`: estilos del blog dinámico.
- `tools/blog-router.php`: router local y protección de archivos privados.
- `.htaccess`, `.gitignore`, `.env.example`: rutas y configuración privada.
- `composer.json`, `composer.lock`: dependencias reproducibles.
- `head.html`, `footer.html`: navegación al blog dinámico.

El despliegue al hosting es un paso separado: configurar Bunzy o ejecutar el sitio localmente no modifica la web pública.
