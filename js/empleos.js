"use strict";
(async () => {
  await Promise.all([['head.html', 'site-header'], ['footer.html', 'site-footer']].map(async ([file, id]) => {
    try {
      const response = await fetch(`./${file}`);
      if (!response.ok) throw new Error('No se pudo cargar la navegación');
      document.getElementById(id).innerHTML = await response.text();
      if (id === 'site-header') {
        document.querySelectorAll('#site-header [data-section]').forEach(link => { link.href = `./index.html#${link.dataset.section}`; });
        document.querySelector('#site-header a[href="./trabaja-con-nosotros.html"]')?.setAttribute('aria-current', 'page');
      }
    } catch (error) { console.error(error); }
  }));
})();
const jobsForm = document.getElementById('jobs-form');
const cvInput = document.getElementById('cv');
const jobsStatus = document.getElementById('quote-status');
let jobsSending = false;
async function validateCV() {
  const file = cvInput.files[0];
  if (!file) {
    cvInput.setCustomValidity('Adjunta tu CV en formato PDF.');
    cvInput.setAttribute('aria-invalid', 'true');
    cvInput.classList.add('input-error');
    return false;
  }
  let isPdf = false;
  try {
    const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
    isPdf = signature === '%PDF-';
  } catch (_) { isPdf = false; }
  const valid = /\.pdf$/i.test(file.name)
    && (!file.type || file.type === 'application/pdf')
    && isPdf
    && file.size > 0
    && file.size <= 5 * 1024 * 1024;
  cvInput.setCustomValidity(valid ? '' : 'Adjunta un archivo PDF válido de hasta 5 MB.');
  cvInput.toggleAttribute('aria-invalid', !valid);
  cvInput.classList.toggle('input-error', !valid);
  return valid;
}
cvInput.addEventListener('change', async () => {
  if (!await validateCV()) window.alertify?.error(cvInput.validationMessage);
});
const jobPhoneInput = jobsForm.elements.telefono;
function clearResolvedFieldError(event) {
  const field = event.target;
  if (!field.matches('input,select,textarea')) return;
  if (field === jobPhoneInput) jobPhoneInput.setCustomValidity('');
  if (field.checkValidity()) {
    field.removeAttribute('aria-invalid');
    field.classList.remove('input-error');
  }
}
jobsForm.addEventListener('input', clearResolvedFieldError);
jobsForm.addEventListener('change', clearResolvedFieldError);
function confirmJobSend() {
  return new Promise(resolve => {
    if (!window.alertify) { resolve(false); return; }
    window.alertify.confirm('Confirmación', '¿Deseas enviar tu postulación con el CV adjunto?',
      () => resolve(true), () => resolve(false));
  });
}
jobsForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (jobsSending) return;
  await validateCV();
  jobPhoneInput.setCustomValidity(/^9[0-9]{8}$/.test(jobPhoneInput.value) ? '' : 'Ingresa un celular peruano de 9 dígitos que empiece con 9.');
  const fieldsToValidate = [...jobsForm.querySelectorAll('input,select,textarea')];
  fieldsToValidate.forEach(field => {
    const invalid = !field.checkValidity();
    field.toggleAttribute('aria-invalid', invalid);
    field.classList.toggle('input-error', invalid);
  });
  if (fieldsToValidate.some(field => !field.checkValidity())) {
    const invalid = jobsForm.querySelector(':invalid');
    window.alertify?.error(invalid.validationMessage || 'Revisa los campos obligatorios del formulario.');
    invalid.focus();
    return;
  }
  if (!await confirmJobSend()) return;
  const payload = new FormData(jobsForm);
  const fields = document.getElementById('jobs-fields');
  const button = document.getElementById('jobs-submit');
  jobsSending = true;
  fields.disabled = true;
  button.textContent = 'Enviando…';
  jobsStatus.hidden = true;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(jobsForm.action, {method:'POST', body:payload, signal:controller.signal});
    const result = await response.json().catch(() => null);
    if (!result) throw new Error('El envío requiere un servidor PHP configurado. No pudimos confirmar tu postulación.');
    if (!response.ok || result.ok !== true) throw new Error(result.message || 'No pudimos confirmar el envío.');
    jobsStatus.className = '';
    jobsStatus.textContent = '¡Gracias! Tu postulación y tu CV se enviaron correctamente.';
    window.alertify?.success('Postulación enviada correctamente.');
    jobsForm.reset();
  } catch (error) {
    jobsStatus.className = 'error';
    jobsStatus.textContent = error.name === 'AbortError' || error instanceof TypeError
      ? 'No pudimos confirmar el envío por un problema de conexión. Conservamos tus datos. Antes de reenviar, verifica con ADMINIO si recibió tu postulación.'
      : error.message;
    window.alertify?.error(jobsStatus.textContent);
  } finally {
    clearTimeout(timer);
    jobsSending = false;
    fields.disabled = false;
    button.textContent = 'Enviar postulación';
    jobsStatus.hidden = false;
    jobsStatus.focus();
  }
});
