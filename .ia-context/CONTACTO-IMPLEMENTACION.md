# Nueva página de contacto de ADMINIO

## 1. Revisar el formulario

Abre `/contacto.html` desde un servidor web. El paso Información solicita características del inmueble, ubicación y servicios. Siguiente valida los campos y exige al menos un servicio. Datos solicita nombre, cargo, teléfono y correo. Volver conserva los valores.

Región, provincia y distrito son listas vinculadas. Cambiar la región limpia provincia y distrito; cambiar la provincia limpia distrito. Los catálogos se cargan desde los tres archivos `static/data/*_ubigeo_*.json`. Si falla la carga se permite reintentar y se bloquea el avance.

## 2. Archivos que se deben subir al hosting

- `contacto.html` (nuevo).
- `css/contacto.css` (nuevo).
- `js/contacto.js` (nuevo).
- `cotizaciones/enviar.php` y `cotizaciones/template_mail.html` (endpoint y plantilla HTML).
- `config/mail_config.php`, `css/template_mail.css` y `vendor/` con PHPMailer instalado por Composer.
- `static/data/1_ubigeo_departamentos.json`, `2_ubigeo_provincias.json` y `3_ubigeo_distritos.json`.
- `css/site-header.css` (cabecera compartida).
- `head.html` (actualizado: Contacto abre la página nueva).
- `index.html` (actualizado: Solicitar una cotización abre la página nueva).

Conserva las carpetas y rutas. La página reutiliza estilos, encabezado, pie y logo del sitio. El formulario legacy del inicio permanece en `index.html` y conserva su propio endpoint.

## 3. Conectar el envío

Contacto llama a `cotizaciones/enviar.php`; Trabaja con nosotros envía `multipart/form-data` a `empleos/enviar.php`. Ambos endpoints nuevos comparten las variables `MAIL_*` del `.env` raíz mediante `config/mail_config.php`. El formulario legacy del inicio conserva `config/envio_correo.php`.

Seguir [CONFIGURACION-ENVIOS.md](CONFIGURACION-ENVIOS.md) para despliegue. Los formularios nuevos generan correo HTML desde sus plantillas propias y usan `MAIL_TO` más una copia a `MAIL_FROM_EMAIL` cuando son direcciones distintas.

## 4. Protección contra envíos automatizados

Se mantienen validación del servidor, campo trampa y límites de intentos en el directorio temporal de PHP.

## 5. Verificación antes de publicar

1. Abrir Contacto desde el menú del inicio y de asistencias.
2. Intentar avanzar con campos vacíos y sin servicios.
3. Completar Información (incluido teléfono de 9 dígitos iniciado en 9 y al menos un servicio), avanzar y volver: los datos deben conservarse.
4. Revisar la vista en celular y escritorio.
5. Con PHP configurado, realizar un envío autorizado y confirmar recepción del correo con todos los detalles del inmueble.
6. Comprobar que ante error de servidor no se muestra éxito y los datos se conservan.

Realizar la prueba de correo solo con autorización y una cuenta de prueba para evitar enviar datos personales reales.

## 6. Conversión de cotización en Google Ads

`contacto.html` carga la etiqueta `AW-18370877112`. `js/contacto.js` envía el evento
`AW-18370877112/jcRjCP-8n6QdELit9bdE` únicamente tras una respuesta HTTP correcta
y `result.ok === true` de `cotizaciones/enviar.php`. No se incluyen datos del formulario
en el evento. Se conserva la confirmación de éxito sin recarga automática y se bloquea
un segundo envío en la misma página. Un fallo de analítica no invalida el envío del correo.

Ejecutar `node --test tests/quote-conversion.test.cjs` para probar éxito, duplicados,
cancelación, validación y errores sin enviar correos ni eventos reales.

Para desplegar esta corrección, publicar juntos `contacto.html` y `js/contacto.js`
(versión de caché 10), conservando la configuración privada del hosting. Después:

1. Conectar Tag Assistant a `/contacto.html` y verificar la etiqueta de Ads.
2. Comprobar que abrir la página, avanzar o cancelar no dispara la conversión.
3. Realizar un único envío autorizado de prueba y verificar la recepción del correo.
4. Verificar en Tag Assistant un único evento con el destino indicado después del éxito.
5. Comprobar la confirmación persistente en escritorio y móvil.

Una prueba con acceso directo valida la etiqueta, pero no implica una conversión
atribuida a anuncios: esta requiere una interacción publicitaria elegible y el
procesamiento de Google Ads. No hacer clic en anuncios propios para probarla.
