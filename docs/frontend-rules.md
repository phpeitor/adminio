# Reglas de Frontend

## Objetivo
Mantener la landing de Adminio consistente, ligera y fácil de mantener.

## Estructura
- No mezclar CSS ni JS en el HTML cuando exista una alternativa en `css/` y `js/`.
- Reutilizar clases existentes antes de crear nuevas variantes.
- Mantener el HTML semántico y ordenado por secciones.
- Evitar dependencias nuevas si el comportamiento ya se resuelve con el stack actual.

## Estilo visual
- Respetar el lenguaje visual del proyecto: gradientes cálidos, blancos, grises y azul corporativo.
- No introducir layouts genéricos o sobrios si rompen la identidad visual actual.
- Usar animaciones con intención: sutiles, continuas y sin exceso de movimiento.
- Priorizar legibilidad, contraste y alineación limpia en formularios y botones.

## CSS
- Preferir hojas dedicadas en `css/` antes de agregar estilos inline.
- Extender utilidades existentes antes de crear reglas duplicadas.
- Mantener nombres de clases descriptivos y coherentes con el proyecto.
- No borrar reglas globales sin revisar el impacto en la landing completa.

## JavaScript
- Mantener la lógica de UI en archivos dedicados dentro de `js/`.
- Validar formularios con comportamiento personalizado cuando el diseño lo requiera.
- Limpiar estados de error en tiempo real al escribir o cambiar un campo.
- Evitar duplicar handlers si ya existe una ruta de validación o envío.

## Formularios
- Mostrar feedback claro debajo de cada campo cuando falte información.
- Marcar visualmente los campos inválidos con borde rojo o estado equivalente.
- Quitar el estado de error apenas el usuario corrija el valor.
- No depender solo de la validación nativa del navegador cuando el UX necesita mensajes propios.

## Calidad
- Verificar el comportamiento en desktop y móvil.
- Mantener los assets versionados si el navegador puede cachear CSS o JS.
- No introducir cambios visuales que alteren el hero, el header o el bloque de contacto sin motivo claro.
