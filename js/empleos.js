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
function validateCV() {
  const file = cvInput.files[0];
  cvInput.setCustomValidity(file && (!/\.pdf$/i.test(file.name) || file.size === 0 || file.size > 5 * 1024 * 1024) ? 'Adjunta un PDF válido de hasta 5 MB.' : '');
}
cvInput.addEventListener('change', validateCV);
jobsForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (jobsSending) return;
  validateCV();
  if (!jobsForm.reportValidity()) return;
  if (!window.confirm('¿Deseas enviar tu postulación con el CV adjunto?')) return;
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
    jobsForm.reset();
  } catch (error) {
    jobsStatus.className = 'error';
    jobsStatus.textContent = error.name === 'AbortError' || error instanceof TypeError
      ? 'No pudimos confirmar el envío por un problema de conexión. Conservamos tus datos. Antes de reenviar, verifica con ADMINIO si recibió tu postulación.'
      : error.message;
  } finally {
    clearTimeout(timer);
    jobsSending = false;
    fields.disabled = false;
    button.textContent = 'Enviar postulación';
    jobsStatus.hidden = false;
    jobsStatus.focus();
  }
});
