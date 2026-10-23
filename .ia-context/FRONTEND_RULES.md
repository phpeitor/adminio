# Reglas de desarrollo frontend — Adminio

## Alcance

- `index.html` es la página de inicio y conserva un formulario legacy administrado por `js/adminio.js`.
- `contacto.html` implementa la solicitud de cotización en dos pasos; `js/contacto.js` carga Ubigeo y envía a `cotizaciones/enviar.php`.
- `trabaja-con-nosotros.html` contiene el formulario de postulación; `js/empleos.js` valida el CV, muestra confirmación y envía `multipart/form-data` a `empleos/enviar.php`.
- `blog.html` y las páginas `blog-*.html` forman el blog; `js/blog.js` gestiona navegación, búsqueda, filtros y calculadora.
- `asistencias.html` es la vista privada de reportes; `js/asistencias.js` controla acceso, filtros, tabla, gráficos y cierre de sesión.
- `css/app.css` aporta estilos base y las páginas cargan hojas específicas como `css/index.css`, `css/contacto.css`, `css/blog.css` y `css/asistencias.css`.

## HTML y accesibilidad

- Conservar `lang="es"`, HTML semántico, labels asociados y navegación por teclado.
- Mantener `aria-label`, `aria-live`, `aria-invalid` y estados `hidden` cuando ya existan en el flujo.
- No mover ni renombrar IDs usados por JavaScript sin actualizar sus consumidores.
- Mantener rutas relativas para `static/`, `css/`, `js/` y endpoints PHP.

## Estilos

- Respetar el lenguaje visual existente: azul corporativo, gradientes, superficies claras y recursos de red del hero.
- Mantener gradientes cálidos, blancos, grises y azul corporativo sin introducir layouts genéricos que rompan la identidad visual.
- Preferir hojas de estilo dedicadas y clases existentes antes que estilos inline o reglas duplicadas.
- Conservar el comportamiento responsive de la landing y del reporte de asistencias.
- Evitar `!important`, cambios globales innecesarios y dependencias CSS nuevas.
- Usar animaciones sutiles y con intención, sin exceso de movimiento.
- Mantener visibles y legibles los estados de carga, error, bloqueo, vacío y éxito.

## JavaScript

- Usar el estilo y las dependencias ya presentes; no reemplazar los bundles ni añadir un framework sin necesidad.
- Mantener la validación y el envío del formulario legacy en `js/adminio.js`; no confundirlo con `contacto.html`.
- Para cotizaciones, mantener los campos, servicios, validación de teléfono peruano de 9 dígitos iniciado en 9 y payload JSON acordado con `cotizaciones/enviar.php`.
- Para empleos, mantener validación del teléfono, consentimiento, PDF auténtico de hasta 5 MB y confirmaciones/avisos de AlertifyJS; conservar `multipart/form-data` y el campo CV `cv`.
- Mantener la carga de las listas de Ubigeo desde `static/data/1_ubigeo_departamentos.json`, `2_ubigeo_provincias.json` y `3_ubigeo_distritos.json`.
- Mantener en `js/asistencias.js` los endpoints `controller/`, la sesión, el token en `sessionStorage` y los filtros de fecha.
- Escapar datos de asistencias antes de insertarlos en HTML.
- Destruir instancias de gráficos antes de renderizarlas de nuevo y mantener el estado de la tabla sincronizado.

## Formularios

- Mostrar mensajes de validación cerca del campo correspondiente.
- Marcar campos inválidos con `input-error` o el estado visual equivalente ya definido.
- Limpiar el error cuando el usuario corrija o cambie el valor.
- No depender únicamente de la validación nativa cuando el flujo requiere mensajes propios.

## Dependencias externas

- Las librerías de la vista de asistencias se cargan desde CDN en `asistencias.html`: jQuery, DataTables, Flatpickr, ApexCharts y AlertifyJS.
- Verificar compatibilidad y disponibilidad de una CDN antes de cambiar versiones o añadir otra dependencia.

## Calidad

- Probar desktop y móvil.
- Revisar consola del navegador, navegación, validación, mensajes de error y estados vacíos.
- Verificar que el formulario no permita dobles envíos mientras espera respuesta.
- Mantener los assets versionados cuando el navegador pueda cachear CSS o JavaScript.
- Después de cambios en PHP, validar también el flujo frontend que consume la respuesta JSON.
