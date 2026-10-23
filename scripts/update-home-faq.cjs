const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const groups=[
 ['Servicios y contratación',[
 ['¿Qué incluye la administración integral?','Coordinamos la gestión administrativa y financiera, el seguimiento de cuotas, la organización del personal, la limpieza, la conserjería y el mantenimiento de las instalaciones comunes. El alcance específico se define en la propuesta de tu edificio.'],
 ['¿Podemos contratar solo algunos servicios?','Sí. Además de la administración integral, presentamos opciones de soporte administrativo para autogestión, recaudación multibanca, administración de mantenimiento y administración de personal. Revisamos qué combinación responde a las necesidades de tu comunidad.'],
 ['¿Cuánto cuesta administrar nuestro edificio?','La cotización depende de las características del inmueble, los servicios requeridos, el personal y la operación que se acuerde. Cuéntanos cuántas unidades tiene el edificio, dónde se encuentra y qué necesita la junta para preparar una propuesta.'],
 ['¿Atienden edificios fuera de Lima?','Algunos servicios no aplican fuera de Lima Metropolitana. Consúltanos indicando la ubicación del inmueble y el tipo de apoyo que necesitas para confirmar la cobertura disponible.'],
 ['¿Cómo se inicia el servicio con ADMINIO?','Primero conocemos las necesidades de la comunidad; luego definimos una propuesta y, una vez acordada, organizamos las actividades, los responsables y los canales de comunicación. La fecha de inicio y las condiciones se coordinan con la junta.']
 ]],
 ['Finanzas y cuotas de mantenimiento',[
 ['¿Cómo se controla el dinero del edificio?','La gestión contempla registros de ingresos y egresos, seguimiento de la recaudación, conciliaciones bancarias y reportes para que la junta pueda revisar la situación financiera. La periodicidad y el acceso a la documentación se coordinan según el servicio contratado.'],
 ['¿ADMINIO cambia las cuotas de mantenimiento?','La administración puede preparar presupuestos y presentar información para evaluar las cuotas. Los acuerdos que correspondan deben adoptarse conforme a las reglas del edificio; una propuesta administrativa no sustituye la decisión válida de la junta.'],
 ['¿Cómo funciona la recaudación multibanca?','Orientamos a los residentes sobre los canales habilitados y damos seguimiento al registro de sus pagos. Las opciones disponibles dependen de la configuración de cada comunidad. Puedes consultar la <a href="./360pay/">Guía de Pagos Multibanca</a>.'],
 ['¿Qué sucede si mi pago no aparece registrado?','Comunica el caso por el canal de atención de tu comunidad e incluye la fecha, el importe y la constancia de pago. La administración podrá contrastar la información y revisar su aplicación a la unidad correspondiente.'],
 ['¿Cómo se atienden las cuotas pendientes?','Organizamos la información de cuentas por cobrar y el seguimiento administrativo de los pagos pendientes. Las comunicaciones, acuerdos de pago y otras medidas se evalúan según el alcance del servicio y las decisiones que correspondan a la junta.']
 ]],
 ['Mantenimiento y personal',[
 ['¿Cómo se organiza el mantenimiento preventivo?','Identificamos las necesidades de las instalaciones y equipos comunes, coordinamos las visitas técnicas y damos seguimiento a las actividades realizadas. La planificación se ajusta al estado de los equipos, sus recomendaciones técnicas y el presupuesto del edificio.'],
 ['¿Las reparaciones y los repuestos están incluidos?','La administración del mantenimiento comprende organización y seguimiento. La inclusión de trabajos técnicos, repuestos o servicios adicionales debe verificarse en la propuesta; no debe suponerse que todo gasto está cubierto por el honorario de administración.'],
 ['¿Supervisan al personal de conserjería y limpieza?','El servicio de administración de personal contempla coordinación de funciones, supervisión del servicio y seguimiento del desempeño. Las responsabilidades, horarios y condiciones se definen de acuerdo con la operación contratada por la comunidad.'],
 ['¿Cómo se reporta una incidencia?','Utiliza los canales habilitados para tu edificio e indica el lugar, el problema y los datos necesarios para su atención. Si existe un riesgo inmediato para las personas, activa el protocolo de emergencia del inmueble; un reporte digital no reemplaza la atención de emergencia.']
 ]],
 ['Tecnología y comunicación',[
 ['¿Para qué sirve ADMIN(IA)?','ADMIN(IA) apoya la orientación sobre gestiones del edificio y la recepción de consultas e incidencias. Complementa el trabajo del equipo administrativo. Las funciones disponibles dependen de la configuración de la comunidad. <a href="./adminia.html">Conoce ADMIN(IA)</a>.'],
 ['¿Qué es Vecinos 360?','Es una plataforma que facilita el acceso a la información de la comunidad y la comunicación con la administración. Las funciones y permisos se habilitan según cada edificio. <a href="./conoce-vecinos360.html">Conoce Vecinos 360</a>.'],
 ['¿Cómo obtengo acceso a la plataforma?','Contacta a la administración de tu comunidad para verificar tu registro y solicitar orientación sobre el acceso. Los permisos dependen de tu relación con la unidad y de la configuración del edificio. No compartas contraseñas por grupos de vecinos.'],
 ['¿La tecnología reemplaza al administrador?','No. Las herramientas digitales facilitan consultas, registros y seguimiento; el equipo humano mantiene la coordinación de las actividades y la atención que corresponda al servicio contratado.']
 ]],
 ['Junta de propietarios y convivencia',[
 ['¿Podemos conservar la autogestión y recibir apoyo?','Sí. El servicio de Back Office para Autogestión brinda soporte en organización documental, registro de ingresos y gastos, seguimiento de tareas y reportes. La junta mantiene su gestión y se acuerdan las funciones de apoyo de ADMINIO.'],
 ['¿Cómo ayudan con los reclamos de convivencia?','Organizamos la recepción de consultas e incidencias y el seguimiento con los responsables. Para atender un conflicto es importante contar con hechos concretos y revisar las reglas aplicables, respetando la privacidad y escuchando a las partes.'],
 ['¿Dónde podemos consultar temas sobre reglamentos y convivencia?','En el <a href="./blog.html">blog de ADMINIO</a> encontrarás guías sobre reglamentos internos, mascotas, alquileres temporales, cuotas y espacios comunes. Son contenidos informativos; la evaluación de una situación específica requiere revisar los documentos del inmueble.'],
 ['¿Cómo solicitamos una propuesta para nuestra comunidad?','Puedes <a href="./contacto.html">completar el formulario de contacto</a> o escribirnos por WhatsApp al 927130275. Indica la ubicación, el número de unidades y los servicios que necesita el edificio para orientar la propuesta.']
 ]]
];
let n=0;
const content='<p class="faq-caption">22 PREGUNTAS SOBRE NUESTRO SERVICIO</p><p class="faq-hint">Selecciona una pregunta para ver la respuesta. Vuelve a seleccionarla para cerrarla.</p>'+groups.map(([title,items])=>`<div class="faq-group"><h3>${title}</h3>${items.map(([q,a])=>`<details class="faq-item" name="adminio-service-faq"><summary><span class="faq-number">${String(++n).padStart(2,'0')}</span><span>${q}</span><span class="faq-toggle" aria-hidden="true"></span></summary><div class="faq-answer"><p>${a}</p></div></details>`).join('')}</div>`).join('')+'<p class="faq-footnote">¿Tienes otra consulta? Cuéntanos qué necesita tu comunidad.</p>';
const file=path.join(root,'index.html');let html=fs.readFileSync(file,'utf8');
const start=html.indexOf('<div class="faq-answers">');const end=html.indexOf('</section>',start);
if(start<0||end<0)throw Error('FAQ section missing');
html=html.slice(0,start)+'<div class="faq-answers">'+content+'</div></div>'+html.slice(end);
html=html.replace('home-faq.css?v=1','home-faq.css?v=2');
fs.writeFileSync(file,html);console.log(`${n} preguntas, ${groups.length} categorías, cerradas inicialmente.`);
